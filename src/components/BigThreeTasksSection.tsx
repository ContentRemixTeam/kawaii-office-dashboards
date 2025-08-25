import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getDailyData, setDailyData, getCelebrationsEnabled } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { emitChanged, KEY_TASKS, addEarnedAnimal } from "@/lib/topbarState";
import { readTodayIntention } from "@/lib/dailyFlow";

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
    id: "bunny", 
    name: "Bunny", 
    emoji: "🐰",
    stages: ["🥚", "🐰", "🥕🐇", "👑🐇🌸"]
  },
  { 
    id: "fox", 
    name: "Fox", 
    emoji: "🦊",
    stages: ["🥚", "🦊", "🍂🦊", "👑🦊🔥"]
  },
  { 
    id: "panda", 
    name: "Panda", 
    emoji: "🐼",
    stages: ["🥚", "🐼", "🎋🐼", "👑🐼🎍"]
  },
  { 
    id: "penguin", 
    name: "Penguin", 
    emoji: "🐧",
    stages: ["🥚", "🐧", "❄️🐧", "👑🐧🏔️"]
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
  const { toast } = useToast();
  const [taskData, setTaskData] = useState<TaskData>({
    tasks: ["", "", ""],
    completed: [false, false, false],
    selectedAnimal: "unicorn"
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // Load tasks data from the Task Pets page storage
  useEffect(() => {
    const loadTasks = () => {
      const data = getDailyData("fm_tasks_v1", {
        tasks: ["", "", ""],
        reflections: ["", "", ""],
        completed: [false, false, false],
        selectedAnimal: "unicorn",
        roundsCompleted: 0,
        totalTasksCompleted: 0
      });

      // Check if we should populate from daily intention
      const intention = readTodayIntention();
      let initialTasks = data.tasks || ["", "", ""];
      
      // If tasks are empty and we have intention data, populate from intention
      const hasEmptyTasks = initialTasks.every(task => !task.trim());
      if (hasEmptyTasks && intention?.top3?.length) {
        initialTasks = [
          intention.top3[0] || "",
          intention.top3[1] || "",
          intention.top3[2] || ""
        ];
      }

      setTaskData({
        tasks: initialTasks,
        completed: data.completed || [false, false, false],
        selectedAnimal: data.selectedAnimal || "unicorn"
      });
    };

    loadTasks();

    // Listen for updates from Task Pets page
    const handleTasksUpdated = () => loadTasks();
    const handleStorageChange = () => loadTasks();
    
    window.addEventListener('tasksUpdated', handleTasksUpdated);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const saveTaskData = (updatedData: Partial<TaskData>) => {
    const newData = { ...taskData, ...updatedData };
    setTaskData(newData);
    
    // Update the full tasks data structure for Task Pets page
    const fullData = getDailyData("fm_tasks_v1", {
      tasks: ["", "", ""],
      reflections: ["", "", ""],
      completed: [false, false, false],
      selectedAnimal: "unicorn",
      roundsCompleted: 0,
      totalTasksCompleted: 0
    });
    
    const updatedFullData = {
      ...fullData,
      tasks: newData.tasks,
      completed: newData.completed,
      selectedAnimal: newData.selectedAnimal
    };
    
    setDailyData("fm_tasks_v1", updatedFullData);
    
    // Dispatch events for real-time updates
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
    window.dispatchEvent(new Event('storage'));
    emitChanged([KEY_TASKS]);
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = taskData.tasks.map((task, i) => i === index ? value : task);
    saveTaskData({ tasks: newTasks });
  };

  const toggleTaskCompleted = (index: number) => {
    const newCompleted = taskData.completed.map((completed, i) => 
      i === index ? !completed : completed
    );
    const completedCount = newCompleted.filter(Boolean).length;
    const previousCompletedCount = taskData.completed.filter(Boolean).length;
    
    saveTaskData({ completed: newCompleted });

    // Show task completion feedback
    if (newCompleted[index] && !taskData.completed[index]) {
      const animal = ANIMALS.find(a => a.id === taskData.selectedAnimal) || ANIMALS[0];
      toast({
        title: `Task ${index + 1} completed! ✨`,
        description: `Your ${animal.name.toLowerCase()} is growing stronger!`
      });
    }
    
    // Check for all tasks completed
    if (completedCount === 3 && previousCompletedCount < 3) {
      if (getCelebrationsEnabled()) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      }
      
      const animal = ANIMALS.find(a => a.id === taskData.selectedAnimal) || ANIMALS[0];
      addEarnedAnimal(animal.id, animal.emoji);
      
      toast({
        title: "🎉 You completed your Big Three!",
        description: `Your ${animal.name.toLowerCase()} has reached maximum power!`,
        duration: 5000
      });
    }
  };

  const completedCount = taskData.completed.filter(Boolean).length;
  const selectedAnimal = ANIMALS.find(a => a.id === taskData.selectedAnimal) || ANIMALS[0];
  const currentStage = Math.min(completedCount, 3);
  const stageEmoji = selectedAnimal.stages[currentStage];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">{selectedAnimal.emoji}</div>
          </div>
          <div className="absolute inset-0">
            {"🎉✨🌟💫🎊⭐💥🔥".split("").map((emoji, i) => (
              <div
                key={i}
                className="absolute text-3xl animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: "2s"
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card/60 backdrop-blur-sm rounded-3xl border-2 border-primary/20 shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">⭐</span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              The Big Three
            </h2>
            <div className="text-4xl">
              {stageEmoji}
            </div>
          </div>
          <p className="text-muted-foreground">Your top 3 priorities for today</p>
          <div className="text-sm text-muted-foreground/80 mt-1">
            {selectedAnimal.name} - Stage {currentStage}/3
          </div>
          
          {completedCount === 3 && (
            <div className="mt-3 text-center animate-pulse">
              <div className="text-lg font-bold text-primary">
                🎉 You completed your Big Three! Your pet is growing stronger! 🎉
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {taskData.tasks.map((task, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                taskData.completed[index]
                  ? "bg-primary/5 border-primary/30 shadow-sm"
                  : "bg-background/80 border-border/20 hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <Checkbox
                checked={taskData.completed[index]}
                onCheckedChange={() => toggleTaskCompleted(index)}
                className="h-6 w-6 rounded-full"
              />
              
              <div className="flex-1">
                <Input
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                  placeholder={`Task ${index + 1} - What needs to get done?`}
                  className={`text-lg border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    taskData.completed[index] 
                      ? "line-through text-muted-foreground" 
                      : "text-foreground"
                  }`}
                />
              </div>
              
              <div className="text-2xl opacity-30">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  i < completedCount ? "bg-primary scale-110" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {completedCount}/3 tasks completed
          </div>
        </div>
      </div>
    </div>
  );
}