import { todayISO } from "@/lib/day";

const KEY = "fm_future_notes_v1";

export type FutureNote = { 
  id: string; 
  text: string; 
  date: string; 
};

export function getFutureNotes(): FutureNote[] {
  try { 
    return JSON.parse(localStorage.getItem(KEY) || "[]"); 
  } catch { 
    return []; 
  }
}

export function addFutureNote(text: string): FutureNote {
  const notes = getFutureNotes();
  const item: FutureNote = { 
    id: crypto.randomUUID(), 
    text, 
    date: todayISO() 
  };
  localStorage.setItem(KEY, JSON.stringify([...notes, item]));
  return item;
}

export function getTodaysNote(): FutureNote | null {
  const today = todayISO();
  return getFutureNotes().find(n => n.date === today) || null;
}