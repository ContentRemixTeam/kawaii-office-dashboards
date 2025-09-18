import { getDailyData, setDailyData, safeGet, safeSet } from '@/lib/storage';
import { emitChanged } from '@/lib/bus';

export interface CurrencyData {
  coins: number;
  gems: number;
  totalEarned: {
    coins: number;
    gems: number;
  };
  dailyEarned: {
    coins: number;
    gems: number;
  };
  lastUpdated: string;
}

export interface CurrencyEarning {
  amount: number;
  type: 'coins' | 'gems';
  source: string;
  timestamp: string;
}

// Storage keys
const CURRENCY_KEY = 'fm_unified_currency_v1';
const DAILY_CURRENCY_KEY = 'fm_daily_currency_v1';
const CURRENCY_LOG_KEY = 'fm_currency_log_v1';

// Earning rates for different activities
export const EARNING_RATES = {
  TASK_COMPLETION: { coins: 10, gems: 0 },
  BIG_THREE_BONUS: { coins: 15, gems: 0 },
  FOCUS_SESSION_SHORT: { coins: 5, gems: 0 },
  FOCUS_SESSION_LONG: { coins: 20, gems: 0 },
  DAILY_STREAK_2: { coins: 5, gems: 0 },
  DAILY_STREAK_7: { coins: 15, gems: 1 },
  DAILY_STREAK_30: { coins: 50, gems: 3 },
  WEEKLY_GOAL: { coins: 25, gems: 1 },
  TROPHY_MILESTONE: { coins: 0, gems: 1 },
  GAME_COMPLETION: { coins: 8, gems: 0 },
  PET_MILESTONE: { coins: 0, gems: 2 }
};

// Get default currency data
const getDefaultCurrencyData = (): CurrencyData => ({
  coins: 150, // Starting coins
  gems: 1, // Starting gem
  totalEarned: { coins: 0, gems: 0 },
  dailyEarned: { coins: 0, gems: 0 },
  lastUpdated: new Date().toISOString()
});

// Get current currency data
export const getCurrencyData = (): CurrencyData => {
  return safeGet(CURRENCY_KEY, getDefaultCurrencyData());
};

// Get daily currency data
export const getDailyCurrencyData = (): CurrencyData => {
  return getDailyData(DAILY_CURRENCY_KEY, getDefaultCurrencyData());
};

// Save currency data
export const saveCurrencyData = (data: CurrencyData) => {
  const updatedData = {
    ...data,
    lastUpdated: new Date().toISOString()
  };
  
  safeSet(CURRENCY_KEY, updatedData);
  setDailyData(DAILY_CURRENCY_KEY, updatedData);
  emitChanged([CURRENCY_KEY]);
};

// Award currency
export const awardCurrency = (
  coins: number = 0, 
  gems: number = 0, 
  source: string = 'manual'
): CurrencyData => {
  const data = getCurrencyData();
  const dailyData = getDailyCurrencyData();
  
  const updatedData: CurrencyData = {
    ...data,
    coins: data.coins + coins,
    gems: data.gems + gems,
    totalEarned: {
      coins: data.totalEarned.coins + coins,
      gems: data.totalEarned.gems + gems
    },
    dailyEarned: {
      coins: dailyData.dailyEarned.coins + coins,
      gems: dailyData.dailyEarned.gems + gems
    }
  };
  
  // Log the earning
  logCurrencyEarning({ amount: coins, type: 'coins', source, timestamp: new Date().toISOString() });
  if (gems > 0) {
    logCurrencyEarning({ amount: gems, type: 'gems', source, timestamp: new Date().toISOString() });
  }
  
  saveCurrencyData(updatedData);
  
  // Emit currency earned event for animations
  if (coins > 0 || gems > 0) {
    window.dispatchEvent(new CustomEvent('currencyEarned', { 
      detail: { coins, gems, source } 
    }));
  }
  
  return updatedData;
};

// Spend currency
export const spendCurrency = (
  coins: number = 0, 
  gems: number = 0, 
  reason: string = 'purchase'
): boolean => {
  const data = getCurrencyData();
  
  // Check if user has enough currency
  if (data.coins < coins || data.gems < gems) {
    return false;
  }
  
  const updatedData: CurrencyData = {
    ...data,
    coins: data.coins - coins,
    gems: data.gems - gems
  };
  
  saveCurrencyData(updatedData);
  
  // Emit spending event
  window.dispatchEvent(new CustomEvent('currencySpent', { 
    detail: { coins, gems, reason } 
  }));
  
  return true;
};

// Award currency based on activity type
export const awardActivityCurrency = (activityType: keyof typeof EARNING_RATES, source?: string): CurrencyData => {
  const rates = EARNING_RATES[activityType];
  return awardCurrency(rates.coins, rates.gems, source || activityType);
};

// Log currency earning for history
const logCurrencyEarning = (earning: CurrencyEarning) => {
  const log = safeGet<CurrencyEarning[]>(CURRENCY_LOG_KEY, []);
  log.push(earning);
  
  // Keep only last 100 entries
  if (log.length > 100) {
    log.splice(0, log.length - 100);
  }
  
  safeSet(CURRENCY_LOG_KEY, log);
};

// Get currency earning history
export const getCurrencyLog = (): CurrencyEarning[] => {
  return safeGet<CurrencyEarning[]>(CURRENCY_LOG_KEY, []);
};

// Check if user can afford something
export const canAfford = (coinsNeeded: number = 0, gemsNeeded: number = 0): boolean => {
  const data = getCurrencyData();
  return data.coins >= coinsNeeded && data.gems >= gemsNeeded;
};

// Get currency display text
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString();
};

// Reset daily currency (called by daily reset system)
export const resetDailyCurrency = () => {
  const data = getCurrencyData();
  const resetData: CurrencyData = {
    ...data,
    dailyEarned: { coins: 0, gems: 0 }
  };
  
  saveCurrencyData(resetData);
};
