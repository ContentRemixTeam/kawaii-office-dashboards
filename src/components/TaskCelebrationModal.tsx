/**
 * Celebration modal that appears when a Big Three task is completed
 */
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Trophy } from 'lucide-react';
import { storage } from '@/lib/storage';
import { z } from 'zod';
import { awardTrophy } from '@/lib/trophySystem';
import { getDailyData, setDailyData } from '@/lib/storage';

interface TaskCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  petType: string;
  taskIndex: number;
}

const PET_GIFS = {
  unicorn: '/gifs/unicorn_celebrate.gif',
  dragon: '/gifs/dragon_fireworks.gif', 
  cat: '/gifs/cat_happy.gif',
  dog: '/gifs/dog_party.gif',
  rabbit: '/gifs/bunny_jump.gif',
  fox: '/gifs/fox_dance.gif',
  panda: '/gifs/panda_clap.gif',
  penguin: '/gifs/penguin_shuffle.gif',
  owl: '/gifs/owl_blink.gif',
  hamster: '/gifs/hamster_spin.gif',
};

const ENCOURAGEMENT_MESSAGES = [
  "Awesome work! 🎉",
  "You're crushing it! ⭐",
  "Way to go! 🚀", 
  "Fantastic job! ✨",
  "Keep it up! 💪"
];

const PET_NAMES = {
  unicorn: 'Unicorn',
  dragon: 'Dragon',
  cat: 'Cat', 
  dog: 'Dog',
  rabbit: 'Bunny',
  fox: 'Fox',
  panda: 'Panda',
  penguin: 'Penguin',
  owl: 'Owl',
  hamster: 'Hamster',
};

export default function TaskCelebrationModal({ 
  isOpen, 
  onClose, 
  petType, 
  taskIndex 
}: TaskCelebrationModalProps) {
  const [settings, setSettings] = useState({ showGifs: true, playSound: true });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [microWin, setMicroWin] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
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

  const handleSubmitMicroWin = () => {
    if (!microWin.trim()) return;
    
    // Get current wins data
    const winsData = getDailyData("fm_wins_v1", { wins: [] });
    
    // Add new micro win
    const newWin = {
      id: Date.now().toString(),
      text: microWin.trim(),
      timestamp: new Date().toISOString(),
      category: 'task-completion'
    };
    
    const updatedWins = [...winsData.wins, newWin];
    setDailyData("fm_wins_v1", { wins: updatedWins });
    
    // Award trophy
    awardTrophy(1);
    
    setHasSubmitted(true);
    setMicroWin("");
    
    // Auto-close after short delay
    setTimeout(onClose, 1500);
  };

  useEffect(() => {
    if (isOpen) {
      setMicroWin("");
      setHasSubmitted(false);
      
      // Play celebration sound if enabled
      if (settings.playSound) {
        try {
          const audio = new Audio('/sounds/celebration-chime.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio play errors (user interaction required)
          });
        } catch (error) {
          // Ignore audio errors
        }
      }
    }
  }, [isOpen, settings.playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !settings.showGifs) return null;

  const gifSrc = PET_GIFS[petType as keyof typeof PET_GIFS] || PET_GIFS.unicorn;
  const fallbackGif = '/gifs/celebrate_generic.gif';
  const petName = PET_NAMES[petType as keyof typeof PET_NAMES] || 'Pet';
  const message = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <Card 
        className="max-w-sm w-full pointer-events-auto animate-fade-in bg-card/95 border-border/20"
        role="status"
        aria-live="polite"
        aria-label={`Task completed celebration for ${petName}`}
      >
        <div className="p-6 text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 p-0"
            aria-label="Close celebration"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="mb-4">
            {prefersReducedMotion ? (
              <div className="w-20 h-20 mx-auto bg-card/50 rounded-full flex items-center justify-center text-3xl">
                🎉
              </div>
            ) : (
              <img
                src={gifSrc}
                alt={`${petName} celebrating`}
                className="w-20 h-20 mx-auto rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackGif;
                }}
              />
            )}
          </div>
          
          {!hasSubmitted ? (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Task Complete! 🎉
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                Celebrate your micro win to earn a trophy! 🏆
              </p>
              
              <div className="space-y-3">
                <Input
                  placeholder="What are you celebrating? (e.g., Made progress on my project!)"
                  value={microWin}
                  onChange={(e) => setMicroWin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitMicroWin()}
                  className="text-sm"
                  maxLength={200}
                />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitMicroWin}
                    disabled={!microWin.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Celebrate & Earn Trophy
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={onClose}
                    size="sm"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Trophy Earned! 🏆
              </h3>
              
              <p className="text-sm text-muted-foreground">
                Great work! Your celebration has been saved.
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}