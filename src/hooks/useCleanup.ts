/**
 * React hook for automatic component cleanup to prevent memory leaks
 */

import { useEffect, useRef, useCallback } from 'react';
import { memoryManager } from '@/lib/memoryManager';
import { errorHandler } from '@/lib/errorHandler';

export interface CleanupCallbacks {
  addInterval: (callback: () => void, delay: number) => NodeJS.Timeout;
  addTimeout: (callback: () => void, delay: number) => NodeJS.Timeout;
  addEventListener: (target: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void;
  removeEventListener: (target: EventTarget, type: string, listener: EventListener, options?: boolean | EventListenerOptions) => void;
  addYouTubePlayer: (player: any) => void;
  addCleanupTask: (cleanupFn: () => void) => void;
  createObjectURL: (object: File | Blob | MediaSource) => string;
  revokeObjectURL: (url: string) => void;
}

/**
 * Hook for automatic component cleanup with memory leak prevention
 */
export function useCleanup(componentName?: string): CleanupCallbacks {
  const cleanupTasks = useRef<Array<() => void>>([]);
  const intervals = useRef<Set<NodeJS.Timeout>>(new Set());
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const eventListeners = useRef<Array<{
    target: EventTarget;
    type: string;
    listener: EventListener;
    options?: boolean | EventListenerOptions;
  }>>([]);
  const youtubeInstances = useRef<Set<any>>(new Set());
  const objectURLs = useRef<Set<string>>(new Set());

  // Cleanup function that runs on unmount
  const cleanup = useCallback(() => {
    try {
      // Clear all intervals
      intervals.current.forEach(interval => {
        clearInterval(interval);
        memoryManager.clearInterval(interval);
      });
      intervals.current.clear();

      // Clear all timeouts
      timeouts.current.forEach(timeout => {
        clearTimeout(timeout);
        memoryManager.clearTimeout(timeout);
      });
      timeouts.current.clear();

      // Remove all event listeners
      eventListeners.current.forEach(({ target, type, listener, options }) => {
        try {
          target.removeEventListener(type, listener, options);
          memoryManager.removeEventListener(target, type, listener, options);
        } catch (error) {
          errorHandler.logError(
            error as Error,
            'low',
            'general',
            { componentName, operation: 'cleanup_event_listener', type }
          );
        }
      });
      eventListeners.current = [];

      // Cleanup YouTube instances
      youtubeInstances.current.forEach(player => {
        memoryManager.unregisterYouTubePlayer(player);
      });
      youtubeInstances.current.clear();

      // Revoke object URLs
      objectURLs.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          errorHandler.logError(
            error as Error,
            'low',
            'general',
            { componentName, operation: 'cleanup_object_url' }
          );
        }
      });
      objectURLs.current.clear();

      // Run custom cleanup tasks
      cleanupTasks.current.forEach(task => {
        try {
          task();
        } catch (error) {
          errorHandler.logError(
            error as Error,
            'medium',
            'general',
            { componentName, operation: 'custom_cleanup_task' }
          );
        }
      });
      cleanupTasks.current = [];

      if (componentName) {
        console.log(`Cleanup completed for component: ${componentName}`);
      }
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'high',
        'general',
        { componentName, operation: 'component_cleanup' },
        'Error during component cleanup'
      );
    }
  }, [componentName]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Managed interval creation
  const addInterval = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const interval = memoryManager.createInterval(callback, delay);
    intervals.current.add(interval);
    return interval;
  }, []);

  // Managed timeout creation
  const addTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = memoryManager.createTimeout(callback, delay);
    timeouts.current.add(timeout);
    return timeout;
  }, []);

  // Managed event listener addition
  const addEventListener = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    try {
      target.addEventListener(type, listener, options);
      memoryManager.addEventListener(target, type, listener, options);
      
      eventListeners.current.push({ target, type, listener, options });
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'medium',
        'general',
        { componentName, operation: 'add_event_listener', type }
      );
    }
  }, [componentName]);

  // Managed event listener removal
  const removeEventListener = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions
  ) => {
    try {
      target.removeEventListener(type, listener, options);
      memoryManager.removeEventListener(target, type, listener, options);
      
      // Remove from tracking
      eventListeners.current = eventListeners.current.filter(
        item => !(item.target === target && item.type === type && item.listener === listener)
      );
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'low',
        'general',
        { componentName, operation: 'remove_event_listener', type }
      );
    }
  }, [componentName]);

  // YouTube player management
  const addYouTubePlayer = useCallback((player: any) => {
    if (player) {
      memoryManager.registerYouTubePlayer(player);
      youtubeInstances.current.add(player);
    }
  }, []);

  // Custom cleanup task addition
  const addCleanupTask = useCallback((cleanupFn: () => void) => {
    cleanupTasks.current.push(cleanupFn);
  }, []);

  // Managed object URL creation
  const createObjectURL = useCallback((object: File | Blob | MediaSource): string => {
    const url = memoryManager.createObjectURL(object);
    objectURLs.current.add(url);
    return url;
  }, []);

  // Managed object URL revocation
  const revokeObjectURL = useCallback((url: string) => {
    memoryManager.revokeObjectURL(url);
    objectURLs.current.delete(url);
  }, []);

  return {
    addInterval,
    addTimeout,
    addEventListener,
    removeEventListener,
    addYouTubePlayer,
    addCleanupTask,
    createObjectURL,
    revokeObjectURL
  };
}

/**
 * Simplified cleanup hook for basic component cleanup
 */
export function useBasicCleanup(componentName?: string): (cleanupFn: () => void) => void {
  const { addCleanupTask } = useCleanup(componentName);
  return addCleanupTask;
}

/**
 * Hook specifically for YouTube component cleanup
 */
export function useYouTubeCleanup(componentName?: string) {
  const { addYouTubePlayer, addCleanupTask, addEventListener, removeEventListener } = useCleanup(componentName);
  
  return {
    registerPlayer: addYouTubePlayer,
    addCleanupTask,
    addEventListener,
    removeEventListener
  };
}

export default useCleanup;