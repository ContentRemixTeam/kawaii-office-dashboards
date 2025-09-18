import { useState, useEffect } from "react";
import { getDailyData } from "@/lib/storage";
import { getUnifiedTaskData, getBigThreeTasks } from "@/lib/unifiedTasks";

interface TaskData {
  tasks: string[];
  reflections: string[];
  completed: boolean[];
  selectedAnimal: string;
  roundsCompleted?: number;
  totalTasksCompleted?: number;
}

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

export default function HomePetDisplay() {
  const [taskData, setTaskData] = useState<TaskData>({
    tasks: ["", "", ""],
    reflections: ["", "", ""],
    completed: [false, false, false],
    selectedAnimal: "unicorn",
    roundsCompleted: 0,
    totalTasksCompleted: 0
  });

  useEffect(() => {
    const unifiedData = getUnifiedTaskData();
    const tasks = getBigThreeTasks();
    const data = {
      tasks: tasks.map(t => t?.title || ""),
      reflections: unifiedData.reflections,
      completed: tasks.map(t => t?.completed || false),
      selectedAnimal: unifiedData.selectedAnimal,
      roundsCompleted: unifiedData.roundsCompleted,
      totalTasksCompleted: unifiedData.totalTasksCompleted
    };
    setTaskData(data);

    // Listen for task updates
    const handleStorageChange = () => {
      const updatedData = getDailyData("fm_tasks_v1", {
        tasks: ["", "", ""],
        reflections: ["", "", ""],
        completed: [false, false, false],
        selectedAnimal: "unicorn",
        roundsCompleted: 0,
        totalTasksCompleted: 0
      });
      setTaskData(updatedData);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tasksUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tasksUpdated', handleStorageChange);
    };
  }, []);

  const completedCount = taskData.completed.filter(Boolean).length;
  const animal = ANIMALS.find(a => a.id === taskData.selectedAnimal) || ANIMALS[0];
  const stage = Math.min(completedCount, 3);
  const currentEmoji = animal.stages[stage];

  const getKawaiiMessage = () => {
    if (completedCount === 0) return `${animal.name} is sleeping... zzz 💤`;
    if (completedCount === 1) return animal.encouragement[0];
    if (completedCount === 2) return animal.encouragement[1];
    if (completedCount === 3) return animal.encouragement[2];
    return animal.encouragement[3];
  };

  const getSpecialEffects = () => {
    if (completedCount === 0) return null;
    
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
        {animalEffects.slice(0, completedCount).map((effect, i) => (
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

  const getSizeClass = () => {
    if (completedCount === 0) return "text-4xl";
    if (completedCount === 1) return "text-5xl animate-bounce";
    if (completedCount === 2) return "text-6xl animate-pulse";
    return "text-7xl animate-bounce";
  };

  // Don't show if no tasks are set up yet
  if (taskData.tasks.every(task => !task.trim())) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border/50 shadow-lg">
        <div className="text-4xl mb-3">🐾</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Ready for Pet Store Mode?
        </h3>
        <p className="text-sm text-muted-foreground">
          Visit Pet Store Mode to choose your companion and set up your daily goals!
        </p>
      </div>
    );
  }

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
  
  const currentStage = stages[stage];

  return (
    <div className="text-center p-8 bg-gradient-to-br from-background to-muted/30 rounded-3xl border-2 border-border/50 shadow-lg relative overflow-hidden">
      {getSpecialEffects()}
      
      <div className="mb-4 relative">
        <div className={`${currentStage.size} mb-2 ${currentStage.animation} transition-all duration-500`}>
          {currentEmoji}
        </div>
        
        {completedCount > 0 && (
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
        {completedCount}/3 tasks completed
        {taskData.roundsCompleted > 0 && (
          <span className="ml-2 bg-primary/20 text-primary px-2 py-1 rounded-full">
            {taskData.roundsCompleted} rounds today
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-3 mt-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${(completedCount / 3) * 100}%` }}
        >
          {completedCount > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          )}
        </div>
      </div>
      
      {completedCount === 3 && (
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
}