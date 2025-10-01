"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import InviteHandler from './invite-handler';
import DashboardPage from '../../components/dashboard';

export default function Dashboard() {
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
    <>
      <InviteHandler />
      <DashboardPage session={session} />
    </>
  );
}
