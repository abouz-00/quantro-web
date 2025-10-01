"use client";

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ErrorBoundary } from '../../components/shared';

// Use dynamic import with SSR disabled for the entire page
const LogPage = dynamic(() => import('../../components/log/LogPage'), {
  ssr: false
});

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: '#6e44ff' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ErrorBoundary>
      <LogPage />
    </ErrorBoundary>
  );
}
