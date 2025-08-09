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
    const fullContext = { ...getBaseContext(), ...context };
    await errorService.logError(error, fullContext);
  }, [getBaseContext]);

  const reportWarning = useCallback(async (message: string, context?: ErrorContext) => {
    const fullContext = { ...getBaseContext(), ...context, severity: 'low' as const };
    await errorService.logWarning(message, fullContext);
  }, [getBaseContext]);

  const reportUserAction = useCallback(async (action: string, data?: unknown, context?: ErrorContext) => {
    const fullContext = { ...getBaseContext(), ...context };
    await errorService.logUserAction(action, data, fullContext);
  }, [getBaseContext]);

  const reportPerformance = useCallback(async (metric: string, value: number, context?: ErrorContext) => {
    const fullContext = { ...getBaseContext(), ...context };
    await errorService.logPerformance(metric, value, fullContext);
  }, [getBaseContext]);

  return {
    reportError,
    reportWarning,
    reportUserAction,
    reportPerformance,
  };
};
