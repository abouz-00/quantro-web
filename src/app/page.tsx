"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '../components/ErrorBoundary';
import LandingPage from '../components/LandingPage';

// Use dynamic import with SSR disabled for the entire LogPage
const LogPage = dynamic(() => import('../components/log/LogPage'), {
  ssr: false
});

export default function Home() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only allow access in development environment
    if (process.env.NODE_ENV === 'development') {
      const accessKey = localStorage.getItem('quantro_access');
      const urlParams = new URLSearchParams(window.location.search);
      const urlKey = urlParams.get('key');
      
      // Allow access if they have the key in localStorage or URL
      if (accessKey === 'dev-access' || urlKey === 'dev-access') {
        setHasAccess(true);
        if (urlKey === 'dev-access') {
          localStorage.setItem('quantro_access', 'dev-access');
        }
      }
    }
    // In production, hasAccess stays false (no access to LogPage)
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for public, log page for authorized users (dev only)
  if (hasAccess) {
    return (
      <ErrorBoundary>
        <LogPage />
      </ErrorBoundary>
    );
  }

  return <LandingPage />;
}