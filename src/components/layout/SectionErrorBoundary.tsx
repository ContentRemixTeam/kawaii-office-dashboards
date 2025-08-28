/**
 * SectionErrorBoundary Component
 * Specialized error boundary for dashboard sections with inline error display
 */

import { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName: string;
  fallbackHeight?: string;
  showRetry?: boolean;
}

function SectionErrorFallback({ 
  sectionName, 
  fallbackHeight = 'min-h-[200px]',
  showRetry = true,
  onRetry 
}: { 
  sectionName: string; 
  fallbackHeight?: string;
  showRetry?: boolean;
  onRetry: () => void;
}) {
  return (
    <div className={`card-standard p-6 ${fallbackHeight} flex items-center justify-center`}>
      <Alert className="border-destructive/20 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span>Error loading {sectionName}</span>
          {showRetry && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRetry}
              className="ml-4 h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function SectionErrorBoundary({ 
  children, 
  sectionName,
  fallbackHeight,
  showRetry = true
}: SectionErrorBoundaryProps) {
  return (
    <FeatureErrorBoundary 
      featureName={sectionName}
      fallback={({ error, retry }) => (
        <SectionErrorFallback 
          sectionName={sectionName}
          fallbackHeight={fallbackHeight}
          showRetry={showRetry}
          onRetry={retry}
        />
      )}
    >
      {children}
    </FeatureErrorBoundary>
  );
}