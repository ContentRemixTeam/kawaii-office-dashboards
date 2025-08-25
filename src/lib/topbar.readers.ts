export const K_ENERGY   = "fm_energy_v1";         // {date, word}
export const K_AFFIRM   = "fm_affirmations_v1";   // {date, cardIndex, text}
export const K_TASKS    = "fm_tasks_v1";          // {date, selectedAnimal, completed:[bool,bool,bool]}
export const K_TROPHIES = "fm_pomo_trophies_v1";  // {date, count}

function ls<T>(k: string, f: T): T { 
  try { 
    const v = localStorage.getItem(k); 
    return v ? JSON.parse(v) as T : f; 
  } catch { 
    return f; 
  } 
}

function todayISO(): string { 
  return new Date().toISOString().slice(0, 10); 
}

function isToday(d?: string): boolean { 
  return d === todayISO(); 
}

export function readPowerWord(): string {
  const v = ls<any>(K_ENERGY, null);
  console.log('readPowerWord - raw data:', v);
  console.log('readPowerWord - isToday check:', v?.date, 'vs', todayISO(), '=', isToday(v?.date));
  
  if (!v) return "";
  if (!isToday(v.date)) return "";
  
  const word = v.word || "";
  console.log('readPowerWord - extracted word:', word);
  return String(word);
}

export function readAffirmation(): string {
  const v = ls<any>(K_AFFIRM, null);
  return v && isToday(v.date) && v.text ? String(v.text) : "";
}

export function readPet(): { animal: string; stage: number } {
  const v = ls<any>(K_TASKS, null);
  const completed = Array.isArray(v?.completed) ? v.completed.filter(Boolean).length : 0;
  const stage = Math.max(0, Math.min(3, completed)); // 0..3
  const animal = v?.selectedAnimal || "";
  return (v && isToday(v.date)) ? { animal, stage } : { animal: "", stage: 0 };
}

export function readTrophies(): number {
  // Try new trophy system first
  try {
    const stats = ls<any>("fm_trophy_stats_v1", null);
    if (stats && stats.todayTrophies !== undefined) {
      return stats.todayTrophies;
    }
  } catch {}
  
  // Fallback to old system
  const v = ls<any>(K_TROPHIES, null);
  return v && isToday(v.date) && Number.isFinite(v.count) ? v.count : 0;
}