import { toLocalISODate } from "./localDate";

export const KEY_ENERGY  = "fm_energy_v1";
export const KEY_AFFIRM  = "fm_affirmations_v1";
export const KEY_TASKS   = "fm_tasks_v1";
export const KEY_WINS    = "fm_wins_v1";
export const KEY_FOCUS   = "fm_focus_v1";
export const KEY_VISION  = "fm_vision_v1";

export function readEnergy() {
  try { 
    const d = JSON.parse(localStorage.getItem(KEY_ENERGY)||"{}");
    if (d?.date === toLocalISODate()) return d.word || null; 
    return null; 
  } catch { 
    return null; 
  }
}

export function readAffirmationFull(): { text:string|null; title?:string|null } {
  try {
    const d = JSON.parse(localStorage.getItem(KEY_AFFIRM)||"{}");
    if (d?.date === toLocalISODate()) {
      // support either {text} or {card:{text,title}}
      const text = d.text ?? d.card?.text ?? null;
      const title = d.title ?? d.card?.title ?? null;
      return { text, title };
    }
    return { text: null, title: null };
  } catch { 
    return { text: null, title: null }; 
  }
}

export function readPetStage() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY_TASKS)||"{}");
    if (d?.date !== toLocalISODate()) return { animal:null, stage:0 };
    const done = Array.isArray(d.completed) ? d.completed.filter(Boolean).length : 0;
    return { animal: d.selectedAnimal || null, stage: Math.min(3, done) };
  } catch { 
    return { animal:null, stage:0 }; 
  }
}

export function readWinsToday() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY_WINS)||"[]");
    const t = toLocalISODate();
    return arr.filter((w:any)=> (w?.date||"").slice(0,10) === t).length;
  } catch { 
    return 0; 
  }
}

export function readTimer() {
  try { 
    const d = JSON.parse(localStorage.getItem(KEY_FOCUS)||"{}");
    return { phase: d.phase || "idle", isRunning: !!d.isRunning, endsAt: d.endsAt || null };
  } catch { 
    return { phase:"idle", isRunning:false, endsAt:null }; 
  }
}

/** Mini vision board thumbnails: return up to 3 image URLs from fm_vision_v1 */
export function readVisionThumbs(max=3): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY_VISION)||"{}");
    const items = Array.isArray(v?.items) ? v.items : []; // expect [{kind,image_url,text,...}]
    const urls = items
      .filter((it:any)=> it?.kind === "image" && typeof it?.image_url === "string" && it.image_url.length>0)
      .sort((a:any,b:any)=> (a.z??0)-(b.z??0)) // mild sort so it's stable
      .slice(0, max)
      .map((it:any)=> it.image_url);
    return urls;
  } catch { 
    return []; 
  }
}