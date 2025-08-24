import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, SkipForward, Settings } from "lucide-react";
import focusTimer from "@/lib/focusTimer";
import TrophyCelebration from "./TrophyCelebration";
import SessionHistory from "./SessionHistory";
import { Trophy } from "@/lib/trophySystem";

interface TrophyResult {
  trophy: Trophy;
  message: string;
  isStreakReward: boolean;
}

export default function PomodoroTimer() {
  const [timerState, setTimerState] = useState(focusTimer.getState());
  const [celebration, setCelebration] = useState<{
    trophy: Trophy;
    message: string;
    isVisible: boolean;
  } | null>(null);

  useEffect(() => {
    // Subscribe to timer updates
    const unsubscribeTick = focusTimer.on("tick", setTimerState);
    const unsubscribePhase = focusTimer.on("phase", () => {
      setTimerState(focusTimer.getState());
    });

    // Listen for trophy celebrations
    const handleTrophyEarned = (event: CustomEvent<TrophyResult>) => {
      const { trophy, message } = event.detail;
      setCelebration({
        trophy,
        message,
        isVisible: true
      });
    };

    window.addEventListener("fm:trophy-earned", handleTrophyEarned as EventListener);

    // Initialize state
    setTimerState(focusTimer.getState());

    return () => {
      unsubscribeTick();
      unsubscribePhase();
      window.removeEventListener("fm:trophy-earned", handleTrophyEarned as EventListener);
    };
  }, []);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (timerState.phase) {
      case "focus": return "from-red-500 to-red-600";
      case "short": return "from-green-500 to-green-600";
      case "long": return "from-blue-500 to-blue-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getPhaseIcon = () => {
    switch (timerState.phase) {
      case "focus": return "🎯";
      case "short": return "☕";
      case "long": return "🏖️";
      default: return "⭐";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Main Timer Card */}
      <Card className="overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${getPhaseColor()} text-white pb-4`}>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <span className="text-2xl">{getPhaseIcon()}</span>
            <span>{timerState.phaseLabel}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-mono font-bold text-foreground mb-2">
              {formatTime(timerState.msLeft)}
            </div>
            <Progress 
              value={timerState.progress * 100} 
              className="h-2"
            />
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3 mb-4">
            {!timerState.isRunning ? (
              <Button
                onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {timerState.phase === "idle" ? "Start Focus" : "Resume"}
              </Button>
            ) : (
              <Button
                onClick={() => focusTimer.pause()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            
            <Button
              onClick={() => focusTimer.stop()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
            
            {timerState.isRunning && (
              <Button
                onClick={() => focusTimer.skip()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </Button>
            )}
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-primary">{timerState.cycleCount}</div>
              <div className="text-muted-foreground">Sessions Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{timerState.dailyGoal}</div>
              <div className="text-muted-foreground">Daily Goal</div>
            </div>
          </div>

          {/* Goal Achievement Badge */}
          {timerState.cycleCount >= timerState.dailyGoal && (
            <div className="flex justify-center mt-4">
              <Badge className="bg-green-100 text-green-800 border-green-300">
                🎉 Daily Goal Achieved!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      <SessionHistory />

      {/* Trophy Celebration Modal */}
      <TrophyCelebration
        trophy={celebration?.trophy || null}
        message={celebration?.message || ""}
        isVisible={celebration?.isVisible || false}
        onClose={() => setCelebration(null)}
      />
    </div>
  );
}