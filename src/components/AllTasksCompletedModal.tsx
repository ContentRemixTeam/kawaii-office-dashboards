/**
 * Modal that appears when all Big Three tasks are completed
 */
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { z } from 'zod';

interface AllTasksCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewRound: () => void;
  petType: string;
}

export default function AllTasksCompletedModal({ 
  isOpen, 
  onClose, 
  onStartNewRound,
  petType 
}: AllTasksCompletedModalProps) {
  const [settings, setSettings] = useState({ showGifs: true, playSound: true });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [celebration, setCelebration] = useState('');
  
  useEffect(() => {
    // Load celebration settings
    const celebrationSettings = storage.getItem(
      'fm_settings_celebrations_v1',
      z.object({ showGifs: z.boolean(), playSound: z.boolean() }),
      { showGifs: true, playSound: true }
    );
    setSettings(celebrationSettings);
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Play celebration sound if enabled
      if (settings.playSound) {
        try {
          const audio = new Audio('/sounds/celebration-chime.mp3');
          audio.volume = 0.4;
          audio.play().catch(() => {
            // Ignore audio play errors (user interaction required)
          });
        } catch (error) {
          // Ignore audio errors
        }
      }
    }
  }, [isOpen, settings.playSound]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleStartNewRound = () => {
    onStartNewRound();
    onClose();
  };

  const handleSkipAndStart = () => {
    onStartNewRound();
    onClose();
  };

  if (!isOpen || !settings.showGifs) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <Card 
        className="max-w-md w-full bg-card/95 border-border/20 shadow-2xl transform animate-scale-in"
        role="dialog"
        aria-live="polite"
        aria-label="All tasks completed celebration"
      >
        <CardContent className="p-6 text-center space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 p-0"
            aria-label="Close celebration"
          >
            <X className="w-4 h-4" />
          </Button>
          
          {/* Unicorn GIF/Icon */}
          <div className="mb-4">
            {prefersReducedMotion ? (
              <div className="w-24 h-24 mx-auto bg-card/50 rounded-full flex items-center justify-center text-4xl">
                🦄✨
              </div>
            ) : (
              <img
                src="/gifs/unicorn_celebrate.gif"
                alt="Unicorn celebrating"
                className="w-24 h-24 mx-auto rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/gifs/celebrate_generic.gif';
                }}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              All Tasks Completed!
            </h2>
            
            <p className="text-muted-foreground">
              Your unicorn has reached maximum power! 🎉
            </p>
          </div>
          
          {/* Optional celebration input */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Celebrate your achievement (optional)
            </label>
            <Textarea
              value={celebration}
              onChange={(e) => setCelebration(e.target.value)}
              placeholder="I crushed all my tasks today! My planning and focus were on point..."
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
          </div>
          
          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleStartNewRound}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              🔄 Start New Round
            </Button>
            
            <Button
              onClick={handleSkipAndStart}
              variant="ghost"
              className="w-full"
            >
              Skip & Start New Round
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}