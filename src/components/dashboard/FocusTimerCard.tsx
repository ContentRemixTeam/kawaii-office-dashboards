import { useState, useEffect } from "react";
import { Play, Pause, Timer, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import focusTimer from "@/lib/focusTimer";
import { readTrophies } from "@/lib/topbar.readers";
import { onChanged } from "@/lib/bus";

export function FocusTimerCard() {
  const navigate = useNavigate();
  const [timerState, setTimerState] = useState(focusTimer.getState());
  const [trophyCount, setTrophyCount] = useState(0);

  useEffect(() => {
    setTrophyCount(readTrophies());

    const unsubscribeTick = focusTimer.on("tick", setTimerState);
    const unsubscribePhase = focusTimer.on("phase", () => {
      setTimerState(focusTimer.getState());
    });
    
    const unsubscribeData = onChanged(keys => {
      if (keys.includes("fm_pomo_trophies_v1") || keys.includes("fm_trophies_v1") || keys.includes("fm_trophy_stats_v1")) {
        setTrophyCount(readTrophies());
      }
    });
    
    setTimerState(focusTimer.getState());
    
    return () => {
      unsubscribeTick();
      unsubscribePhase();
      unsubscribeData();
    };
  }, []);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPhaseEmoji = () => {
    switch (timerState.phase) {
      case "focus": return "🍅"; // Kawaii tomato for pomodoro
      case "short": return "🌸"; // Cute flower for short break
      case "long": return "✨"; // Sparkles for long break
      default: return "💕"; // Heart for idle
    }
  };

  const getPhaseText = () => {
    switch (timerState.phase) {
      case "focus": return "Focus Time";
      case "short": return "Short Break";
      case "long": return "Long Break";
      default: return "Ready to Focus";
    }
  };

  const getProgressColor = () => {
    switch (timerState.phase) {
      case "focus": return "bg-gradient-to-r from-red-400 to-pink-400";
      case "short": return "bg-gradient-to-r from-green-400 to-emerald-400";
      case "long": return "bg-gradient-to-r from-blue-400 to-purple-400";
      default: return "bg-gradient-to-r from-violet-400 to-purple-400";
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 rounded-2xl p-6 border border-pink-200/50 dark:border-pink-800/50">
      {/* Kawaii Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg mb-4">
          <div className="text-2xl animate-bounce">🍅</div>
          <h3 className="text-lg font-bold tracking-wide">POMODORO TIMER</h3>
          <div className="text-xl">☁️</div>
        </div>
        
        {/* Trophy Badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
          <div className="text-lg">🏆</div>
          <span>{trophyCount} trophies</span>
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-white/60 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-200/50 dark:border-pink-700/50">
          <div className="text-2xl">{getPhaseEmoji()}</div>
          <span className="text-sm font-medium text-muted-foreground">{getPhaseText()}</span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
            {formatTime(timerState.msLeft)}
          </div>
          {/* Floating hearts animation */}
          <div className="absolute -top-2 -right-2 text-pink-400 text-sm animate-pulse">💕</div>
          <div className="absolute -bottom-2 -left-2 text-purple-400 text-sm animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
        </div>
        
        {/* Custom Progress Bar */}
        <div className="relative max-w-xs mx-auto">
          <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden shadow-inner border border-pink-200/50 dark:border-pink-700/50">
            <div 
              className={`h-full transition-all duration-300 ease-out ${getProgressColor()} rounded-full shadow-sm`}
              style={{ width: `${timerState.progress * 100}%` }}
            />
          </div>
          {/* Progress indicators */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-xs">🌟</div>
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 text-xs">🎯</div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 mt-8">
        {!timerState.isRunning ? (
          <Button
            onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
            size="lg"
            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 py-3"
          >
            <Play className="w-5 h-5" />
            <span className="font-medium">Start</span>
          </Button>
        ) : (
          <Button
            onClick={() => focusTimer.pause()}
            variant="outline"
            size="lg"
            className="gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 py-3"
          >
            <Pause className="w-5 h-5" />
            <span className="font-medium">Pause</span>
          </Button>
        )}
        
        <Button
          onClick={() => navigate('/tools/focus')}
          variant="outline"
          size="lg"
          className="gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 py-3"
        >
          <Timer className="w-5 h-5" />
          <span className="font-medium">Full Timer</span>
        </Button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 text-pink-300/50 text-sm animate-pulse">🌸</div>
      <div className="absolute top-6 right-6 text-purple-300/50 text-sm animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>
      <div className="absolute bottom-4 left-6 text-blue-300/50 text-sm animate-pulse" style={{ animationDelay: '2s' }}>💫</div>
    </div>
  );
}