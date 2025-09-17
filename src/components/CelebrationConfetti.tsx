import React, { useEffect, useState } from 'react';

interface CelebrationConfettiProps {
  taskType?: 'big-three' | 'regular' | 'habit';
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

// Confetti colors based on task type
const CONFETTI_COLORS = {
  'big-three': ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#9370DB'], // Gold and rainbow
  'regular': ['#FF69B4', '#87CEEB', '#98FB98', '#FFD700', '#FF6347', '#9370DB'], // Multi-colored
  'habit': ['#32CD32', '#90EE90', '#FFFFFF', '#F0F8FF', '#E6FFE6'], // Green and white
  'general': ['#FF69B4', '#87CEEB', '#98FB98', '#FFD700', '#FF6347', '#9370DB']
};

export function CelebrationConfetti({ 
  taskType = 'regular', 
  duration = 3000, 
  particleCount = 25,
  onComplete 
}: CelebrationConfettiProps) {
  const [isActive, setIsActive] = useState(true);
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
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // Return null if reduced motion is preferred or animation is inactive
  if (!isActive || prefersReducedMotion) {
    return null;
  }

  const colors = CONFETTI_COLORS[taskType] || CONFETTI_COLORS.general;
  
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const delay = Math.random() * 0.8; // Stagger particle appearance
    const animationDuration = 2 + Math.random() * 1.5; // Vary fall speed
    const xOffset = (Math.random() - 0.5) * 300; // Wider spread
    const yOffset = Math.random() * 100; // Some particles start higher
    const rotation = Math.random() * 720; // Multiple rotations
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8; // Variable sizes

    const particleStyle = {
      '--delay': `${delay}s`,
      '--duration': `${animationDuration}s`,
      '--x-offset': `${xOffset}px`,
      '--y-offset': `${yOffset}px`,
      '--rotation': `${rotation}deg`,
      '--size': `${size}px`,
      backgroundColor: color,
      width: `${size}px`,
      height: `${size}px`,
    } as React.CSSProperties & {
      '--delay': string;
      '--duration': string;
      '--x-offset': string;
      '--y-offset': string;
      '--rotation': string;
      '--size': string;
    };

    return (
      <div
        key={i}
        className="confetti-particle absolute rounded-full pointer-events-none"
        style={particleStyle}
      />
    );
  });

  return (
    <>
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              transform: translateY(var(--y-offset)) translateX(0) rotate(0deg);
              opacity: 1;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 0.7;
            }
            100% {
              transform: translateY(calc(100vh + 50px)) translateX(var(--x-offset)) rotate(var(--rotation));
              opacity: 0;
            }
          }
          
          .confetti-particle {
            left: 50%;
            top: -20px;
            animation: confetti-fall var(--duration) linear var(--delay) forwards;
            z-index: 9999;
          }
        `}
      </style>
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {particles}
      </div>
    </>
  );
}