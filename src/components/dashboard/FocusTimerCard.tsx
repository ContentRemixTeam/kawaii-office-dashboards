import { useState, useEffect } from "react";
import { Play, Pause, Timer } from "lucide-react";
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
    <Card className="p-4 md:p-5 space-y-4">
      <div className={`bg-gradient-to-r ${getPhaseColor()} rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            <span>{getPhaseIcon()}</span>
            <h2 className="text-lg font-semibold">Focus Timer</h2>
          </div>
          <Badge variant="outline" className="bg-background/80">
            🏆 {trophyCount}
          </Badge>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold mb-2">
            {formatTime(timerState.msLeft)}
          </div>
          <Progress value={timerState.progress * 100} className="h-2 w-32" />
        </div>
        <div className="flex gap-2">
          {!timerState.isRunning ? (
            <Button
              onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => focusTimer.pause()}
              variant="outline"
              size="sm"
            >
              <Pause className="w-4 h-4 mr-1" />
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
    </Card>
  );
}