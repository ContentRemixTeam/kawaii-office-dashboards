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
    { emoji: "🥚", name: "Egg", desc: "Waiting to hatch..." },
    { emoji: "🌱", name: "Sprout", desc: "Starting to grow!" },
    { emoji: "🐱", name: "Happy Pet", desc: "Thriving and content!" }
  ];
  
  const stage = Math.min(completed, 2);
  const currentStage = stages[stage];
  
  return (
    <div className="text-center p-6 bg-gradient-kawaii rounded-2xl">
      <div className="text-6xl mb-3 animate-pulse">{currentStage.emoji}</div>
      <h3 className="text-lg font-semibold text-primary-foreground mb-1">{currentStage.name}</h3>
      <p className="text-primary-foreground/80 text-sm">{currentStage.desc}</p>
      <div className="mt-3 text-primary-foreground/70 text-xs">
        {completed}/3 tasks completed
      </div>
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