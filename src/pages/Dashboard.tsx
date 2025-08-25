import { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink, Timer, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import BackgroundManager from "@/components/BackgroundManager";
import BigThreeTasksSection from "@/components/BigThreeTasksSection";
import YouTubeAmbient from "@/components/YouTubeAmbient";
import { getDailyData, setDailyData } from "@/lib/storage";
import { readVisionThumbs } from "@/lib/topbarState";
import focusTimer from "@/lib/focusTimer";
import { onChanged } from "@/lib/bus";
import { readTrophies } from "@/lib/topbar.readers";

interface AmbientSettings {
  videoId: string;
  useAsBackground: boolean;
  volume: number;
  muted: boolean;
}

interface DashboardData {
  streak: number;
  lastCompletedDate: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [ambientSettings, setAmbientSettings] = useState<AmbientSettings>({
    videoId: "jfKfPfyJRdk", // Default lofi video
    useAsBackground: false,
    volume: 50,
    muted: true
  });
  
  const [timerState, setTimerState] = useState(focusTimer.getState());
  const [visionImages, setVisionImages] = useState<string[]>([]);
  const [trophyCount, setTrophyCount] = useState(0);
  const [streakData, setStreakData] = useState<DashboardData>({ streak: 0, lastCompletedDate: "" });

  // Load data on mount
  useEffect(() => {
    const ambientData = getDailyData("fm_ambient_settings_v1", ambientSettings);
    setAmbientSettings(ambientData);
    
    const dashData = getDailyData("fm_dashboard_v1", streakData);
    setStreakData(dashData);
    
    setVisionImages(readVisionThumbs(4));
    setTrophyCount(readTrophies());
  }, []);

  // Listen for data changes
  useEffect(() => {
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_vision_v1")) {
        setVisionImages(readVisionThumbs(4));
      }
      if (keys.includes("fm_pomo_trophies_v1")) {
        setTrophyCount(readTrophies());
      }
    });
    return unsubscribe;
  }, []);

  // Timer state management
  useEffect(() => {
    const unsubscribeTick = focusTimer.on("tick", setTimerState);
    const unsubscribePhase = focusTimer.on("phase", () => {
      setTimerState(focusTimer.getState());
    });
    
    setTimerState(focusTimer.getState());
    
    return () => {
      unsubscribeTick();
      unsubscribePhase();
    };
  }, []);

  const updateAmbientSettings = (updates: Partial<AmbientSettings>) => {
    const newSettings = { ...ambientSettings, ...updates };
    setAmbientSettings(newSettings);
    setDailyData("fm_ambient_settings_v1", newSettings);
  };

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
    <main className="min-h-screen relative">
      {!ambientSettings.useAsBackground && <BackgroundManager />}
      
      {/* Top spacing for fixed bar */}
      <div className="h-16" />
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Top Row: Ambient Player + Big Three */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column: Ambient YouTube Player (2/3 width) */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Ambient Player
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span>Background</span>
                      <Switch
                        checked={ambientSettings.useAsBackground}
                        onCheckedChange={(checked) => updateAmbientSettings({ useAsBackground: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-muted/20">
                  <YouTubeAmbient 
                    videoId={ambientSettings.videoId}
                    startMuted={ambientSettings.muted}
                    className="w-full h-full"
                  />
                </div>
                
                {/* Player Controls */}
                <div className="flex items-center justify-between mt-4 p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateAmbientSettings({ muted: !ambientSettings.muted })}
                    >
                      {ambientSettings.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={[ambientSettings.muted ? 0 : ambientSettings.volume]}
                        onValueChange={(value) => updateAmbientSettings({ 
                          volume: value[0], 
                          muted: value[0] === 0 
                        })}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/tools/sounds')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    More Sounds
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Big Three Summary (1/3 width) */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  Big Three Today
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Streak: {streakData.streak} days
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/tools/tasks')}
                  className="w-full mb-4"
                  variant="outline"
                >
                  View Full Task Manager
                </Button>
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Complete your Big Three tasks to grow your pet and build your streak!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Big Three Tasks Section */}
        <BigThreeTasksSection />

        {/* Bottom Row: Pomodoro + Vision Board */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Left Column: Pomodoro Timer */}
          <Card className="overflow-hidden">
            <CardHeader className={`bg-gradient-to-r ${getPhaseColor()} pb-4`}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  <span>Focus Timer</span>
                  <span className="text-xl">{getPhaseIcon()}</span>
                </div>
                <Badge variant="outline" className="bg-background/80">
                  🏆 {trophyCount} today
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className="text-4xl font-mono font-bold text-foreground mb-2">
                  {formatTime(timerState.msLeft)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {timerState.phaseLabel}
                </div>
                <Progress value={timerState.progress * 100} className="h-2" />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-2 mb-4">
                {!timerState.isRunning ? (
                  <Button
                    onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {timerState.phase === "idle" ? "Start" : "Resume"}
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
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <div className="text-xl font-bold text-primary">{timerState.cycleCount}</div>
                  <div className="text-muted-foreground">Sessions</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{timerState.dailyGoal}</div>
                  <div className="text-muted-foreground">Goal</div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/tools/focus')}
                variant="outline"
                className="w-full mt-4"
              >
                Full Timer View
              </Button>
            </CardContent>
          </Card>
          
          {/* Right Column: Mini Vision Board */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🌈</span>
                Hold the Vision ✨
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visionImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {visionImages.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-muted/20 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => navigate('/tools/vision')}
                    >
                      <img
                        src={image}
                        alt={`Vision ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted/20 flex items-center justify-center mb-4">
                  <div className="text-center text-muted-foreground">
                    <div className="text-4xl mb-2">🌟</div>
                    <p className="text-sm">Add images to your vision board</p>
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => navigate('/tools/vision')}
                className="w-full"
                variant="outline"
              >
                View Full Board
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer tip */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground bg-card/30 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto">
            💡 Your daily status is always visible in the top toolbar
          </p>
        </div>
      </div>
    </main>
  );
}