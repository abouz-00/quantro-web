"use client";

import * as React from 'react';
import { Poppins } from 'next/font/google';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleAppleSignIn = () => {
    signIn('apple', { callbackUrl: '/dashboard' });
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: '#6e44ff' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null; // Will redirect to dashboard
  }
  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden fixed inset-0" style={{ backgroundColor: '#6e44ff', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div className="text-center px-6 py-4 max-w-2xl mx-auto h-full flex flex-col justify-center pb-32">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-3">
            <img 
              src="/header_logo.svg" 
              alt="Quantro Logo" 
              className="h-32"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-5xl mx-auto">
          <div className="backdrop-blur-sm rounded-xl shadow-lg" style={{ backgroundColor: '#EADFCA', userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="p-6 h-full flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🥗</span>
              </div>
              <div>
                <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${poppins.className}`}>Smart Tracking</h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${poppins.className}`}>Intelligent food logging with comprehensive nutrition data</p>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-sm rounded-xl shadow-lg" style={{ backgroundColor: '#EADFCA', userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="p-6 h-full flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">📊</span>
              </div>
              <div>
                <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${poppins.className}`}>Analytics</h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${poppins.className}`}>Detailed insights into your nutritional patterns</p>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-sm rounded-xl shadow-lg" style={{ backgroundColor: '#EADFCA', userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="p-6 h-full flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <div>
                <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${poppins.className}`}>Goals</h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${poppins.className}`}>Personalized targets and progress tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Buttons */}
        <div className="flex gap-4 justify-center mb-8 max-w-md mx-auto">
          <button 
            onClick={() => {
              // For now, show an alert. In production, integrate with Apple Sign-In SDK
              alert('Apple Sign-In integration coming soon!');
            }}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className={poppins.className}>Sign in with Apple</span>
          </button>
          
          <button 
            onClick={() => {
              // For now, show an alert. In production, integrate with Google Sign-In SDK
              alert('Google Sign-In integration coming soon!');
            }}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className={poppins.className}>Sign in with Google</span>
          </button>
        </div>

        {/* Sign In Buttons */}
        <div className="flex gap-4 justify-center mb-8 max-w-md mx-auto">
          <button 
            onClick={() => {
              // For now, show an alert. In production, integrate with Apple Sign-In SDK
              alert('Apple Sign-In integration coming soon!');
            }}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className={poppins.className}>Sign in with Apple</span>
          </button>
          
          <button 
            onClick={() => {
              // For now, show an alert. In production, integrate with Google Sign-In SDK
              alert('Google Sign-In integration coming soon!');
            }}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className={poppins.className}>Sign in with Google</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <p className={`text-white/70 text-sm ${poppins.className}`}>
            © 2025 Quantro. All rights reserved.
          </p>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <a 
              href="https://x.com/quantroapp" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Follow Quantro on X (Twitter)"
              className="focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="text-white"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>
      </footer>
    </div>
  );
}