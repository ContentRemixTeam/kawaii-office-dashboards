import React from "react";
import { useNavigate } from "react-router-dom";
import { loadHero, HERO_KEY } from "@/lib/heroStore";
import HotspotImage, { Hotspot } from "@/components/HotspotImage";

type Props = { 
  hotspots: Hotspot[];
  fallbackSrc: string;
  alt: string;
  aspectRatio?: number;
};

export default function OfficeHero({ hotspots, fallbackSrc, alt, aspectRatio = 16/9 }: Props) {
  const [state, setState] = React.useState(loadHero());
  const navigate = useNavigate();

  React.useEffect(() => {
    const onStorage = (e: any) => {
      const keys = e?.detail?.keys || [e.key];
      if (keys?.includes?.(HERO_KEY)) {
        setState(loadHero());
      }
    };
    window.addEventListener("fm:data-changed", onStorage as any);
    window.addEventListener("storage", onStorage as any);
    return () => {
      window.removeEventListener("fm:data-changed", onStorage as any);
      window.removeEventListener("storage", onStorage as any);
    };
  }, []);

  if (state?.kind === "youtube" && state.youtubeUrl) {
    // Extract video ID and use privacy-enhanced nocookie domain
    const id = getYouTubeId(state.youtubeUrl);
    const src = id
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&playsinline=1&rel=0&playlist=${id}`
      : "";
    
    return (
      <div className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg">
        <div className="relative bg-black/5" style={{ paddingBottom: `${(1/aspectRatio) * 100}%` }}>
          {id && (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={src}
              title="Ambient Office"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        {/* hotspot layer above video */}
        <div className="absolute inset-0 pointer-events-none">
          <HotspotOverlay hotspots={hotspots} navigate={navigate} />
        </div>
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

// Utility to extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    const match = u.pathname.match(/\/embed\/([^/?#]+)/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}