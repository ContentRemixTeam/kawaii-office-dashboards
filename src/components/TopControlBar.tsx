import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { onDataChanged } from "@/lib/bus";
import { toLocalISODate } from "@/lib/localDate";
import focusTimer, { FocusTimerState } from "@/lib/focusTimer";

// Storage keys
const ENERGY_KEY = "fm_energy_v1";
const AFFIRM_KEY = "fm_affirmations_v1";
const TASKS_KEY = "fm_tasks_v1";
const WINS_KEY = "fm_wins_v1";
const VISION_KEY = "fm_vision_v1";

// Data readers from ProductivityBar
function readEnergy(): { word?: string; date?: string; pinned?: boolean } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ENERGY_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    
    if (data?.date && data?.data?.word) {
      return { 
        word: data.data.word, 
        date: data.date, 
        pinned: data.data.pinned !== false 
      };
    }
    
    if (data?.word && data?.date) return { word: data.word, date: data.date, pinned: data.pinned };
    
    if (Array.isArray(data?.recent) && data.recent.length) {
      const latest = data.recent[0];
      return { word: latest?.word, date: latest?.date, pinned: data.pinned };
    }
    return {};
  } catch { return {}; }
}

function readAffirmation(): { text?: string; date?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(AFFIRM_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    
    if (data?.date && data?.data?.card?.text) {
      return { text: data.data.card.text, date: data.date };
    }
    if (data?.affirmation && data?.date) {
      return { text: data.affirmation, date: data.date };
    }
    return {};
  } catch { return {}; }
}

function readWins(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(WINS_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const today = toLocalISODate();
    
    if (Array.isArray(data?.entries)) {
      return data.entries.filter((entry: any) => entry?.date === today).length;
    }
    return 0;
  } catch { return 0; }
}

function readTasks(): { pet?: string; completedToday: number; totalToday: number } {
  if (typeof window === "undefined") return { completedToday: 0, totalToday: 0 };
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return { completedToday: 0, totalToday: 0 };
    const data = JSON.parse(raw);
    const today = toLocalISODate();
    
    let pet = data?.selectedPet || "unicorn";
    let completedToday = 0;
    let totalToday = 0;
    
    if (Array.isArray(data?.tasks)) {
      const todayTasks = data.tasks.filter((task: any) => task?.date === today);
      completedToday = todayTasks.filter((task: any) => task?.completed).length;
      totalToday = todayTasks.length;
    }
    
    return { pet, completedToday, totalToday };
  } catch { return { completedToday: 0, totalToday: 0 }; }
}

function readVisionImages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VISION_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    
    if (Array.isArray(data?.images)) {
      return data.images.slice(0, 3).map((img: any) => img?.src || img).filter(Boolean);
    }
    return [];
  } catch { return []; }
}

const ANIMAL_ICONS = {
  unicorn: "🦄",
  dragon: "🐉", 
  phoenix: "🔥",
  turtle: "🐢"
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
  const [energy, setEnergy] = useState<{ word?: string; date?: string; pinned?: boolean }>({});
  const [affirmation, setAffirmation] = useState<{ text?: string; date?: string }>({});
  const [winsCount, setWinsCount] = useState(0);
  const [tasks, setTasks] = useState<{ pet?: string; completedToday: number; totalToday: number }>({ completedToday: 0, totalToday: 0 });
  const [visionImages, setVisionImages] = useState<string[]>([]);

  const loadData = useCallback(() => {
    setEnergy(readEnergy());
    setAffirmation(readAffirmation());
    setWinsCount(readWins());
    setTasks(readTasks());
    setVisionImages(readVisionImages());
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
      if (keys.some(key => [ENERGY_KEY, AFFIRM_KEY, WINS_KEY, TASKS_KEY, VISION_KEY].includes(key))) {
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
    if (visionImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % visionImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [visionImages.length]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isToday = (date?: string) => date === toLocalISODate();
  const showEnergy = energy.word && isToday(energy.date) && energy.pinned !== false;
  const showAffirmation = affirmation.text && isToday(affirmation.date);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-lg border-b border-border/20 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left section - Vision Board Mini */}
        <div className="flex items-center gap-4">
          {visionImages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tools/vision")}
              className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded overflow-hidden">
                  <img 
                    src={visionImages[currentImageIndex]} 
                    alt="Vision" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium">Vision</span>
                {visionImages.length > 1 && (
                  <div className="flex gap-1">
                    {visionImages.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 h-1 rounded-full transition-colors ${
                          i === currentImageIndex ? 'bg-primary' : 'bg-muted'
                        }`} 
                      />
                    ))}
                  </div>
                )}
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
          {showEnergy && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => navigate("/tools/energy")}
            >
              <span className="mr-1">✨</span>
              {energy.word}
            </Badge>
          )}

          {/* Affirmation Preview */}
          {showAffirmation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tools/affirmations")}
              className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors max-w-32"
            >
              <span className="text-xs truncate">🃏 {affirmation.text}</span>
            </Button>
          )}

          {/* Pet Status */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tools/tasks")}
            className="h-8 px-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-1">
              <span>{ANIMAL_ICONS[tasks.pet as keyof typeof ANIMAL_ICONS] || "🦄"}</span>
              <span>{getPetStage(tasks.completedToday)}</span>
            </div>
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