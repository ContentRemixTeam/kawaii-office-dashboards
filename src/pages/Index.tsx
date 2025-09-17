import { useState, useEffect } from "react";
import VisionPreviewOverlay from "@/components/VisionPreviewOverlay";
import NavPills from "@/components/NavPills";
import { HOTSPOTS, OFFICE_ALT, OFFICE_IMAGE_SRC } from "@/data/hotspots";
import { getHomeTitle, getHomeSubtitle } from "@/lib/storage";
import { Sparkles, Heart } from "lucide-react";
import useDailyFlow from "@/hooks/useDailyFlow";
import OfficeHero from "@/components/OfficeHero";

const Index = () => {
  const [homeTitle, setHomeTitle] = useState(() => getHomeTitle());
  const [homeSubtitle, setHomeSubtitle] = useState(() => getHomeSubtitle());
  const f = useDailyFlow();
  
  useEffect(() => {
    setHomeTitle(getHomeTitle());
    setHomeSubtitle(getHomeSubtitle());
    
    // Listen for storage changes to update text
    const handleStorageChange = () => {
      setHomeTitle(getHomeTitle());
      setHomeSubtitle(getHomeSubtitle());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const boardHotspot = HOTSPOTS.find(h => h.id === 'board')!;
  
  return (
    <main className="min-h-screen body-gradient flex flex-col items-center py-6 px-4">
      <div className="text-center mb-8 space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-kawaii bg-clip-text text-transparent">
            {homeTitle}
          </h1>
          <Heart className="w-8 h-8 text-primary animate-bounce-cute" />
        </div>
        <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          {homeSubtitle} Complete your tasks to grow your daily companion!
        </p>
      </div>

      {/* Simple Landing Content */}
      <div className="w-full max-w-4xl mb-8">
        <div className="text-center p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl">
          <p className="text-lg text-muted-foreground mb-6">
            This is a simple landing page. Your main dashboard is available at the root route "/".
          </p>
        </div>
      </div>

      {/* Vision Board Section */}
      <div className="w-full max-w-6xl mb-8">
        <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-primary mb-1">🎯 Hold the Vision</h2>
              <p className="text-sm text-muted-foreground">Your vision board preview</p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/20">
              <OfficeHero
                hotspots={HOTSPOTS}
                fallbackSrc={OFFICE_IMAGE_SRC}
                alt={OFFICE_ALT}
                aspectRatio={16/9}
              />
              <VisionPreviewOverlay boardBox={boardHotspot} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="w-full max-w-6xl mb-8 rounded-3xl bg-white/80 dark:bg-black/30 backdrop-blur-lg border-2 border-primary/20 shadow-2xl p-6">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-main mb-1">🛠️ Your Productivity Toolkit</h2>
          <p className="text-sm text-muted">Access all your tools and settings</p>
        </div>
        <NavPills />
        
        {/* Daily Settings - Compact */}
        <div className="mt-6 pt-4 border-t border-border/20">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground">Daily sign-off:</label>
              <input 
                defaultValue={f.prefs.signoffTime} 
                onBlur={e => f.setSignoffTime(e.currentTarget.value)}
                className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                type="time" 
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked={f.prefs.autoPrompt} 
                  onChange={e => f.setAutoPrompt(e.currentTarget.checked)}
                  className="rounded border-input w-3 h-3"
                />
                <span className="text-muted-foreground text-xs">Auto-prompt workflows</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground font-medium">
          💡 Tip: Select YouTube ambient videos in Sounds to replace the office background
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/80">
          <span>🐱 Task Pets</span>
          <span>📁 Positivity Cabinet</span>
          <span>🎨 Customize your theme in Settings</span>
          <span>🎯 Vision Board</span>
        </div>
      </div>
    </main>
  );
};

export default Index;
