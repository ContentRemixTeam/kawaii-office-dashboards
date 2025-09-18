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
    "--bg-start": "220 5% 98%",      // very light background
    "--bg-end": "220 5% 99%",        // almost white
    "--brand": "220 13% 90%",        // light pastel blue
    "--brand-fg": "220 15% 25%",     // dark text on brand - proper contrast
    "--accent": "200 25% 92%",       // very light pastel blue-gray
    "--accent-fg": "200 15% 30%",    // dark text on accent - proper contrast
    "--card": "0 0% 100%",           // white
    "--text": "220 13% 18%",         // dark gray - high contrast
    "--muted": "220 9% 55%",         // medium gray - good contrast
    "--ring": "220 25% 85%"          // light pastel focus ring
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
  console.log('🚀 Initializing theme system');
  if (typeof window === 'undefined') return;
  
  // Reset to default kawaii theme and clear any theme data attributes
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.classList.remove('theme-green', 'dark', 'light');
  
  // Clear green theme from localStorage and use default kawaii theme
  localStorage.removeItem('fm_theme_v1');
  
  // Force apply the default theme immediately
  applyTheme(DEFAULT_THEME);
  
  console.log('🎨 Theme initialized with values:', DEFAULT_THEME.vars);
  
  // Also trigger a re-render by dispatching a custom event
  window.dispatchEvent(new CustomEvent('themeChanged'));
  
  // Force a background refresh since BackgroundManager might be overriding
  setTimeout(() => {
    console.log('🔄 Re-applying theme after 100ms to ensure it sticks');
    applyTheme(DEFAULT_THEME);
  }, 100);
}

export function applyTheme(theme: ThemeData) {
  if (typeof window === 'undefined') return;
  
  console.log('🎨 Applying theme:', theme);
  
  const root = document.documentElement;
  
  // Apply all theme variables
  Object.entries(theme.vars).forEach(([key, value]) => {
    console.log(`Setting ${key}: ${value}`);
    root.style.setProperty(key, value);
  });

  console.log('✅ Theme variables applied');

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
  
  // Ensure timer colors update with theme
  root.style.setProperty('--timer-focus-fill', theme.vars['--brand']);
  root.style.setProperty('--timer-short-fill', theme.vars['--accent']);
  root.style.setProperty('--timer-long-fill', theme.vars['--accent']); // Use accent for long break too
  root.style.setProperty('--timer-focus-glow', `hsl(${theme.vars['--brand']} / 0.6)`);
  root.style.setProperty('--timer-short-glow', `hsl(${theme.vars['--accent']} / 0.6)`);
  root.style.setProperty('--timer-long-glow', `hsl(${theme.vars['--accent']} / 0.6)`);

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