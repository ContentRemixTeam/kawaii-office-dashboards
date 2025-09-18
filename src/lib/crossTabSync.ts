/**
 * Cross-tab synchronization for localStorage data
 */

import { errorHandler } from './errorHandler';

class CrossTabSync {
  private listeners: Map<string, Set<(newValue: any, oldValue: any) => void>> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  /**
   * Subscribe to changes for a specific localStorage key
   */
  subscribe(key: string, callback: (newValue: any, oldValue: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(callback);
    
    return () => {
      this.listeners.get(key)?.delete(callback);
      if (this.listeners.get(key)?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  /**
   * Broadcast a change to other tabs (with debouncing)
   */
  broadcastChange(key: string, newValue: any): void {
    // Clear existing timer for this key
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    // Set new debounced timer
    const timer = setTimeout(() => {
      try {
        // Trigger storage event by actually updating localStorage
        const serialized = JSON.stringify(newValue);
        localStorage.setItem(key, serialized);
        this.debounceTimers.delete(key);
      } catch (error) {
        errorHandler.logError(
          error as Error,
          'medium',
          'storage',
          { key, operation: 'broadcast_change' }
        );
      }
    }, 100); // 100ms debounce

    this.debounceTimers.set(key, timer);
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (!event.key) return;

    try {
      const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
      const newValue = event.newValue ? JSON.parse(event.newValue) : null;

      const callbacks = this.listeners.get(event.key);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(newValue, oldValue);
          } catch (error) {
            errorHandler.logError(
              error as Error,
              'medium',
              'general',
              { key: event.key, operation: 'storage_callback' }
            );
          }
        });
      }
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'low',
        'storage',
        { key: event.key, operation: 'handle_storage_event' }
      );
    }
  }

  cleanup(): void {
    this.listeners.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

export const crossTabSync = new CrossTabSync();
export default crossTabSync;