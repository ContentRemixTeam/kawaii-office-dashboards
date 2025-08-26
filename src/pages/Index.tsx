import { useState, useEffect } from "react";
import OfficeHero from "@/components/OfficeHero";
import VisionPreviewOverlay from "@/components/VisionPreviewOverlay";
import NavPills from "@/components/NavPills";
import BigThreeTasksSection from "@/components/BigThreeTasksSection";
import HomePetDisplay from "@/components/HomePetDisplay";
import { HOTSPOTS, OFFICE_ALT, OFFICE_IMAGE_SRC } from "@/data/hotspots";
import { getHomeTitle, getHomeSubtitle } from "@/lib/storage";
import { Sparkles, Heart } from "lucide-react";
import useDailyFlow from "@/hooks/useDailyFlow";

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
    <main className="min-h-screen body-gradient flex flex-col items-center py-10 px-4">
      <div className="text-center mb-12 space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-kawaii bg-clip-text text-transparent">
            {homeTitle}
          </h1>
          <Heart className="w-8 h-8 text-primary animate-bounce-cute" />
        </div>
        <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
          {homeSubtitle} Use the toolbar below to access your favorite productivity and positivity tools.
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="w-full max-w-7xl mx-auto">
        {/* Top Row - Office + Big Three */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Office Hero */}
          <div className="lg:col-span-2">
            <div className="h-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl overflow-hidden">
              <OfficeHero
                hotspots={HOTSPOTS}
                fallbackSrc={OFFICE_IMAGE_SRC}
                alt={OFFICE_ALT}
                aspectRatio={16/9}
              />
              <VisionPreviewOverlay boardBox={boardHotspot} />
            </div>
          </div>
          
          {/* Big Three Tasks */}
          <div className="lg:col-span-3">
            <div className="h-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl p-6">
              <BigThreeTasksSection />
            </div>
          </div>
        </div>

        {/* Bottom Row - Pet + Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Pet Display */}
          <div className="lg:col-span-1">
            <div className="h-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl p-6">
              <HomePetDisplay />
            </div>
          </div>
          
          {/* Navigation Pills */}
          <div className="lg:col-span-2">
            <div className="h-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-main mb-4 text-center">🛠️ Your Productivity Toolkit</h2>
              <NavPills />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Settings */}
      <div className="w-full max-w-6xl mb-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/20 shadow-lg p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-card-foreground mb-1">🌙 Daily Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your daily workflow</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Sign-off Time Setting */}
          <div className="flex items-center gap-2 text-sm">
            <label className="text-muted-foreground">Daily sign-off time:</label>
            <input 
              defaultValue={f.prefs.signoffTime} 
              onBlur={e => f.setSignoffTime(e.currentTarget.value)}
              className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              type="time" 
            />
            <span className="text-xs text-muted-foreground/70">Debrief will prompt at this time</span>
          </div>
          
          {/* Auto Prompt Setting */}
          <div className="flex items-center gap-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                defaultChecked={f.prefs.autoPrompt} 
                onChange={e => f.setAutoPrompt(e.currentTarget.checked)}
                className="rounded border-input w-4 h-4"
              />
              <span className="text-muted-foreground">Auto-prompt daily workflows</span>
            </label>
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
          <span>🌱 Habit Garden</span>
        </div>
      </div>
    </main>
  );
};

export default Index;
