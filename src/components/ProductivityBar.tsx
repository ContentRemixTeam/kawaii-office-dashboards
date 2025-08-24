import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, Square, SkipForward, Settings, Sparkles, ChevronDown, ChevronUp, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { onDataChanged } from "@/lib/bus";
import { toLocalISODate, isSameLocalDayISO } from "@/lib/localDate";
import { loadAmbient, AMBIENT_KEY } from "@/lib/ambientStore";
import focusTimer, { FocusTimerState } from "@/lib/focusTimer";

// Storage keys
const ENERGY_KEY = "fm_energy_v1";
const AFFIRM_KEY = "fm_affirmations_v1";
const TASKS_KEY = "fm_tasks_v1";
const WINS_KEY = "fm_wins_v1";

// Data readers for robust localStorage parsing
function readEnergy(): { word?: string; date?: string; pinned?: boolean } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ENERGY_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    
    // Shape A: Wrapped format from getDailyData/setDailyData { date: "2025-01-XX", data: { word, isCustom, pinned } }
    if (data?.date && data?.data?.word) {
      return { 
        word: data.data.word, 
        date: data.date, 
        pinned: data.data.pinned !== false 
      };
    }
    
    // Shape B: Direct format { date, word, pinned? }
    if (data?.word && data?.date) return { word: data.word, date: data.date, pinned: data.pinned };
    
    // Shape C: { pinned?, recent: [{date, word}, ...] }
    if (Array.isArray(data?.recent) && data.recent.length) {
      const latest = data.recent[0];
      return { word: latest?.word, date: latest?.date, pinned: data.pinned };
    }
    return {};
  } catch { return {}; }
}

function readAffirm(): { text?: string; date?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(AFFIRM_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    
    // Shape A: Wrapped format from getDailyData/setDailyData { date: "2025-01-XX", data: { cardIndex, text } }
    if (data?.date && data?.data?.text) {
      return { text: data.data.text, date: data.date };
    }
    
    // Shape B: Direct format { date, cardIndex, text }
    if (data?.text && data?.date) return { text: data.text, date: data.date };
    
    // Shape C: { today:{date,text}, history: [...] }
    if (data?.today?.text && data?.today?.date) return { text: data.today.text, date: data.today.date };
    
    // Fallback to most recent history item
    if (Array.isArray(data?.history) && data.history.length) {
      const latest = data.history[0];
      return { text: latest?.text, date: latest?.date };
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
    if (Array.isArray(data)) {
      const today = toLocalISODate();
      return data.filter((win: any) => {
        if (!win.date && !win.createdAt && !win.timestamp) return false;
        const winDate = new Date(win.date || win.createdAt || win.timestamp);
        const winDateISO = toLocalISODate(winDate);
        return winDateISO === today;
      }).length;
    }
    return 0;
  } catch { return 0; }
}

// Pet data types and helpers
type TaskState = {
  selectedAnimal?: string;
  tasks?: { text?: string; done?: boolean }[] | string[];
  completed?: boolean[]; // fallback
};

type PetStage = 0 | 1 | 2 | 3; // 0=egg, 1=baby, 2=growing, 3=full

function readTasks(): { animal?: string; completedCount: number; total: number } {
  if (typeof window === "undefined") return { completedCount: 0, total: 3 };
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return { completedCount: 0, total: 3 };
    const data = JSON.parse(raw) as TaskState;
    const animal = data.selectedAnimal;

    // normalize completion array
    let doneFlags: boolean[] = [];
    if (Array.isArray(data.tasks)) {
      doneFlags = (data.tasks as any[]).map(t =>
        typeof t === "object" ? !!t?.done : false
      );
    } else if (Array.isArray(data.completed)) {
      doneFlags = data.completed.map(Boolean);
    }
    const total = Math.max(3, doneFlags.length || 3);
    const completedCount = doneFlags.filter(Boolean).length;

    return { animal, completedCount, total };
  } catch {
    return { completedCount: 0, total: 3 };
  }
}

function getPetStage(count: number): PetStage {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3; // 3+
}

const stageIcon: Record<PetStage, string> = { 0:"🥚", 1:"🐣", 2:"🫶", 3:"✨" };
const stageLabel: Record<PetStage, string> = { 0:"Sleeping", 1:"Baby", 2:"Growing", 3:"Full" };

const animalIcons: Record<string, string> = {
  unicorn: "🦄",
  dragon: "🐉", 
  cat: "🐱",
  dog: "🐶",
  bunny: "🐰",
  fox: "🦊",
  panda: "🐼",
  penguin: "🐧",
  owl: "🦉",
  hamster: "🐹"
};

interface DailyProgress {
  date: string;
  waters: number;
  stretches: number;
}

interface PositivityData {
  energyWord?: string;
  affirmation?: string;
  winsCount?: number;
}

// Custom hook for live data updates
function useLiveData(loadFn: () => void) {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if ([ENERGY_KEY, AFFIRM_KEY, TASKS_KEY, WINS_KEY, AMBIENT_KEY].includes(e.key)) loadFn();
    };
    window.addEventListener("storage", onStorage);

    let offBus: (() => void) | undefined;
    try { 
      offBus = onDataChanged?.((keys) => {
        if (!keys || !keys.length) { loadFn(); return; }
        if (keys.some(k => [ENERGY_KEY, AFFIRM_KEY, TASKS_KEY, WINS_KEY, AMBIENT_KEY].includes(k))) loadFn();
      }); 
    } catch {}

    const onVis = () => { if (document.visibilityState === "visible") loadFn(); };
    document.addEventListener("visibilitychange", onVis);

    const id = window.setInterval(loadFn, 10000);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(id);
      offBus?.();
    };
  }, [loadFn]);
}

const getTodayISO = () => new Date().toISOString().split('T')[0];

const ANIMALS = {
  unicorn: { base: "🦄", stages: ["🥚", "🦄", "🦄", "🌟🦄✨"] },
  dragon: { base: "🐉", stages: ["🥚", "🐲", "🐉", "🔥🐉🔥"] },
  cat: { base: "🐱", stages: ["🥚", "🐱", "😸", "👑🐱👑"] },
  dog: { base: "🐶", stages: ["🥚", "🐶", "🐕", "⭐🐕⭐"] },
  bunny: { base: "🐰", stages: ["🥚", "🐰", "🐇", "🌙🐇🌙"] },
  fox: { base: "🦊", stages: ["🥚", "🦊", "🦊", "🍂🦊🍂"] },
  panda: { base: "🐼", stages: ["🥚", "🐼", "🐼", "🎋🐼🎋"] },
  penguin: { base: "🐧", stages: ["🥚", "🐧", "🐧", "❄️🐧❄️"] },
  owl: { base: "🦉", stages: ["🥚", "🦉", "🦉", "🌟🦉🌟"] },
  hamster: { base: "🐹", stages: ["🥚", "🐹", "🐹", "🌻🐹🌻"] }
};

export default function ProductivityBar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timerState, setTimerState] = useState<FocusTimerState>(focusTimer.getState());
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: getTodayISO(),
    waters: 0,
    stretches: 0
  });

  const [lastWaterTime, setLastWaterTime] = useState<number>(Date.now());
  const [lastStretchTime, setLastStretchTime] = useState<number>(Date.now());
  const [showWaterReminder, setShowWaterReminder] = useState(false);
  const [showStretchReminder, setShowStretchReminder] = useState(false);
  const [positivityData, setPositivityData] = useState<PositivityData>({});
  const [petInfo, setPetInfo] = useState<{animal?: string; count: number; total: number}>({ count: 0, total: 3 });

  // Individual state for better tracking
  const [energyWord, setEnergyWord] = useState<string>();
  const [affirmText, setAffirmText] = useState<string>();
  const [winsCount, setWinsCount] = useState<number>(0);

  const { toast } = useToast();

  // Load data functions
  const loadPet = () => {
    const taskData = readTasks();
    setPetInfo({ 
      animal: taskData.animal, 
      count: taskData.completedCount, 
      total: taskData.total 
    });
  };

  const loadData = useCallback(() => {
    const e = readEnergy();
    const a = readAffirm();
    const w = readWins();
    
    // Only show today's energy word if it's today and not explicitly disabled
    setEnergyWord(isSameLocalDayISO(e.date) && e.pinned !== false ? e.word : undefined);
    
    // Only show today's affirmation
    setAffirmText(isSameLocalDayISO(a.date) ? a.text : undefined);
    
    // Set wins count
    setWinsCount(w);
    
    // Update combined data for compatibility
    setPositivityData({
      energyWord: isSameLocalDayISO(e.date) && e.pinned !== false ? e.word : undefined,
      affirmation: isSameLocalDayISO(a.date) ? a.text : undefined,
      winsCount: w
    });
    
    // Load pet data
    loadPet();
  }, []);

  // Subscribe to live updates
  useLiveData(loadData);

  // Load saved data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer integration
  useEffect(() => {
    setTimerState(focusTimer.getState());
    
    const unsubscribeTick = focusTimer.on("tick", setTimerState);
    const unsubscribePhase = focusTimer.on("phase", (newPhase) => {
      setTimerState(focusTimer.getState());
      
      // Celebration confetti for completed focus
      if (newPhase !== "focus") {
        // Focus session completed
        setTimeout(() => {
          const celebration = document.createElement("div");
          celebration.innerHTML = "🎉";
          celebration.className = "fixed top-4 right-4 text-2xl animate-bounce z-50";
          document.body.appendChild(celebration);
          setTimeout(() => celebration.remove(), 2000);
        }, 100);
      }
    });
    
    const unsubscribeReminder = focusTimer.on("reminder", (type) => {
      const now = Date.now();
      if (type === "hydration" && now - lastWaterTime > 30 * 60 * 1000) {
        setShowWaterReminder(true);
      }
      if (type === "stretch" && now - lastStretchTime > 60 * 60 * 1000) {
        setShowStretchReminder(true);
      }
    });

    return () => {
      unsubscribeTick();
      unsubscribePhase();
      unsubscribeReminder();
    };
  }, [lastWaterTime, lastStretchTime]);

  // Hydration and stretch progress
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('fm_productivity_day_v1') || '{}');
    const today = getTodayISO();
    
    if (savedProgress.date !== today) {
      const newProgress = { date: today, waters: 0, stretches: 0 };
      setDailyProgress(newProgress);
      localStorage.setItem('fm_productivity_day_v1', JSON.stringify(newProgress));
    } else {
      setDailyProgress({ 
        date: savedProgress.date || today, 
        waters: savedProgress.waters || 0, 
        stretches: savedProgress.stretches || 0 
      });
    }
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (timerState.isRunning) {
      focusTimer.pause();
    } else if (timerState.msLeft > 0) {
      focusTimer.resume();
    } else {
      focusTimer.start("focus");
      focusTimer.enableAudio(); // Enable audio on user gesture
    }
  };

  const stopTimer = () => {
    focusTimer.stop();
  };

  const skipPhase = () => {
    focusTimer.skip();
  };

  const addWater = () => {
    if (dailyProgress.waters < 8) {
      const newProgress = { ...dailyProgress, waters: dailyProgress.waters + 1 };
      setDailyProgress(newProgress);
      localStorage.setItem('fm_productivity_day_v1', JSON.stringify(newProgress));
      setLastWaterTime(Date.now());
      setShowWaterReminder(false);

      toast({
        title: "💧 Hydration boost!",
        description: `${newProgress.waters}/8 glasses today`
      });
    }
  };

  const addStretch = () => {
    const newProgress = { ...dailyProgress, stretches: dailyProgress.stretches + 1 };
    setDailyProgress(newProgress);
    localStorage.setItem('fm_productivity_day_v1', JSON.stringify(newProgress));
    setLastStretchTime(Date.now());
    setShowStretchReminder(false);

    toast({
      title: "🤸 Great stretch!",
      description: `${newProgress.stretches} stretches completed today`
    });
  };
  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsCollapsed(false)}
          className="rounded-full w-12 h-12 bg-gradient-to-r from-pink-200 to-emerald-200 hover:from-pink-300 hover:to-emerald-300 border border-pink-300/50 animate-pulse"
        >
          <Sparkles className="w-5 h-5 text-pink-800" />
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 overflow-visible">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-pink-100 via-purple-50 to-emerald-100 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-emerald-900/30 backdrop-blur-lg border border-pink-200/50 dark:border-pink-700/50 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-pink-800 dark:text-pink-200">✨ Kawaii Productivity</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-pink-700 hover:text-pink-800"
                  onClick={() => navigate('/tools/theme')}
                >
                  <Palette className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/tools/focus')}
                  className="text-pink-700 hover:text-pink-800"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCollapsed(true)}
                  className="text-pink-700 hover:text-pink-800"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Focus Timer */}
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                <div className="text-2xl">🎯</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={timerState.phase === 'focus' ? 'default' : 'secondary'} className="text-xs">
                      {timerState.phaseLabel}
                    </Badge>
                    <span className="text-lg font-mono font-bold text-pink-800 dark:text-pink-200">
                      {formatTime(timerState.msLeft)}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-1">
                    <Button size="sm" variant="outline" onClick={toggleTimer}>
                      {timerState.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={stopTimer}>
                      <Square className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={skipPhase}>
                      <SkipForward className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${timerState.progress * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Session {timerState.cycleCount + 1} of {timerState.dailyGoal} • Today: {timerState.cycleCount} focus blocks
                  </div>
                </div>
              </div>

              {/* Hydration & Stretch */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <div className={`text-2xl ${showWaterReminder ? 'animate-bounce' : ''}`}>💧</div>
                  <div className="flex-1">
                    <div className="text-xs text-muted mb-1">Hydration {dailyProgress.waters}/8</div>
                    <div className="flex gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={addWater}
                          disabled={i >= dailyProgress.waters}
                          className={`w-3 h-3 rounded-full transition-all ${
                            i < dailyProgress.waters 
                              ? 'bg-blue-400 scale-110' 
                              : 'bg-gray-200 dark:bg-gray-600 hover:bg-blue-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <button
                    onClick={addStretch}
                    className={`text-2xl transition-transform hover:scale-110 ${
                      showStretchReminder ? 'animate-bounce' : ''
                    }`}
                  >
                    🤸
                  </button>
                  <div className="flex-1">
                    <div className="text-xs text-muted mb-1">Stretches: {dailyProgress.stretches}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {showStretchReminder ? '✨ Stretch time!' : 'Keep moving!'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}