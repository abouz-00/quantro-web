import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { errorService, ErrorContext } from '../services/errorService';

export interface UseErrorReportingReturn {
  reportError: (error: Error | string, context?: ErrorContext) => Promise<void>;
  reportWarning: (message: string, context?: ErrorContext) => Promise<void>;
  reportUserAction: (action: string, data?: unknown, context?: ErrorContext) => Promise<void>;
  reportPerformance: (metric: string, value: number, context?: ErrorContext) => Promise<void>;
}

export const useErrorReporting = (): UseErrorReportingReturn => {
  const { data: session } = useSession();

  const getBaseContext = useCallback((): ErrorContext => ({
    userId: session?.user?.id,
    sessionId: session?.user?.email || undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
  }), [session]);

  const reportError = useCallback(async (error: Error | string, context?: ErrorContext) => {
    try {
      const fullContext = { ...getBaseContext(), ...context };
      await errorService.logError(error, fullContext);
    } catch (err) {
      // Silently fail - we don't want error reporting to break the app
      console.warn('Error reporting failed:', err);
    }
  }, [getBaseContext]);

  const reportWarning = useCallback(async (message: string, context?: ErrorContext) => {
    try {
      const fullContext = { ...getBaseContext(), ...context, severity: 'low' as const };
      await errorService.logWarning(message, fullContext);
    } catch (err) {
      // Silently fail - we don't want error reporting to break the app
      console.warn('Warning reporting failed:', err);
    }
  }, [getBaseContext]);

  const reportUserAction = useCallback(async (action: string, data?: unknown, context?: ErrorContext) => {
    try {
      const fullContext = { ...getBaseContext(), ...context };
      await errorService.logUserAction(action, data, fullContext);
    } catch (err) {
      // Silently fail - we don't want error reporting to break the app
      console.warn('User action reporting failed:', err);
    }
  }, [getBaseContext]);

  const reportPerformance = useCallback(async (metric: string, value: number, context?: ErrorContext) => {
    try {
      const fullContext = { ...getBaseContext(), ...context };
      await errorService.logPerformance(metric, value, fullContext);
    } catch (err) {
      // Silently fail - we don't want error reporting to break the app
      console.warn('Performance reporting failed:', err);
    }
  }, [getBaseContext]);

  return {
    reportError,
    reportWarning,
    reportUserAction,
    reportPerformance,
  };
};
