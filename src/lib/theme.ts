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
}

const DEFAULT_THEME: ThemeData = {
  vars: {
    "--bg-start": "350 100% 98%",    // pastel pink
    "--bg-end": "150 40% 96%",       // mint
    "--brand": "340 75% 75%",        // pink accent
    "--brand-fg": "0 0% 100%",       // white text on brand
    "--accent": "150 60% 65%",       // mint accent
    "--accent-fg": "160 30% 25%",    // dark text on accent
    "--card": "0 0% 100%",           // white
    "--text": "340 15% 25%",         // dark gray
    "--muted": "340 10% 45%",        // secondary text
    "--ring": "340 75% 85%"          // focus ring
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

  // Also update the main CSS system variables to match theme
  root.style.setProperty('--primary', theme.vars['--brand']);
  root.style.setProperty('--primary-foreground', theme.vars['--brand-fg']);
  root.style.setProperty('--secondary', theme.vars['--accent']);
  root.style.setProperty('--secondary-foreground', theme.vars['--accent-fg']);
  root.style.setProperty('--background', theme.vars['--bg-start']);
  root.style.setProperty('--foreground', theme.vars['--text']);
  root.style.setProperty('--muted-foreground', theme.vars['--muted']);

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