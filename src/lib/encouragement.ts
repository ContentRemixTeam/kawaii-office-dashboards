import { safeGet } from "@/lib/storage";
import { getTodaysNote } from "@/lib/futureNotes";

export function getRandomEncouragement(): string {
  // Prefer today's note if available
  const todays = getTodaysNote();
  if (todays?.text) return todays.text;

  // Otherwise pull from cabinet + older notes
  const cabinet = safeGet("fm_cabinet_v1", []);
  const future = safeGet("fm_future_notes_v1", []);
  const all: string[] = [];
  
  cabinet.forEach((c: any) => { 
    if (c?.content) all.push(c.content); 
  });
  future.forEach((f: any) => { 
    if (f?.text) all.push(f.text); 
  });
  
  if (all.length === 0) return "You're doing great — keep going 💖";
  return all[Math.floor(Math.random() * all.length)];
}