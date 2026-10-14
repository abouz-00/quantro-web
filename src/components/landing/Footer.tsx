// src/components/landing/Footer.tsx
import React from 'react';
import { Poppins } from 'next/font/google';
import { XIcon, InstagramIcon, TikTokIcon } from './icons';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const Footer = () => {
  return (
    <footer className="px-8 py-6 relative z-20">
      {/* Social media icons moved up */}
      <div className="flex justify-center items-center mb-6 relative z-20">
        <div className="flex items-center justify-center gap-6">
          <XIcon />
          <InstagramIcon />
          <TikTokIcon />
        </div>
      </div>

      {/* Copyright notice */}
      <div className="max-w-7xl mx-auto text-center">
        <p className={`text-white/70 text-sm ${poppins.className}`}>
          © 2026 Quantro LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
