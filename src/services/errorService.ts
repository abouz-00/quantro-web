/**
 * Centralized error handling and logging service
 */

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'network' | 'validation' | 'auth' | 'database' | 'ui' | 'api';
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  context?: ErrorContext;
  fingerprint?: string;
}

class ErrorService {
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';
  private errorQueue: ErrorReport[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  /**
   * Log an error to multiple destinations (non-blocking)
   */
  async logError(error: Error | string, context?: ErrorContext): Promise<void> {
    const errorReport: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context: {
        ...context,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      },
      fingerprint: this.generateFingerprint(error, context),
    };

    // Log to console in development
    if (this.isDevelopment) {
      console.error('🚨 Error Report:', errorReport);
    }

    // Send to logging services asynchronously without blocking
    this.sendErrorsAsync(errorReport);
  }

  /**
   * Send errors asynchronously without blocking the main thread
   */
  private sendErrorsAsync(errorReport: ErrorReport): void {
    // Add to queue for batching
    this.errorQueue.push(errorReport);
    
    // Flush immediately if queue is full, otherwise wait for timer
    if (this.errorQueue.length >= this.BATCH_SIZE) {
      this.flushErrors();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushErrors();
      }, this.FLUSH_INTERVAL);
    }
  }

  /**
   * Flush queued errors in batch
   */
  private flushErrors(): void {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Send batched errors
    setTimeout(async () => {
      try {
        await Promise.allSettled([
          this.sendBatchToSentry(errors),
          this.sendBatchToServerLogs(errors),
          this.sendBatchToAnalytics(errors),
        ]);
      } catch (err) {
        // Silently fail - we don't want error reporting to break the app
        console.warn('Error reporting failed:', err);
      }
    }, 0);
  }

  /**
   * Log a warning (non-critical issue) - non-blocking
   */
  logWarning(message: string, context?: ErrorContext): void {
    // Make warnings non-blocking
    this.logError(message, { ...context, severity: 'low' });
  }

  /**
   * Log performance issues - non-blocking
   */
  logPerformance(metric: string, value: number, context?: ErrorContext): void {
    const perfReport = {
      metric,
      value,
      context: {
        ...context,
        category: 'performance' as const,
        timestamp: Date.now(),
      },
    };

    if (this.isDevelopment) {
      console.warn('⚠️ Performance Issue:', perfReport);
    }

    // Send async without blocking
    setTimeout(() => {
      this.sendToAnalytics(perfReport).catch(() => {
        // Silently fail
      });
    }, 0);
  }

  /**
   * Log user interactions for debugging - non-blocking
   */
  logUserAction(action: string, data?: unknown, context?: ErrorContext): void {
    const actionReport = {
      action,
      data,
      context: {
        ...context,
        category: 'user-action' as const,
        timestamp: Date.now(),
      },
    };

    if (this.isDevelopment) {
      console.log('👤 User Action:', actionReport);
    }

    // Send async without blocking
    setTimeout(() => {
      this.sendToAnalytics(actionReport).catch(() => {
        // Silently fail
      });
    }, 0);
  }

  /**
   * Generate a unique fingerprint for error grouping
   */
  private generateFingerprint(error: Error | string, context?: ErrorContext): string {
    const message = typeof error === 'string' ? error : error.message;
    const category = context?.category || 'unknown';
    const url = context?.url || 'unknown';
    
    // Create a hash-like string for grouping similar errors
    return `${category}-${message.slice(0, 50)}-${url.split('/').pop()}`;
  }

  /**
   * Send batch of errors to Sentry
   */
  private async sendBatchToSentry(errors: ErrorReport[]): Promise<void> {
    if (!this.isProduction) return;

    try {
      await fetch('/api/errors/sentry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors }),
      });
    } catch (err) {
      console.error('Failed to send batch to Sentry:', err);
    }
  }

  /**
   * Send batch of errors to server logs
   */
  private async sendBatchToServerLogs(errors: ErrorReport[]): Promise<void> {
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors }),
      });
    } catch (err) {
      console.error('Failed to send batch to server logs:', err);
    }
  }

  /**
   * Send batch to analytics
   */
  private async sendBatchToAnalytics(errors: ErrorReport[]): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'error_batch',
          data: errors.map(error => ({
            message: error.message,
            category: error.context?.category,
            severity: error.context?.severity,
            timestamp: error.context?.timestamp,
          }))
        }),
      });
    } catch (err) {
      console.error('Failed to send batch to analytics:', err);
    }
  }

  /**
   * Send error to Sentry (or similar service)
   */
  private async sendToSentry(errorReport: ErrorReport): Promise<void> {
    if (!this.isProduction) return;

    try {
      // In production, you'd initialize Sentry and use it here
      // For now, we'll use a mock implementation
      await fetch('/api/errors/sentry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      });
    } catch (err) {
      console.error('Failed to send error to Sentry:', err);
    }
  }

  /**
   * Send error to server logs
   */
  private async sendToServerLogs(errorReport: ErrorReport): Promise<void> {
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      });
    } catch (err) {
      console.error('Failed to send error to server logs:', err);
      // Store in localStorage as fallback
      this.storeErrorLocally(errorReport);
    }
  }

  /**
   * Send analytics data
   */
  private async sendToAnalytics(data: unknown): Promise<void> {
    if (!this.isProduction) return;

    try {
      // Send to analytics service (Google Analytics, Mixpanel, etc.)
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Failed to send to analytics:', err);
    }
  }

  /**
   * Store error locally as fallback
   */
  private storeErrorLocally(errorReport: ErrorReport): void {
    try {
      const stored = localStorage.getItem('quantro_errors') || '[]';
      const errors = JSON.parse(stored);
      errors.push(errorReport);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('quantro_errors', JSON.stringify(errors));
    } catch (err) {
      console.error('Failed to store error locally:', err);
    }
  }

  /**
   * Get locally stored errors
   */
  getStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('quantro_errors') || '[]';
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Clear locally stored errors
   */
  clearStoredErrors(): void {
    localStorage.removeItem('quantro_errors');
  }
}

// Export singleton instance
export const errorService = new ErrorService();

// Global error handlers
if (typeof window !== 'undefined') {
  // Catch unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    errorService.logError(event.error || event.message, {
      severity: 'high',
      category: 'ui',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorService.logError(event.reason || 'Unhandled promise rejection', {
      severity: 'high',
      category: 'network',
      metadata: {
        type: 'unhandled_promise_rejection',
      },
    });
  });

  // Monitor performance issues
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation' && entry.duration > 3000) {
          errorService.logPerformance('slow_page_load', entry.duration, {
            severity: 'medium',
            metadata: { navigationTiming: entry },
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
  }
}
