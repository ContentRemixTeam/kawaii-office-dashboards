/**
 * Bulletproof Card Component
 * Self-healing card component with comprehensive error handling and fallback UI
 */

import React, { forwardRef, useCallback, useRef, useImperativeHandle } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon, AlertTriangle, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { log } from '@/lib/log';

// ===== TYPES =====

export interface BulletproofCardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
  
  // Content props
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  
  // State props
  loading?: boolean;
  error?: boolean | string;
  disabled?: boolean;
  
  // Behavior props
  collapsible?: boolean;
  dismissible?: boolean;
  retryable?: boolean;
  
  // Callbacks
  onRetry?: () => void;
  onDismiss?: () => void;
  onError?: (error: Error, errorInfo: any) => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
  
  // Advanced
  fallback?: React.ComponentType<any>;
  loadingMessage?: string;
  errorMessage?: string;
  minHeight?: string;
  maxHeight?: string;
}

export interface BulletproofCardRef {
  retry: () => void;
  dismiss: () => void;
  focus: () => void;
  element: HTMLDivElement | null;
}

// ===== VARIANTS =====

const cardVariants = cva(
  'rounded-xl border transition-all duration-300 ease-in-out relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground shadow-sm border-border/20',
        elevated: 'bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl',
        glass: 'bg-card/60 backdrop-blur-lg border-border/10 shadow-md',
        interactive: 'bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer',
        danger: 'bg-destructive/5 border-destructive/20 text-destructive-foreground',
        warning: 'bg-warning/5 border-warning/20 text-warning-foreground',
        success: 'bg-success/5 border-success/20 text-success-foreground',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      state: {
        normal: '',
        loading: 'pointer-events-none',
        error: 'border-destructive/40',
        disabled: 'opacity-50 pointer-events-none',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'normal',
    },
  }
);

// ===== OVERLAY COMPONENTS =====

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div 
    className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
    role="status"
    aria-live="polite"
    aria-label={message}
  >
    <div className="flex items-center gap-3 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  </div>
);

const ErrorOverlay: React.FC<{
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryable: boolean;
  dismissible: boolean;
}> = ({ error, onRetry, onDismiss, retryable, dismissible }) => (
  <div 
    className="absolute inset-0 bg-destructive/10 rounded-xl flex items-center justify-center z-10 p-4"
    role="alert"
    aria-live="assertive"
  >
    <div className="text-center max-w-sm">
      <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm text-destructive mb-4 leading-relaxed">
        {error}
      </p>
      <div className="flex gap-2 justify-center">
        {retryable && onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
        {dismissible && onDismiss && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Dismiss
          </Button>
        )}
      </div>
    </div>
  </div>
);

// ===== ERROR FALLBACK =====

interface CardErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  title?: string;
  retryable: boolean;
  dismissible: boolean;
  onDismiss?: () => void;
}

const CardErrorFallback: React.FC<CardErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title,
  retryable,
  dismissible,
  onDismiss
}) => {
  const isDevelopment = import.meta.env.DEV;
  
  return (
    <div className="p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-destructive mb-2">
        {title ? `${title} Error` : 'Component Error'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isDevelopment ? error.message : 'Something went wrong with this section.'}
      </p>
      
      <div className="flex gap-2 justify-center">
        {retryable && (
          <Button onClick={resetErrorBoundary} variant="outline" size="sm">
            <RefreshCw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        )}
        {dismissible && onDismiss && (
          <Button onClick={onDismiss} variant="ghost" size="sm">
            <X className="w-3 h-3 mr-1" />
            Hide
          </Button>
        )}
      </div>
      
      {isDevelopment && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs font-medium">
            Error Details
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
};

// ===== MAIN COMPONENT =====

export const BulletproofCard = forwardRef<BulletproofCardRef, BulletproofCardProps>(
  ({
    children,
    className,
    variant,
    size,
    title,
    subtitle,
    icon: Icon,
    action,
    loading = false,
    error = false,
    disabled = false,
    collapsible = false,
    dismissible = false,
    retryable = true,
    onRetry,
    onDismiss,
    onError,
    fallback: CustomFallback,
    loadingMessage = 'Loading...',
    errorMessage,
    minHeight,
    maxHeight,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    role,
    ...props
  }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isDismissed, setIsDismissed] = React.useState(false);

    // Determine state
    const state = disabled ? 'disabled' : loading ? 'loading' : error ? 'error' : 'normal';
    const finalErrorMessage = typeof error === 'string' ? error : errorMessage || 'An error occurred';

    // Handlers
    const handleRetry = useCallback(() => {
      onRetry?.();
    }, [onRetry]);

    const handleDismiss = useCallback(() => {
      setIsDismissed(true);
      onDismiss?.();
    }, [onDismiss]);

    const handleError = useCallback((error: Error, errorInfo: any) => {
      log.error('BulletproofCard error:', error, errorInfo);
      onError?.(error, errorInfo);
    }, [onError]);

    const handleToggleCollapse = useCallback(() => {
      setIsCollapsed(prev => !prev);
    }, []);

    // Imperative handle
    useImperativeHandle(ref, () => ({
      retry: handleRetry,
      dismiss: handleDismiss,
      focus: () => cardRef.current?.focus(),
      element: cardRef.current,
    }));

    // Don't render if dismissed
    if (isDismissed) {
      return null;
    }

    // Card content
    const cardContent = (
      <div
        ref={cardRef}
        className={cn(
          cardVariants({ variant, size, state }),
          className
        )}
        style={{ minHeight, maxHeight }}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        role={role}
        {...props}
      >
        {/* Header */}
        {(title || subtitle || Icon || action || collapsible || dismissible) && (
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {Icon && (
                <Icon className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="text-lg font-semibold leading-none tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 ml-4">
              {action}
              {collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleCollapse}
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  <RefreshCw className={cn(
                    "w-4 h-4 transition-transform",
                    isCollapsed && "rotate-180"
                  )} />
                </Button>
              )}
              {dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {!isCollapsed && (
          <div className="relative">
            {children}
            
            {/* Overlays */}
            {loading && <LoadingOverlay message={loadingMessage} />}
            {error && (
              <ErrorOverlay
                error={finalErrorMessage}
                onRetry={retryable ? handleRetry : undefined}
                onDismiss={dismissible ? handleDismiss : undefined}
                retryable={retryable}
                dismissible={dismissible}
              />
            )}
          </div>
        )}
      </div>
    );

    // Wrap in error boundary
    return (
      <ErrorBoundary
        FallbackComponent={CustomFallback || ((props) => (
          <CardErrorFallback
            {...props}
            resetErrorBoundary={props.resetErrorBoundary}
            title={title}
            retryable={retryable}
            dismissible={dismissible}
            onDismiss={handleDismiss}
          />
        ))}
        onError={handleError}
      >
        {cardContent}
      </ErrorBoundary>
    );
  }
);

BulletproofCard.displayName = 'BulletproofCard';

export default BulletproofCard;