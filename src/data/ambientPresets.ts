// Curated ambient YouTube presets with verified embeddable videos

export interface AmbientPreset {
  key: string;
  title: string;
  id: string;        // YouTube video ID
  emoji?: string;
}

export const AMBIENT_PRESETS: AmbientPreset[] = [
  { key: 'lofi_girl', title: 'Lofi Study', id: 'jfKfPfyJRdk', emoji: '🎵' },
  { key: 'coffee_shop', title: 'Cozy Café', id: 'lTRiuFIWV54', emoji: '☕' },
  { key: 'fireplace', title: 'Fireplace', id: 'eyU3bRy2x44', emoji: '🔥' },
  { key: 'ocean', title: 'Ocean Waves', id: 'cjqDNEN_4ro', emoji: '🌊' },
  { key: 'rain', title: 'Rain Window', id: '2Np_UNrAaF8', emoji: '🌧️' },
  { key: 'birds', title: 'Morning Birds', id: 'haggdJjc0zI', emoji: '🐦' },
  { key: 'coworking', title: 'Coworking', id: 'iDuxlrrN-wM', emoji: '🎥' },
  { key: 'body_double', title: 'Body Double', id: 'GkR-FhknLZE', emoji: '👯' },
  { key: 'adhd_focus', title: 'ADHD Focus', id: '-bRc2jrFtzo', emoji: '🧠' },
];

// Get preset by key
export function getPresetById(key: string): AmbientPreset | undefined {
  return AMBIENT_PRESETS.find(preset => preset.key === key);
}

// Get next preset for fallback
export function getNextPreset(currentKey: string): AmbientPreset {
  const currentIndex = AMBIENT_PRESETS.findIndex(preset => preset.key === currentKey);
  const nextIndex = (currentIndex + 1) % AMBIENT_PRESETS.length;
  return AMBIENT_PRESETS[nextIndex];
}