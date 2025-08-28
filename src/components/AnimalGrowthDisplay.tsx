import { getCompletionStats } from '@/lib/unifiedTasks';
import { useTodayPet } from '@/hooks/useTodayPet';
import { Progress } from '@/components/ui/progress';

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

interface AnimalGrowthDisplayProps {
  selectedAnimal: string;
}

export function AnimalGrowthDisplay({ selectedAnimal }: AnimalGrowthDisplayProps) {
  const stats = getCompletionStats();
  const currentAnimal = ANIMALS.find(a => a.id === selectedAnimal) || ANIMALS[0];
  const petStage = Math.min(stats.completedCount, 3); // Stage 0-3 based on completed tasks

  const getStageMessage = () => {
    switch (stats.completedCount) {
      case 0:
        return `${currentAnimal.name} is sleeping... Ready to grow! 💤`;
      case 1:
        return `${currentAnimal.name} is awakening! 1/3 tasks completed ✨`;
      case 2:
        return `${currentAnimal.name} is growing strong! 2/3 tasks completed 💪`;
      case 3:
        return `Your magic is growing! ${currentAnimal.name} is fully grown! 🦄✨`;
      default:
        return `${currentAnimal.name} has reached maximum power! 🌟`;
    }
  };

  const getStageTitle = () => {
    switch (petStage) {
      case 0:
        return "Sleeping Baby";
      case 1:
        return "Awake Baby";
      case 2:
        return "Growing Strong";
      case 3:
        return "Fully Grown Magical";
      default:
        return "Maximum Power";
    }
  };

  const getSpecialEffects = () => {
    if (stats.completedCount === 0) return [];
    
    const effects = {
      unicorn: ["🌈", "✨", "⭐"],
      dragon: ["🔥", "⚡", "💥"],
      cat: ["💕", "🐾", "✨"],
      dog: ["❤️", "🌟", "⭐"],
      bunny: ["🌸", "🌺", "✨"],
      fox: ["🍂", "✨", "🌟"],
      panda: ["🎋", "💚", "✨"],
      penguin: ["❄️", "💎", "⭐"],
      owl: ["🌙", "📚", "✨"],
      hamster: ["🌻", "💫", "⭐"]
    };
    
    const animalEffects = effects[currentAnimal.id as keyof typeof effects] || effects.unicorn;
    return animalEffects.slice(0, stats.completedCount);
  };

  return (
    <div className="text-center p-6 bg-gradient-to-br from-background to-muted/30 rounded-3xl border-2 border-border/50 shadow-lg relative overflow-hidden">
      {/* Special Effects */}
      {stats.completedCount > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {getSpecialEffects().map((effect, i) => (
            <div
              key={i}
              className="absolute text-lg animate-bounce"
              style={{
                left: `${15 + i * 25}%`,
                top: `${10 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: "2s"
              }}
            >
              {effect}
            </div>
          ))}
        </div>
      )}
      
      <div className="mb-4 relative">
        <div className={`${
          petStage === 0 ? 'text-6xl' : 
          petStage === 1 ? 'text-7xl animate-bounce' : 
          petStage === 2 ? 'text-8xl animate-pulse' : 
          'text-9xl animate-bounce'
        } mb-2 transition-all duration-500`}>
          {currentAnimal.stages[petStage]}
        </div>
        
        {stats.completedCount > 0 && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xl">
            <span className="text-primary">◡ ◡</span>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {getStageTitle()}
      </h3>
      
      <p className="text-muted-foreground text-sm mb-2 font-medium">
        {getStageMessage()}
      </p>
      
      <div className="text-muted-foreground/70 text-xs mb-3">
        {stats.completedCount}/{stats.totalCount} tasks completed
      </div>
      
      {/* Progress bar */}
      <Progress 
        value={stats.percentage} 
        className="w-full h-3 mb-3"
      />
      
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
  );
}