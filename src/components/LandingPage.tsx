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
            className="flex-1 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            style={{ 
              borderRadius: '22px', // Match the SVG border radius
              userSelect: 'none', 
              WebkitUserSelect: 'none' 
            }}
          >
            <svg width="200" height="44" viewBox="0 0 200 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-11">
              <rect x="0" y="0" width="200" height="44" rx="22" ry="22" fill="#000000"/>
              <g fill="#FFFFFF">
                <path d="M12.42 22.01C12.42 21.03 12.65 20.08 13.09 19.16C13.54 18.25 14.19 17.43 15.02 16.71C15.86 15.98 16.88 15.42 18.06 15.02C19.25 14.63 20.59 14.43 22.09 14.43C23.59 14.43 24.93 14.63 26.11 15.02C27.3 15.42 28.32 15.98 29.16 16.71C30 17.43 30.65 18.25 31.09 19.16C31.54 20.08 31.76 21.03 31.76 22.01C31.76 22.99 31.54 23.94 31.09 24.85C30.65 25.77 30 26.59 29.16 27.32C28.32 28.04 27.3 28.6 26.11 28.99C24.93 29.39 23.59 29.58 22.09 29.58C20.59 29.58 19.25 29.39 18.06 28.99C16.88 28.6 15.86 28.04 15.02 27.32C14.19 26.59 13.54 25.77 13.09 24.85C12.65 23.94 12.42 22.99 12.42 22.01ZM22.09 31.6C20.15 31.6 18.42 31.25 16.91 30.56C15.4 29.87 14.13 28.92 13.1 27.7C12.06 26.49 11.23 25.09 10.6 23.5C9.97 21.91 9.66 20.2 9.66 18.37C9.66 16.54 9.97 14.83 10.6 13.24C11.23 11.65 12.06 10.25 13.1 9.04C14.13 7.82 15.4 6.87 16.91 6.18C18.42 5.49 20.15 5.14 22.09 5.14C24.03 5.14 25.76 5.49 27.27 6.18C28.78 6.87 30.05 7.82 31.09 9.04C32.12 10.25 32.95 11.65 33.58 13.24C34.21 14.83 34.52 16.54 34.52 18.37C34.52 20.2 34.21 21.91 33.58 23.5C32.95 25.09 32.12 26.49 31.09 27.7C30.05 28.92 28.78 29.87 27.27 30.56C25.76 31.25 24.03 31.6 22.09 31.6Z" transform="translate(0, -3)"/>
              </g>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
                    fontSize="16" letterSpacing="-0.01em" fontWeight="600">
                Sign in with Apple
              </text>
            </svg>
          </button>
          
          <button 
            onClick={handleGoogleSignIn}
            className="flex-1 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer overflow-hidden"
            style={{ 
              borderRadius: '20px', // Pill shape to match Apple button
              userSelect: 'none', 
              WebkitUserSelect: 'none' 
            }}
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
