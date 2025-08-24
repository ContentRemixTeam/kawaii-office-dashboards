import { useState } from "react";
import { Sparkles, Heart } from "lucide-react";
import BackgroundManager from "@/components/BackgroundManager";
import HomeHero from "@/components/HomeHero";
import ToolDock from "@/components/ToolDock";
import VisionPanel from "@/components/VisionPanel";

export default function Dashboard() {
  return (
    <main className="min-h-screen relative flex flex-col items-center px-4 py-8">
      <BackgroundManager />
      
      {/* Main content */}
      <div className="relative z-10 w-full space-y-8">
        {/* Welcome header */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-kawaii bg-clip-text text-transparent">
              Kawaii Positivity Office
            </h1>
            <Heart className="w-8 h-8 text-primary animate-bounce-cute" />
          </div>
          
          <p className="text-lg text-card-foreground/80 leading-relaxed bg-card/40 backdrop-blur-sm rounded-2xl p-4 border border-border/20">
            Your cozy digital workspace ✨
          </p>
        </div>

        {/* Layout that supports a side panel on wide screens */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Hero ambient video */}
            <HomeHero />
            
            {/* Vision panel below video on small/medium screens */}
            <div className="xl:hidden">
              <VisionPanel />
            </div>
            
            {/* Tool dock */}
            <ToolDock />
          </div>

          {/* Vision panel as a side panel on xl+ screens */}
          <aside className="hidden xl:block">
            <VisionPanel side />
          </aside>
        </div>
        
        {/* Helpful tip */}
        <div className="text-center mt-8">
          <p className="text-sm text-card-foreground/60 bg-card/30 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto">
            💡 Tip: Change the ambience in Soundscapes
          </p>
        </div>
      </div>
    </main>
  );
}