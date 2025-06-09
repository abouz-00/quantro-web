"use client";

import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center select-none">
      <div className="text-center px-6 py-12 max-w-2xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-violet-600 mb-4">
            Quantro
          </h1>
          <div className="w-24 h-1 bg-violet-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <div className="mb-12">
          <h2 className="text-4xl font-light text-gray-700 mb-6">
            Stay Tuned
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            We&apos;re building something amazing for nutrition tracking. 
            Our platform will revolutionize how you monitor your health and wellness journey.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">🥗</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Smart Tracking</h3>
            <p className="text-gray-600 text-sm">Intelligent food logging with comprehensive nutrition data</p>
          </div>
          
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">Detailed insights into your nutritional patterns</p>
          </div>
          
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Goals</h3>
            <p className="text-gray-600 text-sm">Personalized targets and progress tracking</p>
          </div>
        </div>

        {/* Email Signup */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Get Early Access
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to know when Quantro launches
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button className="px-6 py-3 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors">
              Notify Me
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-500 text-sm">
          © 2025 Quantro. Coming Soon.
        </div>
      </div>
    </div>
  );
}