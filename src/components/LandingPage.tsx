"use client";

import React from 'react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'] });

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#6e44ff', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div className="text-center px-6 py-12 max-w-2xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className={`text-6xl font-bold text-white mb-4 ${montserrat.className}`}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            Quantro
          </h1>
          <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <div className="mb-12">
          <h2 className={`text-4xl font-light text-white mb-6 ${montserrat.className}`}>
            Stay Tuned
          </h2>
          <p className={`text-xl text-white/90 leading-relaxed ${montserrat.className}`}>
            We&apos;re building something amazing for nutrition tracking. 
            Our platform will revolutionize how you monitor your health and wellness journey.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="w-12 h-12 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">🥗</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 ${montserrat.className}`}>Smart Tracking</h3>
            <p className={`text-gray-600 text-sm ${montserrat.className}`}>Intelligent food logging with comprehensive nutrition data</p>
          </div>
          
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="w-12 h-12 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 ${montserrat.className}`}>Analytics</h3>
            <p className={`text-gray-600 text-sm ${montserrat.className}`}>Detailed insights into your nutritional patterns</p>
          </div>
          
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="w-12 h-12 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className={`font-semibold text-gray-800 mb-2 ${montserrat.className}`}>Goals</h3>
            <p className={`text-gray-600 text-sm ${montserrat.className}`}>Personalized targets and progress tracking</p>
          </div>
        </div>

        {/* Email Signup */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
          <h3 className={`text-2xl font-semibold text-gray-800 mb-4 ${montserrat.className}`}>
            Get Early Access
          </h3>
          <p className={`text-gray-600 mb-6 ${montserrat.className}`}>
            Be the first to know when Quantro launches
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className={`flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${montserrat.className}`}
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />
            <button className={`px-6 py-3 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors ${montserrat.className}`}>
              Notify Me
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-6 pb-4">
        <p className={`text-white/70 text-sm ${montserrat.className}`}>
          © 2025 Quantro. All rights reserved.
        </p>
        <div className="flex-1 flex justify-center">
          <a 
            href="https://x.com/quantroapp" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow Quantro on X (Twitter)"
            className="flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="text-white/70 hover:text-white transition-colors duration-200"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
        <div className="w-20"></div> {/* Spacer for balance */}
      </footer>
    </div>
  );
}