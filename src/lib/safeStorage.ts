/**
 * SafeStorage - Enhanced localStorage operations with error handling and event dispatch
 * Provides reliable storage operations with graceful fallbacks and cleanup capabilities
 */

import { log } from './log';

// Storage events for reactive updates
const STORAGE_EVENT = 'safeStorageUpdate';

interface StorageEvent extends CustomEvent {
  detail: {
    key: string;
    value: any;
    operation: 'set' | 'remove' | 'clear';
  };
}

interface BackupData {
  timestamp: number;
  version: string;
  data: Record<string, any>;
}

interface StorageConfig {
  maxSize: number; // Max items before cleanup
  backupPrefix: string;
  version: string;
}

class SafeStorage {
  private config: StorageConfig = {
    maxSize: 100,
    backupPrefix: 'fm_backup_',
    version: '1.0'
  };

  private eventBus = new EventTarget();

  /**
   * Get item from localStorage with error handling
   */
  get<T = any>(key: string, fallback: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      
      // Try to parse as JSON, fall back to string
      try {
        return JSON.parse(item);
      } catch (parseError) {
        log.warn(`SafeStorage: Failed to parse JSON for key "${key}", returning as string`);
        return item as unknown as T;
      }
    } catch (error) {
      log.error(`SafeStorage: Failed to get item "${key}":`, error);
      return fallback;
    }
  }

  /**
   * Set item in localStorage with error handling and cleanup
   */
  set(key: string, value: any): boolean {
    try {
      const serialized = JSON.stringify(value);
      
      try {
        localStorage.setItem(key, serialized);
        this.dispatchStorageEvent(key, value, 'set');
        return true;
      } catch (storageError) {
        // Handle quota exceeded error
        if (this.isQuotaExceeded(storageError)) {
          log.warn('SafeStorage: localStorage quota exceeded, attempting cleanup');
          
          if (this.cleanup()) {
            // Try again after cleanup
            try {
              localStorage.setItem(key, serialized);
              this.dispatchStorageEvent(key, value, 'set');
              return true;
            } catch (retryError) {
              log.error('SafeStorage: Failed to set item even after cleanup:', retryError);
              return false;
            }
          } else {
            log.error('SafeStorage: Cleanup failed, cannot store item');
            return false;
          }
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      log.error(`SafeStorage: Failed to set item "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      this.dispatchStorageEvent(key, null, 'remove');
      return true;
    } catch (error) {
      log.error(`SafeStorage: Failed to remove item "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all localStorage items
   */
  clear(): boolean {
    try {
      localStorage.clear();
      this.dispatchStorageEvent('*', null, 'clear');
      return true;
    } catch (error) {
      log.error('SafeStorage: Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Create backup of user data
   */
  backup(includePatterns: string[] = ['fm_']): string | null {
    try {
      const data: Record<string, any> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        // Check if key matches any include pattern
        const shouldInclude = includePatterns.some(pattern => key.includes(pattern));
        if (shouldInclude) {
          const value = this.get(key);
          if (value !== null) {
            data[key] = value;
          }
        }
      }
      
      const backup: BackupData = {
        timestamp: Date.now(),
        version: this.config.version,
        data
      };
      
      const backupString = JSON.stringify(backup, null, 2);
      log.info(`SafeStorage: Created backup with ${Object.keys(data).length} items`);
      
      return backupString;
    } catch (error) {
      log.error('SafeStorage: Failed to create backup:', error);
      return null;
    }
  }

  /**
   * Restore data from backup
   */
  restore(backupString: string, overwrite: boolean = false): boolean {
    try {
      const backup: BackupData = JSON.parse(backupString);
      
      if (!backup.data || !backup.timestamp) {
        log.error('SafeStorage: Invalid backup format');
        return false;
      }
      
      let restoredCount = 0;
      let skippedCount = 0;
      
      for (const [key, value] of Object.entries(backup.data)) {
        // Check if item already exists and overwrite is false
        if (!overwrite && this.get(key) !== null) {
          skippedCount++;
          continue;
        }
        
        if (this.set(key, value)) {
          restoredCount++;
        }
      }
      
      log.info(`SafeStorage: Restored ${restoredCount} items, skipped ${skippedCount} items`);
      return true;
    } catch (error) {
      log.error('SafeStorage: Failed to restore backup:', error);
      return false;
    }
  }

  /**
   * Cleanup old or unnecessary items
   */
  cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): boolean {
    try {
      const keysToDelete: string[] = [];
      const now = Date.now();
      
      // Find items to cleanup
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        // Skip essential keys
        if (this.isEssentialKey(key)) continue;
        
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;
          
          // Try to parse and check if it has a timestamp
          const parsed = JSON.parse(item);
          if (parsed && typeof parsed === 'object' && parsed.timestamp) {
            const age = now - parsed.timestamp;
            if (age > maxAge) {
              keysToDelete.push(key);
            }
          }
        } catch {
          // If we can't parse it, consider it for cleanup if it looks like old data
          if (key.includes('_old_') || key.includes('_temp_')) {
            keysToDelete.push(key);
          }
        }
      }
      
      // Remove old items
      keysToDelete.forEach(key => {
        this.remove(key);
      });
      
      log.info(`SafeStorage: Cleaned up ${keysToDelete.length} old items`);
      return true;
    } catch (error) {
      log.error('SafeStorage: Cleanup failed:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  getUsageInfo(): { used: number; available: number; total: number } {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const item = localStorage.getItem(key);
          if (item) {
            used += key.length + item.length;
          }
        }
      }
      
      // Rough estimation of available space (browsers typically allow 5-10MB)
      const total = 5 * 1024 * 1024; // 5MB estimate
      const available = total - used;
      
      return { used, available, total };
    } catch (error) {
      log.error('SafeStorage: Failed to get usage info:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }

  /**
   * Subscribe to storage events
   */
  subscribe(callback: (event: StorageEvent) => void): () => void {
    const listener = (event: Event) => {
      callback(event as StorageEvent);
    };
    
    this.eventBus.addEventListener(STORAGE_EVENT, listener);
    
    return () => {
      this.eventBus.removeEventListener(STORAGE_EVENT, listener);
    };
  }

  /**
   * Dispatch storage event for reactive updates
   */
  private dispatchStorageEvent(key: string, value: any, operation: 'set' | 'remove' | 'clear'): void {
    try {
      const event = new CustomEvent(STORAGE_EVENT, {
        detail: { key, value, operation }
      }) as StorageEvent;
      
      this.eventBus.dispatchEvent(event);
    } catch (error) {
      log.warn('SafeStorage: Failed to dispatch storage event:', error);
    }
  }

  /**
   * Check if error is quota exceeded
   */
  private isQuotaExceeded(error: any): boolean {
    return (
      error instanceof DOMException &&
      (
        error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )
    );
  }

  /**
   * Check if key is essential and should not be cleaned up
   */
  private isEssentialKey(key: string): boolean {
    const essentialPatterns = [
      'fm_tasks_v1',
      
      'fm_vision_v1',
      'fm_focus_timer_v1',
      'fm_daily_',
      'fm_trophy_'
    ];
    
    return essentialPatterns.some(pattern => key.includes(pattern));
  }

  /**
   * Export all user data for external backup
   */
  exportUserData(): string | null {
    return this.backup(['fm_']);
  }

  /**
   * Import user data from external backup
   */
  importUserData(data: string, overwrite: boolean = false): boolean {
    return this.restore(data, overwrite);
  }
}

// Create singleton instance
export const safeStorage = new SafeStorage();

// Export for direct usage
export default safeStorage;

// Compatibility helpers for existing code
export const safeGet = (key: string, fallback: any = null) => safeStorage.get(key, fallback);
export const safeSet = (key: string, value: any) => safeStorage.set(key, value);
export const safeRemove = (key: string) => safeStorage.remove(key);
export const safeClear = () => safeStorage.clear();