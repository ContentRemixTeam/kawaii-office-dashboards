import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pickGif } from '@/lib/celebrations';
import { useTodayPet } from '@/hooks/useTodayPet';
import { awardTrophy } from '@/lib/trophySystem';
import { saveTaskWin } from '@/lib/winsStorage';
import { useToast } from '@/hooks/use-toast';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskIndex: number;
}

export function TaskCompletionModal({ isOpen, onClose, taskIndex }: TaskCompletionModalProps) {
  const [winText, setWinText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gifData, setGifData] = useState<{ url: string; message: string; credit?: string } | null>(null);
  const todayPet = useTodayPet();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Load celebration GIF when modal opens
      const loadGif = async () => {
        setIsLoading(true);
        try {
          const gif = await pickGif({ pet: todayPet, occasion: 'taskComplete' });
          setGifData({
            url: gif.url,
            message: gif.msg,
            credit: gif.credit
          });
        } catch (error) {
          console.error('Failed to load celebration GIF:', error);
          setGifData({
            url: '/gifs/celebrate_generic.gif',
            message: '🎉 Great job completing your task!'
          });
        }
        setIsLoading(false);
      };
      loadGif();
    } else {
      // Reset state when modal closes
      setWinText('');
      setGifData(null);
      setIsLoading(false);
    }
  }, [isOpen, todayPet]);

  const handleSaveCelebration = async () => {
    try {
      // Award trophy for task completion
      const result = awardTrophy(5); // 5 minutes default for task completion
      
      // Save the win if there's text
      if (winText.trim()) {
        saveTaskWin(winText.trim(), taskIndex);
      }

      toast({
        title: "🎉 Celebration saved!",
        description: result.trophy ? "You earned a trophy!" : "Keep up the great work!",
      });

      onClose();
    } catch (error) {
      console.error('Failed to save celebration:', error);
      toast({
        title: "Error",
        description: "Failed to save celebration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = async () => {
    try {
      // Still award trophy even when skipping
      awardTrophy(5);
      
      toast({
        title: "🏆 Trophy earned!",
        description: "Great job completing your task!",
      });

      onClose();
    } catch (error) {
      console.error('Failed to award trophy:', error);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">🎉 Nice work!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* GIF Display */}
          <div className="flex justify-center">
            {isLoading ? (
              <div className="w-48 h-32 bg-muted animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : gifData ? (
              <div className="text-center">
                <img 
                  src={gifData.url}
                  alt="Celebration"
                  className="w-48 h-32 object-cover rounded-lg mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/gifs/celebrate_generic.gif';
                  }}
                />
                <p className="text-sm text-muted-foreground mt-2">{gifData.message}</p>
                {gifData.credit && (
                  <p className="text-xs text-muted-foreground">{gifData.credit}</p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-2">🎉</div>
                <p className="text-muted-foreground">Great job completing your task!</p>
              </div>
            )}
          </div>

          {/* Celebration Input */}
          <div className="space-y-2">
            <p className="text-center text-muted-foreground">
              Want to capture this tiny win?
            </p>
            <Input
              placeholder="What are you celebrating? (optional)"
              value={winText}
              onChange={(e) => setWinText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveCelebration();
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button onClick={handleSaveCelebration} className="flex-1">
              Save Celebration
            </Button>
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}