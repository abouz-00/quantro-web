"use client";

import { useSession } from "next-auth/react";
import InviteHandler from './invite-handler';
import DashboardPage from '../../../components/dashboard';

export default function Dashboard() {
  const { data: session } = useSession();

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
