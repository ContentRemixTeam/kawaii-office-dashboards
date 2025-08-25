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

function dailyKey(baseKey: string): string {
  return `${baseKey}:${todayISO()}`;
}

function todayISO(): string { 
  return new Date().toISOString().slice(0, 10); 
}

function isToday(d?: string): boolean { 
  return d === todayISO(); 
}

export function readPowerWord(): string {
  // Try daily key first (new format)
  const dailyV = ls<any>(dailyKey(K_ENERGY), null);
  console.log('readPowerWord - daily key data:', dailyV);
  
  if (dailyV && dailyV.word) {
    console.log('readPowerWord - using daily key format, word:', dailyV.word);
    return String(dailyV.word);
  }
  
  // Fallback to old format
  const v = ls<any>(K_ENERGY, null);
  console.log('readPowerWord - legacy data:', v);
  console.log('readPowerWord - isToday check:', v?.date, 'vs', todayISO(), '=', isToday(v?.date));
  console.log('readPowerWord - localStorage all energy keys:', Object.keys(localStorage).filter(k => k.includes('energy')));
  
  if (!v) {
    console.log('readPowerWord - no data found');
    return "";
  }
  if (!isToday(v.date)) {
    console.log('readPowerWord - date mismatch, returning empty');
    return "";
  }
  
  const word = v.word || "";
  console.log('readPowerWord - extracted word:', word);
  return String(word);
}

export function readAffirmation(): string {
  // Try daily key first (new format)
  const dailyV = ls<any>(dailyKey(K_AFFIRM), null);
  console.log('readAffirmation - daily key data:', dailyV);
  
  if (dailyV && dailyV.text) {
    console.log('readAffirmation - using daily key format, text:', dailyV.text);
    return String(dailyV.text);
  }
  
  // Fallback to old format
  const v = ls<any>(K_AFFIRM, null);
  console.log('readAffirmation - legacy data:', v);
  console.log('readAffirmation - isToday check:', v?.date, 'vs', todayISO(), '=', isToday(v?.date));
  console.log('readAffirmation - text found:', v?.text);
  
  if (!v) {
    console.log('readAffirmation - no data found');
    return "";
  }
  if (!isToday(v.date)) {
    console.log('readAffirmation - date mismatch, returning empty');
    return "";
  }
  
  const text = v.text || "";
  console.log('readAffirmation - extracted text:', text);
  return String(text);
}

export function readPet(): { animal: string; stage: number } {
  // Try daily key first (new format)
  const dailyV = ls<any>(dailyKey(K_TASKS), null);
  console.log('readPet - daily key data:', dailyV);
  
  if (dailyV) {
    const completed = Array.isArray(dailyV.completed) ? dailyV.completed.filter(Boolean).length : 0;
    const stage = Math.max(0, Math.min(3, completed)); // 0..3
    const animal = dailyV.selectedAnimal || "";
    console.log('readPet - daily format - completed:', completed, 'stage:', stage, 'animal:', animal);
    return { animal, stage };
  }
  
  // Fallback to old format
  const v = ls<any>(K_TASKS, null);
  console.log('readPet - legacy data:', v);
  console.log('readPet - isToday check:', v?.date, 'vs', todayISO(), '=', isToday(v?.date));
  console.log('readPet - selectedAnimal:', v?.selectedAnimal);
  console.log('readPet - completed array:', v?.completed);
  
  const completed = Array.isArray(v?.completed) ? v.completed.filter(Boolean).length : 0;
  const stage = Math.max(0, Math.min(3, completed)); // 0..3
  const animal = v?.selectedAnimal || "";
  
  console.log('readPet - legacy format - completed:', completed, 'stage:', stage, 'animal:', animal);
  
  return (v && isToday(v.date)) ? { animal, stage } : { animal: "", stage: 0 };
}

export function readTrophies(): number {
  console.log('readTrophies - checking both trophy systems...');
  
  // Try new trophy system first
  try {
    const stats = ls<any>("fm_trophy_stats_v1", null);
    console.log('readTrophies - new system stats:', stats);
    if (stats && stats.todayTrophies !== undefined) {
      console.log('readTrophies - using new system, todayTrophies:', stats.todayTrophies);
      return stats.todayTrophies;
    }
  } catch (e) {
    console.log('readTrophies - new system error:', e);
  }
  
  // Fallback to old system
  const v = ls<any>(K_TROPHIES, null);
  console.log('readTrophies - old system data:', v);
  const result = v && isToday(v.date) && Number.isFinite(v.count) ? v.count : 0;
  console.log('readTrophies - final result:', result);
  return result;
}