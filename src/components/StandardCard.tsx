/**
 * StandardCard - Reusable card pattern for dashboard features
 * Provides consistent spacing, styling, and states across the app
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced TypeScript interfaces
interface StatusIndicator {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

interface ActionButton {
  text: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface StandardCardProps {
  // Content props
  title: string;
  emoji?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  
  // Status and actions
  statusIndicator?: StatusIndicator;
  actionButton?: ActionButton;
  
  // States
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  
  // Styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  gradient?: "green" | "blue" | "purple" | "orange" | "pink" | "none";
  size?: "sm" | "md" | "lg";
  
  // Interactions
  clickable?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// Gradient configurations for different card types
const GRADIENTS = {
  green: "bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200/50",
  blue: "bg-gradient-to-br from-blue-50/50 to-cyan-50/50 border-blue-200/50",
  purple: "bg-white border-purple-200",
  orange: "bg-white border-orange-200",
  pink: "bg-white border-pink-200",
  none: "bg-gradient-to-br from-background to-muted/20 border-border/50"
};

// Size configurations
const SIZES = {
  sm: {
    header: "pb-2",
    content: "p-4",
    title: "text-base",
    emoji: "text-xl"
  },
  md: {
    header: "pb-3", 
    content: "p-6",
    title: "text-lg",
    emoji: "text-2xl"
  },
  lg: {
    header: "pb-4",
    content: "p-8", 
    title: "text-xl",
    emoji: "text-3xl"
  }
};

function LoadingState({ size = "md" }: { size: "sm" | "md" | "lg" }) {
  const sizeConfig = SIZES[size];
  
  return (
    <div className={cn("space-y-4", sizeConfig.content)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function ErrorState({ 
  error, 
  onRetry, 
  size = "md" 
}: { 
  error: string; 
  onRetry?: () => void;
  size: "sm" | "md" | "lg";
}) {
  const sizeConfig = SIZES[size];
  
  return (
    <div className={cn("text-center", sizeConfig.content)}>
      <div className="text-4xl mb-3">😵</div>
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Oops! Something went wrong</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          {error}
        </p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="gap-2"
          >
            <Loader2 className="w-3 h-3" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ 
  message = "No data available", 
  icon = "🌟",
  size = "md" 
}: { 
  message: string;
  icon: string;
  size: "sm" | "md" | "lg";
}) {
  const sizeConfig = SIZES[size];
  
  return (
    <div className={cn("text-center", sizeConfig.content)}>
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function StandardCard({
  // Content
  title,
  emoji,
  icon,
  children,
  
  // Status and actions  
  statusIndicator,
  actionButton,
  
  // States
  loading = false,
  error = null,
  empty = false,
  emptyMessage = "No data available",
  emptyIcon = "🌟",
  
  // Styling
  className = "",
  headerClassName = "",
  contentClassName = "",
  gradient = "none",
  size = "md",
  
  // Interactions
  clickable = false,
  onClick,
  disabled = false
}: StandardCardProps) {
  const sizeConfig = SIZES[size];
  const gradientClasses = GRADIENTS[gradient];
  
  // Determine if card should be interactive
  const isInteractive = clickable && onClick && !disabled && !loading;
  
  const cardClasses = cn(
    gradientClasses,
    isInteractive && "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
    disabled && "opacity-50 cursor-not-allowed",
    loading && "animate-pulse",
    className
  );
  
  const handleCardClick = () => {
    if (isInteractive) {
      onClick();
    }
  };

  return (
    <Card className={cardClasses} onClick={handleCardClick}>
      <CardHeader className={cn(sizeConfig.header, headerClassName)}>
        <CardTitle className={cn(
          "flex items-center justify-between", 
          sizeConfig.title
        )}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {emoji && (
              <span className={cn("flex-shrink-0", sizeConfig.emoji)}>
                {emoji}
              </span>
            )}
            {icon && (
              <div className="flex-shrink-0 text-muted-foreground">
                {icon}
              </div>
            )}
            <span className="truncate font-semibold text-card-foreground">
              {title}
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {statusIndicator && (
              <Badge 
                variant={statusIndicator.variant || "outline"}
                className={cn("bg-background/80", statusIndicator.className)}
              >
                {statusIndicator.text}
              </Badge>
            )}
            
            {actionButton && (
              <Button
                variant={actionButton.variant || "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when button is clicked
                  actionButton.onClick();
                }}
                disabled={actionButton.disabled || disabled || loading}
                className="flex items-center gap-2"
              >
                {actionButton.icon || <ExternalLink className="w-3 h-3" />}
                <span className="hidden sm:inline">{actionButton.text}</span>
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={cn(contentClassName)}>
        {loading ? (
          <LoadingState size={size} />
        ) : error ? (
          <ErrorState 
            error={error} 
            onRetry={onClick} 
            size={size}
          />
        ) : empty ? (
          <EmptyState 
            message={emptyMessage} 
            icon={emptyIcon}
            size={size}
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// Export component variants for common use cases

export const TaskCard = (props: Omit<StandardCardProps, 'gradient'>) => (
  <StandardCard {...props} gradient="green" />
);

export const FocusCard = (props: Omit<StandardCardProps, 'gradient'>) => (
  <StandardCard {...props} gradient="blue" />
);

export const VisionCard = (props: Omit<StandardCardProps, 'gradient'>) => (
  <StandardCard {...props} gradient="purple" />
);

export const TrophyCard = (props: Omit<StandardCardProps, 'gradient'>) => (
  <StandardCard {...props} gradient="orange" />
);

export const PetCard = (props: Omit<StandardCardProps, 'gradient'>) => (
  <StandardCard {...props} gradient="pink" />
);

export default StandardCard;