import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { safeGet, safeSet, generateId, getTodayISO } from "@/lib/storage";

interface Win {
  id: string;
  text: string;
  date: string;
  week: string;
  source?: string;
}

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  animalName: string;
  animalEmoji: string;
  onReset: () => void;
}

const getWeekKey = (date: Date) => {
  const year = date.getFullYear();
  const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
};

export default function CelebrationModal({ 
  open, 
  onClose, 
  animalName, 
  animalEmoji, 
  onReset 
}: CelebrationModalProps) {
  const [celebration, setCelebration] = useState("");

  const addToWins = (text: string) => {
    if (!text.trim()) return;

    const today = getTodayISO();
    const newWin: Win = {
      id: generateId(),
      text: text.trim(),
      date: today,
      week: getWeekKey(new Date()),
      source: "pet-celebration"
    };

    const existingWins = safeGet<Win[]>("fm_wins_v1", []);
    const updatedWins = [newWin, ...existingWins];
    safeSet("fm_wins_v1", updatedWins);

    // Dispatch events for real-time updates
    window.dispatchEvent(new CustomEvent('winsUpdated'));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveAndReset = () => {
    if (celebration.trim()) {
      addToWins(celebration);
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
      addToWins(celebration);
    }
    setCelebration("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleJustClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="text-4xl mb-2">{animalEmoji}✨</div>
            <div>All Tasks Completed!</div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Your {animalName.toLowerCase()} has reached maximum power! 🎉
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Celebrate your achievement (optional)
            </Label>
            <Textarea
              value={celebration}
              onChange={(e) => setCelebration(e.target.value)}
              placeholder="I crushed all my tasks today! My planning and focus were on point..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSaveAndReset}
              className="w-full"
            >
              {celebration.trim() ? "🏆 Add to Wins & Start New Round" : "🔄 Start New Round"}
            </Button>
            
            {celebration.trim() && (
              <Button 
                variant="outline" 
                onClick={handleJustClose}
                className="w-full"
              >
                🏆 Add to Wins & Finish
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={handleSkipAndReset}
              className="w-full"
            >
              Skip & Start New Round
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}