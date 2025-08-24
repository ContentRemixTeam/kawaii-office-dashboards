import { todayISO, nowISO } from "./day";

export const KEY_INTENT  = "fm_daily_intention_v1"; // {date, feel, focus, top3: string[], notes}
export const KEY_DEBRIEF = "fm_daily_debrief_v1";   // {date, wins: string[], reflect, nextTop3: string[]}
export const KEY_PREFS   = "fm_daily_prefs_v1";     // {signoffTime: "17:30", autoPrompt: true}

export function saveJSON(key:string, v:any){ try{ localStorage.setItem(key, JSON.stringify(v)); }catch{} }
export function loadJSON<T=any>(key:string, fallback:T|null=null): T|null {
  try{ const v=localStorage.getItem(key); return v? JSON.parse(v) as T : fallback; }catch{ return fallback; }
}

export function readTodayIntention(){
  const d = loadJSON(KEY_INTENT, null);
  return d?.date===todayISO()? d : null;
}
export function writeTodayIntention(p:{feel:string; focus:string; top3:string[]; notes?:string;}){
  const v = { date: todayISO(), createdAt: nowISO(), ...p };
  saveJSON(KEY_INTENT, v); return v;
}

export function readTodayDebrief(){
  const d = loadJSON(KEY_DEBRIEF, null);
  return d?.date===todayISO()? d : null;
}
export function writeTodayDebrief(p:{wins:string[]; reflect?:string; nextTop3?:string[];}){
  const v = { date: todayISO(), createdAt: nowISO(), ...p };
  saveJSON(KEY_DEBRIEF, v); return v;
}

export function readPrefs(){ return loadJSON(KEY_PREFS, {signoffTime:"17:00", autoPrompt:true})!; }
export function writePrefs(p:any){ saveJSON(KEY_PREFS, {...readPrefs(), ...p}); }

export function shouldShowIntention(): boolean {
  return !readTodayIntention(); // show once per day
}

export function shouldShowDebrief(now: Date=new Date()){
  const prefs = readPrefs();
  if (!prefs.autoPrompt) return false;
  const [hh,mm] = String(prefs.signoffTime||"17:00").split(":").map(n=>parseInt(n,10));
  const ts = new Date(now); ts.setHours(hh,mm,0,0);
  const overdue = now >= ts;
  const already = !!readTodayDebrief();
  return overdue && !already;
}