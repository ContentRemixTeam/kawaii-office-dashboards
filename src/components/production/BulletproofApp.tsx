/**
 * Bulletproof Application Wrapper
 * Implements comprehensive error handling, performance monitoring, and graceful degradation
 */

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { log } from '@/lib/log';
import { storage } from '@/lib/storage';

// ===== PERFORMANCE MONITORING =====

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  componentMountTime: number;
  errors: Array<{
    message: string;
    timestamp: number;
    stack?: string;
  }>;
}

const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: Date.now(),
    componentMountTime: Date.now(),
    errors: []
  });

  const logError = useCallback((error: Error, errorInfo: any) => {
    setMetrics(prev => ({
      ...prev,
      errors: [...prev.errors.slice(-9), {
        message: error.message,
        timestamp: Date.now(),
        stack: error.stack
      }]
    }));
  }, []);

  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: Date.now()
    }));
  });

  return { metrics, logError };
};

// ===== QUERY CLIENT SETUP =====

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// ===== LOADING FALLBACK =====

const LoadingFallback: React.FC<{ message?: string }> = ({ 
  message = "Loading application..." 
}) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  </div>
);

// ===== ERROR FALLBACK =====

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  componentStack
}) => {
  const isDevelopment = import.meta.env.DEV;

  const handleReportError = useCallback(() => {
    // In production, this could send to an error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      storage.setItem('fm_last_critical_error_v1', errorReport);
      log.error('Critical application error reported:', errorReport);
    } catch (storageError) {
      log.error('Failed to save error report:', storageError);
    }
  }, [error, componentStack]);

  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    handleReportError();
  }, [handleReportError]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Application Error
          </CardTitle>
          <CardDescription>
            We encountered an unexpected error. Your data has been saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={handleGoHome}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleReload}>
              Reload Page
            </Button>
          </div>

          {isDevelopment && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-4 bg-muted rounded-md">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  <code>
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                    {componentStack && (
                      '\n\nComponent Stack:' + componentStack
                    )}
                  </code>
                </pre>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ===== MAIN BULLETPROOF WRAPPER =====

interface BulletproofAppProps {
  children: React.ReactNode;
}

export const BulletproofApp: React.FC<BulletproofAppProps> = ({ children }) => {
  const { metrics, logError } = usePerformanceMonitoring();
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    // Global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      log.error('Unhandled promise rejection:', event.reason);
      event.preventDefault(); // Prevent default browser error handling
    };

    const handleError = (event: ErrorEvent) => {
      log.error('Global error:', event.error || event.message);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Log performance metrics in development
  useEffect(() => {
    if (import.meta.env.DEV && metrics.renderCount > 0) {
      const renderTime = Date.now() - metrics.lastRenderTime;
      if (renderTime > 100) {
        log.warn(`Slow render detected: ${renderTime}ms`);
      }
    }
  }, [metrics]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Clear any error state
        window.location.reload();
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
          
          {/* Toast notifications */}
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default BulletproofApp;