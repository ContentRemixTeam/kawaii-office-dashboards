import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TOOLS = [
  { href: "/tools/tasks", title: "Pet Store Mode", emoji: "🐾" },
  { href: "/tools/cabinet", title: "Positivity Cabinet", emoji: "📁" },
  { href: "/tools/vision", title: "Vision Board", emoji: "🖼️" },
  { href: "/tools/money", title: "Money Tracker", emoji: "🐷" },
  { href: "/tools/affirmations", title: "Affirmations", emoji: "🃏" },
  
  { href: "/tools/wins", title: "Daily Wins", emoji: "🏆" },
  { href: "/tools/energy", title: "Energy Word", emoji: "✨" },
  { href: "/tools/sounds", title: "Soundscapes", emoji: "🎧" },
  { href: "/tools/focus", title: "Pomodoro", emoji: "⏱️" },
  { href: "/tools/theme", title: "Theme", emoji: "🎨" },
];

export default function ToolDock() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {TOOLS.map((tool) => {
          const isActive = location.pathname === tool.href;
          
          return (
            <Button
              key={tool.href}
              variant="ghost"
              onClick={() => navigate(tool.href)}
              className={`h-auto p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-soft ${
                isActive 
                  ? "bg-primary/10 border-primary/30 shadow-soft" 
                  : "bg-card/50 border-border/20 hover:bg-card/80 hover:border-primary/20"
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-3xl sm:text-4xl" role="img" aria-label={tool.title}>
                  {tool.emoji}
                </span>
                <span className={`font-medium text-sm sm:text-base ${
                  isActive ? "text-primary" : "text-card-foreground"
                }`}>
                  {tool.title}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}