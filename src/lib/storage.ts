// Safe localStorage utilities with fallbacks

export function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// Daily utilities for date-locked features
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDailyData<T>(key: string, fallback: T): T {
  const data = safeGet(key, { date: '', data: fallback });
  const today = getTodayISO();
  
  if (data.date === today) {
    return data.data;
  }
  
  return fallback;
}

export function setDailyData<T>(key: string, value: T): boolean {
  const today = getTodayISO();
  return safeSet(key, { date: today, data: value });
}

// Helper to generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}