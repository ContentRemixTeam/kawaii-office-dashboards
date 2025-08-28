import { getDailyData, setDailyData } from '@/lib/storage';

export interface DailyWin {
  id: string;
  taskTitle: string;
  taskIndex: number;
  celebrationNote: string;
  completedAt: string;
}

export interface DailyWinsData {
  wins: DailyWin[];
  lastUpdated: string;
}

const DAILY_WINS_KEY = 'fm_daily_wins_v1';

// Generate unique ID
const generateWinId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get default data
const getDefaultWinsData = (): DailyWinsData => ({
  wins: [],
  lastUpdated: new Date().toISOString(),
});

// Get daily wins data
export const getDailyWinsData = (): DailyWinsData => {
  return getDailyData(DAILY_WINS_KEY, getDefaultWinsData());
};

// Save daily wins data
export const saveDailyWinsData = (data: DailyWinsData) => {
  const updatedData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  
  setDailyData(DAILY_WINS_KEY, updatedData);
};

// Save a new daily win
export const saveDailyWin = (win: Omit<DailyWin, 'id'>) => {
  const data = getDailyWinsData();
  
  const newWin: DailyWin = {
    id: generateWinId(),
    ...win
  };
  
  const updatedData = {
    ...data,
    wins: [...data.wins, newWin]
  };
  
  saveDailyWinsData(updatedData);
  return newWin;
};

// Get wins for display
export const getTodaysWins = (): DailyWin[] => {
  const data = getDailyWinsData();
  return data.wins.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
};

// Clear all wins (for new day reset)
export const clearDailyWins = () => {
  saveDailyWinsData(getDefaultWinsData());
};

// Format time for display
export const formatWinTime = (completedAt: string): string => {
  const date = new Date(completedAt);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};