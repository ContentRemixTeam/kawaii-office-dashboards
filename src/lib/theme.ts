// Theme system initialization and utilities
import { safeGet } from "./storage";

interface ThemeData {
  vars: {
    "--bg-start": string;
    "--bg-end": string;
    "--brand": string;
    "--accent": string;
    "--card": string;
    "--text": string;
  };
  backgroundImage?: string;
  useImage?: boolean;
}

const DEFAULT_THEME: ThemeData = {
  vars: {
    "--bg-start": "350 100% 98%",    // pastel pink
    "--bg-end": "150 40% 96%",       // mint
    "--brand": "340 75% 75%",        // pink accent
    "--accent": "150 60% 85%",       // mint accent
    "--card": "0 0% 100%",           // white
    "--text": "340 15% 25%"          // dark gray
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
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

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