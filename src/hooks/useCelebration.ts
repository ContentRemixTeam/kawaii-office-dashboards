import { useState, useCallback, useEffect, useRef } from 'react';
import { PetKey, Occasion, GifItem, pickGif } from '@/lib/celebrations';
import { getCelebrationsEnabled } from '@/lib/storage';

export interface CelebrationPayload {
  occasion: Occasion;
  pet?: PetKey | 'general';
  customMessage?: string;
}

export interface CelebrationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  throttleSeconds: number;
  minimalMode: boolean;
}

const DEFAULT_SETTINGS: CelebrationSettings = {
  enabled: true,
  soundEnabled: false,
  throttleSeconds: 10,
  minimalMode: false
};

export function useCelebration() {
  const [currentCelebration, setCurrentCelebration] = useState<{
    gif: GifItem;
    customMessage?: string;
  } | null>(null);
  
  const [settings, setSettings] = useState<CelebrationSettings>(DEFAULT_SETTINGS);
  const lastCelebrationTime = useRef<number>(0);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fm_settings_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.encouragement) {
          setSettings(prev => ({
            ...prev,
            ...parsed.encouragement
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to load celebration settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<CelebrationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      try {
        const stored = localStorage.getItem('fm_settings_v2') || '{}';
        const parsed = JSON.parse(stored);
        parsed.encouragement = updated;
        localStorage.setItem('fm_settings_v2', JSON.stringify(parsed));
      } catch (error) {
        console.warn('Failed to save celebration settings:', error);
      }
      
      return updated;
    });
  }, []);

  const celebrate = useCallback(async ({ occasion, pet, customMessage }: CelebrationPayload) => {
    console.log('[useCelebration] celebrate called with:', { occasion, pet, customMessage });
    
    // Check if celebrations are enabled
    if (!getCelebrationsEnabled() || !settings.enabled || settings.minimalMode) {
      console.log('[useCelebration] Celebrations disabled:', {
        globalEnabled: getCelebrationsEnabled(),
        settingsEnabled: settings.enabled,
        minimalMode: settings.minimalMode
      });
      return;
    }

    // Check throttling
    const now = Date.now();
    if (now - lastCelebrationTime.current < settings.throttleSeconds * 1000) {
      console.log('[useCelebration] Throttled, last celebration was too recent');
      return;
    }

    try {
      console.log('[useCelebration] Calling pickGif...');
      const gif = await pickGif({ pet, occasion });
      console.log('[useCelebration] pickGif returned:', gif);
      
      if (gif) {
        console.log('[useCelebration] Setting celebration state');
        setCurrentCelebration({ gif, customMessage });
        lastCelebrationTime.current = now;
        
        // Play sound if enabled
        if (settings.soundEnabled) {
          try {
            const audio = new Audio('/sounds/celebration-chime.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
              // Ignore audio play failures (user hasn't interacted with page yet)
            });
          } catch (error) {
            console.warn('Failed to play celebration sound:', error);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to show celebration:', error);
    }
  }, [settings]);

  const clearCelebration = useCallback(() => {
    setCurrentCelebration(null);
  }, []);

  // Convenience methods
  const celebrateTask = useCallback((pet?: PetKey) => {
    celebrate({ occasion: 'taskComplete', pet });
  }, [celebrate]);

  const celebratePomodoro = useCallback((pet?: PetKey) => {
    celebrate({ occasion: 'pomodoroComplete', pet });
  }, [celebrate]);

  const celebrateMicroWin = useCallback(() => {
    celebrate({ occasion: 'microWinLogged', pet: 'general' });
  }, [celebrate]);

  return {
    currentCelebration,
    settings,
    celebrate,
    celebrateTask,
    celebratePomodoro,
    celebrateMicroWin,
    clearCelebration,
    updateSettings,
    isEnabled: settings.enabled && getCelebrationsEnabled()
  };
}