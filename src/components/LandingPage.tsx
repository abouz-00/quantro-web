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
            onClick={handleAppleSignIn}
            className="flex-1 bg-black text-white rounded-lg h-11 px-4 flex items-center justify-center gap-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              userSelect: 'none', 
              WebkitUserSelect: 'none' 
            }}
          >
            <svg width="16" height="20" viewBox="0 0 384 460.8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-43.6-35.5-2.4-74.3 21.2-93.6 21.2-19.7 0-49.4-19.8-81.6-19.1-40.8.6-79.6 25.1-100.9 63.4-43.5 77.6-11.1 192.6 31.3 255.4 20.9 30.4 45.8 64.6 78.6 63.5 31.2-1.1 43.1-20.2 81.2-20.2 37.7 0 49.2 20.2 81.4 19.5 33.9-.5 55.8-30.9 76.8-61.5 24.4-35.8 34.3-70.3 34.6-72.1-.4-.9-82.8-31.7-83-141.2z" fill="white"/>
              <path d="M267.2 69.7c17.6-21.3 29.2-51.4 26.8-81.2-25.9 1.1-56.7 17.4-75.2 39.3-16.4 19.4-30.8 50.9-26.8 80.8 28.3 2.1 57.2-14.4 75.2-38.9z" fill="white"/>
            </svg>
            <span>Sign in with Apple</span>
          </button>
          
          <button 
            onClick={handleGoogleSignIn}
            className="flex-1 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer rounded-lg overflow-hidden"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <img 
              src="/google-signin-official-light.svg" 
              alt="Sign in with Google" 
              className="w-full h-10 object-contain"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />
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
