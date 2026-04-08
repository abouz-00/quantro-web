// src/components/landing/SignInButtons.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { signIn } from 'next-auth/react';
import { COLORS, NO_SELECT_STYLES } from '../../constants/ui';
import { AppleIcon, GoogleIcon } from './icons';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface SignInButtonsProps {
  onDevSignIn: () => void;
}

export const SignInButtons: React.FC<SignInButtonsProps> = ({ onDevSignIn }) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleAppleSignIn = () => {
    signIn('apple', { callbackUrl: '/dashboard' });
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setEmailLoading(true);
    setEmailError('');

    try {
      // Pre-check beta access before sending the magic link email
      const check = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      if (check.status === 429) {
        setEmailError('Too many attempts. Please try again later.');
        return;
      }

      const { allowed } = await check.json();
      if (!allowed) {
        setEmailError('This email does not have access. Request a beta invite first.');
        return;
      }

      // Only now trigger the actual magic link send
      const result = await signIn('resend', {
        email: trimmed,
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        setEmailError('Unable to send sign-in link. Please try again.');
      } else {
        setEmailSent(true);
      }
    } catch {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-lg"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, delay: 0.8 }
        }
      }}
    >
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* Apple Sign In Button */}
        <motion.button
          onClick={handleAppleSignIn}
          className="w-full sm:flex-1 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: COLORS.black,
            ...NO_SELECT_STYLES
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <AppleIcon />
          <span className={poppins.className}>Sign in with Apple</span>
        </motion.button>

        {/* Google Sign In Button */}
        <motion.button
          onClick={handleGoogleSignIn}
          className="w-full sm:flex-1 bg-white text-gray-700 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-lg hover:shadow-xl border border-gray-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <GoogleIcon />
          <span className={poppins.className}>Sign in with Google</span>
        </motion.button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/50 text-sm font-medium">or</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Email Magic Link */}
      {emailSent ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-5"
        >
          <div className="text-2xl mb-2">✉️</div>
          <p className={`${poppins.className} text-white font-semibold`}>Check your email</p>
          <p className="text-white/70 text-sm mt-1">
            We sent a sign-in link to <strong className="text-white">{email}</strong>
          </p>
          <button
            onClick={() => { setEmailSent(false); setEmail(''); }}
            className="mt-3 text-white/60 text-xs underline hover:text-white/80 transition-colors"
          >
            Use a different email
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleEmailSignIn} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className={`${poppins.className} flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/15 transition-all`}
          />
          <motion.button
            type="submit"
            disabled={emailLoading || !email.trim()}
            className="px-6 py-3 rounded-xl bg-white text-[#6e44ff] font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!emailLoading ? { scale: 1.02 } : {}}
            whileTap={!emailLoading ? { scale: 0.98 } : {}}
            transition={{ duration: 0.15 }}
          >
            <span className={poppins.className}>
              {emailLoading ? 'Sending...' : 'Send Link'}
            </span>
          </motion.button>
        </form>
      )}

      {emailError && (
        <p className="text-red-300 text-sm text-center mt-2">{emailError}</p>
      )}

      {/* Development Sign In Button - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex justify-center mt-4">
          <motion.button
            onClick={onDevSignIn}
            className="bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <span className={poppins.className}>🚀 Dev Sign In</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
