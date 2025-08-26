import { useState, useEffect } from 'react';
import { getUISettings, saveUISettings, type UISettings } from '@/lib/uiSettings';

export function useUISettings() {
  const [settings, setSettings] = useState<UISettings>(getUISettings);

  useEffect(() => {
    setSettings(getUISettings());
  }, []);

  const updateSettings = (updates: Partial<UISettings>) => {
    const newSettings = saveUISettings(updates);
    setSettings(newSettings);
    return newSettings;
  };

  const toggleFeature = (feature: keyof Omit<UISettings, 'minimalMode'>) => {
    return updateSettings({ [feature]: !settings[feature] });
  };

  const toggleMinimalMode = () => {
    return updateSettings({ minimalMode: !settings.minimalMode });
  };

  return {
    ...settings,
    updateSettings,
    toggleFeature,
    toggleMinimalMode,
  };
}