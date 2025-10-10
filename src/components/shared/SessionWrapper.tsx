"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { useAuthSync } from "../../hooks/useAuthSync";

interface SessionWrapperProps {
  children: ReactNode;
}

// Inner component that uses the auth sync hook
function AuthSyncWrapper({ children }: { children: ReactNode }) {
  useAuthSync(); // Sync NextAuth session with Zustand store
  return <>{children}</>;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gains focus
    >
      <AuthSyncWrapper>
        {children}
      </AuthSyncWrapper>
    </SessionProvider>
  );
}
