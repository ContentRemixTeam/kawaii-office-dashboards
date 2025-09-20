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

  const getProgressStyle = () => {
    switch (timerState.phase) {
      case "focus": return { backgroundColor: "#FF8A80" }; // Warm coral
      case "short": return { backgroundColor: "#A8E6CF" }; // Mint green
      case "long": return { backgroundColor: "#81D4FA" }; // Sky blue
      default: return { backgroundColor: "#D1B3FF" }; // Lavender
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}>
      {/* Kawaii Header Image */}
      <div className="relative">
        <img 
          src={kawaiiPomodoroHeader} 
          alt="Kawaii Pomodoro Timer" 
          className="w-full h-40 object-cover"
        />
        {/* Trophy Badge Overlay - High contrast yellow with dark text */}
        <div className="absolute top-4 right-4">
          <div className="px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm" style={{ backgroundColor: '#FFF176', color: '#2E2E2E' }}>
            <Trophy className="w-4 h-4" />
            {trophyCount}
          </div>
        </div>
      </div>

      {/* Timer Content - Cream background with generous padding */}
      <div className="p-6" style={{ backgroundColor: '#FFF8E1', padding: '24px' }}>
        {/* Phase Indicator - High contrast with proper spacing */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
            <span className="text-xl">{getPhaseEmoji()}</span>
            <span className="font-bold text-lg" style={{ color: '#2E2E2E' }}>{getPhaseText()}</span>
          </div>
        </div>

        {/* Timer Display - Large, bold, high contrast */}
        <div className="text-center mb-8">
          <div className="text-7xl font-bold font-mono tracking-wider mb-6" style={{ color: '#2E2E2E', lineHeight: '1.1' }}>
            {formatTime(timerState.msLeft)}
          </div>
          
          {/* Progress Bar - Clean with soft corners */}
          <div className="max-w-sm mx-auto">
            <div className="h-4 bg-white rounded-full shadow-inner border border-gray-200 overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${timerState.progress * 100}%`,
                  ...getProgressStyle()
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Action Buttons - High contrast, proper sizing */}
        <div className="flex items-center justify-center gap-4">
          {!timerState.isRunning ? (
            <Button
              onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
              size="lg"
              className="font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ 
                backgroundColor: '#A8E6CF', 
                color: '#2E2E2E',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#96E0C1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#A8E6CF';
              }}
            >
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => focusTimer.pause()}
              size="lg"
              className="font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ 
                backgroundColor: '#FF8A80', 
                color: '#FFFFFF',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF7A6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF8A80';
              }}
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/tools/focus')}
            size="lg"
            className="font-bold text-lg px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ 
              backgroundColor: '#D1B3FF', 
              color: '#2E2E2E',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C7A6FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#D1B3FF';
            }}
          >
            <Timer className="w-5 h-5 mr-2" />
            Full Timer
          </Button>
        </div>
      </div>
    </div>
  );
}