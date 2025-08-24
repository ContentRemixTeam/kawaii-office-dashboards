import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { buildEmbedSrc } from "@/lib/youtube";
import { loadAmbient, AMBIENT_KEY } from "@/lib/ambientStore";
import { onDataChanged } from "@/lib/bus";

const DEFAULT_AMBIENT_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk";

export default function HomeHero() {
  const navigate = useNavigate();
  const [ambientState, setAmbientState] = useState(() => loadAmbient());

  useEffect(() => {
    const unsubscribe = onDataChanged((keys) => {
      if (keys.includes(AMBIENT_KEY)) {
        setAmbientState(loadAmbient());
      }
    });
    return unsubscribe;
  }, []);

  const activeUrl = ambientState.customUrl || DEFAULT_AMBIENT_URL;
  const presetName = ambientState.activeId === "custom" ? "Custom Ambient" : "Lofi Study";
  
  const embedSrc = buildEmbedSrc(activeUrl, { 
    autoplay: 1, 
    mute: 1, 
    loop: 1 
  });

  return (
    <div className="relative w-full max-w-5xl mx-auto mb-8">
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-xl bg-black/10">
        <iframe
          src={embedSrc}
          className="w-full h-full absolute inset-0 rounded-3xl"
          allow="autoplay; encrypted-media; picture-in-picture"
          style={{ border: "none" }}
        />
        
        {/* Overlay with preset info */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="truncate max-w-32">{presetName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/tools/sounds")}
                className="h-6 px-2 text-xs text-white hover:bg-white/20 hover:text-white"
              >
                <Settings className="w-3 h-3 mr-1" />
                Change
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}