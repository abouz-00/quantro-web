// src/components/landing/SignInButtons.tsx
import React from 'react';
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
  const handleAppleSignIn = () => {
    signIn('apple', { callbackUrl: '/dashboard' });
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
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
