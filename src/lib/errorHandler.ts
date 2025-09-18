/**
 * Centralized error handling system for the application
 * Provides consistent error logging, user notifications, and recovery mechanisms
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'storage' | 'network' | 'validation' | 'youtube' | 'timer' | 'general';

export interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
  userMessage?: string;
}

class ErrorHandler {
  private errors: AppError[] = [];
  private maxErrors = 100; // Keep last 100 errors
  private errorListeners: Set<(error: AppError) => void> = new Set();

  /**
   * Log an error with automatic categorization and user notification
   */
  logError(
    error: Error | string,
    severity: ErrorSeverity = 'medium',
    category: ErrorCategory = 'general',
    context?: Record<string, any>,
    userMessage?: string
  ): AppError {
    const appError: AppError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error instanceof Error ? error.message : error,
      severity,
      category,
      timestamp: Date.now(),
      context,
      stack: error instanceof Error ? error.stack : undefined,
      userMessage
    };

    // Store error (with rotation)
    this.errors.push(appError);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Console logging based on severity
    switch (severity) {
      case 'critical':
        console.error('🚨 CRITICAL ERROR:', appError);
        break;
      case 'high':
        console.error('❌ HIGH ERROR:', appError);
        break;
      case 'medium':
        console.warn('⚠️ MEDIUM ERROR:', appError);
        break;
      case 'low':
        console.info('ℹ️ LOW ERROR:', appError);
        break;
    }

    // Notify listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(appError);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });

    return appError;
  }

  /**
   * Safe localStorage operations with automatic error handling
   */
  safeLocalStorage = {
    getItem: (key: string, defaultValue: any = null): any => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        this.logError(
          error as Error,
          'low',
          'storage',
          { key, operation: 'getItem' },
          'Failed to load saved data'
        );
        return defaultValue;
      }
    },

    setItem: (key: string, value: any): boolean => {
      try {
        // Validate data size (5MB limit for localStorage)
        const serialized = JSON.stringify(value);
        if (serialized.length > 5 * 1024 * 1024) {
          this.logError(
            new Error('Data too large for localStorage'),
            'medium',
            'storage',
            { key, size: serialized.length },
            'Unable to save data - too large'
          );
          return false;
        }

        localStorage.setItem(key, serialized);
        return true;
      } catch (error) {
        this.logError(
          error as Error,
          'medium',
          'storage',
          { key, operation: 'setItem' },
          'Failed to save data'
        );
        return false;
      }
    },

    removeItem: (key: string): boolean => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        this.logError(
          error as Error,
          'low',
          'storage',
          { key, operation: 'removeItem' },
          'Failed to remove saved data'
        );
        return false;
      }
    }
  };

  /**
   * Safe async operation wrapper with retry logic
   */
  async safeAsync<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: Record<string, any>
  ): Promise<T | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.logError(
            lastError,
            'high',
            'general',
            { ...context, attempt, maxRetries },
            'Operation failed after multiple attempts'
          );
          break;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    return null;
  }

  /**
   * Network error handler with connection detection
   */
  handleNetworkError(error: Error, context?: Record<string, any>): void {
    const isOnline = navigator.onLine;
    const severity: ErrorSeverity = isOnline ? 'medium' : 'high';
    const userMessage = isOnline 
      ? 'Network request failed. Please try again.'
      : 'You appear to be offline. Please check your connection.';

    this.logError(error, severity, 'network', { ...context, isOnline }, userMessage);
  }

  /**
   * YouTube-specific error handler
   */
  handleYouTubeError(errorCode: number, videoId?: string): void {
    const errorMessages: Record<number, { message: string; severity: ErrorSeverity; userMessage: string }> = {
      2: { message: 'Invalid video ID', severity: 'low', userMessage: 'Invalid video. Please try a different one.' },
      5: { message: 'Video playback error', severity: 'medium', userMessage: 'Video failed to play. Trying again...' },
      100: { message: 'Video not found', severity: 'low', userMessage: 'Video not found or has been removed.' },
      101: { message: 'Video unavailable', severity: 'low', userMessage: 'This video is not available.' },
      150: { message: 'Video embedding disabled', severity: 'low', userMessage: 'Video cannot be embedded. Try opening in YouTube.' },
      [-1]: { message: 'Network or API error', severity: 'medium', userMessage: 'Connection error. Please check your internet.' }
    };

    const errorInfo = errorMessages[errorCode] || {
      message: `Unknown YouTube error: ${errorCode}`,
      severity: 'medium' as ErrorSeverity,
      userMessage: 'Video error occurred. Please try again.'
    };

    this.logError(
      new Error(errorInfo.message),
      errorInfo.severity,
      'youtube',
      { errorCode, videoId },
      errorInfo.userMessage
    );
  }

  /**
   * Component lifecycle error handler
   */
  handleComponentError(error: Error, componentName: string, context?: Record<string, any>): void {
    this.logError(
      error,
      'high',
      'general',
      { ...context, componentName },
      'A component encountered an error. Please refresh the page.'
    );
  }

  /**
   * Subscribe to error events
   */
  onError(listener: (error: AppError) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error summary for health check
   */
  getErrorSummary(): { total: number; bySeverity: Record<ErrorSeverity, number>; byCategory: Record<ErrorCategory, number> } {
    const summary = {
      total: this.errors.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 } as Record<ErrorSeverity, number>,
      byCategory: { storage: 0, network: 0, validation: 0, youtube: 0, timer: 0, general: 0 } as Record<ErrorCategory, number>
    };

    this.errors.forEach(error => {
      summary.bySeverity[error.severity]++;
      summary.byCategory[error.category]++;
    });

    return summary;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Global error handling setup
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(
      new Error(`Unhandled promise rejection: ${event.reason}`),
      'high',
      'general',
      { reason: event.reason },
      'An unexpected error occurred'
    );
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorHandler.logError(
      new Error(event.message),
      'high',
      'general',
      { filename: event.filename, lineno: event.lineno, colno: event.colno },
      'An unexpected error occurred'
    );
  });
}

export default errorHandler;