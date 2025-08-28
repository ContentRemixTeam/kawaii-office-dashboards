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
  // TEST ERROR BOUNDARY - REMOVE AFTER TESTING
  if (Math.random() > 0.7) throw new Error('Test error boundary - remove this line after testing');
  
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
    <div 
      className="cursor-pointer transition-all duration-200 hover:scale-[1.02] p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
      onClick={() => navigate('/tools/tasks')}
    >
      <div className="flex items-center gap-4">
        <div className="text-5xl p-3 rounded-2xl bg-background/50">
          {currentEmoji}
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="text-card-title mb-1">
              {getStatusTitle()}
            </div>
            <div className="text-subtle truncate">
              {getStatusMessage()}
            </div>
          </div>
          <div className="space-y-2">
            <div className="status-indicator status-progress">
              {completedTasks}/{totalTasks} tasks completed
            </div>
            <Progress 
              value={progress} 
              className="h-3 bg-muted/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}