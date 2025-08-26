import { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink, Timer, Calendar, Heart, Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import DashboardGrid from "@/components/DashboardGrid";
import { DashboardCard } from "@/components/DashboardCard";
import BigThreeTasksSection from "@/components/BigThreeTasksSection";
import YouTubeAmbient from "@/components/YouTubeAmbient";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import DailyProgressPanel from "@/components/DailyProgressPanel";
import InspirationCorner from "@/components/InspirationCorner";
import DashboardHabitTracker from "@/components/DashboardHabitTracker";
import DashboardTrophyCase from "@/components/DashboardTrophyCase";
import { RecentWinsPanel } from "@/components/RecentWinsPanel";
import PetStatusCard from "@/components/PetStatusCard";
import { useGiphyCelebration } from "@/hooks/useGiphyCelebration";
import GiphyCelebration from "@/components/GiphyCelebration";
import { eventBus } from "@/lib/eventBus";
import { getDailyData, setDailyData } from "@/lib/storage";
import { getUnifiedTaskData, getBigThreeTasks } from "@/lib/unifiedTasks";
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
    
    const unifiedData = getUnifiedTaskData();
    const tasks = getBigThreeTasks();
    const loadedTaskData = {
      tasks: tasks.map(t => t?.title || ""),
      completed: tasks.map(t => t?.completed || false),
      selectedAnimal: unifiedData.selectedAnimal
    };
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
      console.log('Dashboard - Current state before update:', {
        taskData,
        petData,
        trophyCount,
        earnedAnimals
      });
      
      if (keys.includes("fm_vision_v1")) {
        setVisionImages(readVisionThumbs(4));
      }
      if (keys.includes("fm_pomo_trophies_v1") || keys.includes("fm_trophies_v1") || keys.includes("fm_trophy_stats_v1")) {
        const newTrophyCount = readTrophies();
        console.log('Dashboard - Updated trophy count:', newTrophyCount);
        setTrophyCount(newTrophyCount);
      }
      if (keys.includes("fm_tasks_v1")) {
        console.log('Dashboard - Updating task and pet data...');
        const newPetData = readPetStage();
        const taskFallback = { tasks: ["", "", ""], completed: [false, false, false], selectedAnimal: "unicorn" };
        const newTaskData = getDailyData("fm_tasks_v1", taskFallback);
        console.log('Dashboard - Updated pet data:', newPetData);
        console.log('Dashboard - Updated task data:', newTaskData);
        console.log('Dashboard - Raw localStorage fm_tasks_v1:', localStorage.getItem('fm_tasks_v1:' + new Date().toISOString().split('T')[0]));
        setPetData(newPetData);
        setTaskData(newTaskData);
      }
      if (keys.includes("fm_daily_intention_v1")) {
        console.log('Dashboard - Updating intention data...');
        const newIntention = readTodayIntention();
        console.log('Dashboard - New intention:', newIntention);
        setTodayIntention(newIntention);
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
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 py-6 md:py-8">
        <DashboardGrid>
          
          {/* Ambient Player (medium, wide) */}
          <DashboardCard size="m" colSpan={{ base: 1, md: 6, xl: 8 }}>
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
            <CardContent className="p-0">
              <div className="aspect-video rounded-xl overflow-hidden bg-muted/20 mb-4">
                <YouTubeAmbient 
                  videoId={getCurrentVideoId()}
                  startMuted={ambientState.muted || true}
                  className="w-full h-full"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
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
          </DashboardCard>

          {/* Big Three Tasks (large, medium-wide) */}
          <DashboardCard size="l" colSpan={{ base: 1, md: 6, xl: 4 }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">⭐</span>
                The Big Three
              </CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Streak: {streakData.streak} days
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 min-h-[280px]">
              <BigThreeTasksSection />
            </CardContent>
          </DashboardCard>

          {/* Focus Timer (small) */}
          <DashboardCard size="s" colSpan={{ base: 1, md: 3, xl: 4 }}>
            <CardHeader className={`bg-gradient-to-r ${getPhaseColor()} pb-4`}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  <span>{getPhaseIcon()}</span>
                </div>
                <Badge variant="outline" className="bg-background/80">
                  🏆 {trophyCount}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="text-center mb-2">
                <div className="text-2xl font-mono font-bold">
                  {formatTime(timerState.msLeft)}
                </div>
                <Progress value={timerState.progress * 100} className="h-1 mt-2" />
              </div>
              <div className="flex justify-center gap-1">
                {!timerState.isRunning ? (
                  <Button
                    onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
                    size="sm"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => focusTimer.pause()}
                    variant="outline"
                    size="sm"
                  >
                    <Pause className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  onClick={() => navigate('/tools/focus')}
                  variant="outline"
                  size="sm"
                >
                  Full
                </Button>
              </div>
            </CardContent>
          </DashboardCard>

          {/* Quick Actions (small) */}
          <DashboardCard size="s" colSpan={{ base: 1, md: 3, xl: 4 }}>
            <QuickActionsPanel />
          </DashboardCard>

          {/* Daily Progress (small) */}
          <DashboardCard size="s" colSpan={{ base: 1, md: 3, xl: 4 }}>
            <DailyProgressPanel />
          </DashboardCard>

          {/* Recent Wins (medium) */}
          <DashboardCard size="m" colSpan={{ base: 1, md: 3, xl: 4 }}>
            <RecentWinsPanel />
          </DashboardCard>

          {/* Trophy Case (small) */}
          <DashboardCard size="s" colSpan={{ base: 1, md: 3, xl: 4 }}>
            <DashboardTrophyCase />
          </DashboardCard>

          {/* Habits (small) */}
          <DashboardCard size="s" colSpan={{ base: 1, md: 3, xl: 4 }}>
            <DashboardHabitTracker />
          </DashboardCard>

          {/* Today's Intention (small) */}
          <DashboardCard size="s" colSpan={{ base: 1, md: 3, xl: 4 }}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="cursor-pointer hover:scale-105 transition-transform h-full flex flex-col justify-center text-center p-2"
                    onClick={() => navigate('/tools/tasks')}
                  >
                    <div className="text-2xl mb-2">✨</div>
                    <div className="text-sm font-medium mb-1">Today's Intention</div>
                    <div className="text-xs text-muted-foreground">
                      {todayIntention ? (
                        <div className="space-y-1">
                          <div>Feel: {todayIntention.feel}</div>
                          {todayIntention.focus && <div>Focus: {todayIntention.focus}</div>}
                        </div>
                      ) : "Set your intention"}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to set intention</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DashboardCard>

          {/* Vision Preview (medium, wide) */}
          <DashboardCard size="m" colSpan={{ base: 1, md: 6, xl: 8 }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🌈</span>
                Hold the Vision ✨
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                <div className="h-24 rounded-lg bg-muted/20 flex items-center justify-center mb-4">
                  <div className="text-center text-muted-foreground">
                    <div className="text-2xl mb-1">🌟</div>
                    <p className="text-xs">Add images to your vision board</p>
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => navigate('/tools/vision')}
                className="w-full"
                variant="outline"
                size="sm"
              >
                View Full Board
              </Button>
            </CardContent>
          </DashboardCard>

          {/* Inspiration Corner (small) */}
          <DashboardCard size="s" colSpan={{ base: 1, md: 3, xl: 4 }}>
            <InspirationCorner />
          </DashboardCard>

          {/* Today's Earned Pets */}
          {earnedAnimals.length > 0 && (
            <DashboardCard size="s" colSpan={{ base: 1, md: 6, xl: 8 }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  🏆 Today's Earned Pets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap gap-3 justify-center mb-2">
                  {earnedAnimals.map((animal, index) => (
                    <div 
                      key={`${animal.id}-${index}`}
                      className="text-3xl animate-bounce hover:scale-110 transition-transform cursor-default"
                      style={{ animationDelay: `${index * 0.3}s` }}
                      title={`Earned ${animal.id}!`}
                    >
                      {animal.emoji}
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Complete tasks to earn more pets! 🎉
                </p>
              </CardContent>
            </DashboardCard>
          )}

        </DashboardGrid>
        
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