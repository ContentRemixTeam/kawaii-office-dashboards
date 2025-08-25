import { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink, Timer, Calendar, Heart, Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import BigThreeTasksSection from "@/components/BigThreeTasksSection";
import YouTubeAmbient from "@/components/YouTubeAmbient";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import DailyProgressPanel from "@/components/DailyProgressPanel";
import InspirationCorner from "@/components/InspirationCorner";
import FocusInsightsPanel from "@/components/FocusInsightsPanel";
import PetStatusCard from "@/components/PetStatusCard";
import { useGiphyCelebration } from "@/hooks/useGiphyCelebration";
import GiphyCelebration from "@/components/GiphyCelebration";
import { eventBus } from "@/lib/eventBus";
import { getDailyData, setDailyData } from "@/lib/storage";
import { readVisionThumbs, readPetStage, readEarnedAnimals } from "@/lib/topbarState";
import { readTodayIntention } from "@/lib/dailyFlow";
import focusTimer from "@/lib/focusTimer";
import { onChanged } from "@/lib/bus";
import { readTrophies } from "@/lib/topbar.readers";
import { loadAmbient, saveAmbient, type AmbientState } from "@/lib/ambientStore";
import { getPresetById } from "@/data/ambientPresets";

interface DashboardData {
  streak: number;
  lastCompletedDate: string;
}

interface TaskData {
  tasks: string[];
  completed: boolean[];
  selectedAnimal: string;
}

const ANIMALS = [
  { id: "unicorn", name: "Unicorn", emoji: "🦄", stages: ["🥚", "🐣", "🦄", "✨🦄✨"] },
  { id: "dragon", name: "Dragon", emoji: "🐉", stages: ["🥚", "🐣", "🐲", "🐉"] },
  { id: "phoenix", name: "Phoenix", emoji: "🔥", stages: ["🥚", "🐣", "🦅", "🔥"] },
  { id: "cat", name: "Cat", emoji: "🐱", stages: ["🥚", "🐣", "🐱", "😸"] },
  { id: "dog", name: "Dog", emoji: "🐶", stages: ["🥚", "🐣", "🐶", "🐕"] },
  { id: "rabbit", name: "Rabbit", emoji: "🐰", stages: ["🥚", "🐣", "🐰", "🌟🐰"] }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    currentCelebration, 
    celebratePomodoro, 
    clearCelebration 
  } = useGiphyCelebration();
  
  // Ambient player state
  const [ambientState, setAmbientState] = useState<AmbientState>(loadAmbient);
  
  const [timerState, setTimerState] = useState(focusTimer.getState());
  const [visionImages, setVisionImages] = useState<string[]>([]);
  const [trophyCount, setTrophyCount] = useState(0);
  const [streakData, setStreakData] = useState<DashboardData>({ streak: 0, lastCompletedDate: "" });
  const [petData, setPetData] = useState({ animal: null, stage: 0 });
  const [taskData, setTaskData] = useState<TaskData>({ tasks: ["", "", ""], completed: [false, false, false], selectedAnimal: "unicorn" });
  const [todayIntention, setTodayIntention] = useState(null);
  const [earnedAnimals, setEarnedAnimals] = useState<Array<{ id: string; emoji: string }>>([]);

  // Load initial data
  useEffect(() => {
    setAmbientState(loadAmbient());
    
    // Subscribe to event bus for focus session completions
    const unsubscribeFocus = eventBus.on('FOCUS_SESSION_ENDED', (data) => {
      if (data.phase === 'focus') {
        // Get current pet for themed celebration
        const currentPetData = readPetStage();
        celebratePomodoro(currentPetData.animal);
      }
    });
    
    const dashData = getDailyData("fm_dashboard_v1", streakData);
    setStreakData(dashData);
    
    const taskFallback = { tasks: ["", "", ""], completed: [false, false, false], selectedAnimal: "unicorn" };
    const loadedTaskData = getDailyData("fm_tasks_v1", taskFallback);
    setTaskData(loadedTaskData);
    
    setVisionImages(readVisionThumbs(4));
    setTrophyCount(readTrophies());
    setPetData(readPetStage());
    setTodayIntention(readTodayIntention());
    setEarnedAnimals(readEarnedAnimals());
    
    return unsubscribeFocus;
  }, [celebratePomodoro]);

  // Listen for data changes
  useEffect(() => {
    const unsubscribe = onChanged(keys => {
      console.log('Dashboard - Changed keys:', keys);
      if (keys.includes("fm_vision_v1")) {
        setVisionImages(readVisionThumbs(4));
      }
      if (keys.includes("fm_pomo_trophies_v1") || keys.includes("fm_trophies_v1") || keys.includes("fm_trophy_stats_v1")) {
        const newTrophyCount = readTrophies();
        console.log('Dashboard - Updated trophy count:', newTrophyCount);
        setTrophyCount(newTrophyCount);
      }
      if (keys.includes("fm_tasks_v1")) {
        const newPetData = readPetStage();
        const taskFallback = { tasks: ["", "", ""], completed: [false, false, false], selectedAnimal: "unicorn" };
        const newTaskData = getDailyData("fm_tasks_v1", taskFallback);
        console.log('Dashboard - Updated pet data:', newPetData);
        console.log('Dashboard - Updated task data:', newTaskData);
        setPetData(newPetData);
        setTaskData(newTaskData);
      }
      if (keys.includes("fm_daily_intention_v1")) {
        setTodayIntention(readTodayIntention());
      }
      if (keys.includes("fm_ambient_v1")) {
        setAmbientState(loadAmbient());
      }
      if (keys.includes("fm_earned_animals_v1")) {
        setEarnedAnimals(readEarnedAnimals());
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

  const updateAmbientState = (updates: Partial<AmbientState>) => {
    const newState = { ...ambientState, ...updates };
    setAmbientState(newState);
    saveAmbient(newState);
  };

  // Get current video ID from ambient state
  const getCurrentVideoId = () => {
    if (!ambientState.activeId) return "jfKfPfyJRdk"; // Default lofi video
    
    if (ambientState.activeId === "custom" && ambientState.customUrl) {
      const match = ambientState.customUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      return match ? match[1] : "jfKfPfyJRdk";
    }
    
    const preset = getPresetById(ambientState.activeId);
    return preset ? preset.id : "jfKfPfyJRdk";
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
      
      {/* Top spacing for fixed bar */}
      <div className="h-16" />
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Focus Hub Layout */}
        <div className="grid lg:grid-cols-[1fr_0.6fr_0.4fr] gap-6">
          
          {/* Left Section: Video + Motivation Panel */}
          <div className="space-y-6">
            
            {/* Ambient YouTube Player */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Ambient Player
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span>Hero Mode</span>
                      <Switch
                        checked={ambientState.useAsHero || false}
                        onCheckedChange={(checked) => updateAmbientState({ useAsHero: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-muted/20">
                  <YouTubeAmbient 
                    videoId={getCurrentVideoId()}
                    startMuted={ambientState.muted || true}
                    className="w-full h-full"
                  />
                </div>
                
                {/* Player Controls */}
                <div className="flex items-center justify-between mt-4 p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateAmbientState({ muted: !ambientState.muted })}
                    >
                      {ambientState.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={[ambientState.muted ? 0 : (ambientState.volume || 50)]}
                        onValueChange={(value) => updateAmbientState({ 
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

            {/* Motivation Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Pet Status Card */}
              <PetStatusCard 
                petData={petData}
                completedTasks={taskData.completed.filter(Boolean).length}
                totalTasks={3}
              />

              {/* Micro Wins Today */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className="cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border-yellow-200/50"
                      onClick={() => navigate('/tools/positivity-cabinet')}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">🎉</div>
                        <div className="text-sm font-medium text-foreground mb-1">
                          Micro Wins
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Celebrate progress
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to view Positivity Cabinet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </div>

            {/* Today's Intention Card */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50"
                    onClick={() => navigate('/tools/tasks')}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">✨</div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        Today's Intention
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {todayIntention ? (
                          <div className="space-y-1">
                            <div>Feel: {todayIntention.feel}</div>
                            {todayIntention.focus && (
                              <div>Focus: {todayIntention.focus}</div>
                            )}
                            {todayIntention.top3?.length > 0 && (
                              <div>{todayIntention.top3.length} tasks set</div>
                            )}
                          </div>
                        ) : "Set your intention"
                        }
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to set intention</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Focus Insights Panel */}
            <FocusInsightsPanel />
          </div>
          
          {/* Right Section: Focus Panel */}
          <div className="space-y-4 h-full flex flex-col">
            
            {/* Big Three Tasks */}
            <Card className="flex-1">
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
              <CardContent className="p-0">
                <div className="p-6">
                  <BigThreeTasksSection />
                </div>
              </CardContent>
            </Card>

            {/* Pomodoro Timer */}
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
              <CardContent className="p-4">
                {/* Timer Display */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-mono font-bold text-foreground mb-2">
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
                  <Button
                    onClick={() => navigate('/tools/focus')}
                    variant="outline"
                    size="sm"
                  >
                    Full View
                  </Button>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <div className="text-lg font-bold text-primary">{timerState.cycleCount}</div>
                    <div className="text-muted-foreground">Sessions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{timerState.dailyGoal}</div>
                    <div className="text-muted-foreground">Goal</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Earned Animals Display */}
            {earnedAnimals.length > 0 && (
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    🏆 Today's Earned Pets
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {earnedAnimals.map((animal, index) => (
                      <div 
                        key={`${animal.id}-${index}`}
                        className="text-4xl animate-bounce hover:scale-110 transition-transform cursor-default"
                        style={{ animationDelay: `${index * 0.3}s` }}
                        title={`Earned ${animal.id}!`}
                      >
                        {animal.emoji}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    Complete tasks to earn more pets! 🎉
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Section: Multi-Widget Panel */}
          <div className="space-y-4 hidden lg:block">
            <QuickActionsPanel />
            <DailyProgressPanel />
            <InspirationCorner />
          </div>

        </div>

        {/* Mini Vision Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🌈</span>
              Hold the Vision ✨
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visionImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
              <div className="h-32 rounded-lg bg-muted/20 flex items-center justify-center mb-4">
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
        
        {/* Footer tip */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground bg-card/30 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto">
            💡 Your daily status is always visible in the top toolbar
          </p>
        </div>
      </div>
      
      {/* GIPHY Celebration Component */}
      <GiphyCelebration
        payload={currentCelebration}
        onClose={clearCelebration}
      />
    </main>
  );
};

export default Dashboard;