/**
 * Bulletproof State Management Hook
 * Provides type-safe state with automatic persistence, validation, and error recovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { z, ZodSchema } from 'zod';
import { storage } from '@/lib/storage';
import { log } from '@/lib/log';

export interface StateOptions<T> {
  key: string;
  schema: ZodSchema<T>;
  defaultValue: T;
  persist?: boolean;
  debounceMs?: number;
  onError?: (error: Error) => void;
  validate?: (value: T) => boolean | string;
}

export interface StateResult<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useBulletproofState<T>(options: StateOptions<T>): StateResult<T> {
  const {
    key,
    schema,
    defaultValue,
    persist = true,
    debounceMs = 300,
    onError,
    validate
  } = options;

  const [value, setInternalValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const initializedRef = useRef(false);

  // Load initial value
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      if (persist) {
        const stored = storage.getItem(key, schema, defaultValue);
        setInternalValue(stored);
      }
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load state');
      log.error(`Failed to load state for ${key}:`, error);
      setError(error.message);
      setInternalValue(defaultValue);
      setIsLoading(false);
      onError?.(error);
    }
  }, [key, schema, defaultValue, persist, onError]);

  // Validated setter
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const resolvedValue = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(value)
        : newValue;

      // Custom validation
      if (validate) {
        const validationResult = validate(resolvedValue);
        if (validationResult !== true) {
          const errorMessage = typeof validationResult === 'string'
            ? validationResult
            : 'Validation failed';
          throw new Error(errorMessage);
        }
      }

      // Schema validation
      const validated = schema.parse(resolvedValue);
      
      setInternalValue(validated);
      setError(null);
      setLastUpdated(new Date());

      // Debounced persistence
      if (persist) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        
        debounceRef.current = setTimeout(() => {
          try {
            storage.setItem(key, validated);
          } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to persist state');
            log.error(`Failed to persist state for ${key}:`, error);
            setError(error.message);
            onError?.(error);
          }
        }, debounceMs);
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Invalid state value');
      log.error(`State validation failed for ${key}:`, error);
      setError(error.message);
      onError?.(error);
    }
  }, [value, key, schema, validate, persist, debounceMs, onError]);

  // Reset to default
  const reset = useCallback(() => {
    setInternalValue(defaultValue);
    setError(null);
    setLastUpdated(new Date());
    
    if (persist) {
      storage.setItem(key, defaultValue);
    }
  }, [key, defaultValue, persist]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue,
    reset,
    isLoading,
    error,
    lastUpdated
  };
}

// ===== SPECIALIZED HOOKS =====

// For array state with typed operations
export function useBulletproofArray<T>(
  key: string,
  schema: ZodSchema<T[]>,
  defaultValue: T[] = []
) {
  const state = useBulletproofState({
    key,
    schema,
    defaultValue
  });

  const push = useCallback((item: T) => {
    state.setValue(prev => [...prev, item]);
  }, [state]);

  const remove = useCallback((index: number) => {
    state.setValue(prev => prev.filter((_, i) => i !== index));
  }, [state]);

  const update = useCallback((index: number, item: T) => {
    state.setValue(prev => prev.map((existing, i) => i === index ? item : existing));
  }, [state]);

  const clear = useCallback(() => {
    state.setValue([]);
  }, [state]);

  return {
    ...state,
    push,
    remove,
    update,
    clear,
    length: state.value.length,
    isEmpty: state.value.length === 0
  };
}

// For object state with typed operations
export function useBulletproofObject<T extends Record<string, any>>(
  key: string,
  schema: ZodSchema<T>,
  defaultValue: T
) {
  const state = useBulletproofState({
    key,
    schema,
    defaultValue
  });

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    state.setValue(prev => ({ ...prev, [field]: value }));
  }, [state]);

  const updateFields = useCallback((updates: Partial<T>) => {
    state.setValue(prev => ({ ...prev, ...updates }));
  }, [state]);

  const deleteField = useCallback(<K extends keyof T>(field: K) => {
    state.setValue(prev => {
      const { [field]: _, ...rest } = prev;
      return rest as T;
    });
  }, [state]);

  return {
    ...state,
    updateField,
    updateFields,
    deleteField
  };
}

export default useBulletproofState;