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
    
    // Emit change event for components listening to data changes
    try {
      window.dispatchEvent(new CustomEvent("fm:data-changed", { 
        detail: { keys: [dailyKey, baseKey] } 
      }));
    } catch {
      // Ignore if window is not available
    }
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

// Create a backward-compatible schema map for common keys
const SCHEMA_MAP = {
  // Tasks system
  "fm_tasks_v1": z.object({
    tasks: z.array(z.string()).default(["", "", ""]),
    reflections: z.array(z.string()).default(["", "", ""]),
    completed: z.array(z.boolean()).default([false, false, false]),
    selectedAnimal: z.string().default("unicorn"),
    roundsCompleted: z.number().default(0),
    totalTasksCompleted: z.number().default(0),
  }),
  
  // Dashboard data
  "fm_dashboard_v1": z.object({
    streak: z.number().default(0),
    lastCompletedDate: z.string().default(''),
  }),
  
  // Ambient settings
  "fm_ambient_settings_v1": z.object({
    videoId: z.string().default('jfKfPfyJRdk'),
    useAsBackground: z.boolean().default(false),
    volume: z.number().default(50),
    muted: z.boolean().default(true),
  }),
  
  // Default fallback schema for unknown keys
  default: z.any(),
};

// Backward-compatible getDailyData that auto-applies schemas
export function getDailyData<T>(key: string, fallback: T): T {
  const schema = SCHEMA_MAP[key as keyof typeof SCHEMA_MAP] || SCHEMA_MAP.default;
  return storage.getDailyItem(key, schema, fallback);
}

// Re-export for backward compatibility
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

// Celebration settings
export interface CelebrationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  throttleSeconds: number;
  minimalMode: boolean;
}

export function getCelebrationSettings(): CelebrationSettings {
  const defaults: CelebrationSettings = {
    enabled: true,
    soundEnabled: false,
    throttleSeconds: 10,
    minimalMode: false
  };

  try {
    const stored = localStorage.getItem('fm_settings_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaults, ...parsed.encouragement };
    }
  } catch (error) {
    console.warn('Failed to load celebration settings:', error);
  }
  
  return defaults;
}

export function setCelebrationSettings(settings: Partial<CelebrationSettings>): void {
  try {
    const stored = localStorage.getItem('fm_settings_v2') || '{}';
    const parsed = JSON.parse(stored);
    parsed.encouragement = { ...getCelebrationSettings(), ...settings };
    localStorage.setItem('fm_settings_v2', JSON.stringify(parsed));
  } catch (error) {
    console.warn('Failed to save celebration settings:', error);
  }
}

// Legacy GIPHY celebrations setting (kept for backward compatibility)
export function getGiphyCelebrationsEnabled(): boolean {
  try {
    const stored = localStorage.getItem("fm_giphy_celebrations_enabled");
    return stored === null ? true : stored === "true"; // Default to enabled
  } catch {
    return true;
  }
}

export function setGiphyCelebrationsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem("fm_giphy_celebrations_enabled", enabled.toString());
  } catch {
    // Ignore localStorage errors
  }
}
