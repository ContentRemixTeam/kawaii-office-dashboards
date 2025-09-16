import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Play, ExternalLink, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { BREAK_CATEGORIES, BreakCategory, BreakPreset } from "@/data/breakPresets";
import { BreakState, loadBreakState, saveBreakState, trackBreakSession } from "@/lib/breakStore";
import { extractYouTubeId } from "@/lib/youtube";
import SafeYouTube from "@/components/SafeYouTube";

export default function BreakPlayer() {
  const [state, setState] = useState<BreakState>(loadBreakState);
  const [customUrl, setCustomUrl] = useState(state.customUrl || "");
  const [urlError, setUrlError] = useState("");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Pre-load YouTube API when component mounts
  useEffect(() => {
    preloadYouTubeAPI();
  }, []);

  const preloadYouTubeAPI = async () => {
    setIsInitializing(true);
    
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
      setIsInitializing(false);
      return;
    }

    try {
      // Load YouTube API
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Wait for API to be ready
      const checkAPI = () => {
        return new Promise<void>((resolve) => {
          if (window.YT && window.YT.Player) {
            resolve();
          } else {
            window.onYouTubeIframeAPIReady = () => resolve();
          }
        });
      };

      await checkAPI();
      
      // Additional delay to ensure full initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsAPIReady(true);
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to load YouTube API:', error);
      setIsInitializing(false);
      toast.error('YouTube player initialization failed');
    }
  };

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

  const selectPreset = (category: BreakCategory, preset: BreakPreset) => {
    if (!isAPIReady) {
      toast.loading("Preparing your wellness video...", { id: "loading-video" });
      preloadYouTubeAPI().then(() => {
        toast.dismiss("loading-video");
        proceedWithPreset(category, preset);
      });
      return;
    }
    
    proceedWithPreset(category, preset);
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

  const handleCustomUrlSubmit = () => {
    const videoId = extractYouTubeId(customUrl);
    if (!videoId) {
      setUrlError("Please enter a valid YouTube URL");
      return;
    }

    if (!isAPIReady) {
      toast.loading("Preparing your custom video...", { id: "loading-custom" });
      preloadYouTubeAPI().then(() => {
        toast.dismiss("loading-custom");
        proceedWithCustomUrl(videoId);
      });
      return;
    }

    proceedWithCustomUrl(videoId);
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
    toast.error("Video loading failed. Sometimes videos take a moment to load - please try again.");
  };

  const handleVideoReady = () => {
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

      {/* API Initialization Status */}
      {isInitializing && (
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

      {/* Video Player */}
      {!isInitializing && currentVideoId ? (
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
      ) : !isInitializing && (
        <Card className="aspect-video bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Select a break to get started</p>
            {!isAPIReady && (
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
                      disabled={isInitializing}
                    >
                      <div className="font-medium text-sm">{preset.title}</div>
                      {!isAPIReady && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Preparing video player...
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
              disabled={!customUrl.trim() || isInitializing}
            >
              {isInitializing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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