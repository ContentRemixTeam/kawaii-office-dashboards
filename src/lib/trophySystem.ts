import { safeGet, safeSet, getTodayISO } from "./storage";
import { emitChanged } from "./bus";

export interface Trophy {
  id: string;
  type: "basic" | "silver" | "gold" | "diamond";
  emoji: string;
  name: string;
  description: string;
  earnedAt: string; // ISO date
  sessionStreak: number; // streak when earned
}

export interface TrophyStats {
  totalTrophies: number;
  todayTrophies: number;
  currentStreak: number;
  bestStreak: number;
  lastSessionDate: string;
  dailyHistory: Record<string, number>; // date -> trophies earned
}

export interface SessionLog {
  id: string;
  completedAt: string; // ISO timestamp
  duration: number; // minutes
  trophy: Trophy;
  streak: number;
}

const TROPHY_KEY = "fm_trophies_v1";
const TROPHY_STATS_KEY = "fm_trophy_stats_v1";
const SESSION_LOG_KEY = "fm_session_log_v1";
const POMO_COUNT_KEY = "fm_pomo_trophies_v1"; // For topbar reader compatibility

// Trophy types and thresholds
const TROPHY_TYPES = {
  basic: { emoji: "🏆", name: "Shiny Trophy", description: "Focus session completed!" },
  silver: { emoji: "🥈", name: "Silver Medal", description: "3 sessions in a row!" },
  gold: { emoji: "🏆✨", name: "Gold Trophy", description: "5 sessions in a row!" },
  diamond: { emoji: "👑💎", name: "Diamond Crown", description: "8+ sessions streak!" }
};

const ENCOURAGEMENT_MESSAGES = {
  basic: ["🏆 Focus champion! You earned a trophy.", "✨ Another one in the bag!", "💪 Productivity unlocked!"],
  silver: ["🥈 Silver achieved! Keep it up.", "💪 Streak power! You're on fire.", "⚡ Momentum building nicely!"],
  gold: ["🏆✨ Gold unlocked! Incredible focus.", "🌟 You're absolutely crushing it!", "🔥 This is some serious dedication!"],
  diamond: ["👑💎 Diamond crown earned! You're unstoppable!", "🚀 Peak performance achieved!", "🏆 Focus master level unlocked!"]
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getTrophyType(sessionStreak: number): keyof typeof TROPHY_TYPES {
  if (sessionStreak >= 8) return "diamond";
  if (sessionStreak >= 5) return "gold";
  if (sessionStreak >= 3) return "silver";
  return "basic";
}

export function createTrophy(sessionStreak: number): Trophy {
  const type = getTrophyType(sessionStreak);
  const template = TROPHY_TYPES[type];
  
  return {
    id: generateId(),
    type,
    emoji: template.emoji,
    name: template.name,
    description: template.description,
    earnedAt: getTodayISO(),
    sessionStreak
  };
}

export function awardTrophy(durationMinutes: number): {
  trophy: Trophy;
  message: string;
  isStreakReward: boolean;
} {
  const stats = getTrophyStats();
  
  // Update streak
  const today = getTodayISO();
  const isNewDay = stats.lastSessionDate !== today;
  const newStreak = isNewDay ? 1 : stats.currentStreak + 1;
  
  // Create trophy
  const trophy = createTrophy(newStreak);
  const isStreakReward = trophy.type !== "basic";
  
  // Save trophy
  const trophies = getTrophies();
  trophies.push(trophy);
  safeSet(TROPHY_KEY, trophies);
  
  // Update stats
  const newStats: TrophyStats = {
    ...stats,
    totalTrophies: stats.totalTrophies + 1,
    todayTrophies: isNewDay ? 1 : stats.todayTrophies + 1,
    currentStreak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    lastSessionDate: today,
    dailyHistory: {
      ...stats.dailyHistory,
      [today]: (stats.dailyHistory[today] || 0) + 1
    }
  };
  safeSet(TROPHY_STATS_KEY, newStats);
  
  // Log session
  const sessionLog = getSessionLog();
  sessionLog.push({
    id: generateId(),
    completedAt: new Date().toISOString(),
    duration: durationMinutes,
    trophy,
    streak: newStreak
  });
  
  // Keep only last 50 sessions
  if (sessionLog.length > 50) {
    sessionLog.splice(0, sessionLog.length - 50);
  }
  safeSet(SESSION_LOG_KEY, sessionLog);
  
  // Also maintain simple count for topbar compatibility
  safeSet(POMO_COUNT_KEY, { date: today, count: newStats.todayTrophies });
  
  // Emit changes
  emitChanged([TROPHY_KEY, TROPHY_STATS_KEY, SESSION_LOG_KEY, POMO_COUNT_KEY]);
  
  // Get encouragement message
  const messages = ENCOURAGEMENT_MESSAGES[trophy.type];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  return { trophy, message, isStreakReward };
}

export function getTrophies(): Trophy[] {
  return safeGet<Trophy[]>(TROPHY_KEY, []);
}

export function getTrophyStats(): TrophyStats {
  return safeGet<TrophyStats>(TROPHY_STATS_KEY, {
    totalTrophies: 0,
    todayTrophies: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastSessionDate: "",
    dailyHistory: {}
  });
}

export function getSessionLog(): SessionLog[] {
  return safeGet<SessionLog[]>(SESSION_LOG_KEY, []);
}

export function getTodaySessionLog(): SessionLog[] {
  const today = getTodayISO();
  return getSessionLog().filter(session => 
    session.completedAt.startsWith(today)
  );
}

export function getTrophyCountsByType(): Record<keyof typeof TROPHY_TYPES, number> {
  const trophies = getTrophies();
  const counts = { basic: 0, silver: 0, gold: 0, diamond: 0 };
  
  trophies.forEach(trophy => {
    counts[trophy.type]++;
  });
  
  return counts;
}

// Award trophy specifically for task completion
export function awardTaskTrophy(durationMinutes: number = 5): { trophy: Trophy; message: string; isStreakReward: boolean } {
  return awardTrophy(durationMinutes);
}

export function resetTrophies() {
  safeSet(TROPHY_KEY, []);
  safeSet(TROPHY_STATS_KEY, {
    totalTrophies: 0,
    todayTrophies: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastSessionDate: "",
    dailyHistory: {}
  });
  safeSet(SESSION_LOG_KEY, []);
  emitChanged([TROPHY_KEY, TROPHY_STATS_KEY, SESSION_LOG_KEY]);
}
