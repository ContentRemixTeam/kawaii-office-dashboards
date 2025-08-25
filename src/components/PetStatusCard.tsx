import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ANIMALS = [
  { id: "unicorn", name: "Unicorn", emoji: "🦄", stages: ["🥚", "🐣", "🦄", "✨🦄✨"] },
  { id: "dragon", name: "Dragon", emoji: "🐉", stages: ["🥚", "🐣", "🐲", "🐉"] },
  { id: "phoenix", name: "Phoenix", emoji: "🔥", stages: ["🥚", "🐣", "🦅", "🔥"] },
  { id: "cat", name: "Cat", emoji: "🐱", stages: ["🥚", "🐣", "🐱", "😸"] },
  { id: "dog", name: "Dog", emoji: "🐶", stages: ["🥚", "🐣", "🐶", "🐕"] },
  { id: "rabbit", name: "Rabbit", emoji: "🐰", stages: ["🥚", "🐣", "🐰", "🌟🐰"] }
];

interface PetStatusCardProps {
  petData: { animal: string | null; stage: number };
  completedTasks: number;
  totalTasks: number;
}

export default function PetStatusCard({ petData, completedTasks, totalTasks }: PetStatusCardProps) {
  const navigate = useNavigate();
  
  const animal = petData.animal ? ANIMALS.find(a => a.id === petData.animal) : null;
  const currentEmoji = animal ? animal.stages[petData.stage] : "🥚";
  
  const getStatusMessage = () => {
    if (!animal) return "Choose your companion";
    
    if (completedTasks === 0) {
      return `${animal.name} is sleeping... zzz 💤`;
    } else if (completedTasks === 1) {
      return `${animal.name} is stirring awake! 👀`;
    } else if (completedTasks === 2) {
      return `${animal.name} is getting excited! ✨`;
    } else {
      return `${animal.name} is fully awake and happy! 🌟`;
    }
  };
  
  const getStatusTitle = () => {
    if (!animal) return "Pet Companion";
    
    if (completedTasks === 0) {
      return "Sleeping Baby";
    } else if (completedTasks === 1) {
      return "Stirring";
    } else if (completedTasks === 2) {
      return "Awakening";
    } else {
      return "Fully Awake";
    }
  };
  
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <Card 
      className="cursor-pointer hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200/50"
      onClick={() => navigate('/tools/tasks')}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            {currentEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground mb-1">
              {getStatusTitle()}
            </div>
            <div className="text-xs text-muted-foreground mb-2 truncate">
              {getStatusMessage()}
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              {completedTasks}/{totalTasks} tasks completed
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-muted/30"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}