import React from "react";
import { useNavigate } from "react-router-dom";
import { loadHero, HERO_KEY } from "@/lib/heroStore";
import { loadAmbient, AMBIENT_KEY } from "@/lib/ambientStore";
import { AMBIENT_PRESETS } from "@/data/ambientPresets";
import { buildEmbedSrc } from "@/lib/youtube";
import HotspotImage, { Hotspot } from "@/components/HotspotImage";

type Props = { 
  hotspots: Hotspot[];
  fallbackSrc: string;
  alt: string;
  aspectRatio?: number;
};

export default function OfficeHero({ hotspots, fallbackSrc, alt, aspectRatio = 16/9 }: Props) {
  const [state, setState] = React.useState(loadHero());
  const [ambientState, setAmbientState] = React.useState(loadAmbient());
  const navigate = useNavigate();

  React.useEffect(() => {
    const onStorage = (e: any) => {
      const keys = e?.detail?.keys || [e.key];
      if (keys?.includes?.(HERO_KEY)) {
        setState(loadHero());
      }
      if (keys?.includes?.(AMBIENT_KEY)) {
        setAmbientState(loadAmbient());
      }
    };
    window.addEventListener("fm:data-changed", onStorage as any);
    window.addEventListener("storage", onStorage as any);
    return () => {
      window.removeEventListener("fm:data-changed", onStorage as any);
      window.removeEventListener("storage", onStorage as any);
    };
  }, []);

  // Always use ambient video as hero when available
  const useAmbientAsHero = ambientState.activeId;
  
  if (useAmbientAsHero) {
    const activePreset = AMBIENT_PRESETS.find(p => p.id === ambientState.activeId);
    const activeUrl = ambientState.activeId === "custom" ? ambientState.customUrl : activePreset?.youtube;
    
    if (activeUrl) {
      const embedSrc = buildEmbedSrc(activeUrl, { 
        autoplay: 1, 
        mute: ambientState.muted ? 1 : 0, 
        loop: 1 
      });
      
      return (
        <div className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg">
          <div className="relative bg-black/5" style={{ paddingBottom: `${(1/aspectRatio) * 100}%` }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedSrc}
              title="Ambient Office Background"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          {/* No hotspots when video is playing - use toolbar navigation */}
        </div>
      );
    }
  }

  if (state?.kind === "youtube" && state.youtubeUrl) {
    // Extract video ID and use privacy-enhanced nocookie domain
    const embedSrc = buildEmbedSrc(state.youtubeUrl, { 
      autoplay: 1, 
      mute: 1, 
      loop: 1 
    });
    
    
    return (
      <div className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg">
        <div className="relative bg-black/5" style={{ paddingBottom: `${(1/aspectRatio) * 100}%` }}>
          {embedSrc && (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedSrc}
              title="Ambient Office"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        {/* No hotspots when video is playing - use toolbar navigation */}
      </div>
    );
  }

  // default to image path from state or fallback
  return (
    <HotspotImage
      src={state?.imageSrc || fallbackSrc}
      alt={alt}
      hotspots={hotspots}
      aspectRatio={aspectRatio}
    />
  );
}

// Lightweight overlay that reuses Hotspot positions
function HotspotOverlay({ hotspots, navigate }: { hotspots: Hotspot[]; navigate: (path: string) => void }) {
  return (
    <div className="relative w-full h-full">
      {hotspots.map(h => (
        <button
          key={h.id}
          onClick={() => navigate(h.href)}
          aria-label={h.aria ?? h.label}
          title={h.label}
          className="pointer-events-auto absolute rounded-xl outline-none transition-all duration-200 hover:scale-105"
          style={{ 
            top: `${h.top}%`, 
            left: `${h.left}%`, 
            width: `${h.width}%`, 
            height: `${h.height}%` 
          }}
        >
          <span className="sr-only">{h.label}</span>
          <span className="absolute inset-0 rounded-xl ring-0 hover:ring-4 ring-primary/60 bg-primary/5 hover:bg-primary/10 transition-all" />
        </button>
      ))}
    </div>
  );
}