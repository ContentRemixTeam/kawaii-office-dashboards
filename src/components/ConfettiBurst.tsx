import React, { useEffect, useState } from 'react';

interface ConfettiBurstProps {
  duration?: number;
  particleCount?: number;
}

export function ConfettiBurst({ duration = 2000, particleCount = 20 }: ConfettiBurstProps) {
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
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isActive || prefersReducedMotion) {
    return null;
  }

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const delay = Math.random() * 0.5;
    const duration = 1.5 + Math.random() * 1;
    const xOffset = (Math.random() - 0.5) * 200;
    const rotation = Math.random() * 360;
    const colors = ['#ff69b4', '#87ceeb', '#98fb98', '#ffd700', '#ff6347'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full pointer-events-none"
        style={{
          backgroundColor: color,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%)`,
          animation: `confetti-fall ${duration}s linear ${delay}s forwards`,
          '--x-offset': `${xOffset}px`,
          '--rotation': `${rotation}deg`,
        } as React.CSSProperties & { '--x-offset': string; '--rotation': string }}
      />
    );
  });

  return (
    <>
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              transform: translate(-50%, -50%) translateY(0) translateX(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) translateY(100px) translateX(var(--x-offset)) rotate(var(--rotation));
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="relative w-full h-16 overflow-hidden">
        {particles}
      </div>
    </>
  );
}