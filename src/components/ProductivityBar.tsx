import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Settings, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { safeGet, safeSet } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

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

const getTodayISO = () => new Date().toISOString().split('T')[0];

export default function ProductivityBar() {
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load saved data
  useEffect(() => {
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
  }, []);

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  );
}