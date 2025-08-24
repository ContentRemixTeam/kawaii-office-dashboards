import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ToolSection {
  title: string;
  emoji: string;
  tools: Array<{
    href: string;
    title: string;
    emoji: string;
    subtitle?: string;
  }>;
}

const TOOL_SECTIONS: ToolSection[] = [
  {
    title: "Daily Habits",
    emoji: "🌱",
    tools: [
      { href: "/tools/tasks", title: "Task Pets", emoji: "🐾", subtitle: "Gamified tasks" },
      { href: "/tools/energy", title: "Energy Word", emoji: "✨", subtitle: "Daily power word" },
      { href: "/tools/affirmations", title: "Affirmations", emoji: "🃏", subtitle: "Positive mindset" },
      { href: "/tools/habits", title: "Habit Garden", emoji: "🌱", subtitle: "Build routines" },
    ]
  },
  {
    title: "Gamified Tools",
    emoji: "🎮",
    tools: [
      { href: "/tools/focus", title: "Pomodoro", emoji: "⏱️", subtitle: "Focus sessions" },
      { href: "/tools/wins", title: "Daily Wins", emoji: "🏆", subtitle: "Celebrate progress" },
      { href: "/tools/money", title: "Money Tracker", emoji: "🐷", subtitle: "Financial goals" },
      { href: "/tools/cabinet", title: "Positivity Cabinet", emoji: "📁", subtitle: "Good vibes storage" },
    ]
  },
  {
    title: "Customization",
    emoji: "✨",
    tools: [
      { href: "/tools/vision", title: "Vision Board", emoji: "🖼️", subtitle: "Visual goals" },
      { href: "/tools/sounds", title: "Soundscapes", emoji: "🎧", subtitle: "Ambient focus" },
      { href: "/tools/theme", title: "Theme", emoji: "🎨", subtitle: "Personalize style" },
    ]
  }
];

export default function ThemedToolSections() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full space-y-8">
      <div className="text-center mb-6">
        <p className="text-muted-foreground text-sm">Choose your tool →</p>
      </div>
      
      {TOOL_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2 text-lg font-bold text-foreground">
            <span>{section.emoji}</span>
            <h2>{section.title}</h2>
          </div>
          
          {/* Tools Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {section.tools.map((tool) => {
              const isActive = location.pathname === tool.href;
              
              return (
                <Button
                  key={tool.href}
                  variant="ghost"
                  onClick={() => navigate(tool.href)}
                  className={`h-auto p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    isActive 
                      ? "bg-primary/10 border-primary/30 shadow-lg" 
                      : "bg-card/50 border-border/20 hover:bg-card/80 hover:border-primary/20"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl sm:text-3xl" role="img" aria-label={tool.title}>
                      {tool.emoji}
                    </span>
                    <div>
                      <div className={`font-medium text-sm ${
                        isActive ? "text-primary" : "text-card-foreground"
                      }`}>
                        {tool.title}
                      </div>
                      {tool.subtitle && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {tool.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}