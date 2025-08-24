import { useState } from "react";
import { Sparkles, Heart } from "lucide-react";
import BackgroundManager from "@/components/BackgroundManager";
import HomeHero from "@/components/HomeHero";
import VisionStrip from "@/components/VisionStrip";
import ThemedToolSections from "@/components/ThemedToolSections";

export default function Dashboard() {
  return (
    <main className="min-h-screen relative">
      <BackgroundManager />
      
      {/* Top spacing for fixed bar */}
      <div className="h-12" />
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-kawaii bg-clip-text text-transparent">
              Kawaii Positivity Office
            </h1>
            <Heart className="w-8 h-8 text-primary animate-bounce-cute" />
          </div>
          
          <p className="text-lg text-card-foreground/80 leading-relaxed bg-card/40 backdrop-blur-sm rounded-2xl p-4 border border-border/20 max-w-2xl mx-auto">
            Your cozy digital workspace ✨
          </p>
        </div>

        {/* Focus Area */}
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">🌟 Ready to focus?</p>
          </div>
          
          {/* Enhanced video with frame */}
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-card/20 to-card/40 p-4 rounded-3xl border border-border/20 shadow-xl backdrop-blur-sm">
              <HomeHero />
            </div>
          </div>
        </div>

        {/* Vision Board Strip */}
        <VisionStrip />

        {/* Tool Sections */}
        <ThemedToolSections />
        
        {/* Footer tip */}
        <div className="text-center mt-12">
          <p className="text-sm text-card-foreground/60 bg-card/30 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto">
            💡 Tip: Your daily info is always visible in the top bar
          </p>
        </div>
      </div>
    </main>
  );
}