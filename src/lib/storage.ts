/**
 * Type-safe, versioned localStorage with migrations
 */
import { z, ZodSchema } from 'zod';
import { log } from './log';

export interface StorageOptions {
  version?: number;
  migrate?: (oldData: any, fromVersion: number) => any;
}

class SafeStorage {
  private debounceTimeouts = new Map<string, NodeJS.Timeout>();

  getItem<T>(key: string, schema: ZodSchema<T>, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      const validated = schema.safeParse(parsed);
      
      if (validated.success) {
        return validated.data;
      } else {
        log.warn(`Invalid data for key ${key}, using fallback:`, validated.error);
        return fallback;
      }
    } catch (error) {
      log.error(`Failed to get item ${key}:`, error);
      return fallback;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      log.error(`Failed to set item ${key}:`, error);
    }
  }

  setItemDebounced<T>(key: string, value: T, delay = 300): void {
    // Clear existing timeout
    const existing = this.debounceTimeouts.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.setItem(key, value);
      this.debounceTimeouts.delete(key);
    }, delay);

    this.debounceTimeouts.set(key, timeout);
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      log.error(`Failed to remove item ${key}:`, error);
    }
  }

  migrate<T>(
    key: string,
    schema: ZodSchema<T>,
    fallback: T,
    options: StorageOptions
  ): T {
    const { version = 1, migrate } = options;
    
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      
      // Check if data has version info
      const dataVersion = parsed._version || 1;
      
      if (dataVersion < version && migrate) {
        log.info(`Migrating ${key} from v${dataVersion} to v${version}`);
        const migrated = migrate(parsed, dataVersion);
        const withVersion = { ...migrated, _version: version };
        this.setItem(key, withVersion);
        return schema.parse(migrated);
      }

      const validated = schema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      } else {
        log.warn(`Migration validation failed for ${key}, using fallback`);
        return fallback;
      }
    } catch (error) {
      log.error(`Migration failed for ${key}:`, error);
      return fallback;
    }
  }

  // Daily-locked data helpers
  dailyKey(baseKey: string, dateISO?: string): string {
    const date = dateISO || new Date().toISOString().split('T')[0];
    return `${baseKey}:${date}`;
  }

  getDailyItem<T>(
    baseKey: string,
    schema: ZodSchema<T>,
    fallback: T,
    dateISO?: string
  ): T {
    const dailyKey = this.dailyKey(baseKey, dateISO);
    return this.getItem(dailyKey, schema, fallback);
  }

  setDailyItem<T>(
    baseKey: string,
    value: T,
    dateISO?: string
  ): void {
    const dailyKey = this.dailyKey(baseKey, dateISO);
    this.setItem(dailyKey, value);
  }

  // Clear old daily data (keep last 30 days)
  cleanupDailyData(baseKey: string, keepDays = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${baseKey}:`)) {
        const dateStr = key.split(':')[1];
        const date = new Date(dateStr);
        if (date < cutoffDate) {
          localStorage.removeItem(key);
        }
      }
    }
  }
}

export const storage = new SafeStorage();

// Re-export for backward compatibility
export const getDailyData = storage.getDailyItem.bind(storage);
export const setDailyData = storage.setDailyItem.bind(storage);

// Legacy API for backward compatibility
export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    log.error(`Failed to set ${key}:`, error);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// Settings helpers
export function getCelebrationsEnabled(): boolean {
  return safeGet('fm_celebrations_enabled_v1', true);
}

export function setCelebrationsEnabled(enabled: boolean): void {
  safeSet('fm_celebrations_enabled_v1', enabled);
}

export function getEncouragementsEnabled(): boolean {
  return safeGet('fm_encouragements_enabled_v1', true);
}

export function setEncouragementsEnabled(enabled: boolean): void {
  safeSet('fm_encouragements_enabled_v1', enabled);
}

export function getHomeTitle(): string {
  return safeGet('fm_home_title_v1', 'ADHD Virtual Office');
}

export function setHomeTitle(title: string): void {
  safeSet('fm_home_title_v1', title);
}

export function getHomeSubtitle(): string {
  return safeGet('fm_home_subtitle_v1', 'Your AI-powered productivity companion');
}

export function setHomeSubtitle(subtitle: string): void {
  safeSet('fm_home_subtitle_v1', subtitle);
}
