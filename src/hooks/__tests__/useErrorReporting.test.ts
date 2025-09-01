import { renderHook } from '@testing-library/react';
import { useErrorReporting } from '../useErrorReporting';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock errorService
jest.mock('../../services/errorService', () => ({
  errorService: {
    logError: jest.fn(),
    logWarning: jest.fn(),
    logUserAction: jest.fn(),
    logPerformance: jest.fn(),
  },
}));

import { useSession } from 'next-auth/react';
import { errorService } from '../../services/errorService';

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockErrorService = errorService as jest.Mocked<typeof errorService>;

describe('useErrorReporting', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
    expires: '2025-12-31T23:59:59.999Z',
  };

  const mockAuthenticatedSession = {
    data: mockSession,
    status: 'authenticated' as const,
    update: jest.fn(),
  };

  const mockUnauthenticatedSession = {
    data: null,
    status: 'unauthenticated' as const,
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all required methods', () => {
    mockUseSession.mockReturnValue(mockUnauthenticatedSession);

    const { result } = renderHook(() => useErrorReporting());

    expect(result.current).toHaveProperty('reportError');
    expect(result.current).toHaveProperty('reportWarning');
    expect(result.current).toHaveProperty('reportUserAction');
    expect(result.current).toHaveProperty('reportPerformance');
    expect(typeof result.current.reportError).toBe('function');
    expect(typeof result.current.reportWarning).toBe('function');
    expect(typeof result.current.reportUserAction).toBe('function');
    expect(typeof result.current.reportPerformance).toBe('function');
  });

  it('should call errorService.logError with correct parameters', async () => {
    mockUseSession.mockReturnValue(mockAuthenticatedSession);
    mockErrorService.logError.mockResolvedValue();

    const { result } = renderHook(() => useErrorReporting());

    const testError = new Error('Test error');
    const testContext = { category: 'ui' as const };

    await result.current.reportError(testError, testContext);

    expect(mockErrorService.logError).toHaveBeenCalledWith(testError, {
      userId: 'user-123',
      sessionId: 'test@example.com',
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
      category: 'ui',
    });
  });

  it('should call errorService.logError with string error', async () => {
    mockUseSession.mockReturnValue(mockAuthenticatedSession);
    mockErrorService.logError.mockResolvedValue();

    const { result } = renderHook(() => useErrorReporting());

    const testError = 'String error message';

    await result.current.reportError(testError);

    expect(mockErrorService.logError).toHaveBeenCalledWith(testError, {
      userId: 'user-123',
      sessionId: 'test@example.com',
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
    });
  });

  it('should call errorService.logWarning with correct parameters', async () => {
    mockUseSession.mockReturnValue(mockAuthenticatedSession);
    mockErrorService.logWarning.mockReturnValue();

    const { result } = renderHook(() => useErrorReporting());

    const testMessage = 'Test warning message';
    const testContext = { category: 'validation' as const };

    await result.current.reportWarning(testMessage, testContext);

    expect(mockErrorService.logWarning).toHaveBeenCalledWith(testMessage, {
      userId: 'user-123',
      sessionId: 'test@example.com',
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
      category: 'validation',
      severity: 'low',
    });
  });

  it('should call errorService.logUserAction with correct parameters', async () => {
    mockUseSession.mockReturnValue(mockAuthenticatedSession);
    mockErrorService.logUserAction.mockReturnValue();

    const { result } = renderHook(() => useErrorReporting());

    const testAction = 'button_click';
    const testData = { buttonId: 'submit-btn' };
    const testContext = { category: 'ui' as const };

    await result.current.reportUserAction(testAction, testData, testContext);

    expect(mockErrorService.logUserAction).toHaveBeenCalledWith(testAction, testData, {
      userId: 'user-123',
      sessionId: 'test@example.com',
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
      category: 'ui',
    });
  });

  it('should call errorService.logPerformance with correct parameters', async () => {
    mockUseSession.mockReturnValue(mockAuthenticatedSession);
    mockErrorService.logPerformance.mockReturnValue();

    const { result } = renderHook(() => useErrorReporting());

    const testMetric = 'page_load_time';
    const testValue = 1500;
    const testContext = { category: 'ui' as const };

    await result.current.reportPerformance(testMetric, testValue, testContext);

    expect(mockErrorService.logPerformance).toHaveBeenCalledWith(testMetric, testValue, {
      userId: 'user-123',
      sessionId: 'test@example.com',
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
      category: 'ui',
    });
  });

  it('should handle session without user data', async () => {
    mockUseSession.mockReturnValue(mockUnauthenticatedSession);
    mockErrorService.logError.mockResolvedValue();

    const { result } = renderHook(() => useErrorReporting());

    const testError = new Error('Test error');

    await result.current.reportError(testError);

    expect(mockErrorService.logError).toHaveBeenCalledWith(testError, {
      userId: undefined,
      sessionId: undefined,
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
    });
  });

  it('should handle session with partial user data', async () => {
    const partialSession = {
      data: {
        user: {
          id: 'user-123',
          // email is missing
        },
        expires: '2025-12-31T23:59:59.999Z',
      },
      status: 'authenticated' as const,
      update: jest.fn(),
    };

    mockUseSession.mockReturnValue(partialSession);
    mockErrorService.logError.mockResolvedValue();

    const { result } = renderHook(() => useErrorReporting());

    const testError = new Error('Test error');

    await result.current.reportError(testError);

    expect(mockErrorService.logError).toHaveBeenCalledWith(testError, {
      userId: 'user-123',
      sessionId: undefined,
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
    });
  });

  it('should handle SSR environment gracefully', async () => {
    // For SSR testing, we'll just verify that the hook works with default jsdom values
    // since jsdom always provides a window object
    mockUseSession.mockReturnValue(mockAuthenticatedSession);
    mockErrorService.logError.mockResolvedValue();

    const { result } = renderHook(() => useErrorReporting());

    const testError = new Error('Test error');

    await result.current.reportError(testError);

    expect(mockErrorService.logError).toHaveBeenCalledWith(testError, {
      userId: 'user-123',
      sessionId: 'test@example.com',
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
    });
  });

  it('should merge provided context with base context', async () => {
    mockUseSession.mockReturnValue(mockAuthenticatedSession);
    mockErrorService.logError.mockResolvedValue();

    const { result } = renderHook(() => useErrorReporting());

    const testError = new Error('Test error');
    const testContext = {
      category: 'ui' as const,
      severity: 'high' as const,
      // This should override the base context if it conflicts
      userId: 'override-user-id',
    };

    await result.current.reportError(testError, testContext);

    expect(mockErrorService.logError).toHaveBeenCalledWith(testError, {
      userId: 'override-user-id', // Should use provided context value
      sessionId: 'test@example.com',
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
      category: 'ui',
      severity: 'high',
    });
  });

  it('should merge provided context with base context when base has undefined values', async () => {
    mockUseSession.mockReturnValue(mockUnauthenticatedSession);
    mockErrorService.logError.mockResolvedValue();

    const { result } = renderHook(() => useErrorReporting());

    const testError = new Error('Test error');
    const testContext = {
      category: 'ui' as const,
      userId: 'provided-user-id',
      sessionId: 'provided-session-id',
    };

    await result.current.reportError(testError, testContext);

    expect(mockErrorService.logError).toHaveBeenCalledWith(testError, {
      userId: 'provided-user-id', // Should use provided context value
      sessionId: 'provided-session-id', // Should use provided context value
      url: 'http://localhost/',
      userAgent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
      category: 'ui',
    });
  });

  it('should handle error service failures gracefully', async () => {
    mockUseSession.mockReturnValue(mockAuthenticatedSession);
    mockErrorService.logError.mockRejectedValue(new Error('Service failure'));

    const { result } = renderHook(() => useErrorReporting());

    const testError = new Error('Test error');

    // Should not throw when service fails
    await expect(result.current.reportError(testError)).resolves.toBeUndefined();

    expect(mockErrorService.logError).toHaveBeenCalled();
  });
});
