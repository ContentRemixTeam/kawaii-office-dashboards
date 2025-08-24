import { todayISO } from "./today";
import { emitChanged } from "./bus";

// Re-export emitChanged for convenience
export { emitChanged };

export const KEY_ENERGY  = "fm_energy_v1";
export const KEY_AFFIRM  = "fm_affirmations_v1";
export const KEY_TASKS   = "fm_tasks_v1";
export const KEY_WINS    = "fm_wins_v1";
export const KEY_VISION  = "fm_vision_v1";

export function readEnergy() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY_ENERGY) || "null");
    return d?.date === todayISO() ? d.word ?? null : null;
  } catch { return null; }
}

export function readAffirmation() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY_AFFIRM) || "null");
    if (d?.date !== todayISO()) return { text: null, title: null };
    return {
      text: d.text ?? d.card?.text ?? null,
      title: d.title ?? d.card?.title ?? null,
    };
  } catch { return { text: null, title: null }; }
}

export function readPetStage() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY_TASKS) || "null");
    if (d?.date !== todayISO()) return { animal: null, stage: 0 };
    const done = Array.isArray(d.completed) ? d.completed.filter(Boolean).length : 0;
    return { animal: d.selectedAnimal ?? null, stage: Math.min(3, done) };
  } catch { return { animal: null, stage: 0 }; }
}

/** Return up to N image URLs saved by Vision Board */
export function readVisionThumbs(max = 3): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY_VISION) || "null");
    const items = Array.isArray(v?.items) ? v.items : [];
    return items
      .filter((it:any) => it?.kind === "image" && typeof it?.image_url === "string" && it.image_url)
      .sort((a:any,b:any)=> (a.z ?? 0) - (b.z ?? 0))
      .slice(0, max)
      .map((it:any)=> it.image_url);
  } catch { return []; }
}