"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface DebugError {
  type: string;
  message: string;
  timestamp: string;
  filename?: string;
  lineno?: number;
  error?: string;
}

interface LocalStorageData {
  foodLogSelectedDate: string | null;
  authToken: 'present' | 'missing';
  keys: string[];
  error?: string;
}

interface DebugInfo {
  session: {
    status: string;
    user: Session['user'] | undefined;
    expires: string | undefined;
  } | null;
  environment: string;
  timestamp: string;
  localStorage: LocalStorageData | { error: string };
  apiStatus: 'checking' | 'success' | 'error';
  apiMessage: string;
  errors: DebugError[];
}

// Extend Window interface for debug properties
declare global {
  interface Window {
    __debugErrors?: DebugError[];
  }
}

export default function DebugPanel() {
  const { data: session, status } = useSession();
  const sessionSnapshot = useMemo(() => ({
    status,
    user: session?.user,
    expires: session?.expires
  }), [
    status,
    session?.expires,
    session?.user
  ]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    session: null,
    environment: 'unknown',
    timestamp: new Date().toISOString(),
    localStorage: { error: 'Not loaded yet' },
    apiStatus: 'checking',
    apiMessage: '',
    errors: []
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isActive = true;

    const updateDebugInfo = async () => {
      try {
        // Check API status
        const response = await fetch('/api/auth/session');
        await response.json();
        
        // Get localStorage data safely
        let localStorageData: LocalStorageData | { error: string } = { error: 'Cannot access localStorage' };
        try {
          if (typeof window !== 'undefined') {
            localStorageData = {
              foodLogSelectedDate: localStorage.getItem('foodLogSelectedDate'),
              authToken: localStorage.getItem('next-auth.session-token') ? 'present' : 'missing',
              keys: Object.keys(localStorage)
            };
          }
        } catch {
          // Keep the default error object
        }

        if (!isActive) {
          return;
        }

        setDebugInfo({
          session: sessionSnapshot,
          environment: process.env.NODE_ENV || 'unknown',
          timestamp: new Date().toISOString(),
          localStorage: localStorageData,
          apiStatus: response.ok ? 'success' : 'error',
          apiMessage: response.ok ? 'API responding' : `API error: ${response.status}`,
          errors: window.__debugErrors || []
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setDebugInfo(prev => ({
          ...prev,
          apiStatus: 'error',
          apiMessage: `API check failed: ${error}`,
          errors: [...prev.errors, { type: 'api-check', message: String(error), timestamp: new Date().toISOString() }]
        }));
      }
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000); // Update every 5 seconds

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [sessionSnapshot]);

  // Add global error handler
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Enhance console methods to capture errors
    console.error = (...args) => {
      originalConsoleError(...args);
      if (typeof window !== 'undefined') {
        window.__debugErrors = window.__debugErrors || [];
        window.__debugErrors.push({
          type: 'console.error',
          message: args.map(arg => String(arg)).join(' '),
          timestamp: new Date().toISOString()
        });
      }
    };

    console.warn = (...args) => {
      originalConsoleWarn(...args);
      if (typeof window !== 'undefined') {
        window.__debugErrors = window.__debugErrors || [];
        window.__debugErrors.push({
          type: 'console.warn',
          message: args.map(arg => String(arg)).join(' '),
          timestamp: new Date().toISOString()
        });
      }
    };

    // Global error handler
    const handleError = (event: ErrorEvent) => {
      if (typeof window !== 'undefined') {
        window.__debugErrors = window.__debugErrors || [];
        window.__debugErrors.push({
          type: 'uncaught-error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          timestamp: new Date().toISOString()
        });
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-1/2 right-4 -translate-y-1/2 z-50 bg-red-500 text-white px-3 py-1 rounded text-xs font-mono"
        style={{ zIndex: 9999 }}
      >
        DEBUG
      </button>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-80 z-50 overflow-auto" style={{ zIndex: 9999 }}>
      <div className="bg-white m-4 p-4 rounded max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Debug Panel</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 font-mono text-sm">
          <div>
            <h3 className="font-bold">Environment:</h3>
            <pre>{debugInfo.environment}</pre>
          </div>

          <div>
            <h3 className="font-bold">Timestamp:</h3>
            <pre>{debugInfo.timestamp}</pre>
          </div>

          <div>
            <h3 className="font-bold">Session Status:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(debugInfo.session, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-bold">API Status:</h3>
            <pre className={`p-2 rounded ${debugInfo.apiStatus === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {debugInfo.apiMessage}
            </pre>
          </div>

          <div>
            <h3 className="font-bold">LocalStorage:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(debugInfo.localStorage, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-bold">Errors ({debugInfo.errors.length}):</h3>
            <div className="bg-red-50 p-2 rounded overflow-auto max-h-40">
              {debugInfo.errors.length > 0 ? (
                debugInfo.errors.slice(-10).map((error, index) => (
                  <div key={index} className="border-b border-red-200 py-1">
                    <div className="font-bold text-red-600">{error.type}</div>
                    <div className="text-xs text-gray-500">{error.timestamp}</div>
                    <pre className="text-xs overflow-x-auto">{JSON.stringify(error, null, 2)}</pre>
                  </div>
                ))
              ) : (
                <div>No errors captured</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold">Test Actions:</h3>
            <div className="space-x-2">
              <button
                onClick={() => console.log('Test log message')}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                Test Console
              </button>
              <button
                onClick={() => console.error('Test error message')}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Test Error
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/food-logs?date=2025-09-01');
                    console.log('API test response:', response.status, await response.text());
                  } catch (error) {
                    console.error('API test failed:', error);
                  }
                }}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
              >
                Test API
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.__debugErrors = [];
                    setDebugInfo(prev => ({ ...prev, errors: [] }));
                  }
                }}
                className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
              >
                Clear Errors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
