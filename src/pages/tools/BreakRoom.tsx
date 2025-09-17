import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BreakPlayer from "@/components/BreakPlayer";
import YouTubeErrorBoundary from "@/components/YouTubeErrorBoundary";

export default function BreakRoom() {
  return (
    <main className="min-h-screen bg-gradient-background py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-card rounded-3xl shadow-cute p-8 border border-border/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-main mb-2">
                Break Room 🛋️
              </h1>
              <p className="text-lg text-muted-foreground">
                Take a mindful break to recharge
              </p>
            </div>
            <Link 
              to="/" 
              className="btn btn-secondary text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Office
            </Link>
          </div>

          {/* Break Player */}
          <div className="text-main leading-relaxed">
            <YouTubeErrorBoundary fallbackMessage="Break Room encountered an error. Please refresh the page or try again later.">
              <BreakPlayer />
            </YouTubeErrorBoundary>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-muted/30 rounded-xl p-4 border border-border/10">
            <h3 className="font-medium text-main mb-2">🌟 How to use your Break Room</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• Choose from 6 break categories designed for focus and energy</li>
              <li>• Each category has 3-4 curated options to avoid overwhelm</li>
              <li>• Use Hero Mode for full-screen immersive breaks</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}