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
            className="flex-1 bg-black text-white h-10 px-4 flex items-center justify-center gap-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            style={{ 
              borderRadius: '20px', // Pill shape (half of height)
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              userSelect: 'none', 
              WebkitUserSelect: 'none' 
            }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.4 6.8c-.1-1.5.6-2.6 2-3.4-.7-1.1-1.9-1.7-3.4-1.8-1.4-.1-3 .9-3.8.9-.8 0-2-.8-3.3-.8-1.6.1-3.2 1-4.1 2.6-1.7 3.1-.4 7.7 1.2 10.2.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.3-.8 1.5 0 2 .8 3.3.8 1.4 0 2.2-1.2 3.1-2.4 1-1.4 1.4-2.8 1.4-2.9-.1 0-3.3-1.3-3.3-5.7z" fill="white"/>
              <path d="M10.7 2.8c.7-.8 1.2-2.1 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z" fill="white"/>
            </svg>
            <span>Sign in with Apple</span>
          </button>
          
          <button 
            onClick={handleGoogleSignIn}
            className="flex-1 bg-white text-gray-600 border border-gray-300 h-10 px-4 flex items-center justify-center gap-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
            style={{ 
              borderRadius: '20px', // Pill shape (half of height)
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              userSelect: 'none', 
              WebkitUserSelect: 'none' 
            }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.532 24.552c0-1.414-.126-2.807-.37-4.169H24.48v7.89h12.946c-.558 3.011-2.26 5.565-4.816 7.275v6.024h7.786c4.565-4.205 7.136-10.402 7.136-17.02z" fill="#4285F4"/>
              <path d="M24.48 47.885c6.518 0 11.982-2.162 15.976-5.864l-7.786-6.024c-2.162 1.449-4.927 2.306-8.19 2.306-6.297 0-11.624-4.252-13.527-9.968H2.897v6.218c3.973 7.896 12.127 13.332 21.583 13.332z" fill="#34A853"/>
              <path d="M10.953 28.335c-.484-1.449-.76-2.993-.76-4.583s.276-3.134.76-4.583v-6.218H2.897C1.055 16.207 0 19.992 0 24.048s1.055 7.841 2.897 11.097l8.056-6.81z" fill="#FBBC04"/>
              <path d="M24.48.213c3.358 0 6.37 1.155 8.74 3.421l6.555-6.555C35.456-1.414 30.297-3 24.48-3 15.024-3 6.87 2.436 2.897 10.332l8.056 6.218C12.856 10.834 18.183 6.582 24.48 6.582v-6.369z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
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
