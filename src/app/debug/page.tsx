"use client";

import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Session Info</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Session Status</h2>
        <p><strong>Status:</strong> {status}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Session Data</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Raw Session Object</h2>
        <p><strong>Session exists:</strong> {session ? "Yes" : "No"}</p>
        <p><strong>User exists:</strong> {session?.user ? "Yes" : "No"}</p>
        {session?.user && (
          <>
            <p><strong>User ID:</strong> {session.user.id}</p>
            <p><strong>User Name:</strong> {session.user.name}</p>
            <p><strong>User Email:</strong> {session.user.email}</p>
          </>
        )}
      </div>
    </div>
  );
}
