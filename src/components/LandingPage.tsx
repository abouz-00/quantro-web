"use client";

import React from 'react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'] });

export default function LandingPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden fixed inset-0" style={{ backgroundColor: '#6e44ff', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div className="text-center px-6 py-4 max-w-2xl mx-auto h-full flex flex-col justify-center pb-32">
        {/* Logo/Brand */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className={`text-8xl font-bold text-white ${montserrat.className}`}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
              Quantro
            </h1>
            <img 
              src="/logo.svg" 
              alt="Quantro Logo" 
              className="w-16 h-16"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />
          </div>
          <div className="w-32 h-1.5 bg-white mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <div className="mb-16">
          <p className={`text-2xl text-white/90 leading-relaxed ${montserrat.className}`}>
            We&apos;re building something amazing for nutrition tracking. 
            Our platform will revolutionize how you monitor your health and wellness journey.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="w-14 h-14 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">🥗</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${montserrat.className}`}>Smart Tracking</h3>
            <p className={`text-gray-600 text-base ${montserrat.className}`}>Intelligent food logging with comprehensive nutrition data</p>
          </div>
          
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="w-14 h-14 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">📊</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${montserrat.className}`}>Analytics</h3>
            <p className={`text-gray-600 text-base ${montserrat.className}`}>Detailed insights into your nutritional patterns</p>
          </div>
          
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="w-14 h-14 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${montserrat.className}`}>Goals</h3>
            <p className={`text-gray-600 text-base ${montserrat.className}`}>Personalized targets and progress tracking</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className={`text-white/70 text-sm ${montserrat.className}`}>
            © 2025 Quantro. All rights reserved.
          </p>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <a 
              href="https://x.com/quantroapp" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Follow Quantro on X (Twitter)"
              className="flex items-center justify-center p-3 hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="text-white/90 hover:text-white transition-colors duration-200"
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