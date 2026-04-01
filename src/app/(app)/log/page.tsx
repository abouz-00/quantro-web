"use client";

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { ErrorBoundary } from '../../../components/shared';

const LogPage = dynamic(() => import('../../../components/log/LogPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: '#F5F0E7' }}>
      <div className="w-full h-16 shadow-sm" style={{ backgroundColor: '#6e44ff' }} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="h-8 w-48 bg-black/5 rounded-lg" />
        <div className="bg-white rounded-xl h-48 shadow-lg" />
        <div className="bg-white rounded-xl h-64 shadow-lg" />
      </div>
    </div>
  ),
});

export default function Page() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <ErrorBoundary>
      <LogPage />
    </ErrorBoundary>
  );
}
