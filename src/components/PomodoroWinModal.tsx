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

interface PomodoroWinModalProps {
  open: boolean;
  onClose: () => void;
  sessionDuration: number; // in minutes
}

const getWeekKey = (date: Date) => {
  const year = date.getFullYear();
  const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
};

export default function PomodoroWinModal({ 
  open, 
  onClose, 
  sessionDuration 
}: PomodoroWinModalProps) {
  const [accomplishment, setAccomplishment] = useState("");

  const addToWins = (text: string) => {
    if (!text.trim()) return;

    const today = getTodayISO();
    const newWin: Win = {
      id: generateId(),
      text: text.trim(),
      date: today,
      week: getWeekKey(new Date()),
      source: "pomodoro"
    };

    const existingWins = safeGet<Win[]>("fm_wins_v1", []);
    const updatedWins = [newWin, ...existingWins];
    safeSet("fm_wins_v1", updatedWins);

    // Dispatch events for real-time updates
    window.dispatchEvent(new CustomEvent('winsUpdated'));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSave = () => {
    if (accomplishment.trim()) {
      addToWins(accomplishment);
    }
    setAccomplishment("");
    onClose();
  };

  const handleSkip = () => {
    setAccomplishment("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="text-3xl mb-2">🍅✨</div>
            <div>Focus Session Complete!</div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              You focused for {sessionDuration} minutes! What did you accomplish?
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              What did you get done? (optional)
            </Label>
            <Textarea
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              placeholder="Finished the project proposal, reviewed 10 emails, made progress on the design..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={!accomplishment.trim()}
              className="flex-1"
            >
              🏆 Add to Wins
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="flex-1"
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}