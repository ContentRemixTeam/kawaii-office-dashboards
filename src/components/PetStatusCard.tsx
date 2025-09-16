import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    id: "rabbit", 
    name: "Rabbit", 
    emoji: "🐰",
    stages: ["🥚", "🐰", "🌸🐰", "👑🐰🌈"],
    encouragement: [
      "Hopping toward success! 🐰💨",
      "Bunny bounces with joy! 🌸",
      "Some-bunny is very proud! 🐰💕",
      "You're absolutely bunny-tastic! 👑🐰"
    ]
  }
];

interface PetStatusCardProps {
  petData: { animal: string | null; stage: number };
  completedTasks: number;
  totalTasks: number;
}

export default function PetStatusCard({ petData, completedTasks, totalTasks }: PetStatusCardProps) {
  const navigate = useNavigate();
  
  const animal = petData.animal ? ANIMALS.find(a => a.id === petData.animal) : null;
  const stage = Math.min(completedTasks, 3);
  const currentEmoji = animal ? animal.stages[stage] : "🥚";
  
  const getStatusMessage = () => {
    if (!animal) return "Choose your companion";
    
    if (completedTasks === 0) return `${animal.name} is sleeping... zzz 💤`;
    if (completedTasks === 1) return animal.encouragement[0];
    if (completedTasks === 2) return animal.encouragement[1];
    if (completedTasks === 3) return animal.encouragement[2];
    return animal.encouragement[3];
  };
  
  const getStatusTitle = () => {
    if (!animal) return "Pet Companion";
    
    const stages = ["Sleeping Baby", "Awake Baby", "Growing Strong", "Fully Grown Magical"];
    return stages[stage];
  };
  
  const getSpecialEffects = () => {
    if (completedTasks === 0) return null;
    
    const effects = {
      unicorn: ["🌈", "✨", "⭐"],
      dragon: ["🔥", "⚡", "💥"],
      cat: ["💕", "🐾", "✨"],
      dog: ["❤️", "🌟", "⭐"],
      bunny: ["🌸", "🌺", "✨"],
      fox: ["🍂", "✨", "🌟"],
      rabbit: ["🌸", "🌺", "✨"]
    };
    
    const animalEffects = effects[animal?.id as keyof typeof effects] || effects.unicorn;
    
    return (
      <div className="absolute top-1 right-1 flex gap-1">
        {animalEffects.slice(0, Math.min(completedTasks, 3)).map((effect, i) => (
          <div
            key={i}
            className="text-lg animate-bounce"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: "2s"
            }}
          >
            {effect}
          </div>
        ))}
      </div>
    );
  };
  
  const getSizeAndAnimation = () => {
    if (completedTasks === 0) return "text-4xl";
    if (completedTasks === 1) return "text-5xl animate-bounce";
    if (completedTasks === 2) return "text-6xl animate-pulse";
    return "text-7xl animate-bounce";
  };
  
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <div 
      className="cursor-pointer transition-all duration-200 hover:scale-[1.02] rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 relative overflow-hidden"
      onClick={() => navigate('/tools/tasks')}
    >
      {getSpecialEffects()}
      
      <div className="p-6">
        <div className="text-center mb-4">
          <div className={`${getSizeAndAnimation()} mb-2 transition-all duration-500`}>
            {currentEmoji}
          </div>
          <div className="text-card-title mb-1">
            {getStatusTitle()}
          </div>
          <div className="text-subtle text-sm">
            {getStatusMessage()}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="status-indicator status-progress text-center">
            {completedTasks}/{totalTasks} tasks completed
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-muted/20"
          />
          {completedTasks === totalTasks && totalTasks > 0 && (
            <div className="text-center animate-bounce">
              <div className="text-sm text-primary font-semibold">
                Perfect day achieved! ✨
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}