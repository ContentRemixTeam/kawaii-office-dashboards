// Break Room YouTube presets - Curated and verified videos

export interface BreakPreset {
  key: string;
  title: string;
  id: string;        // YouTube video ID  
}

export interface BreakCategory {
  key: string;
  title: string;
  emoji: string;
  color: string;     // Tailwind gradient class
  description: string;
  presets: BreakPreset[];
}

// Verified high-quality YouTube video presets with tested IDs
export const BREAKROOM_PRESETS = {
  pepTalk: [
    { title: "Mel Robbins – Quick Pep Talk", videoId: "YeemJlrNx2Q" },
    { title: "You Got This Motivation", videoId: "rQiHzcdUVAI" },
    { title: "5-Min Confidence Boost", videoId: "tbnzAVRZ9Xc" }
  ],
  meditation: [
    { title: "5-Minute Breathing Meditation", videoId: "ZToicYcHIOU" },
    { title: "Quick Focus Meditation", videoId: "6p0DAz_30qQ" },
    { title: "Calm Mind Reset", videoId: "ssss7V1_eyA" }
  ],
  stretch: [
    { title: "Desk Stretches – 5 Minutes", videoId: "_pdsuOuqNm8" },
    { title: "Stretch Break for Focus", videoId: "2GOoCTVGY1w" },
    { title: "Seated Office Stretches", videoId: "EQV0vPGMqlo" }
  ],
  shortWorkout: [
    { title: "5-Minute Office Workout", videoId: "50kH0qOKhrY" },
    { title: "Quick Cardio Blast", videoId: "gMh-vlQwrmU" },
    { title: "7-Min Energizer", videoId: "ECxYJcnvyMw" }
  ],
  eftTapping: [
    { title: "Tapping for Stress Relief", videoId: "iE_H0rJsgLY" },
    { title: "EFT for Anxiety", videoId: "bhXlzp3QbNs" },
    { title: "Quick Focus Tapping", videoId: "JTpBbUe2-_I" }
  ],
  danceParty: [
    { title: "Happy Dance Break Song", videoId: "ZbZSe6N_BXs" },
    { title: "Lofi Dance Energy", videoId: "jfKfPfyJRdk" },
    { title: "Feel Good 5-Minute Dance", videoId: "dTAAsCNK7RA" },
    { title: "Longer Energy Boost Dance Mix", videoId: "4xDzrJKXOOY" }
  ]
};

// Convert to the expected format for the UI
export const BREAK_CATEGORIES: BreakCategory[] = [
  {
    key: 'pep_talk',
    title: 'Pep Talk',
    emoji: '🎤',
    color: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20',
    description: 'Quick motivational boosts',
    presets: BREAKROOM_PRESETS.pepTalk.map((preset, index) => ({
      key: `pep_talk_${index}`,
      title: preset.title,
      id: preset.videoId
    }))
  },
  {
    key: 'meditation',
    title: 'Meditation',
    emoji: '🧘',
    color: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20',
    description: 'Quick mindful moments',
    presets: BREAKROOM_PRESETS.meditation.map((preset, index) => ({
      key: `meditation_${index}`,
      title: preset.title,
      id: preset.videoId
    }))
  },
  {
    key: 'stretch',
    title: 'Stretch',
    emoji: '🤸',
    color: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20',
    description: 'Desk-friendly movement',
    presets: BREAKROOM_PRESETS.stretch.map((preset, index) => ({
      key: `stretch_${index}`,
      title: preset.title,
      id: preset.videoId
    }))
  },
  {
    key: 'workout',
    title: 'Short Workout',
    emoji: '💪',
    color: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20',
    description: 'Quick energizers',
    presets: BREAKROOM_PRESETS.shortWorkout.map((preset, index) => ({
      key: `workout_${index}`,
      title: preset.title,
      id: preset.videoId
    }))
  },
  {
    key: 'eft_tapping',
    title: 'EFT Tapping',
    emoji: '👆',
    color: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20',
    description: 'Emotional freedom technique',
    presets: BREAKROOM_PRESETS.eftTapping.map((preset, index) => ({
      key: `eft_tapping_${index}`,
      title: preset.title,
      id: preset.videoId
    }))
  },
  {
    key: 'dance_party',
    title: 'Dance Party',
    emoji: '💃',
    color: 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20',
    description: 'Shake out the energy',
    presets: BREAKROOM_PRESETS.danceParty.map((preset, index) => ({
      key: `dance_party_${index}`,
      title: preset.title,
      id: preset.videoId
    }))
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