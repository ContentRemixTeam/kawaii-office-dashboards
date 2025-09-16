import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Play, ExternalLink, Maximize2, Minimize2, Loader2, AlertCircle } from "lucide-react";
import { BREAK_CATEGORIES, BreakCategory, BreakPreset } from "@/data/breakPresets";
import { BreakState, loadBreakState, saveBreakState, trackBreakSession } from "@/lib/breakStore";
import { extractYouTubeId } from "@/lib/youtube";
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI";
import SafeYouTube from "@/components/SafeYouTube";

export default function BreakPlayer() {
  const [state, setState] = useState<BreakState>(loadBreakState);
  const [customUrl, setCustomUrl] = useState(state.customUrl || "");
  const [urlError, setUrlError] = useState("");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  
  // Use centralized YouTube API hook
  const youtubeAPI = useYouTubeAPI();

  // Pre-load YouTube API when component mounts
  useEffect(() => {
    youtubeAPI.loadAPI().catch(error => {
      console.error('Failed to preload YouTube API:', error);
      toast.error('YouTube player failed to initialize');
    });
  }, []);

  // Determine current video ID
  const getCurrentVideoId = (): string | null => {
    if (state.customUrl) {
      return extractYouTubeId(state.customUrl);
    }
    if (state.activeCategory && state.activePreset) {
      const category = BREAK_CATEGORIES.find(c => c.key === state.activeCategory);
      const preset = category?.presets.find(p => p.key === state.activePreset);
      return preset?.id || null;
    }
    return null;
  };

  const currentVideoId = getCurrentVideoId();

  const selectPreset = async (category: BreakCategory, preset: BreakPreset) => {
    if (!youtubeAPI.isReady) {
      setVideoLoading(true);
      toast.loading("Preparing your wellness video...", { id: "loading-video" });
      
      try {
        await youtubeAPI.loadAPI();
        toast.dismiss("loading-video");
        setVideoLoading(false);
        proceedWithPreset(category, preset);
      } catch (error) {
        toast.dismiss("loading-video");
        setVideoLoading(false);
        toast.error("Video player failed to load. Please try again.");
        return;
      }
    } else {
      proceedWithPreset(category, preset);
    }
  };

  const proceedWithPreset = (category: BreakCategory, preset: BreakPreset) => {
    const newState = {
      ...state,
      activeCategory: category.key,
      activePreset: preset.key,
      customUrl: undefined
    };
    setState(newState);
    saveBreakState(newState);
    trackBreakSession(category.key, preset.key);
    setActiveVideoId(preset.id);
    setUrlError("");
    toast.success(`Started ${preset.title} break`);
  };

  const handleCustomUrlSubmit = async () => {
    const videoId = extractYouTubeId(customUrl);
    if (!videoId) {
      setUrlError("Please enter a valid YouTube URL");
      return;
    }

    if (!youtubeAPI.isReady) {
      setVideoLoading(true);
      toast.loading("Preparing your custom video...", { id: "loading-custom" });
      
      try {
        await youtubeAPI.loadAPI();
        toast.dismiss("loading-custom");
        setVideoLoading(false);
        proceedWithCustomUrl(videoId);
      } catch (error) {
        toast.dismiss("loading-custom");
        setVideoLoading(false);
        toast.error("Video player failed to load. Please try again.");
        return;
      }
    } else {
      proceedWithCustomUrl(videoId);
    }
  };

  const proceedWithCustomUrl = (videoId: string) => {
    const newState = {
      ...state,
      customUrl,
      activeCategory: undefined,
      activePreset: undefined
    };
    setState(newState);
    saveBreakState(newState);
    trackBreakSession("custom");
    setActiveVideoId(videoId);
    setUrlError("");
    toast.success("Custom break video loaded");
  };

  const toggleHeroMode = () => {
    const newState = { ...state, isHeroMode: !state.isHeroMode };
    setState(newState);
    saveBreakState(newState);
  };

  const handleVideoError = (error: any) => {
    console.error("YouTube video error:", error);
    setVideoLoading(false);
    toast.error("Video failed to load. Please try selecting a different video or check your connection.");
  };

  const handleVideoReady = () => {
    setVideoLoading(false);
    toast.success("Video ready to play!", { duration: 2000 });
  };

  return (
    <div className="space-y-6">
      {/* Hero Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="hero-mode"
            checked={state.isHeroMode}
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

      {/* API Loading Status */}
      {youtubeAPI.state === 'loading' && !currentVideoId && (
        <Card className="aspect-video bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <div>
              <p className="text-main font-medium">Preparing Break Room...</p>
              <p className="text-sm text-muted-foreground mt-1">Loading video player</p>
            </div>
          </div>
        </Card>
      )}

      {/* API Error Status */}
      {youtubeAPI.state === 'error' && !currentVideoId && (
        <Card className="aspect-video bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <div>
              <p className="text-main font-medium">Video Player Error</p>
              <p className="text-sm text-muted-foreground mt-1">{youtubeAPI.error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={youtubeAPI.retry}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Video Loading Indicator */}
      {videoLoading && currentVideoId && (
        <Card className="aspect-video bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <div>
              <p className="text-main font-medium">Loading Video...</p>
              <p className="text-sm text-muted-foreground mt-1">Preparing your break video</p>
            </div>
          </div>
        </Card>
      )}

      {/* Video Player */}
      {!videoLoading && youtubeAPI.state !== 'loading' && youtubeAPI.state !== 'error' && currentVideoId ? (
        <div className={`${state.isHeroMode ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
          <div className={`${state.isHeroMode ? 'h-full' : 'aspect-video'} rounded-xl overflow-hidden`}>
            <SafeYouTube
              videoId={currentVideoId}
              onError={handleVideoError}
              onReady={handleVideoReady}
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
      ) : !videoLoading && youtubeAPI.state !== 'loading' && youtubeAPI.state !== 'error' && (
        <Card className="aspect-video bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Select a break to get started</p>
            {!youtubeAPI.isReady && youtubeAPI.state === 'idle' && (
              <p className="text-xs text-muted-foreground mt-2">
                Video player will initialize when you select a break
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Break Categories */}
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
                      className="h-auto p-3 flex flex-col items-start text-left"
                      disabled={videoLoading || youtubeAPI.state === 'loading'}
                    >
                      <div className="font-medium text-sm">{preset.title}</div>
                      {!youtubeAPI.isReady && youtubeAPI.state === 'loading' && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Preparing player...
                        </div>
                      )}
                      {videoLoading && state.activeCategory === category.key && state.activePreset === preset.key && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading video...
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom URL Section */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Custom Break Video
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL here..."
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setUrlError("");
              }}
              className={urlError ? "border-destructive" : ""}
            />
            <Button 
              onClick={handleCustomUrlSubmit} 
              disabled={!customUrl.trim() || videoLoading || youtubeAPI.state === 'loading'}
            >
              {(videoLoading || youtubeAPI.state === 'loading') ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Load
            </Button>
          </div>
          {urlError && (
            <p className="text-sm text-destructive mt-2">{urlError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Paste any YouTube URL for your personal break video
          </p>
        </CardContent>
      </Card>
    </div>
  );
}