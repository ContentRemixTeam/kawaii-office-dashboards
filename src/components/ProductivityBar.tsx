import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, RotateCcw, Settings, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { safeGet, safeSet } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { onDataChanged } from "@/lib/bus";

interface ProductivitySettings {
  focusMinutes: number;
  breakMinutes: number;
  longBreakEvery: number;
  waterInterval: number;
  stretchInterval: number;
  enabled: boolean;
}

interface DailyProgress {
  date: string;
  focusSessions: number;
  waters: number;
  stretches: number;
  currentRound: number;
}

interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  isBreak: boolean;
  phase: 'focus' | 'break' | 'longBreak';
}

const DEFAULT_SETTINGS: ProductivitySettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakEvery: 4,
  waterInterval: 30,
  stretchInterval: 60,
  enabled: true
};

interface PositivityData {
  energyWord?: string;
  affirmation?: string;
  pet?: {
    animal: string;
    stage: number;
    emoji: string;
  };
  winsCount?: number;
}

const getTodayISO = () => new Date().toISOString().split('T')[0];

const ANIMAL_STAGES = {
  0: { emoji: "🥚", label: "Egg" },
  1: { emoji: "🐣", label: "Baby" }, 
  2: { emoji: "🐥", label: "Growing" },
  3: { emoji: "✨", label: "Magical" }
};

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ProductivitySettings>(DEFAULT_SETTINGS);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: getTodayISO(),
    focusSessions: 0,
    waters: 0,
    stretches: 0,
    currentRound: 1
  });
  
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    timeLeft: DEFAULT_SETTINGS.focusMinutes * 60,
    isBreak: false,
    phase: 'focus'
  });

  const [lastWaterTime, setLastWaterTime] = useState<number>(Date.now());
  const [lastStretchTime, setLastStretchTime] = useState<number>(Date.now());
  const [showWaterReminder, setShowWaterReminder] = useState(false);
  const [showStretchReminder, setShowStretchReminder] = useState(false);
  const [positivityData, setPositivityData] = useState<PositivityData>({});

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load saved data and positivity data
  useEffect(() => {
    const loadData = () => {
      const savedSettings = safeGet<ProductivitySettings>('fm_productivity_settings_v1', DEFAULT_SETTINGS);
      const savedProgress = safeGet<DailyProgress>('fm_productivity_day_v1', {
        date: getTodayISO(),
        focusSessions: 0,
        waters: 0,
        stretches: 0,
        currentRound: 1
      });

      setSettings(savedSettings);
      
      // Reset progress if it's a new day
      const today = getTodayISO();
      if (savedProgress.date !== today) {
        const newProgress = {
          date: today,
          focusSessions: 0,
          waters: 0,
          stretches: 0,
          currentRound: 1
        };
        setDailyProgress(newProgress);
        safeSet('fm_productivity_day_v1', newProgress);
      } else {
        setDailyProgress(savedProgress);
      }

      // Set initial timer duration
      setTimer(prev => ({ ...prev, timeLeft: savedSettings.focusMinutes * 60 }));

      // Load positivity data
      loadPositivityData();
    };

    loadData();
    
    // Listen for storage changes AND bus events for real-time updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fm_energy_v1' || e.key === 'fm_affirmations_v1' || e.key === 'fm_tasks_v1' || e.key === 'fm_wins_v1') {
        loadPositivityData();
      }
    };

    const handleBusChange = (keys: string[]) => {
      const relevantKeys = ['fm_energy_v1', 'fm_affirmations_v1', 'fm_tasks_v1', 'fm_wins_v1'];
      if (keys.some(key => relevantKeys.includes(key))) {
        loadPositivityData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const unsubscribeBus = onDataChanged(handleBusChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeBus();
    };
  }, []);

  const loadPositivityData = () => {
    if (typeof window === 'undefined') return; // SSR guard
    
    const today = getTodayISO();
    const newPositivityData: PositivityData = {};

    // Load Energy Word - handle both shapes
    try {
      const energyRaw = localStorage.getItem('fm_energy_v1');
      if (energyRaw) {
        const energyData = JSON.parse(energyRaw);
        
        // Shape A: { date, word, pinned? }
        if (energyData.date === today && energyData.word) {
          newPositivityData.energyWord = energyData.word;
        }
        // Shape B: { pinned?, recent: [{date,word}, ...] }
        else if (Array.isArray(energyData.recent) && energyData.recent.length > 0) {
          const todayEntry = energyData.recent.find((entry: any) => entry.date === today);
          if (todayEntry?.word) {
            newPositivityData.energyWord = todayEntry.word;
          }
        }
      }
    } catch (error) {
      console.debug('Error loading energy word:', error);
    }

    // Load Affirmation - handle both shapes
    try {
      const affirmationRaw = localStorage.getItem('fm_affirmations_v1');
      if (affirmationRaw) {
        const affirmationData = JSON.parse(affirmationRaw);
        
        // Shape A: { date, cardIndex, text }
        if (affirmationData.date === today && affirmationData.text) {
          newPositivityData.affirmation = affirmationData.text;
        }
        // Shape B: { today: {date,text}, history:[...] }
        else if (affirmationData.today?.date === today && affirmationData.today?.text) {
          newPositivityData.affirmation = affirmationData.today.text;
        }
      }
    } catch (error) {
      console.debug('Error loading affirmation:', error);
    }

    // Load Pet Data
    try {
      const tasksRaw = localStorage.getItem('fm_tasks_v1');
      if (tasksRaw) {
        const tasksData = JSON.parse(tasksRaw);
        if (tasksData.date === today && tasksData.selectedAnimal) {
          const completedTasks = (tasksData.tasks || []).filter((task: any) => task.completed).length;
          const stage = Math.min(3, completedTasks);
          const animalKey = tasksData.selectedAnimal;
          const animalData = ANIMALS[animalKey as keyof typeof ANIMALS];
          
          if (animalData) {
            newPositivityData.pet = {
              animal: animalKey,
              stage,
              emoji: animalData.stages[stage] || animalData.base
            };
          }
        }
      }
    } catch (error) {
      console.debug('Error loading pet data:', error);
    }

    // Load Daily Wins
    try {
      const winsRaw = localStorage.getItem('fm_wins_v1');
      if (winsRaw) {
        const winsData = JSON.parse(winsRaw);
        if (Array.isArray(winsData)) {
          // Count wins from today
          const todayWins = winsData.filter((win: any) => {
            const winDate = new Date(win.createdAt || win.date || win.timestamp);
            return winDate.toISOString().split('T')[0] === today;
          }).length;
          newPositivityData.winsCount = todayWins;
        }
      }
    } catch (error) {
      console.debug('Error loading wins data:', error);
    }

    setPositivityData(newPositivityData);
  };

  // Timer logic
  useEffect(() => {
    if (timer.isRunning && settings.enabled) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.timeLeft <= 1) {
            // Timer finished
            const isCurrentlyBreak = prev.phase === 'break' || prev.phase === 'longBreak';
            let newPhase: 'focus' | 'break' | 'longBreak' = 'focus';
            let newTimeLeft = settings.focusMinutes * 60;

            if (!isCurrentlyBreak) {
              // Just finished focus session
              const newProgress = {
                ...dailyProgress,
                focusSessions: dailyProgress.focusSessions + 1,
                currentRound: dailyProgress.currentRound + 1
              };
              setDailyProgress(newProgress);
              safeSet('fm_productivity_day_v1', newProgress);

              // Determine break type
              if (newProgress.currentRound % settings.longBreakEvery === 0) {
                newPhase = 'longBreak';
                newTimeLeft = settings.breakMinutes * 60 * 2; // Double break time for long break
              } else {
                newPhase = 'break';
                newTimeLeft = settings.breakMinutes * 60;
              }

              toast({
                title: "🎉 Focus session complete!",
                description: "Time for a well-deserved break!"
              });
            } else {
              // Just finished break
              newPhase = 'focus';
              newTimeLeft = settings.focusMinutes * 60;
              
              toast({
                title: "✨ Break time over!",
                description: "Ready for another focused session?"
              });
            }

            return {
              isRunning: false,
              timeLeft: newTimeLeft,
              isBreak: newPhase !== 'focus',
              phase: newPhase
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.isRunning, settings, dailyProgress]);

  // Check for reminders
  useEffect(() => {
    if (!settings.enabled) return;

    const checkReminders = () => {
      const now = Date.now();
      
      if (now - lastWaterTime > settings.waterInterval * 60 * 1000) {
        setShowWaterReminder(true);
      }
      
      if (now - lastStretchTime > settings.stretchInterval * 60 * 1000) {
        setShowStretchReminder(true);
      }
    };

    const reminderInterval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(reminderInterval);
  }, [lastWaterTime, lastStretchTime, settings]);

  const toggleTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetTimer = () => {
    setTimer({
      isRunning: false,
      timeLeft: settings.focusMinutes * 60,
      isBreak: false,
      phase: 'focus'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addWater = () => {
    if (dailyProgress.waters < 8) {
      const newProgress = { ...dailyProgress, waters: dailyProgress.waters + 1 };
      setDailyProgress(newProgress);
      safeSet('fm_productivity_day_v1', newProgress);
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
    safeSet('fm_productivity_day_v1', newProgress);
    setLastStretchTime(Date.now());
    setShowStretchReminder(false);

    toast({
      title: "🤸 Great stretch!",
      description: `${newProgress.stretches} stretches completed today`
    });
  };

  const saveSettings = (newSettings: ProductivitySettings) => {
    setSettings(newSettings);
    safeSet('fm_productivity_settings_v1', newSettings);
    
    // Update timer if not running
    if (!timer.isRunning) {
      setTimer(prev => ({
        ...prev,
        timeLeft: prev.phase === 'focus' ? newSettings.focusMinutes * 60 : newSettings.breakMinutes * 60
      }));
    }
  };

  if (!settings.enabled) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => saveSettings({ ...settings, enabled: true })}
          className="rounded-full w-12 h-12 bg-gradient-to-r from-pink-200 to-emerald-200 hover:from-pink-300 hover:to-emerald-300 border border-pink-300/50"
        >
          <Sparkles className="w-5 h-5 text-pink-800" />
        </Button>
      </div>
    );
  }

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
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-pink-100 via-purple-50 to-emerald-100 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-emerald-900/30 backdrop-blur-lg border border-pink-200/50 dark:border-pink-700/50 rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-pink-800 dark:text-pink-200">✨ Kawaii Productivity</h3>
            <div className="flex items-center gap-2">
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-pink-700 hover:text-pink-800">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>⚙️ Productivity Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <Label>Focus Session (minutes)</Label>
                      <Slider
                        value={[settings.focusMinutes]}
                        onValueChange={(value) => saveSettings({ ...settings, focusMinutes: value[0] })}
                        min={10}
                        max={60}
                        step={5}
                        className="mt-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">{settings.focusMinutes} minutes</div>
                    </div>
                    
                    <div>
                      <Label>Break Duration (minutes)</Label>
                      <Slider
                        value={[settings.breakMinutes]}
                        onValueChange={(value) => saveSettings({ ...settings, breakMinutes: value[0] })}
                        min={5}
                        max={30}
                        step={5}
                        className="mt-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">{settings.breakMinutes} minutes</div>
                    </div>
                    
                    <div>
                      <Label>Water Reminder (minutes)</Label>
                      <Slider
                        value={[settings.waterInterval]}
                        onValueChange={(value) => saveSettings({ ...settings, waterInterval: value[0] })}
                        min={15}
                        max={120}
                        step={15}
                        className="mt-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">Every {settings.waterInterval} minutes</div>
                    </div>
                    
                    <div>
                      <Label>Stretch Reminder (minutes)</Label>
                      <Slider
                        value={[settings.stretchInterval]}
                        onValueChange={(value) => saveSettings({ ...settings, stretchInterval: value[0] })}
                        min={30}
                        max={180}
                        step={30}
                        className="mt-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">Every {settings.stretchInterval} minutes</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Enable Productivity Bar</Label>
                      <Switch
                        checked={settings.enabled}
                        onCheckedChange={(enabled) => saveSettings({ ...settings, enabled })}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
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
            {/* Left Side - Productivity Trackers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Timer Section */}
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-xl">
              <div className="text-2xl">⏱️</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={timer.phase === 'focus' ? 'default' : 'secondary'} className="text-xs">
                    {timer.phase === 'focus' ? 'Focus' : timer.phase === 'longBreak' ? 'Long Break' : 'Break'}
                  </Badge>
                  <span className="text-lg font-mono font-bold text-pink-800 dark:text-pink-200">
                    {formatTime(timer.timeLeft)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={toggleTimer}>
                    {timer.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetTimer}>
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

              {/* Water Tracker */}
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-xl">
              <div className={`text-2xl ${showWaterReminder ? 'animate-bounce' : ''}`}>💧</div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-2">Hydration {dailyProgress.waters}/8</div>
                <div className="flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={addWater}
                      disabled={i >= dailyProgress.waters}
                      className={`w-4 h-4 rounded-full transition-all ${
                        i < dailyProgress.waters 
                          ? 'bg-blue-400 scale-110' 
                          : 'bg-gray-200 dark:bg-gray-600 hover:bg-blue-200'
                      }`}
                    />
                  ))}
                </div>
                {showWaterReminder && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 animate-pulse">
                    💧 Time to hydrate!
              </div>
                )}
              </div>
            </div>

              {/* Stretch Reminder */}
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-xl">
              <button
                onClick={addStretch}
                className={`text-2xl transition-transform hover:scale-110 ${
                  showStretchReminder ? 'animate-bounce' : ''
                }`}
              >
                🤸
              </button>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Stretches: {dailyProgress.stretches}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {showStretchReminder ? '✨ Stretch time!' : 'Keep moving!'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Focus sessions: {dailyProgress.focusSessions}
              </div>
              </div>
              </div>
            </div>

            {/* Right Side - Positivity Anchors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Energy Word */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden rounded-xl px-3 py-2 bg-white/50 dark:bg-black/20 border border-border/10">
                <span aria-hidden="true" className="text-lg flex-shrink-0">🌟</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground leading-tight">Energy</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-left justify-start font-medium leading-tight"
                        onClick={() => navigate('/tools/energy')}
                        title={positivityData.energyWord || 'Choose your word ✨'}
                      >
                        <span className="truncate max-w-[10rem] sm:max-w-[7.5rem] text-sm">
                          {positivityData.energyWord || 'Choose your word ✨'}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{positivityData.energyWord || 'Choose your word ✨'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Affirmation Card */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden rounded-xl px-3 py-2 bg-white/50 dark:bg-black/20 border border-border/10">
                <span aria-hidden="true" className="text-lg flex-shrink-0">🃏</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground leading-tight">Affirmation</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-left justify-start font-medium leading-tight"
                        onClick={() => navigate('/tools/affirmations')}
                        title={positivityData.affirmation || 'Draw your card 🃏'}
                      >
                        <span className="truncate max-w-[10rem] sm:max-w-[7.5rem] text-sm">
                          {positivityData.affirmation || 'Draw your card 🃏'}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{positivityData.affirmation || 'Draw your card 🃏'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Pet of the Day */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden rounded-xl px-3 py-2 bg-white/50 dark:bg-black/20 border border-border/10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lg p-1 hover:scale-110 transition-transform flex-shrink-0"
                      onClick={() => navigate('/tools/tasks')}
                    >
                      {positivityData.pet ? positivityData.pet.emoji : '🦄'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your daily companion</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground leading-tight">Pet</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium leading-tight truncate max-w-[8rem] sm:max-w-[6rem]">
                    {positivityData.pet ? (
                      `${positivityData.pet.animal} • Lv${positivityData.pet.stage + 1}`
                    ) : (
                      'Choose your pet 🦄'
                    )}
                  </div>
                </div>
              </div>

              {/* Daily Wins */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden rounded-xl px-3 py-2 bg-white/50 dark:bg-black/20 border border-border/10">
                <span aria-hidden="true" className="text-lg flex-shrink-0">🏆</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground leading-tight">Wins</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-left justify-start font-medium leading-tight"
                        onClick={() => navigate('/tools/wins')}
                        title={positivityData.winsCount && positivityData.winsCount > 0 
                          ? `${positivityData.winsCount} win${positivityData.winsCount > 1 ? 's' : ''} today!`
                          : 'Log a win 🏆'
                        }
                      >
                        <span className={`text-sm truncate max-w-[8rem] sm:max-w-[6rem] ${
                          positivityData.winsCount && positivityData.winsCount > 0
                            ? 'text-yellow-600 dark:text-yellow-400 font-bold'
                            : 'text-muted-foreground'
                        }`}>
                          {positivityData.winsCount && positivityData.winsCount > 0 
                            ? `${positivityData.winsCount} Win${positivityData.winsCount > 1 ? 's' : ''}` 
                            : 'Log a win 🏆'
                          }
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {positivityData.winsCount && positivityData.winsCount > 0 
                          ? `You've logged ${positivityData.winsCount} win${positivityData.winsCount > 1 ? 's' : ''} today!`
                          : 'Log your daily wins and celebrations'
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
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