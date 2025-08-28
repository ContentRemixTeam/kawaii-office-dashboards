import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import YouTubeAmbient from "@/components/YouTubeAmbient";
import { loadAmbient, AMBIENT_KEY } from "@/lib/ambientStore";
import { AMBIENT_PRESETS } from "@/data/ambientPresets";
import { extractYouTubeId } from "@/lib/youtube";
import { onDataChanged } from "@/lib/bus";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_PRESET_KEY = "lofi_girl";

export default function HomeHero() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ambientState, setAmbientState] = useState(() => loadAmbient());
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [currentPresetName, setCurrentPresetName] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onDataChanged((keys) => {
      if (keys.includes(AMBIENT_KEY)) {
        setAmbientState(loadAmbient());
      }
    });
    return unsubscribe;
  }, []);

  // Determine current video ID and name
  useEffect(() => {
    let videoId = "";
    let presetName = "";

    if (ambientState.activeId === "custom" && ambientState.customUrl) {
      videoId = extractYouTubeId(ambientState.customUrl) || "";
      presetName = "Custom Ambient";
    } else {
      // Find preset
      const preset = AMBIENT_PRESETS.find(p => p.key === ambientState.activeId) || 
                   AMBIENT_PRESETS.find(p => p.key === DEFAULT_PRESET_KEY) ||
                   AMBIENT_PRESETS[0];
      
      if (preset) {
        videoId = preset.id;
        presetName = preset.title;
      }
    }

    setCurrentVideoId(videoId);
    setCurrentPresetName(presetName);
  }, [ambientState]);

  const handleVideoError = (error: { code: number; message: string; retryable: boolean }) => {
    console.warn(`YouTube error ${error.code}: ${error.message}, attempting fallback`);
    
    // Find next preset to try
    const currentIndex = AMBIENT_PRESETS.findIndex(p => p.key === ambientState.activeId);
    const nextIndex = (currentIndex + 1) % AMBIENT_PRESETS.length;
    const nextPreset = AMBIENT_PRESETS[nextIndex];
    
    if (nextPreset) {
      setCurrentVideoId(nextPreset.id);
      setCurrentPresetName(nextPreset.title);
      
      toast({
        title: "Video unavailable",
        description: `That video blocks embeds. Switched to ${nextPreset.title}.`,
        duration: 3000
      });
    }
  };

  if (!currentVideoId) {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-lg bg-muted/50 flex items-center justify-center">
          <p className="text-muted-foreground">No ambient video selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <YouTubeAmbient
        videoId={currentVideoId}
        onError={handleVideoError}
        startMuted={false}
        className="aspect-[16/9]"
      />
      
      {/* Overlay with preset info */}
      <div className="absolute top-3 right-3 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="truncate max-w-32">{currentPresetName}</span>
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
  );
}