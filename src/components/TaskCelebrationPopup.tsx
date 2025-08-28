import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { saveDailyWin } from '@/lib/dailyWins';
import { awardTaskTrophy } from '@/lib/trophySystem';

interface TaskCelebrationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  taskIndex: number;
  selectedAnimal: string;
}

const ANIMAL_CELEBRATION_EMOJIS = {
  unicorn: "🦄✨",
  dragon: "🐲🔥", 
  cat: "🐱🌟",
  dog: "🐶💖",
  bunny: "🐰💖",
  fox: "🦊🍂",
  panda: "🐼🎋",
  penguin: "🐧❄️",
  owl: "🦉🌙",
  hamster: "🐹🌻"
};

const CELEBRATION_MESSAGES = [
  "Amazing work!",
  "You're crushing it!",
  "One step closer to your goals!",
  "Fantastic progress!",
  "You're on fire!",
  "Keep up the momentum!",
  "Brilliant achievement!",
  "You're unstoppable!"
];

export function TaskCelebrationPopup({ 
  open, 
  onOpenChange, 
  taskTitle, 
  taskIndex, 
  selectedAnimal 
}: TaskCelebrationPopupProps) {
  const [celebrationNote, setCelebrationNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const animalEmoji = ANIMAL_CELEBRATION_EMOJIS[selectedAnimal as keyof typeof ANIMAL_CELEBRATION_EMOJIS] || "🌟✨";
  const message = CELEBRATION_MESSAGES[taskIndex % CELEBRATION_MESSAGES.length];

  const handleSaveCelebration = async () => {
    setIsLoading(true);
    
    try {
      // Save the daily win with celebration note
      saveDailyWin({
        taskTitle,
        taskIndex,
        celebrationNote: celebrationNote.trim(),
        completedAt: new Date().toISOString()
      });

      // Grant trophy if they wrote a celebration note
      if (celebrationNote.trim()) {
        const { trophy, message } = awardTaskTrophy(5); // Award 5-minute equivalent trophy
        
        toast({
          title: "🏆 Trophy Earned!",
          description: `${trophy.name} - ${message}`,
          duration: 4000,
        });
      }

      toast({
        title: "🎉 Celebration Saved!",
        description: celebrationNote.trim() 
          ? "Your positive note has been saved to your daily wins!"
          : "Task completion recorded! Great work!",
        duration: 3000,
      });

      onOpenChange(false);
      setCelebrationNote('');
    } catch (error) {
      console.error('Error saving celebration:', error);
      toast({
        title: "Error",
        description: "Failed to save celebration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Save the win without celebration note
    saveDailyWin({
      taskTitle,
      taskIndex,
      celebrationNote: '',
      completedAt: new Date().toISOString()
    });

    toast({
      title: "✅ Task Completed!",
      description: "Great work on completing your task!",
      duration: 2000,
    });

    onOpenChange(false);
    setCelebrationNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            <div className="text-4xl mb-2 animate-bounce">
              {animalEmoji}
            </div>
            {message}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              You just completed:
            </p>
            <p className="font-semibold text-foreground mt-1">
              "{taskTitle}"
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Celebrate your win! Write yourself a positive note:
            </label>
            <Textarea
              value={celebrationNote}
              onChange={(e) => setCelebrationNote(e.target.value)}
              placeholder="I'm proud of myself for..."
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {celebrationNote.length}/200 characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              disabled={isLoading}
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSaveCelebration}
              className="flex-1"
              disabled={isLoading}
            >
              {celebrationNote.trim() ? '🏆 Save Celebration' : 'Complete Task'}
            </Button>
          </div>

          {celebrationNote.trim() && (
            <p className="text-xs text-center text-muted-foreground">
              💡 Writing a positive note will earn you a trophy!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}