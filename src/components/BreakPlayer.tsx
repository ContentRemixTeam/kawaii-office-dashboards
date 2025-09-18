import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle, Play, Maximize2, Minimize2 } from "lucide-react";
import YouTubeAmbient from "@/components/YouTubeAmbient";
import { BREAK_CATEGORIES, BreakCategory, BreakPreset } from "@/data/breakPresets";
import { extractYouTubeId } from "@/lib/youtube";
import { BreakState, loadBreakState, saveBreakState, trackBreakSession } from "@/lib/breakStore";
import { useToast } from "@/hooks/use-toast";

export default function BreakPlayer() {
  const { toast } = useToast();
  const [state, setState] = useState<BreakState>(() => loadBreakState());
  const [customUrl, setCustomUrl] = useState(state.customUrl || "");
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");

  // Determine current video ID (copied from working AmbientPlayer logic)
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
    
    console.log("[BreakPlayer] Current video ID:", videoId, "State:", state);
    setCurrentVideoId(videoId);
  }, [state]);

  const selectPreset = (category: BreakCategory, preset: BreakPreset) => {
    console.log("[BreakPlayer] Selecting preset:", preset.key, "from category:", category.key);
    
    const newState = { 
      ...state, 
      activeCategory: category.key, 
      activePreset: preset.key,
      customUrl: undefined // Clear custom URL when selecting preset
    };
    
    console.log("[BreakPlayer] New state:", newState);
    setState(newState);
    saveBreakState(newState);
    trackBreakSession(category.key, preset.key);
    setUrlError("");
    
    toast({
      title: `🎬 Started ${preset.title}`,
      description: `${category.title} break session loaded`
    });
  };

  const handleCustomUrlSubmit = () => {
    const trimmedUrl = customUrl.trim();
    console.log("[BreakPlayer] Setting custom URL:", trimmedUrl);
    
    if (!trimmedUrl) {
      setUrlError("Please enter a YouTube URL");
      return;
    }

    const videoId = extractYouTubeId(trimmedUrl);
    console.log("[BreakPlayer] Extracted video ID:", videoId);
    
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
    
    console.log("[BreakPlayer] Saving custom URL state:", newState);
    setState(newState);
    saveBreakState(newState);
    trackBreakSession("custom");
    setUrlError("");
    
    toast({
      title: "✅ Custom break video set",
      description: "Your YouTube video has been loaded"
    });
  };

  const toggleHeroMode = () => {
    const newState = { ...state, isHeroMode: !state.isHeroMode };
    setState(newState);
    saveBreakState(newState);
    
    toast({
      title: newState.isHeroMode ? "🎬 Hero Mode ON" : "📱 Hero Mode OFF",
      description: newState.isHeroMode ? "Full-screen immersive experience" : "Regular view restored"
    });
  };

  const handleVideoError = (error: { code: number; message: string; retryable: boolean }) => {
    console.warn(`[BreakPlayer] YouTube error ${error.code}: ${error.message} for video ${currentVideoId}`);
    
    // Show error message
    toast({
      title: "Video Error",
      description: "This video cannot be embedded. Try a different one.",
      variant: "destructive",
      duration: 5000
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
            <YouTubeAmbient
              videoId={currentVideoId}
              onError={handleVideoError}
              startMuted={false}
              className="w-full h-full"
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
                          Active
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