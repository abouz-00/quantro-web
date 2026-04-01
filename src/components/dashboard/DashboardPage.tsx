"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import Image from 'next/image';
import { useDateManager } from '../../hooks/useDateManager';
import { useFoodData } from '../../hooks/useFoodData';
import { useGoals } from '../../hooks/useGoals';

interface DashboardPageProps {
  session: Session;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function NutrientBar({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOver = current > goal;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-sm tabular-nums ${isOver ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
          {Math.round(current)} / {goal}{label !== 'Calories' ? 'g' : ''}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: isOver ? '#ef4444' : color }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage({ session }: DashboardPageProps) {
  const router = useRouter();

  const { selectedDate, formatApiDate } = useDateManager({ defaultToTodayOnRefresh: true });
  const { totals } = useFoodData(selectedDate, formatApiDate);
  const { customGoals } = useGoals();

  const firstName = session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0] || 'there';
  const greeting = getGreeting();
  const hasLoggedToday = totals.calories > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E7' }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-6 shadow-sm rounded-b-3xl" style={{ backgroundColor: '#6e44ff' }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="p-1 rounded-lg transition-all duration-200 cursor-pointer"
          aria-label="Go to Dashboard"
        >
          <Image
            src="/header.svg"
            alt="Quantro Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.1))',
              maxHeight: '2rem'
            }}
            priority
          />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 text-sm font-medium text-[#6e44ff] bg-white hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
        >
          Sign Out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Greeting */}
        <div className="pt-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-gray-500 text-lg">
            {hasLoggedToday ? "Here\u2019s your progress today." : "Ready to start tracking today?"}
          </p>
        </div>

        {/* Today's Overview Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Overview</h2>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="space-y-4">
            <NutrientBar label="Calories" current={totals.calories} goal={customGoals.calories} color="#FF9F1C" />
            <NutrientBar label="Protein" current={totals.protein} goal={customGoals.protein} color="#8BC34A" />
            <NutrientBar label="Carbs" current={totals.carbs} goal={customGoals.carbs} color="#4ECDC4" />
            <NutrientBar label="Fat" current={totals.fat} goal={customGoals.fat} color="#FF6B6B" />
          </div>

          <button
            onClick={() => router.push("/log")}
            className="mt-6 w-full py-3 bg-[#6e44ff] hover:bg-[#5a35d4] text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {hasLoggedToday ? 'Continue Logging' : 'Log Your First Meal'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/log")}
            className="group bg-white rounded-2xl p-5 shadow-lg text-left hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3 group-hover:bg-violet-200 transition-colors">
              <span className="text-xl">🥗</span>
            </div>
            <h3 className="font-semibold text-gray-900">Food Logging</h3>
            <p className="text-sm text-gray-500 mt-1">Track your meals and nutrition</p>
          </button>

          <div className="relative bg-white/60 rounded-2xl p-5 shadow-lg">
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">Soon</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-xl opacity-50">📊</span>
            </div>
            <h3 className="font-semibold text-gray-400">Analytics</h3>
            <p className="text-sm text-gray-400 mt-1">View nutrition insights</p>
          </div>

          <div className="relative bg-white/60 rounded-2xl p-5 shadow-lg">
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">Soon</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-xl opacity-50">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-400">Goals</h3>
            <p className="text-sm text-gray-400 mt-1">Set and track your targets</p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Account created successfully</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${hasLoggedToday ? 'bg-green-500' : 'bg-[#6e44ff]'}`}>
                {hasLoggedToday ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white text-xs font-bold">2</span>
                )}
              </div>
              <span className={hasLoggedToday ? 'text-gray-700' : 'text-gray-700 font-medium'}>
                Log your first meal to get personalized insights
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 text-xs font-bold">3</span>
              </div>
              <span className="text-gray-400">
                Set your nutrition goals and track progress
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
