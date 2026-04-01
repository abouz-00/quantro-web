"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthErrorPage } from '../../../components/auth';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return <AuthErrorPage error={error} />;
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-primary">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
