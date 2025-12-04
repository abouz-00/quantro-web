import React, { useState, useEffect } from 'react';
import { errorService } from '@/services/errorService';

interface ErrorReport {
  message: string;
  stack?: string;
  context?: {
    timestamp?: number;
    severity?: string;
    category?: string;
    url?: string;
    userId?: string;
  };
  fingerprint?: string;
}

export const ErrorMonitoringDashboard: React.FC = () => {
  // Initialize state with computed values to avoid effect setState
  const [errors, setErrors] = useState<ErrorReport[]>(() => errorService.getStoredErrors());
  const [isVisible, setIsVisible] = useState(() => {
    const storedErrors = errorService.getStoredErrors();
    const hasCriticalErrors = storedErrors.some((error: ErrorReport) => 
      error.context?.severity === 'critical' || error.context?.severity === 'high'
    );
    return process.env.NODE_ENV === 'development' || hasCriticalErrors;
  });

  const clearErrors = () => {
    errorService.clearStoredErrors();
    setErrors([]);
    setIsVisible(false);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'network': return '🌐';
      case 'validation': return '⚠️';
      case 'auth': return '🔐';
      case 'database': return '💾';
      case 'ui': return '🖥️';
      case 'api': return '🔌';
      default: return '❓';
    }
  };

  if (!isVisible || errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          🚨 Error Monitor
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            {errors.length}
          </span>
        </h3>
        <div className="flex gap-1">
          <button
            onClick={clearErrors}
            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto p-2">
        {errors.slice(0, 10).map((error, index) => (
          <div
            key={`${error.fingerprint}-${index}`}
            className="mb-2 p-2 border border-gray-200 rounded text-xs"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1">
                <span>{getCategoryIcon(error.context?.category)}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(error.context?.severity)}`}
                >
                  {error.context?.severity || 'unknown'}
                </span>
              </div>
              {error.context?.timestamp && (
                <span className="text-gray-500 text-xs">
                  {new Date(error.context.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            
            <div className="text-gray-800 font-medium mb-1 line-clamp-2">
              {error.message}
            </div>
            
            {error.context?.url && (
              <div className="text-gray-600 text-xs mb-1 truncate">
                📍 {error.context.url}
              </div>
            )}
            
            {error.context?.userId && (
              <div className="text-gray-600 text-xs">
                👤 User: {error.context.userId}
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && error.stack && (
              <details className="mt-1">
                <summary className="cursor-pointer text-gray-600 text-xs">
                  Stack trace
                </summary>
                <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap max-h-20 overflow-y-auto bg-gray-100 p-1 rounded">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        ))}
        
        {errors.length > 10 && (
          <div className="text-center text-gray-500 text-xs py-2">
            ... and {errors.length - 10} more errors
          </div>
        )}
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 border-t border-gray-200 bg-gray-50 rounded-b-lg text-xs text-gray-600">
          💡 This dashboard is visible in development mode and when critical errors occur.
        </div>
      )}
    </div>
  );
};
