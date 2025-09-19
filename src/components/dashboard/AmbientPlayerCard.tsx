import { Play, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import YouTubeAmbient from "@/components/YouTubeAmbient";
import { loadAmbient, saveAmbient, type AmbientState } from "@/lib/ambientStore";
import { getPresetById } from "@/data/ambientPresets";
import { useState } from "react";

export function AmbientPlayerCard() {
  const navigate = useNavigate();
  const [ambientState, setAmbientState] = useState<AmbientState>(loadAmbient);

  const updateAmbientState = (updates: Partial<AmbientState>) => {
    const newState = { ...ambientState, ...updates };
    setAmbientState(newState);
    saveAmbient(newState);
  };

  const getCurrentVideoId = () => {
    console.log('AmbientPlayerCard: Getting current video ID', { 
      activeId: ambientState.activeId, 
      customUrl: ambientState.customUrl 
    });
    
    if (!ambientState.activeId) {
      console.log('AmbientPlayerCard: Using default video (no activeId)');
      return "jfKfPfyJRdk"; // Default lofi video
    }
    
    if (ambientState.activeId === "custom" && ambientState.customUrl) {
      const match = ambientState.customUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      const videoId = match ? match[1] : "jfKfPfyJRdk";
      console.log('AmbientPlayerCard: Using custom video', { customUrl: ambientState.customUrl, videoId });
      return videoId;
    }
    
    const preset = getPresetById(ambientState.activeId);
    const videoId = preset ? preset.id : "jfKfPfyJRdk";
    console.log('AmbientPlayerCard: Using preset video', { activeId: ambientState.activeId, preset, videoId });
    return videoId;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-card-title flex items-center gap-3">
          <Play className="w-5 h-5 text-primary" />
          Ambient Player
        </h2>
        <div className="flex items-center gap-3">
          <div className="status-indicator status-muted">
            <span>Hero Mode</span>
            <Switch
              checked={ambientState.useAsHero || false}
              onCheckedChange={(checked) => updateAmbientState({ useAsHero: checked })}
            />
          </div>
        </div>
      </div>
      
      <div className="w-full rounded-xl overflow-hidden border border-muted/20 bg-muted/5">
        <div className="aspect-video">
          <YouTubeAmbient 
            key={`ambient-${getCurrentVideoId()}`} // Force remount on video change
            videoId={getCurrentVideoId()}
            startMuted={ambientState.muted || true}
            className="w-full h-full"
            maxRetries={5}
            retryDelay={1000}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateAmbientState({ muted: !ambientState.muted })}
          >
            {ambientState.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <div className="w-24">
            <Slider
              value={[ambientState.muted ? 0 : (ambientState.volume || 50)]}
              onValueChange={(value) => updateAmbientState({ 
                volume: value[0], 
                muted: value[0] === 0 
              })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/tools/sounds')}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-3 h-3" />
          More Sounds
        </Button>
      </div>
    </div>
  );
}