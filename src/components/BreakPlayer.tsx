import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle, Play, Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { BREAK_CATEGORIES, BreakCategory, BreakPreset } from "@/data/breakPresets";
import { extractYouTubeId } from "@/lib/youtube";
import { BreakState, loadBreakState, saveBreakState, trackBreakSession } from "@/lib/breakStore";
import { useToast } from "@/hooks/use-toast";
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI";

// Simple, direct YouTube embed component for Break Room
function DirectYouTubePlayer({ videoId, onError }: { videoId: string; onError?: () => void }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Video unavailable</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setHasError(false)}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`}
      title="Break Room Video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      onError={() => {
        setHasError(true);
        onError?.();
      }}
      style={{ borderRadius: '12px' }}
    />
  );
}

export default function BreakPlayer() {
  const { toast } = useToast();
  const youtubeAPI = useYouTubeAPI();
  const [state, setState] = useState<BreakState>(() => loadBreakState());
  const [customUrl, setCustomUrl] = useState(state.customUrl || "");
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");
  const [videoError, setVideoError] = useState(false);

  // Initialize YouTube API
  useEffect(() => {
    if (youtubeAPI.state === 'idle') {
      youtubeAPI.loadAPI().catch(console.error);
    }
  }, [youtubeAPI]);

  // Determine current video ID
  useEffect(() => {
    let videoId = "";
    
    if (state.customUrl) {
      videoId = extractYouTubeId(state.customUrl) || "";
    } else if (state.activeCategory && state.activePreset) {
      const category = BREAK_CATEGORIES.find(c => c.key === state.activeCategory);
      const preset = category?.presets.find(p => p.key === state.activePreset);
      if (preset) {
        videoId = preset.id;
      }
    }
    
    console.log("[BreakPlayer] Setting video ID:", videoId);
    setCurrentVideoId(videoId);
    setVideoError(false);
  }, [state]);

  const selectPreset = (category: BreakCategory, preset: BreakPreset) => {
    console.log("[BreakPlayer] Selecting preset:", preset.key, "from category:", category.key);
    
    const newState = { 
      ...state, 
      activeCategory: category.key, 
      activePreset: preset.key,
      customUrl: undefined
    };
    
    setState(newState);
    saveBreakState(newState);
    trackBreakSession(category.key, preset.key);
    setUrlError("");
    setVideoError(false);
    
    toast({
      title: `🎬 ${preset.title}`,
      description: `Starting ${category.title.toLowerCase()} break`
    });
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

    const newState = { 
      ...state, 
      customUrl: trimmedUrl,
      activeCategory: undefined,
      activePreset: undefined
    };
    
    setState(newState);
    saveBreakState(newState);
    trackBreakSession("custom");
    setUrlError("");
    setVideoError(false);
    
    toast({
      title: "✅ Custom video loaded",
      description: "Your break video is ready"
    });
  };

  const toggleHeroMode = () => {
    const newState = { ...state, isHeroMode: !state.isHeroMode };
    setState(newState);
    saveBreakState(newState);
    
    toast({
      title: newState.isHeroMode ? "🎬 Hero Mode ON" : "📱 Hero Mode OFF",
      description: newState.isHeroMode ? "Full-screen experience" : "Regular view"
    });
  };

  const handleVideoError = () => {
    setVideoError(true);
    toast({
      title: "Video Error",
      description: "This video cannot be played. Try a different one.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Mode Toggle and Last Break Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="hero-mode"
            checked={state.isHeroMode || false}
            onCheckedChange={toggleHeroMode}
          />
          <Label htmlFor="hero-mode" className="flex items-center gap-2">
            {state.isHeroMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            Hero Mode
          </Label>
        </div>
        {state.lastBreakType && (
          <div className="text-sm text-muted-foreground">
            Last break: {state.lastBreakType}
          </div>
        )}
      </div>

      {/* Video Player */}
      {currentVideoId ? (
        <div className={`${state.isHeroMode ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
          <div className={`${state.isHeroMode ? 'h-full' : 'aspect-video'} rounded-xl overflow-hidden`}>
            <DirectYouTubePlayer
              videoId={currentVideoId}
              onError={handleVideoError}
            />
          </div>
          {state.isHeroMode && (
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleHeroMode}
              className="absolute top-4 right-4 z-10"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Hero Mode
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center aspect-video flex items-center justify-center">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Select a break to get started</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Break Categories - PRESERVE ALL EXISTING CONTENT */}
      <div className="grid gap-6">
        {BREAK_CATEGORIES.map((category) => (
          <Card key={category.key} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`${category.color} p-4 border-b`}>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-xl">{category.emoji}</span>
                  {category.title}
                </h3>
                <p className="text-sm opacity-80 mt-1">{category.description}</p>
              </div>
              
              <div className="p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {category.presets.map((preset) => (
                    <Button
                      key={preset.key}
                      variant={
                        state.activeCategory === category.key && state.activePreset === preset.key
                          ? "default"
                          : "outline"
                      }
                      onClick={() => selectPreset(category, preset)}
                      className="h-auto p-3 flex flex-col items-start text-left relative"
                    >
                      <div className="font-medium text-sm">{preset.title}</div>
                      {state.activeCategory === category.key && state.activePreset === preset.key && (
                        <Badge className="absolute -top-1 -right-1 h-5 text-xs">
                          ▶
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom YouTube URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Custom Break Video
          </CardTitle>
          <CardDescription>
            Paste any YouTube URL for your personal break video
          </CardDescription>
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
            <Button onClick={handleCustomUrlSubmit} disabled={!customUrl.trim()}>
              Load Video
            </Button>
          </div>
          {urlError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {urlError}
            </p>
          )}
          {state.customUrl && (
            <Badge variant="secondary" className="w-fit">
              Using custom video
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}