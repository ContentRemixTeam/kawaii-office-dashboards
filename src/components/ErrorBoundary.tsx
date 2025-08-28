/**
 * Enhanced Error Boundaries for robust error handling
 * Provides user-friendly error recovery with logging and retry mechanisms
 */
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Copy, Bug } from 'lucide-react';
import { log } from '@/lib/log';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorLogEntry {
  id: string;
  timestamp: number;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  componentStack?: string;
  userAgent: string;
  url: string;
  retryCount: number;
  boundaryType: 'app' | 'feature';
  featureName?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  maxRetries?: number;
  boundaryType?: 'app' | 'feature';
  featureName?: string;
}

// ===== ERROR LOGGING UTILITIES =====

const saveErrorToStorage = (errorEntry: ErrorLogEntry): void => {
  try {
    const existingErrors = localStorage.getItem('fm_error_logs_v1');
    const errorArray = existingErrors ? JSON.parse(existingErrors) : [];
    const validArray = Array.isArray(errorArray) ? errorArray : [];
    const updatedErrors = [errorEntry, ...validArray.slice(0, 49)]; // Keep last 50 errors
    localStorage.setItem('fm_error_logs_v1', JSON.stringify(updatedErrors));
  } catch (storageError) {
    log.error('Failed to save error to storage:', storageError);
  }
};

const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getUserFriendlyMessage = (error: Error, boundaryType: 'app' | 'feature', featureName?: string): string => {
  const baseMessages = {
    app: "Don't worry! This happens sometimes. Your data is safe and we can get you back on track.",
    feature: `The ${featureName || 'component'} hit a snag, but everything else is working fine.`
  };

  // Check for common error patterns and provide specific guidance
  if (error.message.includes('Network')) {
    return "It looks like there's a connection issue. Please check your internet and try again.";
  }
  
  if (error.message.includes('localStorage') || error.message.includes('storage')) {
    return "There's an issue with saving your data. Try clearing your browser storage and refreshing.";
  }
  
  if (error.message.includes('timeout')) {
    return "The request is taking longer than expected. Please try again in a moment.";
  }

  return baseMessages[boundaryType];
};

// ===== ENHANCED ERROR BOUNDARY =====

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { boundaryType = 'feature', featureName } = this.props;
    
    // Enhanced error logging
    const errorEntry: ErrorLogEntry = {
      id: generateErrorId(),
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
      boundaryType,
      featureName,
    };

    // Save to localStorage for debugging
    saveErrorToStorage(errorEntry);
    
    // Log to console with enhanced context
    log.error(`${boundaryType.toUpperCase()} ErrorBoundary caught an error:`, {
      error,
      errorInfo,
      retryCount: this.state.retryCount,
      featureName,
      errorId: errorEntry.id,
    });
    
    this.setState({
      error,
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    const { maxRetries = 3 } = this.props;
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount >= maxRetries) {
      log.warn(`Max retries (${maxRetries}) reached for error boundary`);
      return;
    }

    log.info(`Retrying error boundary (attempt ${newRetryCount}/${maxRetries})`);
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: newRetryCount,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retry={this.retry}
          showDetails={this.props.showDetails}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          boundaryType={this.props.boundaryType || 'feature'}
          featureName={this.props.featureName}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retry: () => void;
  showDetails?: boolean;
  retryCount: number;
  maxRetries: number;
  boundaryType: 'app' | 'feature';
  featureName?: string;
}

function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  retry, 
  showDetails = false,
  retryCount,
  maxRetries,
  boundaryType,
  featureName
}: DefaultErrorFallbackProps) {
  const isDevelopment = import.meta.env.DEV;
  const { toast } = useToast();
  
  const userFriendlyMessage = error 
    ? getUserFriendlyMessage(error, boundaryType, featureName)
    : "Something unexpected happened, but we're here to help!";

  const canRetry = retryCount < maxRetries;
  
  const copyErrorDetails = useCallback(() => {
    if (!error) return;
    
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryCount,
      boundaryType,
      featureName,
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        toast({
          title: "Error details copied",
          description: "Technical details have been copied to your clipboard for debugging.",
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Unable to copy error details. Please try again.",
          variant: "destructive",
        });
      });
  }, [error, errorInfo, retryCount, boundaryType, featureName, toast]);

  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  // App-level error boundary shows more comprehensive error
  if (boundaryType === 'app') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Oops! Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-base">
                {userFriendlyMessage}
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button onClick={retry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again ({maxRetries - retryCount} attempts left)
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>

              {(isDevelopment || showDetails) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyErrorDetails}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-3 h-3" />
                  Copy Error Details
                </Button>
              )}
            </div>

            {!canRetry && (
              <Alert className="border-orange-200 bg-orange-50">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  This error has occurred multiple times. Please refresh the page or contact support if the issue persists.
                </AlertDescription>
              </Alert>
            )}

            {(showDetails || isDevelopment) && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Technical Details (for developers)
                </summary>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    <code>
                      Error: {error.message}
                      {'\n\nStack Trace:\n'}
                      {error.stack}
                      {errorInfo?.componentStack && (
                        '\n\nComponent Stack:' + errorInfo.componentStack
                      )}
                      {'\n\nRetry Count: ' + retryCount}
                      {'\n\nTimestamp: ' + new Date().toISOString()}
                    </code>
                  </pre>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Feature-level error boundary shows compact error
  return (
    <Alert className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <p className="font-medium text-sm">
            {featureName ? `${featureName} Feature Error` : 'Component Error'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {userFriendlyMessage}
          </p>
        </div>
        <div className="flex gap-2">
          {canRetry && (
            <Button size="sm" variant="outline" onClick={retry}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry ({maxRetries - retryCount} left)
            </Button>
          )}
          {(isDevelopment || showDetails) && (
            <Button size="sm" variant="ghost" onClick={copyErrorDetails}>
              <Copy className="w-3 h-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// ===== SPECIALIZED ERROR BOUNDARIES =====

// App-level error boundary for critical failures
export function AppErrorBoundary({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    log.error('CRITICAL: App-level error boundary triggered:', error, errorInfo);
    
    // Could send to error reporting service here
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: true,
      });
    }
  };

  return (
    <ErrorBoundary
      boundaryType="app"
      maxRetries={3}
      onError={handleError}
      showDetails={false}
    >
      {children}
    </ErrorBoundary>
  );
}

// Feature-specific error boundaries for individual components
export function FeatureErrorBoundary({ 
  children, 
  featureName,
  fallback: CustomFallback,
  maxRetries = 2,
  showDetails = false
}: { 
  children: React.ReactNode; 
  featureName: string;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  maxRetries?: number;
  showDetails?: boolean;
}) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    log.error(`Error in ${featureName} feature:`, error, errorInfo);
  };

  return (
    <ErrorBoundary
      fallback={CustomFallback}
      onError={handleError}
      boundaryType="feature"
      featureName={featureName}
      maxRetries={maxRetries}
      showDetails={showDetails}
    >
      {children}
    </ErrorBoundary>
  );
}

// Section-specific error boundary (alias for backward compatibility)
export const SectionErrorBoundary = FeatureErrorBoundary;

export default ErrorBoundary;