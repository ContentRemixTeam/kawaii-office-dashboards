import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CelebrationConfetti } from './CelebrationConfetti';
import { audioSystem } from '@/lib/audioSystem';
import { Trophy, Clock, Coffee, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PomodoroCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionType: 'focus' | 'short' | 'long';
  sessionCount: number;
  onTakeBreak?: () => void;
  onContinue?: () => void;
}

const CELEBRATION_MESSAGES = {
  focus: [
    "Amazing focus! Time for a well-deserved break! 🎉",
    "Pomodoro complete! Your brain earned some rest! ✨", 
    "Focus session crushed! Treat yourself to a break! 🌟",
    "Incredible concentration! Break time is here! 🎊",
    "You did it! Time to recharge and refresh! ⚡"
  ],
  short: [
    "Break complete! Ready to dive back in? 💪",
    "Refreshed and recharged! Let's focus again! 🚀",
    "Short break done! Time to get back to work! ⭐",
    "Feeling better? Let's tackle the next session! 🎯"
  ],
  long: [
    "Long break complete! Feeling refreshed? 🌟",
    "You've earned this rest! Ready for more focus? 💪",
    "Great job taking a proper break! Let's continue! 🚀",
    "Recharged and ready! Time for the next round! ⚡"
  ]
};

const SESSION_CONFIG = {
  focus: {
    icon: Trophy,
    title: "Focus Session Complete!",
    color: "text-yellow-500",
    bgGradient: "from-yellow-500/20 to-orange-500/20"
  },
  short: {
    icon: Coffee,
    title: "Short Break Complete!",
    color: "text-green-500", 
    bgGradient: "from-green-500/20 to-emerald-500/20"
  },
  long: {
    icon: Clock,
    title: "Long Break Complete!",
    color: "text-blue-500",
    bgGradient: "from-blue-500/20 to-purple-500/20"
  }
};

export function PomodoroCompletionModal({
  isOpen,
  onClose,
  sessionType,
  sessionCount,
  onTakeBreak,
  onContinue
}: PomodoroCompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [message, setMessage] = useState('');
  const [autoCloseTimer, setAutoCloseTimer] = useState(10);
  const navigate = useNavigate();

  const config = SESSION_CONFIG[sessionType];
  const IconComponent = config.icon;

  useEffect(() => {
    if (isOpen) {
      // Set random celebration message
      const messages = CELEBRATION_MESSAGES[sessionType];
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      
      // Show confetti for focus sessions
      if (sessionType === 'focus') {
        setShowConfetti(true);
        // Play celebration sound
        audioSystem.playPomodoroComplete();
      }
      
      // Start auto-close timer
      setAutoCloseTimer(10);
      const timer = setInterval(() => {
        setAutoCloseTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, sessionType, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (sessionType === 'focus') {
          handleTakeBreak();
        } else {
          handleContinue();
        }
      } else if (e.key === '1' && sessionType === 'focus') {
        handleTakeBreak();
      } else if (e.key === '2' && sessionType === 'focus') {
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, sessionType, onClose]);

  const handleTakeBreak = () => {
    navigate('/tools/break-room');
    onTakeBreak?.();
    onClose();
  };

  const handleContinue = () => {
    onContinue?.();
    onClose();
  };

  const handleSkipBreak = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {showConfetti && (
        <CelebrationConfetti
          taskType="big-three"
          duration={3000}
          particleCount={30}
          onComplete={() => setShowConfetti(false)}
        />
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-center justify-center">
            <div className={`p-2 rounded-full bg-gradient-to-br ${config.bgGradient}`}>
              <IconComponent className={`h-6 w-6 ${config.color}`} />
            </div>
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Celebration Message */}
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">
              {message}
            </p>
            <p className="text-sm text-muted-foreground">
              Session #{sessionCount} • Auto-closing in {autoCloseTimer}s
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {sessionType === 'focus' ? (
              <>
                <Button 
                  onClick={handleTakeBreak}
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  Take a Break (1)
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleContinue}
                    className="h-10"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Continue (2)
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleSkipBreak}
                    className="h-10 text-muted-foreground"
                  >
                    Skip Break
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={handleContinue}
                className="w-full h-12 text-lg font-medium"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Next Session (Enter)
              </Button>
            )}
          </div>

          {/* Break Room Link for Focus Sessions */}
          {sessionType === 'focus' && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Need ideas for your break?
              </p>
              <Button
                variant="link"
                onClick={handleTakeBreak}
                className="text-sm font-medium p-0 h-auto"
              >
                Visit the Break Room →
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}