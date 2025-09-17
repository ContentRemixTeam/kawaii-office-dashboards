import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
  videoId?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

/**
 * Error boundary specifically for YouTube components
 * Provides graceful fallback UI and recovery options
 */
export class YouTubeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('YouTubeErrorBoundary: Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('YouTubeErrorBoundary: Error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    console.log('YouTubeErrorBoundary: Retry triggered');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleOpenInYouTube = () => {
    if (this.props.videoId) {
      window.open(`https://youtube.com/watch?v=${this.props.videoId}`, '_blank');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full aspect-video bg-muted/30">
          <CardContent className="h-full flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-sm">
              <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Video Player Error</h3>
                <p className="text-sm text-muted-foreground">
                  {this.props.fallbackMessage || 
                   'Something went wrong with the video player. You can try reloading or watch directly on YouTube.'}
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {this.props.videoId && (
                  <Button 
                    onClick={this.handleOpenInYouTube}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in YouTube
                  </Button>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs text-left bg-muted p-2 rounded mt-4">
                  <summary className="cursor-pointer">Error Details (Dev)</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default YouTubeErrorBoundary;