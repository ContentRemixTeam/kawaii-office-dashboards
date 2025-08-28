/**
 * Layout Configuration
 * Central configuration for all layout constants, breakpoints, and sizing
 */

// Grid and Spacing Constants
export const LAYOUT_CONFIG = {
  // Container sizes
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    content: '1200px', // Standard content width
    dashboard: '1400px', // Dashboard max width
  },

  // Grid gaps and spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Grid systems
  grid: {
    gap: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
    columns: {
      dashboard: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      },
      cards: {
        mobile: 1,
        tablet: 2,
        desktop: 2, // Most cards are 2-column on desktop
      },
    },
  },

  // Breakpoints (Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component heights
  heights: {
    header: '64px',
    sidebar: {
      collapsed: '56px',
      expanded: '240px',
    },
    card: {
      min: '200px',
      standard: '300px',
      large: '400px',
    },
    hero: '500px',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  // Animation durations
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const;

// Type exports for TypeScript
export type SpacingKey = keyof typeof LAYOUT_CONFIG.spacing;
export type BreakpointKey = keyof typeof LAYOUT_CONFIG.breakpoints;
export type GridGapKey = keyof typeof LAYOUT_CONFIG.grid.gap;

// Utility functions
export function getSpacing(key: SpacingKey): string {
  return LAYOUT_CONFIG.spacing[key];
}

export function getBreakpoint(key: BreakpointKey): string {
  return LAYOUT_CONFIG.breakpoints[key];
}

export function getGridGap(key: GridGapKey): string {
  return LAYOUT_CONFIG.grid.gap[key];
}