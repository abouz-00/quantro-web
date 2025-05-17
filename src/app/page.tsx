"use client";

import dynamic from 'next/dynamic';
import ErrorBoundary from '../components/ErrorBoundary';

// Use dynamic import with SSR disabled for the entire LogPage
const LogPage = dynamic(() => import('../components/log/LogPage'), {
  ssr: false
});

export default function Home() {
  return (
    <div className="bg-[#F5F0E7] min-h-screen">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-violet-600">Quantro</h1>
          <div>
            {/* Add navigation or user controls here if needed */}
          </div>
        </div>
      </header>
      
      <main>
        <ErrorBoundary>
          <LogPage />
        </ErrorBoundary>
      </main>
      
      <footer className="container mx-auto px-6 py-4 text-center text-sm text-gray-500 mt-8">
        © {new Date().getFullYear()} Quantro - Track your nutrition
      </footer>
    </div>
  );
}