// Break Room localStorage management

export interface BreakState {
  activeCategory?: string;
  activePreset?: string;
  customUrl?: string;
  isHeroMode?: boolean;
  lastBreakType?: string;
  lastBreakTime?: string;
}

const KEY = "fm_break_room_v1";

export function loadBreakState(): BreakState {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      activeCategory: data.activeCategory,
      activePreset: data.activePreset,
      customUrl: data.customUrl,
      isHeroMode: data.isHeroMode || false,
      lastBreakType: data.lastBreakType,
      lastBreakTime: data.lastBreakTime
    };
  } catch {
    return {};
  }
}

export function saveBreakState(state: BreakState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  try {
    window.dispatchEvent(new CustomEvent("fm:data-changed", { detail: { keys: [KEY] } }));
  } catch {}
}

export function trackBreakSession(categoryKey: string, presetKey?: string) {
  const state = loadBreakState();
  const updatedState = {
    ...state,
    lastBreakType: categoryKey,
    lastBreakTime: new Date().toISOString(),
    activeCategory: categoryKey,
    activePreset: presetKey
  };
  saveBreakState(updatedState);
}

export const BREAK_KEY = KEY;