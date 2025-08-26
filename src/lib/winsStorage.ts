import { safeGet, safeSet, generateId, getTodayISO } from './storage';

export interface Win {
  id: string;
  text: string;
  date: string;
  week: string;
  source?: 'task' | 'manual'; // Track where the win came from
}

const WINS_STORAGE_KEY = "fm_wins_v1";

function getWeekKey(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const weekNumber = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

export function getWins(): Win[] {
  return safeGet<Win[]>(WINS_STORAGE_KEY, []);
}

export function saveWin(text: string): void {
  try {
    const wins = getWins();
    const today = getTodayISO();
    const week = getWeekKey(today);
    
    const newWin: Win = {
      id: generateId(),
      text,
      date: today,
      week,
      source: 'manual'
    };
    
    wins.push(newWin);
    safeSet(WINS_STORAGE_KEY, wins);
    
    // Emit change event
    window.dispatchEvent(new CustomEvent('winsChanged'));
  } catch (error) {
    console.error('Failed to save win:', error);
  }
}

// Save a win specifically from task completion
export function saveTaskWin(text: string, taskIndex: number): void {
  try {
    const wins = getWins();
    const today = getTodayISO();
    const week = getWeekKey(today);
    
    const newWin: Win = {
      id: generateId(),
      text: `Task ${taskIndex + 1}: ${text}`,
      date: today,
      week,
      source: 'task'
    };
    
    wins.push(newWin);
    safeSet(WINS_STORAGE_KEY, wins);
    
    // Emit change event
    window.dispatchEvent(new CustomEvent('winsChanged'));
  } catch (error) {
    console.error('Failed to save task win:', error);
  }
}

export function getRecentWins(limit: number = 5): Win[] {
  const wins = getWins();
  return wins
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getTodayWins(): Win[] {
  const today = getTodayISO();
  return getWins().filter(win => win.date === today);
}