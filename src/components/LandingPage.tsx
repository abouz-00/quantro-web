"use client";

import * as React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function LandingPage() {
  const { status } = useSession();
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
            <Image 
              src="/quantro_header.svg" 
              alt="Quantro Logo" 
              className="h-144"
              width={576}
              height={576}
              style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.05))'
              }}
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
        <div className="flex gap-4 justify-center mb-8 max-w-md mx-auto items-center">
          <button 
            onClick={handleAppleSignIn}
            className="flex-1 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer overflow-hidden flex items-center justify-center"
            style={{ 
              borderRadius: '8px',
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              height: '40px',
              minWidth: '0',
              width: '100%'
            }}
          >
            <svg width="100%" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain">
              <rect x="0" y="0" width="200" height="40" rx="8" ry="8" fill="#000000"/>
              <g fill="#FFFFFF">
                {/* Apple Logo */}
                <g transform="translate(16, 10) scale(0.75)">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.037-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
                  <path d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.883-1.454 2.298-1.273 3.649 1.338.104 2.715-.688 3.56-1.637z"/>
                </g>
              </g>
              <text x="110" y="65%" textAnchor="middle" dominantBaseline="alphabetic" fill="#FFFFFF"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
                    fontSize="18" letterSpacing="-0.01em" fontWeight="400">
                Sign in with Apple
              </text>
            </svg>
          </button>
          
          <button 
            onClick={handleGoogleSignIn}
            className="flex-1 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer overflow-hidden flex items-center justify-center"
            style={{ 
              borderRadius: '20px',
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              height: '40px',
              minWidth: '0',
              width: '100%'
            }}
          >
            <Image 
              src="/google-signin-official-light.svg" 
              alt="Sign in with Google" 
              className="w-full h-full object-contain"
              width={200}
              height={40}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-8 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <p className={`text-white/70 text-sm ${poppins.className}`}>
            © 2025 Quantro. All rights reserved.
          </p>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-end justify-center gap-6">
              <a 
                href="https://x.com/quantroapp" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow Quantro on X (Twitter)"
                className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-end"
              >
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="text-white" 
                  style={{ width: '32px', height: '32px', display: 'block' }}
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/quantro_app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Quantro on Instagram"
                className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-end"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 32 32" className="text-white" style={{ width: '32px', height: '32px', display: 'block' }} aria-hidden="true">
                  <path d="M16 0C11.658 0 11.112.02 9.406.096 7.7.172 6.538.444 5.52.84a7.8 7.8 0 0 0-2.834 1.846A7.8 7.8 0 0 0 .84 5.52C.444 6.538.172 7.7.096 9.406.02 11.112 0 11.654 0 16.002c0 4.342.02 4.884.096 6.59.076 1.706.348 2.868.744 3.886.41 1.052.956 1.944 1.846 2.834a7.8 7.8 0 0 0 2.834 1.846c1.018.396 2.18.668 3.886.744C11.112 31.98 11.654 32 16 32s4.884-.02 6.59-.096c1.706-.076 2.868-.348 3.886-.744a7.8 7.8 0 0 0 2.834-1.846c.89-.89 1.436-1.782 1.846-2.834.394-1.018.666-2.18.744-3.886C31.98 20.886 32 20.344 32 16s-.02-4.886-.096-6.594c-.076-1.706-.35-2.868-.744-3.886a7.8 7.8 0 0 0-1.846-2.834A7.8 7.8 0 0 0 26.48.84c-1.018-.396-2.18-.668-3.886-.744C20.886.02 20.344 0 16 0zm-1.434 2.884h1.436c4.272 0 4.778.014 6.464.092 1.56.07 2.408.332 2.972.55.746.29 1.28.638 1.84 1.198.56.56.908 1.092 1.198 1.84.218.564.48 1.412.55 2.972.078 1.686.094 2.192.094 6.464s-.016 4.778-.094 6.464c-.07 1.56-.332 2.408-.55 2.972a5 5 0 0 1-1.198 1.838c-.56.56-1.094.908-1.84 1.198-.564.218-1.412.48-2.972.55-1.686.078-2.192.094-6.464.094s-4.78-.016-6.466-.094c-1.56-.07-2.408-.332-2.972-.55a5 5 0 0 1-1.84-1.198 5 5 0 0 1-1.2-1.838c-.218-.564-.48-1.412-.55-2.972-.078-1.686-.092-2.192-.092-6.466s.014-4.778.092-6.464c.07-1.56.332-2.408.55-2.972.29-.746.638-1.28 1.198-1.84.56-.56 1.094-.908 1.84-1.198.564-.218 1.412-.48 2.972-.55 1.476-.068 2.048-.088 5.03-.09zm9.976 2.656a1.92 1.92 0 1 0 0 3.84 1.92 1.92 0 0 0 0-3.84zm-8.54 2.244a8.218 8.218 0 1 0 0 16.436 8.218 8.218 0 0 0 0-16.436zm0 2.882a5.334 5.334 0 1 1 0 10.668 5.334 5.334 0 0 1 0-10.668z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@quantro_app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Quantro on TikTok"
                className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-end"
              >
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" className="text-white" style={{ width: '32px', height: '32px', display: 'block' }}>
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <title>TikTok icon</title>
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path>
                  </g>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>
      </footer>
    </div>
  );
}
