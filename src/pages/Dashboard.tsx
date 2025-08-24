import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Sparkles, Heart } from "lucide-react";
import BackgroundManager from "@/components/BackgroundManager";

export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center px-4">
      <BackgroundManager />
      
      {showWelcome && (
        <div className="text-center space-y-6 max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-kawaii bg-clip-text text-transparent">
              Kawaii Positivity Office
            </h1>
            <Heart className="w-8 h-8 text-primary animate-bounce-cute" />
          </div>
          
          <p className="text-xl text-card-foreground/80 leading-relaxed bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
            Welcome to your cozy digital workspace! ✨ 
            <br />
            Use the control bar above to access your tools, or open the menu to navigate.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setShowWelcome(false)}
              className="bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
            >
              Hide Welcome Message
            </Button>
            
            <Button
              variant="outline"
              className="bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize Background
            </Button>
          </div>
          
          <div className="text-center space-y-3 mt-8">
            <p className="text-sm text-card-foreground/60 font-medium bg-card/30 backdrop-blur-sm rounded-lg p-3">
              💡 Tip: Your productivity widgets are always visible in the top bar
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-card-foreground/50">
              <span>🦄 Task Pets</span>
              <span>🎨 Vision Board</span>
              <span>🏆 Daily Wins</span>
              <span>✨ Energy Word</span>
            </div>
          </div>
        </div>
      )}
      
      {!showWelcome && (
        <div className="text-center space-y-4">
          <p className="text-lg text-card-foreground/70 bg-card/50 backdrop-blur-sm rounded-xl p-4">
            Your workspace is ready! ✨
          </p>
          <Button
            variant="ghost"
            onClick={() => setShowWelcome(true)}
            className="text-sm text-card-foreground/50 hover:text-card-foreground/80"
          >
            Show welcome message
          </Button>
        </div>
      )}
    </main>
  );
}