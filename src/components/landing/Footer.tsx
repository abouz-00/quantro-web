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
          <a
            href="https://x.com/quantro_app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Quantro on X (Twitter)"
            className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center hover:scale-110 transition-transform duration-200 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <XIcon />
          </a>
          <a
            href="https://instagram.com/quantro_app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Quantro on Instagram"
            className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center hover:scale-110 transition-transform duration-200 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <InstagramIcon />
          </a>
          <a
            href="https://tiktok.com/@quantro_app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Quantro on TikTok"
            className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center hover:scale-110 transition-transform duration-200 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <TikTokIcon />
          </a>
        </div>
      </div>

      {/* Copyright notice */}
      <div className="max-w-7xl mx-auto text-center">
        <p className={`text-white/70 text-sm ${poppins.className}`}>
          © 2025 Quantro. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
