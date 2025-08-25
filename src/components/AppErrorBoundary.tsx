/**
 * Global error boundary for the entire application
 */
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { log } from '@/lib/log';
import { storage } from '@/lib/storage';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log the error
    log.error('Global application error:', error, errorInfo);
    
    // Try to save error info for debugging (non-blocking)
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      storage.setItem('fm_last_error_v1', errorReport);
    } catch (storageError) {
      // If storage fails, just log it
      log.warn('Failed to save error report:', storageError);
    }

    // In production, you might want to send to an error reporting service
    if (import.meta.env.PROD) {
      // Example: Sentry, LogRocket, etc.
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  };

  return (
    <ErrorBoundary
      onError={handleGlobalError}
      showDetails={import.meta.env.DEV} // Show details only in development
    >
      {children}
    </ErrorBoundary>
  );
}