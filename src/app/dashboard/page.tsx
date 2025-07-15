"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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
    <div className="min-h-screen" style={{ backgroundColor: '#6e44ff' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img 
              src="/quantro_header.svg" 
              alt="Quantro Logo" 
              className="h-12"
              style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.1))'
              }}
            />
            <h1 className={`text-2xl font-bold text-white ${poppins.className}`}>
              Welcome to Quantro, {session.user?.name || session.user?.email}!
            </h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-gray-100 transition-colors ${poppins.className}`}
          >
            Sign Out
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-4 mb-4">
            {session.user?.image && (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className={`text-xl font-semibold text-gray-800 ${poppins.className}`}>
                {session.user?.name || "User"}
              </h2>
              <p className={`text-gray-600 ${poppins.className}`}>
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">🥗</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${poppins.className}`}>
              Food Logging
            </h3>
            <p className={`text-gray-600 text-sm ${poppins.className}`}>
              Start tracking your meals and nutrition
            </p>
            <button 
              onClick={() => router.push("/log")}
              className={`mt-4 w-full px-4 py-2 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors ${poppins.className}`}
            >
              Start Logging
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">📊</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${poppins.className}`}>
              Analytics
            </h3>
            <p className={`text-gray-600 text-sm ${poppins.className}`}>
              View your nutrition insights
            </p>
            <button className={`mt-4 w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed ${poppins.className}`}>
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${poppins.className}`}>
              Goals
            </h3>
            <p className={`text-gray-600 text-sm ${poppins.className}`}>
              Set and track your nutrition goals
            </p>
            <button className={`mt-4 w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed ${poppins.className}`}>
              Coming Soon
            </button>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className={`font-semibold text-gray-800 mb-4 text-lg ${poppins.className}`}>
            Getting Started
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className={`text-gray-700 ${poppins.className}`}>
                Account created successfully
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">2</span>
              </div>
              <span className={`text-gray-700 ${poppins.className}`}>
                Log your first meal to get personalized insights
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm">3</span>
              </div>
              <span className={`text-gray-500 ${poppins.className}`}>
                Set your nutrition goals and track progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
