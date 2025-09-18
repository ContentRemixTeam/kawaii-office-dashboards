import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  getPetTaskData, 
  updatePetTask, 
  updateSelectedAnimal,
  resetPetTasks
} from "@/lib/petTasks";
import { useGiphyCelebration } from "@/hooks/useGiphyCelebration";
import PetCelebrationModal from "./PetCelebrationModal";
import { addEarnedAnimal } from "@/lib/topbarState";

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
    id: "bee", 
    name: "Bee", 
    emoji: "🐝", 
    imageBase: "/characters/bases/bee/bee-base.png",
    accessories: { glasses: "/characters/customization/accessories/glasses-round.png" },
    stages: ["🥚", "🐛", "🐝", "👑🐝✨"], 
    encouragement: [
      "Your bee is starting to buzz! 🐝✨",
      "Buzzing with productivity! 🍯",
      "Sweet progress, keep it up! 🐝💫",
      "Bee-utiful work achieved! 👑🐝"
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

const PetStage = ({ completed, selectedAnimal, tasks, onTaskToggle }: { 
  completed: number; 
  selectedAnimal: string;
  tasks: any[];
  onTaskToggle: (index: number) => void;
}) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pet Display */}
      <div className="text-center p-8 bg-gradient-to-br from-background to-muted/30 rounded-3xl border-2 border-border/50 shadow-lg relative overflow-hidden">
        {getSpecialEffects()}
        
        <div className="mb-4 relative">
          <div className={`${currentStage.size} mb-2 ${currentStage.animation} transition-all duration-500`}>
            {animal.imageBase ? (
              <div className="relative inline-block">
                <img 
                  src={animal.imageBase}
                  alt={animal.name}
                  className="block relative z-10"
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    objectFit: 'contain'
                  }}
                />
                {animal.accessories?.glasses && (
                  <img 
                    src={animal.accessories.glasses}
                    alt=""
                    className="absolute z-20 pointer-events-none"
                    style={{ 
                      top: '0',
                      left: '0',
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain',
                      transform: 'translate(0px, -25px) scale(0.8)'
                    }}
                  />
                )}
              </div>
            ) : (
              currentEmoji
            )}
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

      {/* Task Checklist */}
      <div className="p-6 bg-gradient-to-br from-background to-muted/30 rounded-3xl border-2 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-main mb-4">📋 Next Three Tasks</h3>
        <div className="space-y-4">
          {tasks.slice(0, 3).map((task, index) => (
            <div 
              key={task.id || index}
              className="flex items-center space-x-3 p-3 rounded-xl bg-card/50 border border-border/20 transition-all duration-200 hover:bg-card/70"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onTaskToggle(index)}
                className="w-5 h-5"
              />
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.title || `Task ${index + 1}`}
              </span>
              {task.completed && (
                <span className="text-primary text-lg">✨</span>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-6 text-muted-foreground space-y-3">
              <p className="text-sm mb-2">No tasks set yet!</p>
              <p className="text-xs mb-3">Add your next three tasks to get started</p>
              <div className="space-y-2">
                <Input 
                  placeholder="Task 1"
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const task1 = e.currentTarget.value.trim();
                      e.currentTarget.value = '';
                      const task2Input = e.currentTarget.parentElement?.querySelector('input:nth-child(2)') as HTMLInputElement;
                      task2Input?.focus();
                    }
                  }}
                />
                <Input 
                  placeholder="Task 2"
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const task2 = e.currentTarget.value.trim();
                      e.currentTarget.value = '';
                      const task3Input = e.currentTarget.parentElement?.querySelector('input:nth-child(3)') as HTMLInputElement;
                      task3Input?.focus();
                    }
                  }}
                />
                <Input 
                  placeholder="Task 3"
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const task3 = e.currentTarget.value.trim();
                      const task1Input = e.currentTarget.parentElement?.querySelector('input:nth-child(1)') as HTMLInputElement;
                      const task2Input = e.currentTarget.parentElement?.querySelector('input:nth-child(2)') as HTMLInputElement;
                      const task1 = task1Input.value.trim();
                      const task2 = task2Input.value.trim();
                      
                      if (task1 && task2 && task3) {
                        // Import and use setPetTasks
                        import('@/lib/petTasks').then(({ setPetTasks }) => {
                          setPetTasks(task1, task2, task3);
                        });
                        
                        // Clear inputs
                        task1Input.value = '';
                        task2Input.value = '';
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const inputs = document.querySelectorAll('input[placeholder^="Task"]') as NodeListOf<HTMLInputElement>;
                    const task1 = inputs[0]?.value.trim();
                    const task2 = inputs[1]?.value.trim();
                    const task3 = inputs[2]?.value.trim();
                    
                    if (task1 && task2 && task3) {
                      import('@/lib/petTasks').then(({ setPetTasks }) => {
                        setPetTasks(task1, task2, task3);
                      });
                      
                      // Clear inputs
                      inputs.forEach(input => input.value = '');
                    }
                  }}
                  className="w-full"
                >
                  Add Tasks
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPetHero() {
  const { toast } = useToast();
  const [taskData, setTaskData] = useState(getPetTaskData());
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const { celebrateTask, celebrateAllTasks } = useGiphyCelebration();

  useEffect(() => {
    const updateTaskData = () => {
      setTaskData(getPetTaskData());
    };

    updateTaskData();

    window.addEventListener('petTasksUpdated', updateTaskData);
    window.addEventListener('storage', updateTaskData);

    return () => {
      window.removeEventListener('petTasksUpdated', updateTaskData);
      window.removeEventListener('storage', updateTaskData);
    };
  }, []);

  const handleAnimalSelect = (animalId: string) => {
    const hasAnyProgress = taskData.tasks.some(task => task.completed);
    if (hasAnyProgress) return;
    
    updateSelectedAnimal(animalId);
    setTaskData({ ...taskData, selectedAnimal: animalId });
  };

  const toggleTaskCompleted = (index: number) => {
    const task = taskData.tasks[index];
    if (!task) return;
    
    updatePetTask(task.id, { completed: !task.completed });
    
    const updatedTasks = [...taskData.tasks];
    updatedTasks[index] = { ...task, completed: !task.completed };
    const newData = { ...taskData, tasks: updatedTasks };
    setTaskData(newData);

    const completedCount = updatedTasks.filter(task => task.completed).length;
    const previousCompletedCount = taskData.tasks.filter(task => task.completed).length;
    
    // Show individual task completion celebration
    if (!task.completed && updatedTasks[index].completed) {
      celebrateTask(taskData.selectedAnimal, index + 1);
    }
    
    // Show full completion celebration with modal
    if (completedCount === 3 && previousCompletedCount < 3) {
      const animal = ANIMALS.find(a => a.id === taskData.selectedAnimal) || ANIMALS[0];
      
      // Add the earned animal to the top bar/dashboard display
      addEarnedAnimal(taskData.selectedAnimal, animal.emoji);
      
      // Show celebration modal
      setShowCelebrationModal(true);
      
      celebrateAllTasks(taskData.selectedAnimal);
    }
  };

  const handleResetTasks = () => {
    resetPetTasks();
    setShowCelebrationModal(false);
    toast({
      title: "🔄 New cycle started!",
      description: "Ready for your next three tasks. Choose a new pet companion!"
    });
  };

  const completedCount = taskData.tasks.filter(task => task.completed).length;

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border-2 border-primary/10 p-6 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
          🦄 Pet Growth Center
        </h2>
        <p className="text-muted-foreground text-sm">
          Complete your next three tasks to grow your daily companion
        </p>
      </div>

      <AnimalSelector 
        selectedAnimal={taskData.selectedAnimal}
        onAnimalSelect={handleAnimalSelect}
        disabled={taskData.tasks.some(task => task.completed) && completedCount < 3}
      />
      
      <PetStage 
        completed={completedCount} 
        selectedAnimal={taskData.selectedAnimal}
        tasks={taskData.tasks}
        onTaskToggle={toggleTaskCompleted}
      />
      
      {/* Reset Button - Show when all tasks completed */}
      {completedCount === 3 && (
        <div className="mt-6 text-center">
          <Button 
            onClick={handleResetTasks}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            🔄 Start New Cycle
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Round {taskData.roundsCompleted + 1} • {taskData.totalTasksCompleted} total tasks completed
          </p>
        </div>
      )}
      
      {/* Pet Celebration Modal */}
      <PetCelebrationModal
        open={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        animalId={taskData.selectedAnimal}
        animalName={ANIMALS.find(a => a.id === taskData.selectedAnimal)?.name || "Pet"}
        animalEmoji={ANIMALS.find(a => a.id === taskData.selectedAnimal)?.emoji || "🦄"}
        onReset={handleResetTasks}
      />
    </div>
  );
}