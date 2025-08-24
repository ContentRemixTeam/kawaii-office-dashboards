import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle } from "lucide-react";
import YouTubeAmbient from "@/components/YouTubeAmbient";
import { AMBIENT_PRESETS, getNextPreset } from "@/data/ambientPresets";
import { extractYouTubeId } from "@/lib/youtube";
import { loadAmbient, saveAmbient, AmbientState } from "@/lib/ambientStore";
import { useToast } from "@/hooks/use-toast";

export default function AmbientPlayer() {
  const { toast } = useToast();
  const [state, setState] = useState<AmbientState>(() => loadAmbient());
  const [customUrl, setCustomUrl] = useState(state.customUrl || "");
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");

  // Determine current video ID
  useEffect(() => {
    let videoId = "";
    
    if (state.activeId === "custom" && state.customUrl) {
      videoId = extractYouTubeId(state.customUrl) || "";
    } else {
      const preset = AMBIENT_PRESETS.find(p => p.key === state.activeId);
      if (preset) {
        videoId = preset.id;
      }
    }
    
    setCurrentVideoId(videoId);
  }, [state]);

  const selectPreset = (presetKey: string) => {
    const preset = AMBIENT_PRESETS.find(p => p.key === presetKey);
    if (!preset) return;
    
    const newState = { ...state, activeId: presetKey };
    setState(newState);
    saveAmbient(newState);
    setUrlError("");
  };

  const handleCustomUrlSubmit = () => {
    const trimmedUrl = customUrl.trim();
    if (!trimmedUrl) {
      setUrlError("Please enter a YouTube URL");
      return;
    }

    const videoId = extractYouTubeId(trimmedUrl);
    if (!videoId) {
      setUrlError("Invalid YouTube URL. Please check the format.");
      return;
    }

    const newState = { ...state, activeId: "custom", customUrl: trimmedUrl };
    setState(newState);
    saveAmbient(newState);
    setUrlError("");
    
    toast({
      title: "✅ Custom video set",
      description: "Your YouTube video has been set as the ambient background"
    });
  };

  const handleVideoError = (errorCode: number) => {
    console.warn(`YouTube error ${errorCode} for video ${currentVideoId}`);
    
    // If we're on a preset, try the next one
    if (state.activeId !== "custom") {
      const nextPreset = getNextPreset(state.activeId);
      if (nextPreset && nextPreset.key !== state.activeId) {
        const newState = { ...state, activeId: nextPreset.key };
        setState(newState);
        saveAmbient(newState);
        
        toast({
          title: "Video unavailable",
          description: `That video blocks embeds. Switched to ${nextPreset.title}.`,
          duration: 4000
        });
        return;
      }
    }
    
    // Show error for custom URLs or if all presets fail
    toast({
      title: "Video Error",
      description: "This video cannot be embedded. Try a different one.",
      variant: "destructive",
      duration: 5000
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌟 Curated Presets
          </CardTitle>
          <CardDescription>
            Verified ambient videos perfect for focus and relaxation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AMBIENT_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant={state.activeId === preset.key ? "default" : "outline"}
                onClick={() => selectPreset(preset.key)}
                className="flex flex-col h-auto p-4 text-center relative"
              >
                <span className="text-2xl mb-2">{preset.emoji}</span>
                <span className="font-medium text-sm">{preset.title}</span>
                {state.activeId === preset.key && (
                  <Badge className="absolute -top-1 -right-1 h-5 text-xs">
                    Active
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom YouTube URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎬 Custom YouTube URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setUrlError("");
              }}
              className={urlError ? "border-destructive" : ""}
            />
            <Button onClick={handleCustomUrlSubmit}>
              Set Video
            </Button>
          </div>
          {urlError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {urlError}
            </p>
          )}
          {state.activeId === "custom" && (
            <Badge variant="secondary" className="w-fit">
              Using custom video
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Video Player */}
      {currentVideoId ? (
        <Card>
          <CardContent className="p-6">
            <YouTubeAmbient
              videoId={currentVideoId}
              onError={handleVideoError}
              startMuted={false}
              className="w-full"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <p className="text-sm mb-2">Choose a preset or enter a YouTube link above</p>
              <p className="text-xs">Your ambient video will appear here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}