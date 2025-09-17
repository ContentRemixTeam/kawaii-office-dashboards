import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'timer-focus' | 'timer-short' | 'timer-long' | 'timer-idle';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'default', ...props }, ref) => {
  // Get theme-aware styles based on variant
  const getProgressStyles = () => {
    switch (variant) {
      case 'timer-focus':
        return {
          root: "timer-progress-bar bg-timer-focus-bg",
          indicator: "timer-progress-focus"
        };
      case 'timer-short':
        return {
          root: "timer-progress-bar bg-timer-short-bg",
          indicator: "timer-progress-short"
        };
      case 'timer-long':
        return {
          root: "timer-progress-bar bg-timer-long-bg",
          indicator: "timer-progress-long"
        };
      case 'timer-idle':
        return {
          root: "timer-progress-bar bg-timer-idle-bg",
          indicator: "timer-progress-idle"
        };
      default:
        return {
          root: "bg-secondary",
          indicator: "bg-primary"
        };
    }
  };

  const styles = getProgressStyles();

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full",
        styles.root,
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-in-out",
          styles.indicator
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
