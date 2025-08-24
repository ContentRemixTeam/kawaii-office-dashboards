import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { onDataChanged } from "@/lib/bus";
import focusTimer, { FocusTimerState } from "@/lib/focusTimer";
import {
  readEnergy, readAffirmationFull, readPetStage, readWinsToday, readTimer, readVisionThumbs,
  KEY_ENERGY, KEY_AFFIRM, KEY_TASKS, KEY_WINS, KEY_FOCUS, KEY_VISION
} from "@/lib/topbarState";

const ANIMAL_ICONS = {
  unicorn: "🦄",
  dragon: "🐉", 
  phoenix: "🔥",
  turtle: "🐢",
  Unicorn: "🦄",
  Dragon: "🐉",
  Cat: "🐱",
  Dog: "🐶",
  Bunny: "🐰",
  Fox: "🦊",
  Panda: "🐼",
  Penguin: "🐧",
  Owl: "🦉",
  Hamster: "🐹"
};

const getPetStage = (count: number): string => {
  if (count >= 5) return "✨";
  if (count >= 3) return "💫";
  if (count >= 1) return "⭐";
  return "🥚";
};

export default function TopControlBar() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timerState, setTimerState] = useState<FocusTimerState | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);
  const [affirmation, setAffirmation] = useState<{text:string|null; title?:string|null}>({text:null, title:null});
  const [winsCount, setWinsCount] = useState(0);
  const [pet, setPet] = useState<{animal:string|null; stage:number}>({animal:null, stage:0});
  const [visionThumbs, setVisionThumbs] = useState<string[]>([]);

  const loadData = useCallback(() => {
    setEnergy(readEnergy());
    setAffirmation(readAffirmationFull());
    setWinsCount(readWinsToday());
    setPet(readPetStage());
    setVisionThumbs(readVisionThumbs(3));
  }, []);

  useEffect(() => {
    loadData();
    
    // Subscribe to focus timer
    const unsubscribeTimer = focusTimer.on("tick", (state) => {
      setTimerState(state);
    });
    
    // Load initial timer state
    setTimerState(focusTimer.getState());
    
    // Subscribe to data changes
    const unsubscribeData = onDataChanged((keys) => {
      if (keys.some(key => [KEY_ENERGY, KEY_AFFIRM, KEY_WINS, KEY_TASKS, KEY_VISION, KEY_FOCUS].includes(key))) {
        loadData();
      }
    });
    
    return () => {
      unsubscribeTimer();
      unsubscribeData();
    };
  }, [loadData]);

  // Rotate vision images
  useEffect(() => {
    if (visionThumbs.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % visionThumbs.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [visionThumbs.length]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const petEmoji = (() => {
    const a = pet.animal || "Pet";
    const emoji = ANIMAL_ICONS[a as keyof typeof ANIMAL_ICONS] || "🐾";
    const stars = ["🌙","🌱","✨","🎀"][pet.stage] || "🌙";
    return `${emoji} ${stars}`;
  })();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-lg border-b border-border/20 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left section - Vision Board Mini */}
        <div className="flex items-center gap-4">
          {visionThumbs.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tools/vision")}
              className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🖼️</span>
                <span className="text-xs font-medium">Vision</span>
                <div className="flex -space-x-1">
                  {visionThumbs.slice(0, 3).map((src, i) => (
                    <img 
                      key={i}
                      src={src} 
                      alt="Vision item" 
                      className="w-5 h-5 rounded border object-cover"
                    />
                  ))}
                </div>
              </div>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tools/vision")}
              className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🖼️</span>
                <span className="text-xs text-muted-foreground">Add vision</span>
              </div>
            </Button>
          )}
        </div>

        {/* Center section - Timer */}
        <div className="flex items-center gap-4">
          {timerState && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tools/focus")}
              className="h-8 px-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  timerState.phase === 'focus' ? 'bg-destructive animate-pulse' :
                  timerState.phase === 'idle' ? 'bg-muted' : 'bg-accent'
                }`} />
                <span className="text-xs font-mono">
                  {timerState.isRunning ? formatTime(timerState.msLeft) : timerState.phaseLabel}
                </span>
              </div>
            </Button>
          )}
        </div>

        {/* Right section - Other widgets */}
        <div className="flex items-center gap-2">
          {/* Energy Word */}
          {energy && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => navigate("/tools/energy")}
            >
              <span className="mr-1">✨</span>
              {energy}
            </Badge>
          )}

          {/* Affirmation Preview */}
          {affirmation.text ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tools/affirmations")}
              className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors max-w-40"
            >
              <span className="text-xs truncate">🃏 {affirmation.text}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tools/affirmations")}
              className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <span className="text-xs text-muted-foreground">🃏 Draw card</span>
            </Button>
          )}

          {/* Pet Status */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tools/tasks")}
            className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
          >
            <span className="text-sm">{petEmoji}</span>
          </Button>

          {/* Wins Counter */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tools/wins")}
            className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-1">
              <span>🏆</span>
              <span className="text-xs font-medium">{winsCount}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}