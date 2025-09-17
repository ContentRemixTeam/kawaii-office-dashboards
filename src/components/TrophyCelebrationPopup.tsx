import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfettiBurst } from './ConfettiBurst';

interface TrophyCelebrationPopupProps {
  isVisible: boolean;
  onClose: () => void;
  taskTitle: string;
  taskIndex: number;
}

const CELEBRATION_MESSAGES = [
  "Amazing work! You're crushing it today! 🏆",
  "Trophy unlocked! You're on fire! ✨", 
  "Way to go! One step closer to an awesome day! 🌟",
  "Victory dance time! You earned this! 💃",
  "Boom! Another Big Three down! 🎉",
  "Unstoppable! Keep that momentum going! 🚀",
  "Big Three champion! You're incredible! 👑",
  "Priority master! This is how it's done! ⚡"
];

const CELEBRATION_GIFS = [
  '/gifs/celebrate_generic.gif',
  '/gifs/cat_happy.gif', 
  '/gifs/bunny_jump.gif',
  '/gifs/dog_party.gif',
  '/gifs/unicorn_celebrate.gif',
  '/gifs/dragon_fireworks.gif'
];

export function TrophyCelebrationPopup({ 
  isVisible, 
  onClose, 
  taskTitle, 
  taskIndex 
}: TrophyCelebrationPopupProps) {
  const [animate, setAnimate] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [currentMessage] = useState(() => 
    CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]
  );
  const [currentGif] = useState(() => 
    CELEBRATION_GIFS[Math.floor(Math.random() * CELEBRATION_GIFS.length)]
  );

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setAnimate(true);
      setImageError(false);
      
      // Auto dismiss after 3.5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3500);

      // Handle Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    if (!isVisible) {
      setAnimate(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleImageError = () => {
    console.warn('[TrophyCelebrationPopup] GIF failed to load:', currentGif);
    setImageError(true);
  };

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Confetti Effect */}
      {!prefersReducedMotion && animate && <ConfettiBurst duration={3000} particleCount={30} />}
      
      {/* Main Popup */}
      <div 
        className={`relative bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-pink-900/20 
          rounded-3xl shadow-2xl border-4 border-yellow-400/50 max-w-md w-full mx-4 overflow-hidden
          ${animate ? 'animate-scale-in' : 'animate-scale-out'}
          ${prefersReducedMotion ? '' : 'animate-bounce-in'}
        `}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 shadow-lg"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Trophy Animation */}
          <div className="relative">
            <div className={`text-8xl ${prefersReducedMotion ? '' : 'animate-bounce'} relative z-10`}>
              🏆
            </div>
            {!prefersReducedMotion && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="w-20 h-20 text-yellow-500 animate-spin-slow opacity-30" />
                </div>
                <div className="absolute -top-4 -left-4">
                  <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-6">
                  <Sparkles className="w-6 h-6 text-pink-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </>
            )}
          </div>

          {/* Main Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Big Three Victory!
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-200 font-medium">
              {currentMessage}
            </p>
          </div>

          {/* Completed Task */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border-2 border-yellow-300/50">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Completed Priority #{taskIndex + 1}:
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-100 line-through decoration-yellow-500 decoration-2">
              {taskTitle}
            </p>
          </div>

          {/* Celebration GIF */}
          {!imageError && (
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-pink-200/50">
              <img 
                src={currentGif}
                alt="Celebration animation"
                className="w-full h-32 object-cover"
                onError={handleImageError}
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            </div>
          )}

          {/* Fallback celebration if GIF fails */}
          {imageError && (
            <div className="py-8 text-6xl">
              🎉✨🌟💫🎊
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Awesome! 🎉
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-400 via-pink-400 to-purple-400" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 via-pink-400 via-orange-400 to-yellow-400" />
        
        {!prefersReducedMotion && (
          <>
            {/* Floating sparkles */}
            <div className="absolute top-8 left-8 text-yellow-400 animate-ping opacity-75">✨</div>
            <div className="absolute top-16 right-12 text-pink-400 animate-pulse opacity-60">🌟</div>
            <div className="absolute bottom-20 left-6 text-blue-400 animate-bounce opacity-70" style={{ animationDelay: '0.8s' }}>💫</div>
            <div className="absolute bottom-32 right-8 text-purple-400 animate-pulse opacity-50" style={{ animationDelay: '1.2s' }}>✨</div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}