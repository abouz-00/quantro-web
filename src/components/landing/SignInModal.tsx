"use client";

// src/components/landing/SignInModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import type { SignInModalProps } from './types';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSigningIn
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password');
      return;
    }
    await onSubmit(email, password);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSigningIn && email.trim() && password.trim()) {
      e.preventDefault(); // Prevent default form submission
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-semibold text-gray-900 ${poppins.className}`}>
              Development Sign In
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Enter your email address and development password to sign in for development testing.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="dev-email" className={`block text-sm font-medium text-gray-700 mb-2 ${poppins.className}`}>
                  Email Address
                </label>
                <input
                  id="dev-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${poppins.className}`}
                  placeholder="Enter your email"
                  disabled={isSigningIn}
                />
              </div>

              <div>
                <label htmlFor="dev-password" className={`block text-sm font-medium text-gray-700 mb-2 ${poppins.className}`}>
                  Development Password
                </label>
                <input
                  id="dev-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${poppins.className}`}
                  placeholder="Enter development password"
                  disabled={isSigningIn}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${poppins.className} font-medium`}
                  disabled={isSigningIn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className={`flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${poppins.className} font-medium flex items-center justify-center gap-2`}
                >
                  {isSigningIn ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
