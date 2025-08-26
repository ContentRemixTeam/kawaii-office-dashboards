import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Play, Pause, Timer, Settings, Square, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useDailyFlow from "@/hooks/useDailyFlow";
import { 
  getUnifiedTaskData, 
  getBigThreeTasks, 
  updateTask, 
  updateSelectedAnimal, 
  resetTodaysTasks,
  setBigThreeTasks,
  getCompletionStats,
  initializeTasksFromIntention
} from "@/lib/unifiedTasks";
import { getCelebrationsEnabled } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { emitChanged, addEarnedAnimal } from "@/lib/topbarState";
import { K_TASKS } from "@/lib/topbar.readers";
import focusTimer from "@/lib/focusTimer";
import { useTodayPet } from "@/hooks/useTodayPet";
import { TaskCompletionModal } from "@/components/TaskCompletionModal";
import TaskProgressGraph from "./TaskProgressGraph";

const ANIMALS = [
  { 
    id: "unicorn", 
    name: "Unicorn", 
    emoji: "🦄",
    stages: ["🥚", "🦄", "🌈🦄", "✨🦄👑"]
  },
  { 
    id: "dragon", 
    name: "Dragon", 
    emoji: "🐉",
    stages: ["🥚", "🐲", "🔥🐉", "👑🐉🔥"]
  },
  { 
    id: "cat", 
    name: "Cat", 
    emoji: "🐱",
    stages: ["🥚", "🐱", "🐾🐱", "👑🐱✨"]
  },
  { 
    id: "dog", 
    name: "Dog", 
    emoji: "🐶",
    stages: ["🥚", "🐶", "🦴🐕", "👑🐕⭐"]
  },
  { 
    id: "rabbit", 
    name: "Bunny", 
    emoji: "🐰",
    stages: ["🥚", "🐰", "🥕🐇", "👑🐇🌸"]
  },
  { 
    id: "fox", 
    name: "Fox", 
    emoji: "🦊",
    stages: ["🥚", "🦊", "🍂🦊", "👑🦊🌟"]
  },
  { 
    id: "panda", 
    name: "Panda", 
    emoji: "🐼",
    stages: ["🥚", "🐼", "🎋🐼", "👑🐼✨"]
  },
  { 
    id: "penguin", 
    name: "Penguin", 
    emoji: "🐧",
    stages: ["🥚", "🐧", "❄️🐧", "👑🐧⭐"]
  },
  { 
    id: "owl", 
    name: "Owl", 
    emoji: "🦉",
    stages: ["🥚", "🦉", "📚🦉", "👑🦉🌙"]
  },
  { 
    id: "hamster", 
    name: "Hamster", 
    emoji: "🐹",
    stages: ["🥚", "🐹", "🌻🐹", "👑🐹⚡"]
  }
];

export default function BigThreeTasksSection() {
  const navigate = useNavigate();
  const { setShowIntention } = useDailyFlow();
  const todayPet = useTodayPet();
  
  // Task completion modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [completedTaskIndex, setCompletedTaskIndex] = useState<number>(0);
  
  const [bigThreeTasks, setBigThreeTasksState] = useState<[any, any, any]>([null, null, null]);
  const [selectedAnimal, setSelectedAnimal] = useState("unicorn");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAllTasksCompleted, setShowAllTasksCompleted] = useState(false);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);
  const [timerState, setTimerState] = useState(focusTimer.getState());
  const [showTaskCelebration, setShowTaskCelebration] = useState(false);
  const [celebratedTaskIndex, setCelebratedTaskIndex] = useState<number>(-1);
  const [celebratedTasks, setCelebratedTasks] = useState<Set<number>>(new Set());
  const [streakCount, setStreakCount] = useState(0);

  // Load tasks data from unified storage
  useEffect(() => {
    const loadTasks = () => {
      // Initialize tasks from intention if needed
      initializeTasksFromIntention();
      
      const data = getUnifiedTaskData();
      const tasks = getBigThreeTasks();
      
      console.log('[BigThreeTasksSection] Loaded unified task data:', data);
      setBigThreeTasksState(tasks);
      setSelectedAnimal(data.selectedAnimal);
    };

    loadTasks();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('fm_unified_tasks_v1')) {
        loadTasks();
      }
    };
    
    const handleCustomUpdate = () => {
      loadTasks();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tasksUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tasksUpdated', handleCustomUpdate);
    };
  }, []);

  // Subscribe to focus timer events
  useEffect(() => {
    const unsubscribeTick = focusTimer.on("tick", setTimerState);
    const unsubscribePhase = focusTimer.on("phase", () => {
      setTimerState(focusTimer.getState());
    });

    return () => {
      unsubscribeTick();
      unsubscribePhase();
    };
  }, []);

  const handleTaskChange = (index: number, value: string) => {
    const tasks = getBigThreeTasks();
    const newTitles = tasks.map((task, i) => 
      i === index ? value : (task?.title || "")
    );
    setBigThreeTasks(newTitles[0], newTitles[1], newTitles[2]);
  };

  const handleAnimalSelect = (animalId: string) => {
    updateSelectedAnimal(animalId);
    setShowAnimalPicker(false);
  };

  const toggleTaskCompleted = (index: number) => {
    const task = bigThreeTasks[index];
    if (!task) return;

    const wasCompleted = task.completed;
    
    console.log(`[BigThreeTasksSection] Task ${index} toggled:`, {
      from: wasCompleted,
      to: !wasCompleted,
      task: task.title
    });
    
    updateTask(task.id, { completed: !wasCompleted });
    
    // Show celebration for task completion (not unchecking)
    if (!wasCompleted) {
      setCompletedTaskIndex(index);
      setShowTaskModal(true);
    }
  };

  const handleStartNewRound = () => {
    resetTodaysTasks();
    setCelebratedTasks(new Set()); // Reset celebrated tasks
    
    // Emit additional events for cross-component sync
    window.dispatchEvent(new Event('tasksUpdated'));
    window.dispatchEvent(new CustomEvent('storage', { detail: 'fm_unified_tasks_v1' }));
    
    // Show success toast
    toast({
      title: "New Round Started! 🚀",
      description: "Ready for your next Big Three tasks!",
      duration: 3000,
    });
  };

  // Timer helpers
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (timerState.phase) {
      case "focus": return "text-red-600";
      case "short": return "text-green-600";
      case "long": return "text-blue-600";
      default: return "text-muted-foreground";
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

  const currentAnimal = ANIMALS.find(a => a.id === selectedAnimal) || ANIMALS[0];
  const stats = getCompletionStats();
  const petStage = Math.min(stats.completedCount, 3); // Stage 0-3 based on completed tasks

  if (showCelebration) {
    return (
      <div className="relative">
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h3 className="text-xl font-bold text-primary mb-2">All Tasks Complete!</h3>
          <p className="text-muted-foreground">Amazing work today! 🌟</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar 
              className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => navigate('/tools/tasks')}
            >
              <AvatarFallback className="text-lg">
                {currentAnimal.stages[petStage]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                The Big Three ⭐
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentAnimal.name} – Stage {petStage + 1}/4
                {streakCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    🔥 {streakCount}-day streak
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Pet Stage Display */}
        <div className="text-center p-8 bg-gradient-to-br from-background to-muted/30 rounded-3xl border-2 border-border/50 shadow-lg relative overflow-hidden">
          {/* Special Effects */}
          {stats.completedCount > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {(() => {
                const effects = {
                  unicorn: ["🌈", "✨", "⭐", "💫"],
                  dragon: ["🔥", "⚡", "💥", "🌟"],
                  cat: ["💕", "🐾", "✨", "💖"],
                  dog: ["❤️", "🌟", "⭐", "💫"],
                  rabbit: ["🌸", "🌺", "✨", "💕"],
                  fox: ["🍂", "✨", "🌟", "💫"],
                  panda: ["🎋", "💚", "✨", "🌟"],
                  penguin: ["❄️", "💎", "⭐", "✨"],
                  owl: ["🌙", "📚", "✨", "🌟"],
                  hamster: ["🌻", "💫", "⭐", "✨"]
                };
                const animalEffects = effects[currentAnimal.id as keyof typeof effects] || effects.unicorn;
                return animalEffects.slice(0, stats.completedCount).map((effect, i) => (
                  <div
                    key={i}
                    className="absolute text-lg animate-bounce"
                    style={{
                      left: `${15 + i * 20}%`,
                      top: `${10 + i * 15}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: "2s"
                    }}
                  >
                    {effect}
                  </div>
                ));
              })()}
            </div>
          )}
          
          <div className="mb-4 relative">
            <div className={`${petStage === 0 ? 'text-6xl' : petStage === 1 ? 'text-7xl animate-bounce' : petStage === 2 ? 'text-8xl animate-pulse' : 'text-9xl animate-bounce'} mb-2 transition-all duration-500`}>
              {currentAnimal.stages[petStage]}
            </div>
            
            {stats.completedCount > 0 && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xl">
                <span className="text-primary">◡ ◡</span>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">
            {petStage === 0 ? "Sleeping Baby" : petStage === 1 ? "Awake Baby" : petStage === 2 ? "Growing Strong" : "Fully Grown Magical"}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-2 font-medium">
            {stats.completedCount === 0 ? `${currentAnimal.name} is sleeping... zzz 💤` : 
             stats.completedCount === 1 ? `${currentAnimal.name} is awakening! Ready to grow! ✨` :
             stats.completedCount === 2 ? `${currentAnimal.name} is getting stronger! 💪` : 
             `${currentAnimal.name} has reached maximum power! 🌟`}
          </p>
          
          <div className="text-muted-foreground/70 text-xs mb-3">
            {stats.completedCount}/{stats.totalCount} tasks completed
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${stats.percentage}%` }}
            >
              {stats.completedCount > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>
          
          {stats.allCompleted && (
            <div className="mt-4 animate-bounce">
              <div className="text-sm text-primary font-semibold">
                Perfect day achieved! ✨
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Your {currentAnimal.name.toLowerCase()} is absolutely magical! 💕
              </div>
            </div>
          )}
        </div>

        {/* Progress Graph */}
        <TaskProgressGraph completedCount={stats.completedCount} totalTasks={stats.totalCount} />

        {/* Show prompt if no tasks are set */}
        {stats.totalCount === 0 && (
          <div className="text-center py-6 space-y-3 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
            <div className="text-4xl">✨</div>
            <p className="text-muted-foreground">Set your Big Three to start the day!</p>
            <Button
              variant="outline"
              onClick={() => setShowIntention(true)}
              className="gap-2"
            >
              ✨ Set Daily Intention
            </Button>
          </div>
        )}

        {/* Task List */}
        {stats.totalCount > 0 && (
          <div className="space-y-4">
            {bigThreeTasks.map((task, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                  task?.completed
                    ? "bg-primary/5 border-primary/30 shadow-sm"
                    : "bg-background/80 border-border/20 hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <Checkbox
                  checked={task?.completed || false}
                  onCheckedChange={() => toggleTaskCompleted(index)}
                  className="scale-125"
                />
                <Input
                  value={task?.title || ""}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                  placeholder={`Task ${index + 1}`}
                  className={`border-none bg-transparent text-base font-medium shadow-none focus-visible:ring-0 ${
                    task?.completed ? "line-through text-muted-foreground" : ""
                  }`}
                />
                {task?.completed && (
                  <div className="text-primary text-xl animate-bounce">
                    ✨
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timer Status */}
        <Card className="bg-gradient-to-r from-background to-muted/30 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${getPhaseColor()}`}>
                  {getPhaseIcon()}
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {timerState.isRunning ? 'Focus Timer Running' : 'Timer Ready'}
                  </div>
                  <div className={`text-sm ${getPhaseColor()}`}>
                    {formatTime(timerState.msLeft || 0)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/tools/focus')}
                  className="gap-2"
                >
                  <Timer className="w-4 h-4" />
                  Focus
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAnimalPicker(!showAnimalPicker)}
            className="flex-1 gap-2"
          >
            <div className="text-lg">{currentAnimal.emoji}</div>
            Change Pet
          </Button>
          
          {stats.totalCount > 0 && (
            <Button
              variant="outline"
              onClick={handleStartNewRound}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Animal Picker */}
        {showAnimalPicker && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Choose Your Companion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {ANIMALS.map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => handleAnimalSelect(animal.id)}
                    className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                      selectedAnimal === animal.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{animal.emoji}</div>
                    <div className="text-xs font-medium">{animal.name}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        taskIndex={completedTaskIndex}
      />
    </>
  );
}