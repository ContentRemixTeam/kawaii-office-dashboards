import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GifItem } from '@/lib/celebrations';
import { ConfettiBurst } from './ConfettiBurst';

interface CelebrationPopupProps {
  gif: GifItem | null;
  customMessage?: string;
  isVisible: boolean;
  onClose: () => void;
}

export function CelebrationPopup({ gif, customMessage, isVisible, onClose }: CelebrationPopupProps) {
  const [animate, setAnimate] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    console.log('[CelebrationPopup] useEffect triggered:', { isVisible, gif });
    
    if (isVisible && gif) {
      console.log('[CelebrationPopup] Starting animation for gif:', gif);
      setAnimate(true);
      setImageError(false);
      
      // Auto dismiss after 2.5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 2500);

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
    } else {
      setAnimate(false);
    }
  }, [isVisible, gif, onClose]);

  const handleImageError = () => {
    console.log('[CelebrationPopup] Image failed to load for:', gif?.url);
    setImageError(true);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible || !gif) {
    console.log('[CelebrationPopup] Not rendering:', { isVisible, hasGif: !!gif });
    return null;
  }

  const celebrationContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div 
        className="fixed inset-0"
        onClick={handleBackdropClick}
        aria-label="Close celebration"
      />
      
      <div 
        className={`
          relative max-w-sm mx-4 p-6 bg-gradient-to-br from-primary/10 to-accent/10 
          border-2 border-primary/30 rounded-3xl shadow-2xl text-center
          transform transition-all duration-300 ease-out
          ${animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        aria-describedby="celebration-message"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-primary/10"
          aria-label="Close celebration popup"
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Celebration content */}
        {imageError || prefersReducedMotion ? (
          <div className="mb-4">
            <ConfettiBurst />
            <div className="text-4xl mt-2">🎉</div>
          </div>
        ) : (
          <div className="mb-4">
            <img
              src={gif.url}
              alt={`Celebration animation: ${gif.msg}`}
              className="w-24 h-24 mx-auto rounded-xl object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        )}

        {/* Message */}
        <div 
          id="celebration-message"
          className="bg-primary/5 border border-primary/20 rounded-xl p-3"
        >
          <p className="text-primary font-medium text-sm">
            {customMessage || gif.msg}
          </p>
        </div>

        {/* Sparkle animations */}
        {!prefersReducedMotion && (
          <>
            <div className="absolute -top-2 -right-2 text-xl animate-pulse">
              ✨
            </div>
            <div className="absolute -bottom-2 -left-2 text-xl animate-pulse delay-500">
              ⭐
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(celebrationContent, document.body);
}