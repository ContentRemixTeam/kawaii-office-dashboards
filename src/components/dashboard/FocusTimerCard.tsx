import { useState, useEffect } from "react";
import { Play, Pause, Timer, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import kawaiiPomodoroHeader from "@/assets/kawaii-pomodoro-header.png";
import { Button } from "@/components/ui/button";
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
      case "focus": return "🍅";
      case "short": return "🌸"; 
      case "long": return "🌈";
      default: return "✨";
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border-4 border-purple-200 dark:border-purple-800">
      {/* Kawaii Header Image */}
      <div className="relative">
        <img 
          src={kawaiiPomodoroHeader} 
          alt="Kawaii Pomodoro Timer" 
          className="w-full h-40 object-cover"
        />
        {/* Trophy Badge Overlay */}
        <div className="absolute top-4 right-4">
          <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
            <Trophy className="w-4 h-4" />
            {trophyCount}
          </div>
        </div>
      </div>

      {/* Timer Content */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
        {/* Phase Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md border-2 border-purple-200 dark:border-purple-700">
            <span className="text-xl">{getPhaseEmoji()}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{getPhaseText()}</span>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-gray-800 dark:text-white mb-4 font-mono tracking-wider">
            {formatTime(timerState.msLeft)}
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-sm mx-auto">
            <div className="h-6 bg-white dark:bg-gray-700 rounded-full shadow-inner border-2 border-purple-200 dark:border-purple-600 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 ease-out rounded-full relative"
                style={{ width: `${timerState.progress * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!timerState.isRunning ? (
            <Button
              onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => focusTimer.pause()}
              size="lg"
              variant="outline"
              className="bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/tools/focus')}
            size="lg"
            variant="outline"
            className="bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
          >
            <Timer className="w-5 h-5 mr-2" />
            Full Timer
          </Button>
        </div>
      </div>
    </div>
  );
}