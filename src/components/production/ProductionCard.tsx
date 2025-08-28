/**
 * Production-Ready Card Component System
 * Comprehensive card components with full TypeScript support, error handling, and accessibility
 */

import { forwardRef, ReactNode, useRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  StandardCardProps, 
  CardHeaderProps, 
  CardContentProps, 
  CardFooterProps,
  ComponentRefs,
  A11yProps,
  InteractiveComponentProps
} from '@/types/components';
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

// ===== CARD VARIANTS =====

const cardVariants = cva(
  'rounded-2xl border transition-all duration-300 ease-in-out relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground shadow-sm border-border/20',
        elevated: 'bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl hover:shadow-2xl',
        glass: 'bg-card/60 backdrop-blur-lg border-border/10 shadow-lg hover:shadow-xl',
        interactive: 'bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl hover:shadow-2xl hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
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

// ===== LOADING OVERLAY =====

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay = ({ message = 'Loading...' }: LoadingOverlayProps) => (
  <div 
    className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
    role="status"
    aria-live="polite"
    aria-label={message}
  >
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{message}</span>
    </div>
  </div>
);

// ===== ERROR OVERLAY =====

interface ErrorOverlayProps {
  error: string | boolean;
  onRetry?: () => void;
  retryText?: string;
}

const ErrorOverlay = ({ 
  error, 
  onRetry, 
  retryText = 'Try again' 
}: ErrorOverlayProps) => {
  const errorMessage = typeof error === 'string' ? error : 'Something went wrong';
  
  return (
    <div 
      className="absolute inset-0 bg-destructive/10 rounded-2xl flex items-center justify-center z-10"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center p-4 max-w-sm">
        <AlertTriangle 
          className="w-8 h-8 text-destructive mx-auto mb-2" 
          aria-hidden="true"
        />
        <p className="text-sm text-destructive mb-2" id="error-message">
          {errorMessage}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="text-xs"
            aria-describedby="error-message"
          >
            <RefreshCw className="w-3 h-3 mr-1" aria-hidden="true" />
            {retryText}
          </Button>
        )}
      </div>
    </div>
  );
};

// ===== MAIN CARD COMPONENT =====

export interface ProductionCardProps 
  extends StandardCardProps, 
          InteractiveComponentProps,
          VariantProps<typeof cardVariants>,
          A11yProps {
  children: ReactNode;
  onRetry?: () => void;
  retryText?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

export interface ProductionCardRef extends ComponentRefs {
  focus: () => void;
  blur: () => void;
}

export const ProductionCard = forwardRef<ProductionCardRef, ProductionCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    padding, 
    loading = false,
    error = false,
    onRetry,
    retryText = 'Try again',
    loadingMessage = 'Loading...',
    errorMessage,
    errorBoundary = true,
    featureName = 'Card',
    children, 
    onClick,
    disabled,
    minHeight,
    maxHeight,
    scrollable = false,
    tabIndex,
    role,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      root: rootRef.current,
      content: contentRef.current,
      focus: () => rootRef.current?.focus(),
      blur: () => rootRef.current?.blur(),
    }));

    const isInteractive = variant === 'interactive' || onClick;
    const finalErrorMessage = typeof error === 'string' ? error : errorMessage;

    const cardContent = (
      <div
        ref={rootRef}
        className={cn(
          cardVariants({ variant, size, padding }),
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          isInteractive && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        style={{ 
          minHeight, 
          maxHeight: scrollable ? maxHeight : undefined 
        }}
        onClick={disabled ? undefined : onClick}
        tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
        role={role || (isInteractive ? 'button' : undefined)}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled}
        {...props}
      >
        <div 
          ref={contentRef}
          className={cn(
            "relative h-full",
            scrollable && "overflow-y-auto",
            scrollable && maxHeight && "max-h-full"
          )}
        >
          {children}
          {loading && <LoadingOverlay message={loadingMessage} />}
          {error && (
            <ErrorOverlay 
              error={finalErrorMessage || error} 
              onRetry={onRetry}
              retryText={retryText}
            />
          )}
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

ProductionCard.displayName = 'ProductionCard';

// ===== CARD HEADER =====

export const ProductionCardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    icon: Icon, 
    iconColor,
    action, 
    compact = false,
    children, 
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5',
        compact ? 'p-4 pb-2' : 'p-6 pb-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {Icon && (
            <Icon 
              className={cn(
                "w-5 h-5 flex-shrink-0",
                iconColor || "text-primary"
              )} 
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold leading-none tracking-tight text-card-foreground truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
      {children}
    </div>
  )
);

ProductionCardHeader.displayName = 'ProductionCardHeader';

// ===== CARD CONTENT =====

export const ProductionCardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ 
    className, 
    scrollable = false, 
    maxHeight,
    padding = 'md',
    children, 
    ...props 
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4 pt-0',
      md: 'p-6 pt-0',
      lg: 'p-8 pt-0',
    };

    return (
      <div
        ref={ref}
        className={cn(
          paddingClasses[padding],
          scrollable && 'overflow-y-auto',
          className
        )}
        style={{ maxHeight: scrollable ? maxHeight : undefined }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ProductionCardContent.displayName = 'ProductionCardContent';

// ===== CARD FOOTER =====

export const ProductionCardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ 
    className, 
    justify = 'start',
    align = 'center',
    children,
    ...props 
  }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex p-6 pt-0',
          justifyClasses[justify],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ProductionCardFooter.displayName = 'ProductionCardFooter';

// ===== SPECIALIZED CARDS =====

export interface DashboardCardProps extends Omit<ProductionCardProps, 'variant'> {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const DashboardCard = forwardRef<ProductionCardRef, DashboardCardProps>(
  ({ 
    title, 
    subtitle, 
    icon, 
    action,
    children,
    ...props 
  }, ref) => (
    <ProductionCard
      ref={ref}
      variant="elevated"
      errorBoundary={true}
      featureName={`Dashboard - ${title}`}
      aria-label={`${title} dashboard card`}
      {...props}
    >
      <ProductionCardHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        action={action}
      />
      <ProductionCardContent>
        {children}
      </ProductionCardContent>
    </ProductionCard>
  )
);

DashboardCard.displayName = 'DashboardCard';

// ===== EXPORTS =====

export {
  ProductionCard as Card,
  ProductionCardHeader as CardHeader,
  ProductionCardContent as CardContent,
  ProductionCardFooter as CardFooter,
};

// Default export for backward compatibility
export default ProductionCard;