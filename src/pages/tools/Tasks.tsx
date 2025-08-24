import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getDailyData, setDailyData } from "@/lib/storage";
import { emitChanged, KEY_TASKS } from "@/lib/topbarState";
import { useToast } from "@/hooks/use-toast";
import ToolShell from "@/components/ToolShell";

interface TaskData {
  tasks: string[];
  reflections: string[];
  completed: boolean[];
  selectedAnimal: string;
}

const REFLECTION_PROMPTS = [
  "How do I want to feel today?",
  "What would make today successful?", 
  "What am I grateful for right now?"
];

const ANIMALS = [
  { 
    id: "unicorn", 
    name: "Unicorn", 
    emoji: "🦄",
    stages: ["🥚", "🦄", "🌈🦄", "✨🦄👑"],
    encouragement: [
      "Your magic is growing! ✨🦄✨",
      "Unicorn power activated! 🌈",
      "Believe in your magical abilities! ✨",
      "You're absolutely magical today! 🦄💫"
    ]
  },
  { 
    id: "dragon", 
    name: "Dragon", 
    emoji: "🐉",
    stages: ["🥚", "🐲", "🔥🐉", "👑🐉🔥"],
    encouragement: [
      "You're breathing fire into your goals! 🔥🐉",
      "Dragon strength is rising! 💪",
      "Fierce and unstoppable! 🐉⚡",
      "You're a legendary dragon today! 👑🐉"
    ]
  },
  { 
    id: "cat", 
    name: "Cat", 
    emoji: "🐱",
    stages: ["🥚", "🐱", "😸🐾", "👑😸💎"],
    encouragement: [
      "Purr-fect progress! You're paw-some! 🐾😸",
      "Meow-nificent work! 🐱✨",
      "You're the cat's meow! 😸💕",
      "Absolutely purr-fection achieved! 👑😸"
    ]
  },
  { 
    id: "dog", 
    name: "Dog", 
    emoji: "🐶",
    stages: ["🥚", "🐶", "🐕💕", "👑🐕⭐"],
    encouragement: [
      "Good human! Your pup is proud! 🐶💕",
      "Pawsitively amazing progress! 🐾",
      "You're such a good boy/girl! 🐕✨",
      "Best human ever! Woof woof! 👑🐕"
    ]
  },
  { 
    id: "bunny", 
    name: "Bunny", 
    emoji: "🐰",
    stages: ["🥚", "🐰", "🌸🐰", "👑🐰🌈"],
    encouragement: [
      "Hopping toward success! 🐰💨",
      "Bunny bounces with joy! 🌸",
      "Some-bunny is very proud! 🐰💕",
      "You're absolutely bunny-tastic! 👑🐰"
    ]
  },
  { 
    id: "fox", 
    name: "Fox", 
    emoji: "🦊",
    stages: ["🥚", "🦊", "🍂🦊", "👑🦊✨"],
    encouragement: [
      "Clever fox energy! 🦊✨",
      "Sly progress happening! 🍂",
      "Fantastic foxiness! 🦊💫",
      "You're fox-traordinarily amazing! 👑🦊"
    ]
  },
  { 
    id: "panda", 
    name: "Panda", 
    emoji: "🐼",
    stages: ["🥚", "🐼", "🎋🐼", "👑🐼💚"],
    encouragement: [
      "Panda-stic progress! 🐼🎋",
      "Bear-y impressive work! 💚",
      "You're panda-monium in the best way! 🐼✨",
      "Absolutely panda-perfect! 👑🐼"
    ]
  },
  { 
    id: "penguin", 
    name: "Penguin", 
    emoji: "🐧",
    stages: ["🥚", "🐧", "❄️🐧", "👑🐧💎"],
    encouragement: [
      "Waddle-ing toward greatness! 🐧❄️",
      "Cool progress, literally! 💎",
      "You're ice-credibly awesome! 🐧✨",
      "Penguin perfection achieved! 👑🐧"
    ]
  },
  { 
    id: "owl", 
    name: "Owl", 
    emoji: "🦉",
    stages: ["🥚", "🦉", "🌙🦉", "👑🦉📚"],
    encouragement: [
      "Wise moves today! 🦉🌙",
      "Owl always believe in you! 📚",
      "Hoot-ray for your progress! 🦉✨",
      "Owlstanding achievement! 👑🦉"
    ]
  },
  { 
    id: "hamster", 
    name: "Hamster", 
    emoji: "🐹",
    stages: ["🥚", "🐹", "🌻🐹", "👑🐹💫"],
    encouragement: [
      "Hamster wheel of success! 🐹💨",
      "Tiny but mighty progress! 🌻",
      "You're wheely amazing! 🐹✨",
      "Hamster-ific achievement! 👑🐹"
    ]
  }
];

const AnimalSelector = ({ selectedAnimal, onAnimalSelect, disabled }: {
  selectedAnimal: string;
  onAnimalSelect: (animalId: string) => void;
  disabled: boolean;
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-main mb-3">🎯 Choose Your Daily Pet</h3>
      <div className="grid grid-cols-5 gap-2">
        {ANIMALS.map((animal) => (
          <button
            key={animal.id}
            onClick={() => onAnimalSelect(animal.id)}
            disabled={disabled}
            className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              selectedAnimal === animal.id
                ? "border-primary bg-primary/10 scale-105"
                : "border-border/20 hover:border-primary/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-2xl mb-1">{animal.emoji}</div>
            <div className="text-xs font-medium text-muted-foreground">{animal.name}</div>
          </button>
        ))}
      </div>
      {disabled && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          🔒 Animal locked for today! Complete tasks to unlock for tomorrow.
        </p>
      )}
    </div>
  );
};

const PetStage = ({ completed, selectedAnimal }: { completed: number; selectedAnimal: string }) => {
  const animal = ANIMALS.find(a => a.id === selectedAnimal) || ANIMALS[0];
  
  const stages = [
    { 
      name: "Sleeping Baby", 
      desc: "Dreaming of adventures...",
      size: "text-6xl",
      animation: ""
    },
    { 
      name: "Awake Baby", 
      desc: "Ready to grow with you!",
      size: "text-7xl",
      animation: "animate-bounce"
    },
    { 
      name: "Growing Strong", 
      desc: "Getting stronger every task!",
      size: "text-8xl",
      animation: "animate-pulse"
    },
    { 
      name: "Fully Grown Magical", 
      desc: "Maximum power achieved!",
      size: "text-9xl",
      animation: "animate-bounce"
    }
  ];
  
  const stage = Math.min(completed, 3);
  const currentStage = stages[stage];
  const currentEmoji = animal.stages[stage];
  
  const getKawaiiMessage = () => {
    if (completed === 0) return `${animal.name} is sleeping... zzz 💤`;
    if (completed === 1) return animal.encouragement[0];
    if (completed === 2) return animal.encouragement[1];
    if (completed === 3) return animal.encouragement[2];
    return animal.encouragement[3];
  };
  
  const getProgressBar = () => {
    const progress = (completed / 3) * 100;
    return (
      <div className="w-full bg-muted rounded-full h-3 mt-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {completed > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          )}
        </div>
      </div>
    );
  };
  
  const getSpecialEffects = () => {
    if (completed === 0) return null;
    
    const effects = {
      unicorn: ["🌈", "✨", "⭐", "💫"],
      dragon: ["🔥", "⚡", "💥", "🌟"],
      cat: ["💕", "🐾", "✨", "💖"],
      dog: ["❤️", "🌟", "⭐", "💫"],
      bunny: ["🌸", "🌺", "✨", "💕"],
      fox: ["🍂", "✨", "🌟", "💫"],
      panda: ["🎋", "💚", "✨", "🌟"],
      penguin: ["❄️", "💎", "⭐", "✨"],
      owl: ["🌙", "📚", "✨", "🌟"],
      hamster: ["🌻", "💫", "⭐", "✨"]
    };
    
    const animalEffects = effects[animal.id as keyof typeof effects] || effects.unicorn;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {animalEffects.slice(0, completed).map((effect, i) => (
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
        ))}
      </div>
    );
  };
  
  return (
    <div className="text-center p-8 bg-gradient-to-br from-background to-muted/30 rounded-3xl border-2 border-border/50 shadow-lg relative overflow-hidden">
      {getSpecialEffects()}
      
      <div className="mb-4 relative">
        <div className={`${currentStage.size} mb-2 ${currentStage.animation} transition-all duration-500`}>
          {currentEmoji}
        </div>
        
        {completed > 0 && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xl">
            <span className="text-primary">◡ ◡</span>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {currentStage.name}
      </h3>
      
      <p className="text-muted-foreground text-sm mb-2 font-medium">
        {getKawaiiMessage()}
      </p>
      
      <div className="text-muted-foreground/70 text-xs mb-3">
        {completed}/3 tasks completed
      </div>
      
      {getProgressBar()}
      
      {completed === 3 && (
        <div className="mt-4 animate-bounce">
          <div className="text-sm text-primary font-semibold">
            Perfect day achieved! ✨
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Your {animal.name.toLowerCase()} is absolutely magical! 💕
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
    completed: [false, false, false],
    selectedAnimal: "unicorn"
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const data = getDailyData("fm_tasks_v1", {
      tasks: ["", "", ""],
      reflections: ["", "", ""],
      completed: [false, false, false],
      selectedAnimal: "unicorn"
    });
    setTaskData(data);
  }, []);

  const saveData = (data: TaskData) => {
    setTaskData(data);
    setDailyData("fm_tasks_v1", data);
    // Dispatch events for real-time updates
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
    window.dispatchEvent(new Event('storage'));
    emitChanged([KEY_TASKS]);
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

  const handleAnimalSelect = (animalId: string) => {
    const hasAnyProgress = taskData.completed.some(Boolean);
    if (hasAnyProgress) return; // Don't allow changing if progress made
    
    const newData = { ...taskData, selectedAnimal: animalId };
    saveData(newData);
  };

  const toggleTaskCompleted = (index: number) => {
    const newCompleted = taskData.completed.map((completed, i) => 
      i === index ? !completed : completed
    );
    const newData = { ...taskData, completed: newCompleted };
    saveData(newData);

    const completedCount = newCompleted.filter(Boolean).length;
    const previousCompletedCount = taskData.completed.filter(Boolean).length;
    
    // Show individual task completion celebration
    if (newCompleted[index] && !taskData.completed[index]) {
      const animal = ANIMALS.find(a => a.id === taskData.selectedAnimal) || ANIMALS[0];
      const encouragementIndex = Math.min(completedCount - 1, animal.encouragement.length - 1);
      
      toast({
        title: animal.encouragement[encouragementIndex],
        description: `Task ${index + 1} completed! Your ${animal.name.toLowerCase()} is growing! ✨`
      });
    }
    
    // Show full completion celebration
    if (completedCount === 3 && previousCompletedCount < 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      const animal = ANIMALS.find(a => a.id === taskData.selectedAnimal) || ANIMALS[0];
      toast({
        title: "🎉 All tasks completed!",
        description: `Your ${animal.name.toLowerCase()} has reached maximum power! You're amazing!`
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

        <AnimalSelector 
          selectedAnimal={taskData.selectedAnimal}
          onAnimalSelect={handleAnimalSelect}
          disabled={taskData.completed.some(Boolean)}
        />
        
        <PetStage completed={completedCount} selectedAnimal={taskData.selectedAnimal} />
        
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