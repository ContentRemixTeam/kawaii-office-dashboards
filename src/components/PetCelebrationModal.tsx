import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveDailyWin } from "@/lib/dailyWins";
import { addEarnedAnimal } from "@/lib/topbarState";
import { toast } from "@/hooks/use-toast";

interface PetCelebrationModalProps {
  open: boolean;
  onClose: () => void;
  animalId: string;
  animalName: string;
  animalEmoji: string;
  onReset: () => void;
}

const CELEBRATION_GIFS = {
  unicorn: "/gifs/unicorn_celebrate.gif",
  dragon: "/gifs/dragon_fireworks.gif", 
  cat: "/gifs/cat_happy.gif",
  dog: "/gifs/dog_party.gif",
  bunny: "/gifs/bunny_jump.gif",
  fox: "/gifs/celebrate_generic.gif",
  panda: "/gifs/celebrate_generic.gif",
  penguin: "/gifs/celebrate_generic.gif",
  owl: "/gifs/celebrate_generic.gif",
  hamster: "/gifs/celebrate_generic.gif"
};

const CELEBRATION_MESSAGES = {
  unicorn: "Your unicorn has achieved magical mastery! ✨🦄",
  dragon: "Your dragon breathes fire of accomplishment! 🔥🐉", 
  cat: "Your cat is purring with pride! 🐱💕",
  dog: "Your loyal pup is celebrating your success! 🐶🎉",
  bunny: "Your bunny is hopping with joy! 🐰🌸",
  fox: "Your clever fox celebrates your achievements! 🦊✨",
  panda: "Your panda is bamboo-zled by your success! 🐼💚",
  penguin: "Your penguin is sliding into victory! 🐧❄️",
  owl: "Your wise owl hoots with pride! 🦉📚",
  hamster: "Your energetic hamster is wheel-y proud! 🐹💫"
};

export default function PetCelebrationModal({ 
  open, 
  onClose, 
  animalId,
  animalName, 
  animalEmoji, 
  onReset 
}: PetCelebrationModalProps) {
  const [celebration, setCelebration] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      // Add animal to toolbar when popup opens
      addEarnedAnimal(animalId, animalEmoji);
    }
  }, [open, animalId, animalEmoji]);

  const gifUrl = CELEBRATION_GIFS[animalId as keyof typeof CELEBRATION_GIFS] || CELEBRATION_GIFS.unicorn;
  const message = CELEBRATION_MESSAGES[animalId as keyof typeof CELEBRATION_MESSAGES] || `Your ${animalName} celebrates your success!`;

  const handleSaveAndReset = () => {
    if (celebration.trim()) {
      // Save celebration note as a daily win
      saveDailyWin({
        taskTitle: `${animalName} Pet Tasks Completed`,
        taskIndex: 0,
        celebrationNote: celebration.trim(),
        completedAt: new Date().toISOString()
      });
      
      toast({
        title: "🏆 Celebration saved!",
        description: "Your achievement has been added to your trophy case!"
      });
    }
    
    setCelebration("");
    onReset();
    onClose();
  };

  const handleSkipAndReset = () => {
    setCelebration("");
    onReset();
    onClose();
  };

  const handleJustClose = () => {
    if (celebration.trim()) {
      saveDailyWin({
        taskTitle: `${animalName} Pet Tasks Completed`,
        taskIndex: 0,
        celebrationNote: celebration.trim(),
        completedAt: new Date().toISOString()
      });
      
      toast({
        title: "🏆 Celebration saved!",
        description: "Your achievement has been added to your trophy case!"
      });
    }
    setCelebration("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleJustClose}>
      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="text-6xl mb-3 animate-bounce">{animalEmoji}✨</div>
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              All Tasks Completed!
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Celebration GIF */}
          <div className="text-center">
            <div className="relative inline-block rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl">
              <img 
                src={gifUrl}
                alt={`${animalName} celebration`}
                className="w-48 h-32 object-cover"
                onError={(e) => {
                  // Fallback to a simple celebration if GIF fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-4 text-2xl animate-bounce">🎉</div>
                  <div className="absolute top-4 right-6 text-xl animate-pulse">✨</div>
                  <div className="absolute bottom-3 left-6 text-lg animate-bounce delay-300">🌟</div>
                  <div className="absolute bottom-4 right-4 text-xl animate-pulse delay-500">💫</div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {message}
            </p>
            <div className="mt-2 text-xs text-primary font-medium">
              🏆 {animalName} has been added to your toolbar!
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              🎉 Write yourself a celebration note (saved to your trophy case)
            </Label>
            <Textarea
              value={celebration}
              onChange={(e) => setCelebration(e.target.value)}
              placeholder="I crushed all my tasks today! My focus was incredible and I feel so accomplished..."
              className="min-h-[100px] resize-none"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">
              {celebration.length}/300 characters
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSaveAndReset}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold"
              size="lg"
            >
              {celebration.trim() ? "🏆 Save Celebration & Start New Cycle" : "🔄 Start New Cycle"}
            </Button>
            
            {celebration.trim() && (
              <Button 
                variant="outline" 
                onClick={handleJustClose}
                className="w-full"
              >
                🏆 Save Celebration & Finish
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={handleSkipAndReset}
              className="w-full text-muted-foreground"
            >
              Skip & Start New Cycle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}