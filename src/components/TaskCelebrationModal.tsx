/**
 * Celebration modal that appears when a Big Three task is completed
 */
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { storage } from '@/lib/storage';
import { z } from 'zod';

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
      // Auto-dismiss after 2.5 seconds
      const timer = setTimeout(onClose, 2500);
      
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
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, settings.playSound, onClose]);

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
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nice! Task complete 🎉
          </h3>
          
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        </div>
      </Card>
    </div>
  );
}