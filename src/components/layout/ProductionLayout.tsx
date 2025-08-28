/**
 * ProductionLayout Component
 * A robust layout wrapper with error boundaries and consistent spacing
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LayoutProps } from '@/types/common';
import { LAYOUT_CONFIG } from '@/config/layout';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ProductionLayoutProps extends LayoutProps {
  errorBoundary?: boolean;
  spacing?: keyof typeof LAYOUT_CONFIG.spacing;
}

export function ProductionLayout({
  children,
  className,
  maxWidth = 'xl',
  spacing = 'lg',
  errorBoundary = true,
  ...props
}: ProductionLayoutProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'w-full',
  }[maxWidth];

  const spacingClass = `layout-spacing-${spacing}`;

  const layoutContent = (
    <div 
      className={cn(
        'min-h-screen relative bg-gradient-to-br from-background via-background to-muted/20',
        className
      )}
      {...props}
    >
      <div className="h-16" /> {/* Top spacing for fixed bar */}
      
      <div className={cn(
        'container mx-auto px-4 py-8',
        maxWidthClass,
        spacingClass
      )}>
        {children}
      </div>
    </div>
  );

  if (errorBoundary) {
    return (
      <ErrorBoundary>
        {layoutContent}
      </ErrorBoundary>
    );
  }

  return layoutContent;
}

// Specialized dashboard layout
export function DashboardLayout({ children, ...props }: ProductionLayoutProps) {
  return (
    <ProductionLayout 
      maxWidth="2xl" 
      spacing="md"
      className="layout-container-dashboard"
      {...props}
    >
      {children}
    </ProductionLayout>
  );
}

// Grid container with standardized gaps
interface ProductionGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: keyof typeof LAYOUT_CONFIG.grid.gap;
  className?: string;
}

export function ProductionGrid({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 2 },
  gap = 'md',
  className 
}: ProductionGridProps) {
  const { mobile = 1, tablet = 2, desktop = 2 } = columns;
  
  const gridClass = cn(
    'grid',
    `grid-cols-${mobile}`,
    `md:grid-cols-${tablet}`,
    `lg:grid-cols-${desktop}`,
    `layout-grid-gap-${gap}`,
    'items-start',
    className
  );

  return (
    <div className={gridClass}>
      {children}
    </div>
  );
}