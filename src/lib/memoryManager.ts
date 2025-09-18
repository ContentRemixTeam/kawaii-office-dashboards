/**
 * Memory management utilities for preventing memory leaks and optimizing performance
 */

import { errorHandler } from './errorHandler';

class MemoryManager {
  private observers: Set<MutationObserver> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private eventListeners: Map<EventTarget, Map<string, EventListener[]>> = new Map();
  private youtubeInstances: Set<any> = new Set();
  private objectURLs: Set<string> = new Set();

  /**
   * Register a YouTube player instance for cleanup tracking
   */
  registerYouTubePlayer(player: any): void {
    this.youtubeInstances.add(player);
  }

  /**
   * Unregister and cleanup YouTube player instance
   */
  unregisterYouTubePlayer(player: any): void {
    if (this.youtubeInstances.has(player)) {
      try {
        if (player && typeof player.destroy === 'function') {
          player.destroy();
        }
      } catch (error) {
        errorHandler.logError(
          error as Error,
          'low',
          'general',
          { operation: 'youtube_cleanup' },
          'Error cleaning up video player'
        );
      } finally {
        this.youtubeInstances.delete(player);
      }
    }
  }

  /**
   * Clean up all YouTube instances
   */
  cleanupAllYouTubePlayers(): void {
    this.youtubeInstances.forEach(player => {
      this.unregisterYouTubePlayer(player);
    });
    this.youtubeInstances.clear();
  }

  /**
   * Safe interval creation with automatic cleanup tracking
   */
  createInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(() => {
      try {
        callback();
      } catch (error) {
        errorHandler.logError(
          error as Error,
          'medium',
          'general',
          { operation: 'interval_callback' }
        );
      }
    }, delay);
    
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Safe timeout creation with automatic cleanup tracking
   */
  createTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      try {
        callback();
      } catch (error) {
        errorHandler.logError(
          error as Error,
          'medium',
          'general',
          { operation: 'timeout_callback' }
        );
      } finally {
        this.timeouts.delete(timeout);
      }
    }, delay);
    
    this.timeouts.add(timeout);
    return timeout;
  }

  /**
   * Clear specific interval
   */
  clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  /**
   * Clear specific timeout
   */
  clearTimeout(timeout: NodeJS.Timeout): void {
    clearTimeout(timeout);
    this.timeouts.delete(timeout);
  }

  /**
   * Clear all intervals and timeouts
   */
  clearAllTimers(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.intervals.clear();
    this.timeouts.clear();
  }

  /**
   * Safe event listener registration with cleanup tracking
   */
  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    try {
      target.addEventListener(type, listener, options);
      
      // Track for cleanup
      if (!this.eventListeners.has(target)) {
        this.eventListeners.set(target, new Map());
      }
      
      const targetListeners = this.eventListeners.get(target)!;
      if (!targetListeners.has(type)) {
        targetListeners.set(type, []);
      }
      
      targetListeners.get(type)!.push(listener);
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'medium',
        'general',
        { operation: 'addEventListener', type }
      );
    }
  }

  /**
   * Safe event listener removal
   */
  removeEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions
  ): void {
    try {
      target.removeEventListener(type, listener, options);
      
      // Remove from tracking
      const targetListeners = this.eventListeners.get(target);
      if (targetListeners) {
        const typeListeners = targetListeners.get(type);
        if (typeListeners) {
          const index = typeListeners.indexOf(listener);
          if (index > -1) {
            typeListeners.splice(index, 1);
          }
          
          // Clean up empty arrays
          if (typeListeners.length === 0) {
            targetListeners.delete(type);
          }
        }
        
        // Clean up empty maps
        if (targetListeners.size === 0) {
          this.eventListeners.delete(target);
        }
      }
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'low',
        'general',
        { operation: 'removeEventListener', type }
      );
    }
  }

  /**
   * Remove all event listeners for a target
   */
  removeAllEventListeners(target: EventTarget): void {
    const targetListeners = this.eventListeners.get(target);
    if (targetListeners) {
      targetListeners.forEach((listeners, type) => {
        listeners.forEach(listener => {
          try {
            target.removeEventListener(type, listener);
          } catch (error) {
            errorHandler.logError(
              error as Error,
              'low',
              'general',
              { operation: 'removeAllEventListeners', type }
            );
          }
        });
      });
      this.eventListeners.delete(target);
    }
  }

  /**
   * Register MutationObserver for cleanup tracking
   */
  registerObserver(observer: MutationObserver): void {
    this.observers.add(observer);
  }

  /**
   * Unregister and disconnect MutationObserver
   */
  unregisterObserver(observer: MutationObserver): void {
    if (this.observers.has(observer)) {
      try {
        observer.disconnect();
      } catch (error) {
        errorHandler.logError(
          error as Error,
          'low',
          'general',
          { operation: 'observer_cleanup' }
        );
      } finally {
        this.observers.delete(observer);
      }
    }
  }

  /**
   * Create object URL with cleanup tracking
   */
  createObjectURL(object: File | Blob | MediaSource): string {
    try {
      const url = URL.createObjectURL(object);
      this.objectURLs.add(url);
      return url;
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'medium',
        'general',
        { operation: 'createObjectURL' }
      );
      throw error;
    }
  }

  /**
   * Revoke object URL and remove from tracking
   */
  revokeObjectURL(url: string): void {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'low',
        'general',
        { operation: 'revokeObjectURL' }
      );
    } finally {
      this.objectURLs.delete(url);
    }
  }

  /**
   * Get memory usage information (if available)
   */
  getMemoryInfo(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Force garbage collection (if supported)
   */
  forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch (error) {
        errorHandler.logError(
          error as Error,
          'low',
          'general',
          { operation: 'force_gc' }
        );
      }
    }
  }

  /**
   * Get current resource counts for monitoring
   */
  getResourceCounts(): {
    intervals: number;
    timeouts: number;
    eventListeners: number;
    youtubeInstances: number;
    observers: number;
    objectURLs: number;
  } {
    let eventListenerCount = 0;
    this.eventListeners.forEach(targetMap => {
      targetMap.forEach(listeners => {
        eventListenerCount += listeners.length;
      });
    });

    return {
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
      eventListeners: eventListenerCount,
      youtubeInstances: this.youtubeInstances.size,
      observers: this.observers.size,
      objectURLs: this.objectURLs.size
    };
  }

  /**
   * Complete cleanup of all tracked resources
   */
  cleanup(): void {
    // Clear all timers
    this.clearAllTimers();
    
    // Cleanup YouTube instances
    this.cleanupAllYouTubePlayers();
    
    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        errorHandler.logError(error as Error, 'low', 'general', { operation: 'cleanup_observer' });
      }
    });
    this.observers.clear();
    
    // Revoke all object URLs
    this.objectURLs.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        errorHandler.logError(error as Error, 'low', 'general', { operation: 'cleanup_objectURL' });
      }
    });
    this.objectURLs.clear();
    
    // Note: We don't automatically remove event listeners as they might be needed
    // Components should call removeAllEventListeners for their specific targets
  }

  /**
   * Log current memory status for debugging
   */
  logMemoryStatus(): void {
    const resources = this.getResourceCounts();
    const memoryInfo = this.getMemoryInfo();
    
    console.log('Memory Manager Status:', {
      resources,
      memoryInfo,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoryManager.cleanup();
  });
}

export default memoryManager;