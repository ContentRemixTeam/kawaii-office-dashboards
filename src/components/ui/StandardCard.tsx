/**
 * StandardCard Component
 * A production-ready, standardized card component with consistent styling and error handling
 */

import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { CardProps, CardHeaderProps, CardContentProps } from '@/types/common';
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

// Card variants using CVA
const cardVariants = cva(
  'rounded-2xl border transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground shadow-sm border-border/20',
        elevated: 'bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl',
        glass: 'bg-card/60 backdrop-blur-lg border-border/10 shadow-lg',
        interactive: 'bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl hover:shadow-2xl hover:scale-[1.02] cursor-pointer',
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      padding: 'md',
    },
  }
);

// Loading overlay component
const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  </div>
);

// Error overlay component
const ErrorOverlay = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="absolute inset-0 bg-destructive/10 rounded-2xl flex items-center justify-center z-10">
    <div className="text-center p-4">
      <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
      <p className="text-sm text-destructive mb-2">Something went wrong</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

// Main StandardCard component
interface StandardCardProps extends CardProps, VariantProps<typeof cardVariants> {
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  errorBoundary?: boolean;
  featureName?: string;
}

export const StandardCard = forwardRef<HTMLDivElement, StandardCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    padding, 
    loading = false,
    error = false,
    onRetry,
    errorBoundary = true,
    featureName = 'Card',
    children, 
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const cardContent = (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, padding }),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        <div className="relative">
          {children}
          {loading && <LoadingOverlay />}
          {error && <ErrorOverlay onRetry={onRetry} />}
        </div>
      </div>
    );

    if (errorBoundary) {
      return (
        <FeatureErrorBoundary featureName={featureName}>
          {cardContent}
        </FeatureErrorBoundary>
      );
    }

    return cardContent;
  }
);

StandardCard.displayName = 'StandardCard';

// Card Header component
export const StandardCardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, icon: Icon, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight text-card-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
);

StandardCardHeader.displayName = 'StandardCardHeader';

// Card Content component
export const StandardCardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, scrollable = false, maxHeight, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'p-6 pt-0',
        scrollable && 'overflow-y-auto',
        className
      )}
      style={{ maxHeight }}
      {...props}
    >
      {children}
    </div>
  )
);

StandardCardContent.displayName = 'StandardCardContent';

// Card Footer component
export const StandardCardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);

StandardCardFooter.displayName = 'StandardCardFooter';

// Export all components
export {
  StandardCard as Card,
  StandardCardHeader as CardHeader,
  StandardCardContent as CardContent,
  StandardCardFooter as CardFooter,
};