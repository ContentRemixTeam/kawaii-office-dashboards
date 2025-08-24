import { useState, useEffect } from "react";
import OfficeHero from "@/components/OfficeHero";
import VisionPreviewOverlay from "@/components/VisionPreviewOverlay";
import NavPills from "@/components/NavPills";
import BigThreeTasksSection from "@/components/BigThreeTasksSection";
import { HOTSPOTS, OFFICE_ALT, OFFICE_IMAGE_SRC } from "@/data/hotspots";
import { getHomeTitle, getHomeSubtitle } from "@/lib/storage";
import { Sparkles, Heart } from "lucide-react";

const Index = () => {
  const [homeTitle, setHomeTitle] = useState("");
  const [homeSubtitle, setHomeSubtitle] = useState("");
  
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

      <div className="w-full max-w-6xl mb-8 relative">
        <OfficeHero
          hotspots={HOTSPOTS}
          fallbackSrc={OFFICE_IMAGE_SRC}
          alt={OFFICE_ALT}
          aspectRatio={16/9}
        />
        <VisionPreviewOverlay boardBox={boardHotspot} />
      </div>

      {/* Big Three Tasks Section */}
      <BigThreeTasksSection />

      {/* Navigation Toolbar */}
      <div className="w-full max-w-6xl mt-8 mb-8 rounded-3xl bg-white/80 dark:bg-black/30 backdrop-blur-lg border-2 border-primary/20 shadow-2xl p-6">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-main mb-1">🛠️ Your Productivity Toolkit</h2>
          <p className="text-sm text-muted">Choose your tool to get started</p>
        </div>
        <NavPills />
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
