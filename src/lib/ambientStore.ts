export type AmbientState = {
  activeId?: string;     // preset id or "custom"
  customUrl?: string;    // when user provides a link
  volume?: number;       // 0..1
  muted?: boolean;
  useAsHero?: boolean;   // render in office hero (optional)
};

const KEY = "fm_ambient_v1";
export const AMBIENT_KEY = KEY;

export function loadAmbient(): AmbientState {
  try { 
    return JSON.parse(localStorage.getItem(KEY) || "{}"); 
  } catch { 
    return {}; 
  }
}

export function saveAmbient(s: AmbientState) {
  localStorage.setItem(KEY, JSON.stringify(s));
  try { 
    window.dispatchEvent(new CustomEvent("fm:data-changed", { detail: { keys: [KEY] }})); 
  } catch {}
}