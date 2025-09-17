/**
 * Storage Operations Consolidation
 * Centralized and type-safe storage operations for the entire application
 */

import { z } from 'zod';
import { log } from './log';

// ===== TYPE DEFINITIONS =====

export interface StorageOptions {
  version?: number;
  migrate?: (oldData: any, fromVersion: number) => any;
}

export interface StorageChangeEvent {
  key: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

// Schema definitions for all stored data
export const StorageSchemas = {
  // Task-related schemas
  tasks: z.object({
    tasks: z.array(z.string()).default(["", "", ""]),
    reflections: z.array(z.string()).default(["", "", ""]),
    completed: z.array(z.boolean()).default([false, false, false]),
    selectedAnimal: z.string().default("unicorn"),
    roundsCompleted: z.number().default(0),
    totalTasksCompleted: z.number().default(0),
  }),

  // Settings schemas
  celebrationSettings: z.object({
    enabled: z.boolean().default(true),
    popupsEnabled: z.boolean().default(true),
    soundEnabled: z.boolean().default(false),
    throttleSeconds: z.number().default(10),
    minimalMode: z.boolean().default(false),
    forcePetTheme: z.boolean().default(true),
  }),

  // Theme schemas
  themeSettings: z.object({
    mode: z.enum(['light', 'dark', 'auto']).default('auto'),
    primaryColor: z.string().default('#e91e63'),
    accentColor: z.string().default('#00bcd4'),
    borderRadius: z.number().default(16),
  }),

  // Ambient settings
  ambientSettings: z.object({
    videoId: z.string().default('jfKfPfyJRdk'),
    useAsBackground: z.boolean().default(false),
    volume: z.number().default(50),
    muted: z.boolean().default(true),
    preset: z.string().optional(),
  }),

  // Focus timer state
  focusTimerState: z.object({
    isRunning: z.boolean().default(false),
    phase: z.enum(['idle', 'focus', 'break']).default('idle'),
    timeRemaining: z.number().default(0),
    sessionCount: z.number().default(0),
    totalFocusTime: z.number().default(0),
  }),

  // Vision board data
  visionData: z.object({
    images: z.array(z.string()).default([]),
    title: z.string().default('My Vision Board'),
    description: z.string().default(''),
    lastUpdated: z.string().default(''),
  }),

  // Pet data
  petData: z.object({
    animal: z.string().nullable().default(null),
    stage: z.number().default(0),
    health: z.number().default(100),
    happiness: z.number().default(100),
    lastFed: z.string().optional(),
  }),

  // Habit tracking
  habitData: z.object({
    habits: z.array(z.object({
      id: z.string(),
      name: z.string(),
      completed: z.boolean().default(false),
      streak: z.number().default(0),
    })).default([]),
    lastUpdated: z.string().default(''),
  }),

  // Generic fallback
  generic: z.any(),
} as const;

// Type extraction
export type TasksData = z.infer<typeof StorageSchemas.tasks>;
export type CelebrationSettings = z.infer<typeof StorageSchemas.celebrationSettings>;
export type ThemeSettings = z.infer<typeof StorageSchemas.themeSettings>;
export type AmbientSettings = z.infer<typeof StorageSchemas.ambientSettings>;
export type FocusTimerState = z.infer<typeof StorageSchemas.focusTimerState>;
export type VisionData = z.infer<typeof StorageSchemas.visionData>;
export type PetData = z.infer<typeof StorageSchemas.petData>;


// Storage keys registry
export const STORAGE_KEYS = {
  // Daily data keys
  TASKS: 'fm_tasks_v1',
  DASHBOARD: 'fm_dashboard_v1',
  
  WINS: 'fm_wins_v1',
  DAILY_INTENTION: 'fm_daily_intention_v1',
  
  // Settings keys
  CELEBRATION_SETTINGS: 'fm_celebration_settings_v2',
  THEME_SETTINGS: 'fm_theme_settings_v2',
  UI_SETTINGS: 'fm_ui_settings_v2',
  
  // Feature data keys
  AMBIENT_SETTINGS: 'fm_ambient_settings_v1',
  FOCUS_TIMER: 'fm_focus_timer_v1',
  VISION_DATA: 'fm_vision_v1',
  PET_DATA: 'fm_pet_data_v1',
  YOUTUBE_SETTINGS: 'fm_youtube_settings_v1',
  
  // Legacy compatibility
  HOME_TITLE: 'fm_home_title_v1',
  HOME_SUBTITLE: 'fm_home_subtitle_v1',
  GIPHY_CELEBRATIONS: 'fm_giphy_celebrations_enabled',
} as const;

// ===== STORAGE ENGINE =====

class UnifiedStorageEngine {
  private eventListeners = new Map<string, Set<(event: StorageChangeEvent) => void>>();
  private debounceTimeouts = new Map<string, NodeJS.Timeout>();

  // ===== CORE OPERATIONS =====
  
  get<T>(key: string, schema: z.ZodSchema<T>, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      const result = schema.safeParse(parsed);
      
      if (result.success) {
        return result.data;
      } else {
        log.warn(`Invalid data for key ${key}:`, result.error);
        return fallback;
      }
    } catch (error) {
      log.error(`Failed to get ${key}:`, error);
      return fallback;
    }
  }

  set<T>(key: string, value: T, emitEvent = true): void {
    try {
      const oldValue = this.getRaw(key);
      localStorage.setItem(key, JSON.stringify(value));
      
      if (emitEvent) {
        this.emitChange(key, oldValue, value);
      }
    } catch (error) {
      log.error(`Failed to set ${key}:`, error);
    }
  }

  setDebounced<T>(key: string, value: T, delay = 300): void {
    const existing = this.debounceTimeouts.get(key);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      this.set(key, value);
      this.debounceTimeouts.delete(key);
    }, delay);

    this.debounceTimeouts.set(key, timeout);
  }

  remove(key: string): void {
    try {
      const oldValue = this.getRaw(key);
      localStorage.removeItem(key);
      this.emitChange(key, oldValue, null);
    } catch (error) {
      log.error(`Failed to remove ${key}:`, error);
    }
  }

  // ===== DAILY DATA OPERATIONS =====

  getDailyKey(baseKey: string, date?: string): string {
    const dateStr = date || new Date().toISOString().split('T')[0];
    return `${baseKey}:${dateStr}`;
  }

  getDailyData<T>(baseKey: string, schema: z.ZodSchema<T>, fallback: T, date?: string): T {
    const dailyKey = this.getDailyKey(baseKey, date);
    return this.get(dailyKey, schema, fallback);
  }

  setDailyData<T>(baseKey: string, value: T, date?: string): void {
    const dailyKey = this.getDailyKey(baseKey, date);
    this.set(dailyKey, value);
  }

  // ===== EVENT SYSTEM =====

  private getRaw(key: string): any {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private emitChange(key: string, oldValue: any, newValue: any): void {
    const event: StorageChangeEvent = {
      key,
      oldValue,
      newValue,
      timestamp: Date.now(),
    };

    // Emit to registered listeners
    const listeners = this.eventListeners.get(key);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          log.error(`Storage listener error for ${key}:`, error);
        }
      });
    }

    // Emit legacy events for compatibility
    try {
      window.dispatchEvent(new CustomEvent('fm:data-changed', { 
        detail: { keys: [key] }
      }));
      window.dispatchEvent(new StorageEvent('storage', { 
        key, 
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        storageArea: localStorage,
        url: window.location.href
      }));
    } catch {
      // Ignore if window is not available
    }
  }

  // ===== LISTENERS =====

  onChange(key: string, listener: (event: StorageChangeEvent) => void): () => void {
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set());
    }
    
    this.eventListeners.get(key)!.add(listener);

    // Return cleanup function
    return () => {
      const listeners = this.eventListeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.eventListeners.delete(key);
        }
      }
    };
  }

  // ===== MAINTENANCE =====

  cleanup(daysToKeep = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes(':')) {
        const [, dateStr] = key.split(':');
        const date = new Date(dateStr);
        if (date < cutoffDate) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => this.remove(key));
    log.info(`Cleaned up ${keysToRemove.length} old storage entries`);
  }
}

// ===== SINGLETON INSTANCE =====

export const unifiedStorage = new UnifiedStorageEngine();

// ===== TYPED ACCESSORS =====

export const storage = {
  // Task operations
  getTasks: (date?: string) => 
    unifiedStorage.getDailyData(STORAGE_KEYS.TASKS, StorageSchemas.tasks, StorageSchemas.tasks.parse({}), date),
  setTasks: (data: TasksData, date?: string) => 
    unifiedStorage.setDailyData(STORAGE_KEYS.TASKS, data, date),

  // Settings operations
  getCelebrationSettings: () => 
    unifiedStorage.get(STORAGE_KEYS.CELEBRATION_SETTINGS, StorageSchemas.celebrationSettings, StorageSchemas.celebrationSettings.parse({})),
  setCelebrationSettings: (data: Partial<CelebrationSettings>) => {
    const current = storage.getCelebrationSettings();
    unifiedStorage.set(STORAGE_KEYS.CELEBRATION_SETTINGS, { ...current, ...data });
  },

  getThemeSettings: () =>
    unifiedStorage.get(STORAGE_KEYS.THEME_SETTINGS, StorageSchemas.themeSettings, StorageSchemas.themeSettings.parse({})),
  setThemeSettings: (data: Partial<ThemeSettings>) => {
    const current = storage.getThemeSettings();
    unifiedStorage.set(STORAGE_KEYS.THEME_SETTINGS, { ...current, ...data });
  },

  // Ambient operations
  getAmbientSettings: () =>
    unifiedStorage.get(STORAGE_KEYS.AMBIENT_SETTINGS, StorageSchemas.ambientSettings, StorageSchemas.ambientSettings.parse({})),
  setAmbientSettings: (data: Partial<AmbientSettings>) => {
    const current = storage.getAmbientSettings();
    unifiedStorage.set(STORAGE_KEYS.AMBIENT_SETTINGS, { ...current, ...data });
  },

  // Focus timer operations
  getFocusTimerState: () =>
    unifiedStorage.get(STORAGE_KEYS.FOCUS_TIMER, StorageSchemas.focusTimerState, StorageSchemas.focusTimerState.parse({})),
  setFocusTimerState: (data: Partial<FocusTimerState>) => {
    const current = storage.getFocusTimerState();
    unifiedStorage.set(STORAGE_KEYS.FOCUS_TIMER, { ...current, ...data });
  },

  // Vision board operations
  getVisionData: () =>
    unifiedStorage.get(STORAGE_KEYS.VISION_DATA, StorageSchemas.visionData, StorageSchemas.visionData.parse({})),
  setVisionData: (data: Partial<VisionData>) => {
    const current = storage.getVisionData();
    unifiedStorage.set(STORAGE_KEYS.VISION_DATA, { ...current, ...data });
  },

  // Pet operations
  getPetData: () =>
    unifiedStorage.get(STORAGE_KEYS.PET_DATA, StorageSchemas.petData, StorageSchemas.petData.parse({})),
  setPetData: (data: Partial<PetData>) => {
    const current = storage.getPetData();
    unifiedStorage.set(STORAGE_KEYS.PET_DATA, { ...current, ...data });
  },


  // Generic operations
  get: unifiedStorage.get.bind(unifiedStorage),
  set: unifiedStorage.set.bind(unifiedStorage),
  setDebounced: unifiedStorage.setDebounced.bind(unifiedStorage),
  remove: unifiedStorage.remove.bind(unifiedStorage),
  onChange: unifiedStorage.onChange.bind(unifiedStorage),
  cleanup: unifiedStorage.cleanup.bind(unifiedStorage),
};

// ===== LEGACY COMPATIBILITY =====

// Re-export original functions for backward compatibility
export { safeGet, safeSet, getDailyData, setDailyData } from './storage';

// Legacy getters/setters
export const getHomeTitle = () => unifiedStorage.get(STORAGE_KEYS.HOME_TITLE, z.string(), 'ADHD Virtual Office');
export const setHomeTitle = (title: string) => unifiedStorage.set(STORAGE_KEYS.HOME_TITLE, title);
export const getHomeSubtitle = () => unifiedStorage.get(STORAGE_KEYS.HOME_SUBTITLE, z.string(), 'Your AI-powered productivity companion');
export const setHomeSubtitle = (subtitle: string) => unifiedStorage.set(STORAGE_KEYS.HOME_SUBTITLE, subtitle);

export const getGiphyCelebrationsEnabled = () => unifiedStorage.get(STORAGE_KEYS.GIPHY_CELEBRATIONS, z.boolean(), true);
export const setGiphyCelebrationsEnabled = (enabled: boolean) => unifiedStorage.set(STORAGE_KEYS.GIPHY_CELEBRATIONS, enabled);