import React, { useEffect, useState } from "react";
import { Trophy } from "@/lib/trophySystem";
import { getCelebrationsEnabled } from "@/lib/storage";

// Simple confetti animation using CSS instead of external library
const triggerConfetti = () => {
  // Skip if celebrations are disabled
  if (!getCelebrationsEnabled()) return;
  
  // Create confetti elements
  const colors = ['#ff69b4', '#87ceeb', '#98fb98', '#ffd700', '#ff6347'];
  
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.opacity = '1';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 5000);
  }
};

// Add CSS animation for confetti
if (typeof document !== 'undefined' && !document.getElementById('confetti-styles')) {
  const style = document.createElement('style');
  style.id = 'confetti-styles';
  style.textContent = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(-10px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

interface TrophyCelebrationProps {
  trophy: Trophy | null;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  encouragement?: string;
}

export default function TrophyCelebration({ 
  trophy, 
  message, 
  isVisible, 
  onClose,
  encouragement
}: TrophyCelebrationProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible && trophy) {
      setAnimate(true);
      
      // Trigger confetti celebration
      triggerConfetti();
      
      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, trophy, onClose]);

  if (!isVisible || !trophy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div 
        className={`
          max-w-sm mx-4 p-6 bg-gradient-to-br from-primary/10 to-accent/10 
          border-2 border-primary/30 rounded-3xl shadow-2xl text-center
          transform transition-all duration-500 ease-out
          ${animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
      >
        {/* Trophy Icon */}
        <div className="text-6xl mb-4 animate-bounce">
          {trophy.emoji}
        </div>
        
        {/* Trophy Details */}
        <h2 className="text-xl font-bold text-foreground mb-2">
          {trophy.name}
        </h2>
        
        <p className="text-muted-foreground text-sm mb-4">
          {trophy.description}
        </p>
        
        {/* Encouragement Message */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4">
          <p className="text-primary font-medium text-sm">
            {message}
          </p>
        </div>

        {/* Personal Encouragement */}
        {encouragement && (
          <div className="bg-gradient-subtle border border-border/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">💌</span>
              <span className="text-xs font-medium text-muted-foreground">Encouragement</span>
            </div>
            <p className="text-main text-sm italic leading-relaxed">
              {encouragement}
            </p>
          </div>
        )}
        
        {/* Streak Info */}
        {trophy.sessionStreak > 1 && (
          <div className="text-xs text-muted-foreground">
            🔥 {trophy.sessionStreak} session streak
          </div>
        )}
        
        {/* Sparkle Animation */}
        <div className="absolute -top-2 -right-2 text-xl animate-pulse">
          ✨
        </div>
        <div className="absolute -bottom-2 -left-2 text-xl animate-pulse delay-500">
          ⭐
        </div>
      </div>
    </div>
  );
}