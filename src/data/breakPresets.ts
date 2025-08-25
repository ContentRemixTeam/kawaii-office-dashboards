// Break Room YouTube presets organized by category

export interface BreakPreset {
  key: string;
  title: string;
  id: string;        // YouTube video ID
  duration?: string; // e.g., "5 min"
}

export interface BreakCategory {
  key: string;
  title: string;
  emoji: string;
  color: string;     // Tailwind gradient class
  description: string;
  presets: BreakPreset[];
}

export const BREAK_CATEGORIES: BreakCategory[] = [
  {
    key: 'pep_talk',
    title: 'Pep Talk',
    emoji: '🎤',
    color: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20',
    description: 'Quick motivational boosts',
    presets: [
      { key: 'you_got_this', title: 'You Got This!', id: 'KxGRhd_iWuE', duration: '3 min' },
      { key: 'growth_mindset', title: 'Growth Mindset', id: 'hiiEeMN7vbQ', duration: '4 min' },
      { key: 'confidence_boost', title: 'Confidence Boost', id: 'ZXsQAXx_ao0', duration: '5 min' },
      { key: 'daily_affirmations', title: 'Daily Affirmations', id: 'KO0rDbkXw8o', duration: '10 min' }
    ]
  },
  {
    key: 'meditation',
    title: 'Meditation',
    emoji: '🧘',
    color: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20',
    description: 'Quick mindful moments',
    presets: [
      { key: 'breathing_focus', title: 'Breathing Focus', id: 'ZToicYcHIOU', duration: '5 min' },
      { key: 'body_scan', title: 'Body Scan', id: 'O-6f5wQXSu8', duration: '10 min' },
      { key: 'stress_relief', title: 'Stress Relief', id: 'inpok4MKVLM', duration: '8 min' },
      { key: 'mindful_moment', title: 'Mindful Moment', id: 'cEqZthCaMpo', duration: '3 min' }
    ]
  },
  {
    key: 'stretch',
    title: 'Stretch',
    emoji: '🧍',
    color: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20',
    description: 'Desk-friendly movement',
    presets: [
      { key: 'desk_stretch', title: 'Desk Stretch', id: 'RqcOCBb4arc', duration: '7 min' },
      { key: 'shoulder_rolls', title: 'Shoulder Release', id: 'xFjf4B8FjS4', duration: '5 min' },
      { key: 'neck_relief', title: 'Neck Relief', id: 'S9nGjjIhZko', duration: '6 min' },
      { key: 'posture_reset', title: 'Posture Reset', id: 'FtvGaR6haRk', duration: '8 min' }
    ]
  },
  {
    key: 'workout',
    title: 'Short Workout',
    emoji: '💪',
    color: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20',
    description: 'Quick energizers',
    presets: [
      { key: 'desk_cardio', title: 'Desk Cardio', id: 'Eg8B3iMKOuI', duration: '5 min' },
      { key: 'light_yoga', title: 'Office Yoga', id: 'M-8LCs8IXNS', duration: '10 min' },
      { key: 'hiit_quick', title: '5-Min HIIT', id: 'Nz5QGCgF3WE', duration: '5 min' },
      { key: 'energizer', title: 'Energy Boost', id: 'sTANio_2E0Q', duration: '7 min' }
    ]
  },
  {
    key: 'eft_tapping',
    title: 'EFT Tapping',
    emoji: '✋',
    color: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20',
    description: 'Emotional freedom technique',
    presets: [
      { key: 'stress_release', title: 'Stress Release', id: 'PcGIeWRyOhE', duration: '8 min' },
      { key: 'focus_tapping', title: 'Focus Tapping', id: 'xtDQlXd9u7U', duration: '6 min' },
      { key: 'anxiety_calm', title: 'Calm Anxiety', id: 'vps_3lADyYw', duration: '10 min' },
      { key: 'confidence_tap', title: 'Confidence Tap', id: 'KO0rDbkXw8o', duration: '7 min' }
    ]
  },
  {
    key: 'dance_party',
    title: 'Dance Party',
    emoji: '🎶',
    color: 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20',
    description: 'Shake out the energy',
    presets: [
      { key: 'happy_pop', title: 'Happy Pop Mix', id: 'ZbZSe6N_BXs', duration: '4 min' },
      { key: 'lofi_dance', title: 'Lofi Dance Beats', id: 'lTRiuFIWV54', duration: '3 min' },
      { key: 'feel_good', title: 'Feel Good Vibes', id: 'ru0K8uYEZWw', duration: '5 min' },
      { key: 'movement_fun', title: 'Movement Fun', id: 'KI8H6wGzAKo', duration: '6 min' }
    ]
  }
];

// Get category by key
export function getCategoryById(key: string): BreakCategory | undefined {
  return BREAK_CATEGORIES.find(category => category.key === key);
}

// Get preset by key within a category
export function getPresetById(categoryKey: string, presetKey: string): BreakPreset | undefined {
  const category = getCategoryById(categoryKey);
  return category?.presets.find(preset => preset.key === presetKey);
}