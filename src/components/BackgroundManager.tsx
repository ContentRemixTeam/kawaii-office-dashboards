import { useState, useEffect } from "react";
import { loadAmbient } from "@/lib/ambientStore";
import { loadHero, OFFICE_IMAGES } from "@/lib/heroStore";
import { getYouTubeId } from "@/lib/youtube";

const BG_KEY = "fm_background_v1";

type BackgroundType = "default" | "solid" | "gradient" | "image" | "youtube";

type BackgroundState = {
  type: BackgroundType;
  solidColor?: string;
  gradientPreset?: string;
  imageSrc?: string;
  youtubeUrl?: string;
};

const SOLID_COLORS = [
  { name: "Soft Pink", value: "hsl(340, 50%, 95%)" },
  { name: "Mint Green", value: "hsl(150, 40%, 95%)" },
  { name: "Lavender", value: "hsl(280, 40%, 95%)" },
  { name: "Peach", value: "hsl(25, 60%, 95%)" },
  { name: "Sky Blue", value: "hsl(200, 50%, 95%)" },
];

const GRADIENT_PRESETS = [
  { name: "Kawaii Dream", value: "linear-gradient(135deg, hsl(340, 75%, 90%) 0%, hsl(150, 60%, 90%) 100%)" },
  { name: "Sunset Bliss", value: "linear-gradient(135deg, hsl(25, 85%, 90%) 0%, hsl(340, 70%, 90%) 100%)" },
  { name: "Ocean Breeze", value: "linear-gradient(135deg, hsl(200, 60%, 90%) 0%, hsl(280, 40%, 90%) 100%)" },
  { name: "Forest Mist", value: "linear-gradient(135deg, hsl(150, 50%, 90%) 0%, hsl(200, 45%, 90%) 100%)" },
];

function loadBackground(): BackgroundState {
  try {
    const raw = localStorage.getItem(BG_KEY);
    if (!raw) return { type: "default" };
    return JSON.parse(raw);
  } catch {
    return { type: "default" };
  }
}

function saveBackground(state: BackgroundState) {
  localStorage.setItem(BG_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("fm:data-changed", { detail: { keys: [BG_KEY] } }));
}

export default function BackgroundManager() {
  const [background, setBackground] = useState<BackgroundState>({ type: "default" });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const updateBackground = () => {
      console.log("BackgroundManager: Updating background state");
      const loadedBg = loadBackground();
      setBackground(loadedBg);
      
      // Check if we should use ambient video as background
      const ambient = loadAmbient();
      const hero = loadHero();
      
      console.log("BackgroundManager: ambient", ambient);
      console.log("BackgroundManager: hero", hero);
      
      if (ambient.activeId && ambient.customUrl && ambient.useAsHero) {
        console.log("BackgroundManager: Setting ambient video as background");
        setBackground({
          type: "youtube",
          youtubeUrl: ambient.customUrl
        });
        setIsActive(true);
      } else if (hero.kind === "youtube" && hero.youtubeUrl) {
        console.log("BackgroundManager: Setting hero video as background");
        setBackground({
          type: "youtube", 
          youtubeUrl: hero.youtubeUrl
        });
        setIsActive(true);
      } else if (loadedBg.type !== "default") {
        console.log("BackgroundManager: Setting custom background");
        setIsActive(true);
      } else {
        console.log("BackgroundManager: Using default background");
        setIsActive(false);
      }
    };

    // Initial load
    updateBackground();

    // Listen for storage changes
    const handleDataChange = (event: CustomEvent) => {
      const keys = event.detail?.keys || [];
      if (keys.includes(BG_KEY) || keys.includes("fm_ambient_v1") || keys.includes("fm_hero_v1")) {
        console.log("BackgroundManager: Storage changed, updating background", keys);
        updateBackground();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === BG_KEY || event.key === "fm_ambient_v1" || event.key === "fm_hero_v1") {
        console.log("BackgroundManager: Storage event, updating background", event.key);
        updateBackground();
      }
    };

    window.addEventListener("fm:data-changed", handleDataChange as EventListener);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("fm:data-changed", handleDataChange as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (background.type) {
      case "solid":
        return { backgroundColor: background.solidColor };
      case "gradient":
        return { background: background.gradientPreset };
      case "image":
        return {
          backgroundImage: `url(${background.imageSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        };
      case "youtube":
        return {}; // YouTube handled separately
      default:
        return {
          background: "var(--gradient-background)"
        };
    }
  };

  const renderYouTubeBackground = () => {
    if (background.type !== "youtube" || !background.youtubeUrl) return null;
    
    const videoId = getYouTubeId(background.youtubeUrl);
    if (!videoId) return null;

    console.log("BackgroundManager: Rendering YouTube background", videoId);

    return (
      <div className="absolute inset-0 overflow-hidden -z-50">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&enablejsapi=0`}
          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2"
          allow="autoplay; encrypted-media"
          style={{
            border: "none",
            pointerEvents: "none",
            zIndex: -100
          }}
        />
        <div className="absolute inset-0 bg-black/10 -z-40" />
      </div>
    );
  };

  if (!isActive) {
    // Return default kawaii gradient
    return (
      <div 
        className="fixed inset-0 -z-10"
        style={{ background: "var(--gradient-background)" }}
      />
    );
  }

  return (
    <div className="fixed inset-0 -z-50" style={{ zIndex: -100 }}>
      {background.type === "youtube" ? (
        renderYouTubeBackground()
      ) : (
        <div 
          className="absolute inset-0 -z-40"
          style={getBackgroundStyle()}
        />
      )}
    </div>
  );
}