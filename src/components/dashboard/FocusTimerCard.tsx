import { useState, useEffect } from "react";
import { Play, Pause, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import focusTimerHeader from "@/assets/focus-timer-header.png";
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

  const getPhaseIcon = () => {
    switch (timerState.phase) {
      case "focus": return "🎯";
      case "short": return "☕";
      case "long": return "🏖️";
      default: return "⭐";
    }
  };

  const getPhaseColor = () => {
    switch (timerState.phase) {
      case "focus": return "from-red-500/20 to-red-600/20";
      case "short": return "from-green-500/20 to-green-600/20";
      case "long": return "from-blue-500/20 to-blue-600/20";
      default: return "from-muted/20 to-muted/40";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <img 
          src={focusTimerHeader} 
          alt="Pomodoro Timer" 
          className="h-16 w-full object-contain rounded-lg"
        />
        <div className="text-center">
          <div className="status-indicator status-success">
            🏆 {trophyCount}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="text-5xl font-mono font-bold text-primary">
            {formatTime(timerState.msLeft)}
          </div>
          <Progress 
            value={timerState.progress * 100} 
            className="h-3 max-w-xs mx-auto"
          />
        </div>
        
        <div className="flex items-center justify-center gap-3">
          {!timerState.isRunning ? (
            <Button
              onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
              size="sm"
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => focusTimer.pause()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          <Button
            onClick={() => navigate('/tools/focus')}
            variant="outline"
            size="sm"
          >
            Full Timer
          </Button>
        </div>
      </div>
    </div>
  );
}