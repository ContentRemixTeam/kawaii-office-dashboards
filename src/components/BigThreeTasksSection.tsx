import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Play, Pause, Timer, Settings, Square } from "lucide-react";
import { getDailyData, setDailyData, getCelebrationsEnabled } from "@/lib/storage";
import { readTodayIntention } from "@/lib/dailyFlow";
import { useToast } from "@/hooks/use-toast";
import { emitChanged, addEarnedAnimal } from "@/lib/topbarState";
import { K_TASKS } from "@/lib/topbar.readers";
import focusTimer from "@/lib/focusTimer";
import TaskCelebrationModal from "./TaskCelebrationModal";
import AllTasksCompletedModal from "./AllTasksCompletedModal";
import TaskProgressGraph from "./TaskProgressGraph";
import { useNavigate } from "react-router-dom";

interface TaskData {
  tasks: string[];
  completed: boolean[];
  selectedAnimal: string;
}

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
  const { toast } = useToast();
  
  const [taskData, setTaskData] = useState<TaskData>({
    tasks: ["", "", ""],
    completed: [false, false, false],
    selectedAnimal: "unicorn"
  });
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAllTasksCompleted, setShowAllTasksCompleted] = useState(false);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);
  const [timerState, setTimerState] = useState(focusTimer.getState());
  const [showTaskCelebration, setShowTaskCelebration] = useState(false);
  const [celebratedTaskIndex, setCelebratedTaskIndex] = useState<number>(-1);
  const [celebratedTasks, setCelebratedTasks] = useState<Set<number>>(new Set());
  const [streakCount, setStreakCount] = useState(0);

  // Load tasks data from storage
  useEffect(() => {
    const loadTasks = () => {
      const fallbackData = {
        tasks: ["", "", ""],
        reflections: ["", "", ""],
        completed: [false, false, false],
        selectedAnimal: "unicorn",
        roundsCompleted: 0,
        totalTasksCompleted: 0
      };
      
      const data = getDailyData("fm_tasks_v1", fallbackData);
      
      // Ensure data is valid and has required properties
      if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.completed)) {
        console.warn("loadTasks: Invalid data structure, using fallback");
        setTaskData({
          tasks: fallbackData.tasks,
          completed: fallbackData.completed,
          selectedAnimal: fallbackData.selectedAnimal
        });
        return;
      }

      // Check if we should populate from daily intention
      const intention = readTodayIntention();
      const allTasksEmpty = data.tasks.every((task: string) => task.trim() === "");
      
      if (intention && allTasksEmpty) {
        const intentionText = `Feel ${intention.feel}`;
        const newTasks = [intentionText, "", ""];
        setTaskData({
          tasks: newTasks,
          completed: data.completed,
          selectedAnimal: data.selectedAnimal
        });
        // Save the updated tasks with intention
        saveTaskData({ tasks: newTasks });
      } else {
        setTaskData({
          tasks: data.tasks,
          completed: data.completed,
          selectedAnimal: data.selectedAnimal
        });
      }
    };

    loadTasks();

    // Listen for storage changes
    const handleStorageChange = () => loadTasks();
    window.addEventListener("storage", handleStorageChange);
    
    // Load celebrated tasks for today
    const today = new Date().toISOString().split('T')[0];
    const celebratedToday = getDailyData(`fm_big3_celebrated_v1`, []);
    setCelebratedTasks(new Set(celebratedToday));
    
    // Load streak data
    const dashData = getDailyData("fm_dashboard_v1", { streak: 0, lastCompletedDate: "" });
    setStreakCount(dashData.streak || 0);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
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

  const saveTaskData = (updates: Partial<TaskData>) => {
    const newData = { ...taskData, ...updates };
    setTaskData(newData);
    setDailyData("fm_tasks_v1", {
      tasks: newData.tasks,
      completed: newData.completed,
      selectedAnimal: newData.selectedAnimal,
      reflections: ["", "", ""],
      roundsCompleted: 0,
      totalTasksCompleted: newData.completed.filter(Boolean).length
    });
    emitChanged([K_TASKS]);
  };

  const handleTaskChange = (index: number, value: string) => {
    if (!taskData?.tasks || !Array.isArray(taskData.tasks)) {
      console.error("handleTaskChange: taskData.tasks is not a valid array!");
      return;
    }
    const newTasks = taskData.tasks.map((task, i) => i === index ? value : task);
    saveTaskData({ tasks: newTasks });
  };

  const handleAnimalSelect = (animalId: string) => {
    saveTaskData({ selectedAnimal: animalId });
    setShowAnimalPicker(false);
  };

  const toggleTaskCompleted = (index: number) => {
    if (!taskData?.completed || !Array.isArray(taskData.completed)) {
      console.error("toggleTaskCompleted: taskData.completed is not a valid array!");
      return;
    }
    
    const newCompleted = taskData.completed.map((completed, i) => 
      i === index ? !completed : completed
    );
    
    const wasCompleted = taskData.completed[index];
    const isNowCompleted = !wasCompleted;
    
    // If task is being completed for the first time today, show celebration
    if (isNowCompleted && !celebratedTasks.has(index)) {
      setCelebratedTaskIndex(index);
      setShowTaskCelebration(true);
      
      // Mark this task as celebrated today
      const newCelebratedTasks = new Set(celebratedTasks);
      newCelebratedTasks.add(index);
      setCelebratedTasks(newCelebratedTasks);
      
      // Persist celebrated tasks for today
      setDailyData(`fm_big3_celebrated_v1`, Array.from(newCelebratedTasks));
    }
    
    saveTaskData({ completed: newCompleted });

    if (isNowCompleted) {
      const taskNumber = index + 1;
      if (getCelebrationsEnabled()) {
        toast({
          title: "Task Complete! 🎉",
          description: `Great job finishing task #${taskNumber}!`,
          duration: 3000,
        });
      }

      // Check if all tasks are completed for the first time
      const allCompleted = newCompleted.every(Boolean);
      const wasAllCompleted = taskData.completed.every(Boolean);
      
      console.log("BigThreeTasksSection: Task completion check", {
        allCompleted,
        wasAllCompleted,
        index,
        isNowCompleted
      });
      
      if (allCompleted && !wasAllCompleted) {
        console.log("BigThreeTasksSection: All tasks completed! Showing modal");
        // Show the all-tasks-completed modal
        setShowAllTasksCompleted(true);
      }
    }
  };

  const handleStartNewRound = () => {
    // Reset all tasks
    const resetData = {
      tasks: ["", "", ""],
      completed: [false, false, false]
    };
    saveTaskData(resetData);
    
    // Clear celebrated tasks for new round
    setCelebratedTasks(new Set());
    setDailyData(`fm_big3_celebrated_v1`, []);
    
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

  const selectedAnimal = ANIMALS.find(a => a.id === taskData.selectedAnimal) || ANIMALS[0];
  const completedCount = taskData.completed.filter(Boolean).length;
  const petStage = Math.min(completedCount, 3); // Stage 0-3 based on completed tasks

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
                {selectedAnimal.stages[petStage]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                The Big Three ⭐
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedAnimal.name} – Stage {petStage + 1}/4
                {streakCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    🔥 {streakCount}-day streak
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Compact Timer Row */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-sm">{getPhaseIcon()}</span>
            <div>
              <div className={`font-mono font-semibold ${getPhaseColor()}`}>
                {formatTime(timerState.msLeft)}
              </div>
              <div className="text-xs text-muted-foreground">
                {timerState.phaseLabel}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!timerState.isRunning ? (
              <Button
                size="sm"
                onClick={() => focusTimer.start(timerState.phase === "idle" ? "focus" : timerState.phase)}
                className="h-8"
              >
                <Play className="w-3 h-3 mr-1" />
                Start
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => focusTimer.pause()}
                className="h-8"
              >
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/tools/focus')}
              className="h-8"
            >
              <Timer className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Progress Graph */}
        <TaskProgressGraph completedCount={completedCount} totalTasks={3} />

        {/* Task List */}
        <div className="space-y-4">
          {taskData?.tasks?.map((task, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                taskData?.completed?.[index]
                  ? "bg-primary/5 border-primary/30 shadow-sm"
                  : "bg-background/80 border-border/20 hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <Checkbox
                checked={taskData?.completed?.[index] || false}
                onCheckedChange={() => toggleTaskCompleted(index)}
                className="h-6 w-6 rounded-full"
              />
              
              <div className="flex-1">
                <Input
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                  placeholder={`Task ${index + 1} - What needs to get done?`}
                  className={`text-lg border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    taskData?.completed?.[index] 
                      ? "line-through text-muted-foreground" 
                      : "text-foreground"
                  }`}
                />
              </div>
              
              <div className="text-sm font-medium text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Animal Picker */}
        {showAnimalPicker && (
          <div className="grid grid-cols-5 gap-3 p-4 bg-muted/10 rounded-xl">
            {ANIMALS.map((animal) => (
              <button
                key={animal.id}
                onClick={() => handleAnimalSelect(animal.id)}
                className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                  taskData.selectedAnimal === animal.id
                    ? "bg-primary/20 ring-2 ring-primary/30"
                    : "bg-background/80 hover:bg-muted/20"
                }`}
              >
                <div className="text-2xl mb-1">{animal.emoji}</div>
                <div className="text-xs font-medium">{animal.name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Pet Controls */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Pet Progress:</span>
            <span className="font-medium">{selectedAnimal.stages[petStage]}</span>
            <span className="text-muted-foreground">Stage {petStage + 1}/4</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnimalPicker(!showAnimalPicker)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Change Pet
          </Button>
        </div>
      </div>

      {/* Task Celebration Modal */}
      <TaskCelebrationModal
        isOpen={showTaskCelebration}
        onClose={() => setShowTaskCelebration(false)}
        petType={taskData.selectedAnimal}
        taskIndex={celebratedTaskIndex}
      />

      {/* All Tasks Completed Modal */}
      <AllTasksCompletedModal
        isOpen={showAllTasksCompleted}
        onClose={() => setShowAllTasksCompleted(false)}
        onStartNewRound={handleStartNewRound}
        petType={taskData.selectedAnimal}
      />
    </>
  );
}