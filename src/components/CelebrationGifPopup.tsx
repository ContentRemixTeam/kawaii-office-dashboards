import React, { useEffect, useState } from 'react';
import { pickGif, type GifItem, type Occasion } from '@/lib/celebrations';
import { useTodayPet } from '@/hooks/useTodayPet';
import { Card } from '@/components/ui/card';

interface CelebrationGifPopupProps {
  occasion: Occasion;
  isOpen: boolean;
  onClose: () => void;
  onGifSelected?: (gif: GifItem) => void;
}

export function CelebrationGifPopup({ 
  occasion, 
  isOpen, 
  onClose, 
  onGifSelected 
}: CelebrationGifPopupProps) {
  const [gif, setGif] = useState<GifItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const todayPet = useTodayPet();

  useEffect(() => {
    if (isOpen && !gif) {
      setLoading(true);
      setImageError(false);
      
      pickGif({ pet: todayPet, occasion })
        .then((selectedGif) => {
          setGif(selectedGif);
          setLoading(false);
          if (selectedGif && onGifSelected) {
            onGifSelected(selectedGif);
          }
        })
        .catch((error) => {
          console.error('Failed to pick gif:', error);
          setLoading(false);
        });
    }
  }, [isOpen, occasion, todayPet, gif, onGifSelected]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto-close after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setGif(null);
      setImageError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative animate-scale-in pointer-events-auto">
        <Card className="p-6 max-w-sm mx-auto bg-background/95 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
          {loading && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 animate-pulse bg-muted rounded-lg"></div>
              <p className="text-muted-foreground">Loading celebration...</p>
            </div>
          )}
          
          {gif && !loading && (
            <div className="text-center space-y-4">
              <div className="relative">
                {!imageError ? (
                  <img
                    src={gif.url}
                    alt="Celebration"
                    className="w-32 h-32 mx-auto rounded-lg object-cover shadow-lg"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">🎉</span>
                  </div>
                )}
                
                {/* Dev badge - only show in development */}
                {import.meta.env.DEV && (
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {todayPet}:{gif.id}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  {gif.msg}
                </p>
                <p className="text-xs text-muted-foreground">
                  {gif.credit}
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Click to close
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Hook for easy celebration triggering
export function useCelebrationGif() {
  const [celebration, setCelebration] = useState<{
    occasion: Occasion;
    isOpen: boolean;
  } | null>(null);

  const celebrate = (occasion: Occasion) => {
    setCelebration({ occasion, isOpen: true });
  };

  const close = () => {
    setCelebration(null);
  };

  return {
    celebration,
    celebrate,
    close,
    CelebrationPopup: celebration ? (
      <CelebrationGifPopup
        occasion={celebration.occasion}
        isOpen={celebration.isOpen}
        onClose={close}
      />
    ) : null
  };
}