/**
 * Zod schemas for all persisted data types
 */
import { z } from 'zod';

// Base schemas
export const BaseTaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export const PetSchema = z.object({
  animal: z.string().nullable(),
  stage: z.number().min(0).max(3),
  lastFed: z.string().optional(),
});

export const TrophyStatsSchema = z.object({
  totalTrophies: z.number().default(0),
  currentStreak: z.number().default(0),
  bestStreak: z.number().default(0),
  lastActivity: z.string().optional(),
});

export const ThemeSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  accentColor: z.string().default('blue'),
  customBackground: z.string().optional(),
});

export const IntentionSchema = z.object({
  feel: z.string(),
  setAt: z.string(),
  completed: z.boolean().default(false),
});

export const PowerWordSchema = z.object({
  word: z.string(),
  category: z.string(),
  setAt: z.string(),
});

export const AffirmationSchema = z.object({
  text: z.string(),
  category: z.string(),
  drawnAt: z.string(),
});

export const MoneyEntrySchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  category: z.enum(['income', 'expense', 'saving', 'investment']),
  date: z.string(),
  createdAt: z.string(),
});

export const HabitSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  completed: z.boolean(),
  streak: z.number().default(0),
  lastCompleted: z.string().optional(),
  createdAt: z.string(),
});

export const WinSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.enum(['big', 'small', 'personal', 'work']),
  date: z.string(),
  createdAt: z.string(),
});

export const VisionImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  uploadedAt: z.string(),
});

export const SessionLogSchema = z.object({
  id: z.string(),
  type: z.enum(['focus', 'short', 'long']),
  duration: z.number(),
  startedAt: z.string(),
  completedAt: z.string(),
  interrupted: z.boolean().default(false),
});

export const HydrationLogSchema = z.object({
  count: z.number().default(0),
  goal: z.number().default(8),
  lastDrink: z.string().optional(),
});

export const CelebrationStateSchema = z.object({
  celebratedTasks: z.array(z.string()).default([]),
  celebratedSessions: z.array(z.string()).default([]),
  lastCelebration: z.string().optional(),
});

export const AmbientSettingsSchema = z.object({
  videoId: z.string().default('jfKfPfyJRdk'),
  useAsBackground: z.boolean().default(false),
  volume: z.number().min(0).max(100).default(50),
  muted: z.boolean().default(true),
});

export const DashboardDataSchema = z.object({
  streak: z.number().default(0),
  lastCompletedDate: z.string().default(''),
});

// Feature-specific schemas
export const TasksStateSchema = z.object({
  tasks: z.array(BaseTaskSchema).default([]),
  pet: PetSchema.default({ animal: null, stage: 0 }),
  lastUpdate: z.string().optional(),
});

export const FocusStateSchema = z.object({
  sessions: z.array(SessionLogSchema).default([]),
  settings: z.object({
    focusDuration: z.number().default(25),
    shortBreak: z.number().default(5),
    longBreak: z.number().default(15),
    autoStart: z.boolean().default(false),
  }),
  dailyGoal: z.number().default(4),
});

export const SoundsStateSchema = z.object({
  ambientSettings: AmbientSettingsSchema,
  favoritePresets: z.array(z.string()).default([]),
  volume: z.number().min(0).max(100).default(50),
});

export const VisionStateSchema = z.object({
  images: z.array(VisionImageSchema).default([]),
  settings: z.object({
    showOnDashboard: z.boolean().default(true),
    maxImages: z.number().default(12),
  }),
});

export const MoneyStateSchema = z.object({
  entries: z.array(MoneyEntrySchema).default([]),
  monthlyBudget: z.number().optional(),
  currency: z.string().default('USD'),
});

export const HabitsStateSchema = z.object({
  habits: z.array(HabitSchema).default([]),
  settings: z.object({
    showProgress: z.boolean().default(true),
    reminderTime: z.string().optional(),
  }),
});

export const WinsStateSchema = z.object({
  wins: z.array(WinSchema).default([]),
  settings: z.object({
    autoSuggest: z.boolean().default(true),
    showCategories: z.boolean().default(true),
  }),
});

// Versioned schemas for migrations - simplified approach
export const createVersionedSchema = <T extends Record<string, any>>(schema: z.ZodObject<any>) => 
  schema.extend({
    _version: z.number().default(1),
  });

// Export versioned types
export type TasksState = z.infer<typeof TasksStateSchema>;
export type FocusState = z.infer<typeof FocusStateSchema>;
export type SoundsState = z.infer<typeof SoundsStateSchema>;
export type VisionState = z.infer<typeof VisionStateSchema>;
export type MoneyState = z.infer<typeof MoneyStateSchema>;

export type WinsState = z.infer<typeof WinsStateSchema>;
export type Intention = z.infer<typeof IntentionSchema>;
export type PowerWord = z.infer<typeof PowerWordSchema>;
export type Affirmation = z.infer<typeof AffirmationSchema>;
export type SessionLog = z.infer<typeof SessionLogSchema>;
export type VisionImage = z.infer<typeof VisionImageSchema>;
export type MoneyEntry = z.infer<typeof MoneyEntrySchema>;

export type Win = z.infer<typeof WinSchema>;
export type CelebrationState = z.infer<typeof CelebrationStateSchema>;
export type AmbientSettings = z.infer<typeof AmbientSettingsSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;