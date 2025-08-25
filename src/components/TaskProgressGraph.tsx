/**
 * Mini progress graph for the Big Three tasks
 */
import { useEffect, useState } from 'react';

interface TaskProgressGraphProps {
  completedCount: number;
  totalTasks: number;
  className?: string;
}

export default function TaskProgressGraph({ 
  completedCount, 
  totalTasks = 3, 
  className = '' 
}: TaskProgressGraphProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const progressPercentage = (completedCount / totalTasks) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress segments */}
      <div className="flex gap-1">
        {Array.from({ length: totalTasks }, (_, index) => {
          const isCompleted = index < completedCount;
          return (
            <div
              key={index}
              className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-gradient-to-r from-primary to-primary/80 shadow-sm'
                  : 'bg-muted/40'
              }`}
              style={{
                animationDelay: prefersReducedMotion ? '0ms' : `${index * 100}ms`
              }}
            />
          );
        })}
      </div>
      
      {/* Sparkline progress bar */}
      <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all ${
            prefersReducedMotion ? 'duration-0' : 'duration-500'
          } ease-out`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Progress label */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{completedCount}</span>
          /{totalTasks} tasks completed
        </p>
      </div>
    </div>
  );
}