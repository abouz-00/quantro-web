"use client";

import dynamic from 'next/dynamic';
import ErrorBoundary from '../../components/ErrorBoundary';

// Use dynamic import with SSR disabled for the entire page
const LogPage = dynamic(() => import('../../components/log/LogPage'), {
  ssr: false
});

export default function Page() {
  return (
    <ErrorBoundary>
      <LogPage />
    </ErrorBoundary>
  );
}
