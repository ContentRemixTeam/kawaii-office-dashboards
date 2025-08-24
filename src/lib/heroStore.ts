// persist hero choice
export type HeroKind = "image" | "youtube";
export type HeroState = {
  kind: HeroKind;
  imageSrc?: string;           // /public/office-1.jpg etc.
  youtubeUrl?: string;         // https://www.youtube.com/watch?v=...
};

const KEY = "fm_hero_v1";

export function loadHero(): HeroState {
  try { 
    const data = JSON.parse(localStorage.getItem(KEY) || "{}");
    // Provide defaults if data is incomplete
    return {
      kind: data.kind || "image",
      imageSrc: data.imageSrc,
      youtubeUrl: data.youtubeUrl
    };
  } catch { 
    return { kind: "image" }; 
  }
}

export function saveHero(s: HeroState) {
  localStorage.setItem(KEY, JSON.stringify(s));
  try { 
    window.dispatchEvent(new CustomEvent("fm:data-changed", { detail: { keys: [KEY] } })); 
  } catch {}
}

export const HERO_KEY = KEY;

// Available office image options
export const OFFICE_IMAGES = [
  { id: "default", src: "/src/assets/kawaii-office.png", name: "Default Kawaii Office" },
  { id: "office-1", src: "/office-1.jpg", name: "Modern Office" },
  { id: "office-2", src: "/office-2.jpg", name: "Cozy Workspace" },
  { id: "office-3", src: "/office-3.jpg", name: "Minimalist Office" }
];