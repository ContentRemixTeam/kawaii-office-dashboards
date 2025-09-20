import { useState, useEffect } from "react";
import { Play, Pause, Clock, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import kawaiiTomatoTimer from "@/assets/kawaii-tomato-timer.png";
import { Button } from "@/components/ui/button";
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

  const getPhaseText = () => {
    switch (timerState.phase) {
      case "focus": return "Focus Time";
      case "short": return "Short Break";
      case "long": return "Long Break";
      default: return "Ready to Focus";
    }
  };

  const progressPercentage = timerState.progress * 100;

  return (
    <div 
      className="mx-auto max-w-sm bg-white rounded-2xl overflow-hidden shadow-lg relative"
      style={{ 
        backgroundColor: '#FEFEFE',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(139, 95, 191, 0.1)',
        border: '1px solid rgba(139, 95, 191, 0.1)'
      }}
    >
      {/* Trophy Counter - Top Right */}
      <div className="absolute top-4 right-4">
        <div 
          className="px-3 py-2 rounded-full shadow-sm flex items-center gap-2 font-bold text-sm"
          style={{ 
            backgroundColor: '#FFF176', 
            color: '#2E2E2E',
            border: '1px solid rgba(46, 46, 46, 0.1)'
          }}
        >
          <Trophy className="w-4 h-4" />
          {trophyCount}
        </div>
      </div>

      {/* Header Section */}
      <div className="text-center mb-6 pt-2">
        <h2 
          className="text-xl font-bold tracking-wide mb-4"
          style={{ 
            color: '#8B5FBF',
            fontSize: '20px',
            fontWeight: '700',
            letterSpacing: '0.05em'
          }}
        >
          POMODORO TIMER
        </h2>
        
        {/* Kawaii Tomato Mascot */}
        <div className="flex justify-center mb-4">
          <img 
            src={kawaiiTomatoTimer} 
            alt="Kawaii Tomato Timer" 
            className="w-20 h-20 object-contain"
          />
        </div>
      </div>

      {/* Phase Label */}
      <div className="text-center mb-4">
        <span 
          className="text-base font-medium"
          style={{ 
            color: '#5A5A5A',
            fontSize: '16px'
          }}
        >
          {getPhaseText()}
        </span>
      </div>

      {/* Timer Display - Large and Bold */}
      <div className="text-center mb-6">
        <div 
          className="font-mono font-bold tracking-wider"
          style={{ 
            color: '#2E2E2E',
            fontSize: '72px',
            lineHeight: '1',
            fontWeight: '900'
          }}
        >
          {formatTime(timerState.msLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div 
          className="w-full rounded-full overflow-hidden"
          style={{ 
            height: '12px',
            backgroundColor: '#F0F0F0'
          }}
        >
          <div 
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{ 
              width: `${progressPercentage}%`,
              background: 'linear-gradient(90deg, #66D9A6 0%, #4CAF50 100%)'
            }}
          />
        </div>
      </div>

      {/* Button Section */}
      <div className="flex items-center justify-center gap-4">
        {!timerState.isRunning ? (
          <Button
            onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
            className="font-bold text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            style={{ 
              backgroundColor: '#4CAF50',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '700',
              borderRadius: '24px',
              border: 'none',
              minHeight: '48px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#45A049';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4CAF50';
            }}
          >
            <Play className="w-5 h-5" />
            Start
          </Button>
        ) : (
          <Button
            onClick={() => focusTimer.pause()}
            className="font-bold text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            style={{ 
              backgroundColor: '#FF8A80',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '700',
              borderRadius: '24px',
              border: 'none',
              minHeight: '48px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FF7A6B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF8A80';
            }}
          >
            <Pause className="w-5 h-5" />
            Pause
          </Button>
        )}
        
        <Button
          onClick={() => navigate('/tools/focus')}
          className="font-bold text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          style={{ 
            backgroundColor: '#81B3FF',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '700',
            borderRadius: '24px',
            border: 'none',
            minHeight: '48px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6FA3FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#81B3FF';
          }}
        >
          <Clock className="w-5 h-5" />
          Full Timer
        </Button>
      </div>

      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, #8B5FBF 2px, transparent 2px), radial-gradient(circle at 80% 80%, #FFB3D1 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}