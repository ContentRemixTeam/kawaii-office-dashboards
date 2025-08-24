import OfficeHero from "@/components/OfficeHero";
import VisionPreviewOverlay from "@/components/VisionPreviewOverlay";
import NavPills from "@/components/NavPills";
import { HOTSPOTS, OFFICE_ALT, OFFICE_IMAGE_SRC } from "@/data/hotspots";
import { Sparkles, Heart } from "lucide-react";

const Index = () => {
  const boardHotspot = HOTSPOTS.find(h => h.id === 'board')!;
  return (
    <main className="min-h-screen body-gradient flex flex-col items-center py-10 px-4">
      <div className="text-center mb-12 space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-kawaii bg-clip-text text-transparent">
            Kawaii Positivity Office
          </h1>
          <Heart className="w-8 h-8 text-primary animate-bounce-cute" />
        </div>
        <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
          Welcome to your cozy digital workspace! ✨ Click on any object in the office to access your favorite productivity and positivity tools.
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

      {/* Navigation Pills */}
      <div className="w-full max-w-5xl mt-6 mb-8 rounded-2xl bg-white/70 dark:bg-black/20 backdrop-blur border border-white/60 dark:border-white/20 shadow-lg p-4">
        <NavPills />
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground font-medium">
          💡 Tip: Hover over objects to see what tools are available
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
