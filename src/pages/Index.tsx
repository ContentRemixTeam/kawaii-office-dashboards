import HotspotImage from "@/components/HotspotImage";
import { HOTSPOTS, OFFICE_ALT, OFFICE_IMAGE_SRC } from "@/data/hotspots";
import { Sparkles, Heart } from "lucide-react";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-background flex flex-col items-center py-10 px-4">
      <div className="text-center mb-12 space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-kawaii bg-clip-text text-transparent">
            Kawaii Positivity Office
          </h1>
          <Heart className="w-8 h-8 text-primary animate-bounce-cute" />
        </div>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
          Welcome to your cozy digital workspace! ✨ Click on any object in the office to access your favorite productivity and positivity tools.
        </p>
      </div>

      <div className="w-full max-w-6xl mb-8">
        <HotspotImage
          src={OFFICE_IMAGE_SRC}
          alt={OFFICE_ALT}
          hotspots={HOTSPOTS}
          aspectRatio={16/9}
        />
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground font-medium">
          💡 Tip: Hover over objects to see what tools are available
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/80">
          <span>🐱 Task Pets</span>
          <span>📁 Positivity Cabinet</span>
          <span>🎨 Vision Board</span>
          <span>🌱 Habit Garden</span>
        </div>
      </div>
    </main>
  );
};

export default Index;
