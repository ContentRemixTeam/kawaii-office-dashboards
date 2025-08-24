import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getDailyData, setDailyData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import ToolShell from "@/components/ToolShell";

interface TaskData {
  tasks: string[];
  reflections: string[];
  completed: boolean[];
}

const REFLECTION_PROMPTS = [
  "How do I want to feel today?",
  "What would make today successful?", 
  "What am I grateful for right now?"
];

const PetStage = ({ completed }: { completed: number }) => {
  const stages = [
    { 
      emoji: "🌸", 
      name: "Sleepy Bud", 
      desc: "Waiting for some love...",
      size: "text-4xl",
      glow: "",
      bounce: ""
    },
    { 
      emoji: "💕", 
      name: "Happy Blossom", 
      desc: "Growing with your progress!",
      size: "text-5xl",
      glow: "drop-shadow-lg",
      bounce: "animate-bounce"
    },
    { 
      emoji: "✨", 
      name: "Sparkling Star", 
      desc: "So proud and full of joy!",
      size: "text-6xl",
      glow: "drop-shadow-2xl filter brightness-110",
      bounce: "animate-pulse"
    }
  ];
  
  const stage = Math.min(completed, 2);
  const currentStage = stages[stage];
  
  // Kawaii face expressions based on progress
  const kawaiiPet = () => {
    if (completed === 0) {
      return (
        <div className="relative">
          <div className="text-6xl mb-2">🌙</div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-lg">
            <span className="text-pink-300">• ᴗ •</span>
          </div>
        </div>
      );
    } else if (completed === 1) {
      return (
        <div className="relative">
          <div className="text-7xl mb-2 animate-bounce">🌺</div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xl">
            <span className="text-pink-500">◡ ω ◡</span>
          </div>
        </div>
      );
    } else if (completed === 2) {
      return (
        <div className="relative">
          <div className="text-8xl mb-2 animate-pulse">🌟</div>
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-2xl">
            <span className="text-yellow-400">★ ᵕ ★</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative animate-bounce">
          <div className="text-9xl mb-2">🎀</div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-3xl">
            <span className="text-pink-400">♡ ◡ ♡</span>
          </div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-lg animate-spin">
            ✨
          </div>
          <div className="absolute -top-2 right-4 text-lg animate-ping">
            💖
          </div>
        </div>
      );
    }
  };
  
  const getKawaiiMessage = () => {
    if (completed === 0) return "zzz... dreaming of tasks... ☾";
    if (completed === 1) return "Yay! One step closer! (◡ ‿ ◡)";
    if (completed === 2) return "Almost there! So exciting! ♪(´▽｀)";
    return "Perfect day! You're amazing! ٩(◕‿◕)۶";
  };
  
  const getProgressBar = () => {
    const progress = (completed / 3) * 100;
    return (
      <div className="w-full bg-pink-100 rounded-full h-3 mt-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-pink-400 to-purple-400 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        >
          {completed > 0 && (
            <div className="w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="text-center p-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl border-2 border-pink-200/50 shadow-lg">
      <div className="mb-4">
        {kawaiiPet()}
      </div>
      
      <h3 className="text-xl font-bold text-pink-600 mb-2">
        {currentStage.name}
      </h3>
      
      <p className="text-pink-500/80 text-sm mb-2 font-medium">
        {getKawaiiMessage()}
      </p>
      
      <div className="text-pink-400/70 text-xs mb-3">
        {completed}/3 tasks completed
      </div>
      
      {getProgressBar()}
      
      {completed === 3 && (
        <div className="mt-4 animate-bounce">
          <div className="text-sm text-pink-600 font-semibold">
            Perfect day achieved! ✨
          </div>
          <div className="text-xs text-pink-400 mt-1">
            Your kawaii pet is overjoyed! 💕
          </div>
        </div>
      )}
    </div>
  );
};

export default function Tasks() {
  const { toast } = useToast();
  const [taskData, setTaskData] = useState<TaskData>({
    tasks: ["", "", ""],
    reflections: ["", "", ""],
    completed: [false, false, false]
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const data = getDailyData("fm_tasks_v1", {
      tasks: ["", "", ""],
      reflections: ["", "", ""],
      completed: [false, false, false]
    });
    setTaskData(data);
  }, []);

  const saveData = (data: TaskData) => {
    setTaskData(data);
    setDailyData("fm_tasks_v1", data);
  };

  const handleTaskChange = (index: number, value: string) => {
    const newData = {
      ...taskData,
      tasks: taskData.tasks.map((task, i) => i === index ? value : task)
    };
    saveData(newData);
  };

  const handleReflectionChange = (index: number, value: string) => {
    const newData = {
      ...taskData,
      reflections: taskData.reflections.map((reflection, i) => i === index ? value : reflection)
    };
    saveData(newData);
  };

  const toggleTaskCompleted = (index: number) => {
    const newCompleted = taskData.completed.map((completed, i) => 
      i === index ? !completed : completed
    );
    const newData = { ...taskData, completed: newCompleted };
    saveData(newData);

    const completedCount = newCompleted.filter(Boolean).length;
    if (completedCount === 3 && !taskData.completed.every(Boolean)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast({
        title: "🎉 All tasks completed!",
        description: "Your pet is so happy and proud of you!"
      });
    }
  };

  const completedCount = taskData.completed.filter(Boolean).length;

  return (
    <ToolShell title="Daily Task Pets + Intention">
      <div className="space-y-6">
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <div className="absolute inset-0 animate-pulse">
              {"🎉✨🌟💫🎊".split("").map((emoji, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        )}

        <PetStage completed={completedCount} />
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border/20">
            <h3 className="font-semibold text-card-foreground mb-4">📝 Today's Tasks</h3>
            <div className="space-y-4">
              {taskData.tasks.map((task, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Task {index + 1}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={task}
                      onChange={(e) => handleTaskChange(index, e.target.value)}
                      placeholder={`What's your ${index === 0 ? "first" : index === 1 ? "second" : "third"} task?`}
                      className="flex-1"
                    />
                    <Button
                      variant={taskData.completed[index] ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTaskCompleted(index)}
                      disabled={!task.trim()}
                    >
                      {taskData.completed[index] ? "✓" : "○"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border/20">
            <h3 className="font-semibold text-card-foreground mb-4">💭 Daily Reflections</h3>
            <div className="space-y-4">
              {REFLECTION_PROMPTS.map((prompt, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{prompt}</Label>
                  <Textarea
                    value={taskData.reflections[index]}
                    onChange={(e) => handleReflectionChange(index, e.target.value)}
                    placeholder="Share your thoughts..."
                    className="resize-none h-20"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}