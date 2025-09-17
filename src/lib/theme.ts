// Theme system initialization and utilities
import { safeGet } from "./storage";

interface ThemeData {
  vars: {
    "--bg-start": string;
    "--bg-end": string;
    "--brand": string;
    "--brand-fg": string;
    "--accent": string;
    "--accent-fg": string;
    "--card": string;
    "--text": string;
    "--muted": string;
    "--ring": string;
  };
  backgroundImage?: string;
  useImage?: boolean;
  hiddenFeatures?: {
    topBarEnergyWord?: boolean;
    topBarAffirmations?: boolean;
    topBarTaskPet?: boolean;
    topBarEarnedAnimals?: boolean;
    topBarTrophies?: boolean;
    homeVisionStrip?: boolean;
    homeTaskTools?: boolean;
    homeGameified?: boolean;
    homeCustomization?: boolean;
    dailyIntentionAuto?: boolean;
    debriefAuto?: boolean;
    celebrationModals?: boolean;
    pomodoroWinTracking?: boolean;
  };
}

const DEFAULT_THEME: ThemeData = {
  vars: {
    "--bg-start": "350 100% 98%",    // pastel pink
    "--bg-end": "150 40% 96%",       // mint
    "--brand": "340 75% 75%",        // pink accent
    "--brand-fg": "0 0% 100%",       // white text on brand - proper contrast
    "--accent": "150 60% 65%",       // mint accent
    "--accent-fg": "160 30% 25%",    // dark text on accent - proper contrast
    "--card": "0 0% 100%",           // white
    "--text": "220 13% 18%",         // dark gray - high contrast
    "--muted": "220 9% 46%",         // medium gray - good contrast
    "--ring": "340 75% 85%"          // focus ring
  },
  hiddenFeatures: {
    topBarEnergyWord: false,
    topBarAffirmations: false,
    topBarTaskPet: false,
    topBarEarnedAnimals: false,
    topBarTrophies: false,
    homeVisionStrip: false,
    homeTaskTools: false,
    homeGameified: false,
    homeCustomization: false,
    dailyIntentionAuto: false,
    debriefAuto: false,
    celebrationModals: false,
    pomodoroWinTracking: false,
  }
};

export function initializeTheme() {
  if (typeof window === 'undefined') return;
  
  const savedTheme = safeGet<ThemeData>('fm_theme_v1', DEFAULT_THEME);
  applyTheme(savedTheme);
}

export function applyTheme(theme: ThemeData) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply all theme variables
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Also update the main CSS system variables to match theme with proper contrast
  root.style.setProperty('--primary', theme.vars['--brand']);
  root.style.setProperty('--primary-foreground', theme.vars['--brand-fg']);
  root.style.setProperty('--secondary', theme.vars['--accent']);
  root.style.setProperty('--secondary-foreground', theme.vars['--accent-fg']);
  root.style.setProperty('--background', theme.vars['--bg-start']);
  root.style.setProperty('--foreground', theme.vars['--text']);
  root.style.setProperty('--muted-foreground', theme.vars['--muted']);
  
  // Update semantic text variables for perfect readability
  root.style.setProperty('--text-primary', theme.vars['--text']);
  root.style.setProperty('--text-secondary', theme.vars['--muted']);
  root.style.setProperty('--text-brand-contrast', theme.vars['--brand-fg']);
  root.style.setProperty('--text-accent-contrast', theme.vars['--accent-fg']);
  root.style.setProperty('--bg-primary', theme.vars['--card']);

  if (theme.useImage && theme.backgroundImage) {
    document.body.style.backgroundImage = `url(${theme.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
  } else {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundAttachment = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundPosition = '';
  }
}

// Feature visibility helpers
export function isFeatureVisible(featureKey: keyof NonNullable<ThemeData['hiddenFeatures']>): boolean {
  if (typeof window === 'undefined') return true;
  
  const savedTheme = safeGet<ThemeData>('fm_theme_v1', DEFAULT_THEME);
  return !savedTheme.hiddenFeatures?.[featureKey];
}

export function updateFeatureVisibility(updates: Partial<NonNullable<ThemeData['hiddenFeatures']>>) {
  if (typeof window === 'undefined') return;
  
  const currentTheme = safeGet<ThemeData>('fm_theme_v1', DEFAULT_THEME);
  const updatedTheme = {
    ...currentTheme,
    hiddenFeatures: {
      ...DEFAULT_THEME.hiddenFeatures,
      ...currentTheme.hiddenFeatures,
      ...updates
    }
  };
  
  localStorage.setItem('fm_theme_v1', JSON.stringify(updatedTheme));
  
  // Trigger storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'fm_theme_v1',
    newValue: JSON.stringify(updatedTheme)
  }));
}