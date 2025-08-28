/**
 * Error boundaries for graceful error handling
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { log } from '@/lib/log';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
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
}

function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  retry, 
  showDetails = false 
}: DefaultErrorFallbackProps) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={retry} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        {(showDetails || isDevelopment) && error && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">
              Error Details (for developers)
            </summary>
            <div className="mt-2 p-4 bg-muted rounded-md">
              <pre className="text-xs overflow-auto">
                <code>
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                  {errorInfo?.componentStack && (
                    '\n\nComponent Stack:' + errorInfo.componentStack
                  )}
                </code>
              </pre>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// Feature-specific error boundaries
export function FeatureErrorBoundary({ 
  children, 
  featureName,
  fallback: CustomFallback
}: { 
  children: React.ReactNode; 
  featureName: string;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    log.error(`Error in ${featureName} feature:`, error, errorInfo);
  };

  const DefaultFallbackComponent = ({ error, retry }: { error: Error; retry: () => void }) => (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>The {featureName} feature encountered an error.</span>
        <Button size="sm" onClick={retry} variant="outline">
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );

  return (
    <ErrorBoundary
      fallback={CustomFallback || DefaultFallbackComponent}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;