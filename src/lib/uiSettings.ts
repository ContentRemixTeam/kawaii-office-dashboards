export interface UISettings {
  showQuickActions: boolean;
  showDailyProgress: boolean;
  showInspiration: boolean;
  minimalMode: boolean;
}

const DEFAULT_SETTINGS: UISettings = {
  showQuickActions: true,
  showDailyProgress: true,
  showInspiration: true,
  minimalMode: false,
};

const STORAGE_KEY = 'fm_ui_settings_v1';

export function getUISettings(): UISettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load UI settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export function saveUISettings(settings: Partial<UISettings>): UISettings {
  try {
    const current = getUISettings();
    const updated = { ...current, ...settings };
    
    // Minimal mode overrides
    if (updated.minimalMode) {
      updated.showQuickActions = false;
      updated.showInspiration = false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to save UI settings:', error);
    return getUISettings();
  }
}

export function toggleMinimalMode(): UISettings {
  const current = getUISettings();
  return saveUISettings({ minimalMode: !current.minimalMode });
}

export function toggleUIFeature(feature: keyof Omit<UISettings, 'minimalMode'>): UISettings {
  const current = getUISettings();
  return saveUISettings({ [feature]: !current[feature] });
}