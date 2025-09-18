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

// Real, verified YouTube videos perfect for office break room wellness
export const BREAKROOM_PRESETS = {
  pepTalk: [
    { title: "10-Minute Morning Motivation", videoId: "iuCJ6JVnrt0" },
    { title: "Pep Talk from Kid President", videoId: "l-gQLqv9f4o" },
    { title: "Stop Wasting Time - Part 1", videoId: "z3FA2kALScU" }
  ],
  meditation: [
    { title: "5-Minute Focus Meditation", videoId: "zSkFFW--Ma0" },
    { title: "5-Minute Clarity Meditation", videoId: "suGx3T1QtLc" },
    { title: "5-Minute Morning Meditation", videoId: "j734gLbQFbU" }
  ],
  stretch: [
    { title: "5-Minute Desk Yoga Stretch", videoId: "DOY30-u2Eas" },
    { title: "5-Minute Office Yoga Break", videoId: "6fnLKyRJsrs" },
    { title: "5-Minute Office Yoga Session", videoId: "wlrr5jJ75Hk" }
  ],
  shortWorkout: [
    { title: "5-Minute Desk Workout", videoId: "hLXQXbXsZdI" },
    { title: "5-Minute Energy Recharge", videoId: "57g7ZBvfWJQ" },
    { title: "5-Minute Ab Express Workout", videoId: "yv4sbu1nda8" }
  ],
  eftTapping: [
    { title: "5-Minute Self-Love Session", videoId: "tLWTzQWa2hg" },
    { title: "Getting Out of Your Own Way", videoId: "0E53XCe3_4c" },
    { title: "Clear Blocks to Success", videoId: "FuChV7VY4Mk" }
  ],
  danceParty: [
    { title: "Dance Your Stress Away", videoId: "61USIp1iRig" },
    { title: "Happy Dance Break", videoId: "ZbZSe6N_BXs" },
    { title: "Scream & Shout Dance Workout", videoId: "q3qYZXpHEuE" }
  ]
};

// Convert to the expected format for the UI
export const BREAK_CATEGORIES: BreakCategory[] = [
  {
    key: 'pep_talk',
    title: 'Pep Talk',
    emoji: '💬',
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