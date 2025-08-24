import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Volume2, VolumeX } from "lucide-react";
import { AMBIENT_PRESETS } from "@/data/ambientPresets";
import { loadAmbient, saveAmbient, AMBIENT_KEY } from "@/lib/ambientStore";
import { buildEmbedSrc } from "@/lib/youtube";
import { useToast } from "@/hooks/use-toast";

export default function AmbientPlayer() {
  const [state, setState] = React.useState(loadAmbient());
  const [customInput, setCustomInput] = React.useState(state.customUrl || "");
  const { toast } = useToast();
  
  const volumePct = Math.round((state.volume ?? 0.5) * 100);

  React.useEffect(() => {
    const onBus = (e: any) => {
      const keys = e?.detail?.keys || [e.key];
      if (keys?.includes?.(AMBIENT_KEY)) {
        setState(loadAmbient());
      }
    };
    window.addEventListener("fm:data-changed", onBus as any);
    window.addEventListener("storage", onBus as any);
    return () => {
      window.removeEventListener("fm:data-changed", onBus as any);
      window.removeEventListener("storage", onBus as any);
    };
  }, []);

  const activePreset = AMBIENT_PRESETS.find(p => p.id === state.activeId);
  const activeUrl = state.activeId === "custom" ? state.customUrl : activePreset?.youtube;
  const embedSrc = activeUrl ? buildEmbedSrc(activeUrl, { 
    autoplay: 1, 
    mute: state.muted ? 1 : 0, 
    loop: 1 
  }) : "";

  function choose(id: string) {
    const newState = { ...state, activeId: id };
    setState(newState);
    saveAmbient(newState);
    
    const preset = AMBIENT_PRESETS.find(p => p.id === id);
    if (preset) {
      toast({
        title: `${preset.emoji} ${preset.title}`,
        description: "Ambient soundscape activated"
      });
    }
  }

  function setCustom(url: string) {
    if (!url.includes("youtu")) {
      toast({
        title: "❌ Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      });
      return;
    }
    
    const newState = { ...state, activeId: "custom", customUrl: url };
    setState(newState);
    saveAmbient(newState);
    toast({
      title: "🎬 Custom ambient video",
      description: "Your YouTube video has been set as the ambient background"
    });
  }

  function setMuted(muted: boolean) {
    const newState = { ...state, muted };
    setState(newState);
    saveAmbient(newState);
  }

  function setVolumePct(pct: number) {
    const newState = { ...state, volume: Math.max(0, Math.min(1, pct / 100)) };
    setState(newState);
    saveAmbient(newState);
  }

  function toggleHero() {
    const newState = { ...state, useAsHero: !state.useAsHero };
    setState(newState);
    saveAmbient(newState);
    
    toast({
      title: newState.useAsHero ? "🖼️ Office background enabled" : "🖼️ Office background disabled",
      description: newState.useAsHero 
        ? "Ambient video will be used as your office background"
        : "Office background returned to image mode"
    });
  }

  function stopAmbient() {
    const newState = { ...state, activeId: undefined };
    setState(newState);
    saveAmbient(newState);
    toast({
      title: "🔇 Ambient stopped",
      description: "Soundscape cleared"
    });
  }

  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {AMBIENT_PRESETS.map(preset => {
          const active = state.activeId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => choose(preset.id)}
              className={`rounded-xl border px-4 py-3 text-left shadow-sm transition-all hover:scale-105 ${
                active 
                  ? "bg-primary/10 border-primary ring-2 ring-primary/20" 
                  : "bg-white/80 border-border hover:bg-white hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{preset.emoji}</span>
                <div>
                  <div className="font-medium text-main">{preset.title}</div>
                  {active && <div className="text-xs text-primary">Playing</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom YouTube URL */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <Label className="text-sm font-medium text-main mb-2 block">
          🎬 Custom YouTube URL
        </Label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => setCustom(customInput)}
            disabled={!customInput.includes("youtu")}
            className="btn btn-primary"
          >
            Use
          </Button>
        </div>
        <p className="text-xs text-muted mt-2">
          💡 Try ambient office videos, lofi music, or nature sounds
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-main">🎛️ Controls</h3>
          {state.activeId && (
            <Button variant="outline" size="sm" onClick={stopAmbient}>
              Stop
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMuted(!state.muted)}
            className="flex items-center gap-2"
          >
            {state.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {state.muted ? "Unmute" : "Mute"}
          </Button>
          
          <div className="flex-1 flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volumePct]}
              onValueChange={(value) => setVolumePct(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted w-12">{volumePct}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="use-as-hero"
            checked={!!state.useAsHero}
            onCheckedChange={toggleHero}
          />
          <Label htmlFor="use-as-hero" className="text-sm text-main">
            🖼️ Use as office background
          </Label>
        </div>
      </div>

      {/* Player */}
      {embedSrc ? (
        <div className="relative rounded-2xl overflow-hidden shadow-lg border">
          <div className="relative pt-[56.25%] bg-black/5">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedSrc}
              title="Ambient Player"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="px-4 py-3 bg-card border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-main">
                  {activePreset ? `${activePreset.emoji} ${activePreset.title}` : "🎬 Custom Video"}
                </span>
                {!state.muted && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Playing
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                Tip: Video autoplays muted. Click "Unmute" to hear it.
              </p>
            </div>
          </div>
        </div>
      ) : activeUrl ? (
        <div className="text-center py-12 border-2 border-dashed border-red-200 rounded-xl bg-red-50">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-sm text-red-600 font-medium mb-2">Invalid or unsupported YouTube link</p>
          <p className="text-xs text-red-500">Try a standard watch/shorts/live/playlist URL</p>
          {process.env.NODE_ENV !== "production" && (
            <p className="text-xs text-muted break-all mt-2">Debug URL: {activeUrl}</p>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <div className="text-4xl mb-4">🎵</div>
          <p className="text-main font-medium mb-2">No ambient soundscape selected</p>
          <p className="text-sm text-muted">Choose a preset or enter a YouTube link above</p>
        </div>
      )}

      {/* Optional: tiny debug in dev */}
      {process.env.NODE_ENV !== "production" && embedSrc && (
        <p className="mt-1 text-xs text-muted break-all">Embed: {embedSrc}</p>
      )}
    </div>
  );
}