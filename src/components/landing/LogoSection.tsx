// src/components/landing/LogoSection.tsx
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { ANIMATION_VARIANTS, NO_SELECT_STYLES } from '../../constants/ui';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const LogoSection = () => {
  return (
    <motion.div
      className="w-full max-w-6xl text-center mb-20"
      initial="hidden"
      animate="visible"
      variants={{
        ...ANIMATION_VARIANTS.fadeInDown,
        visible: {
          ...ANIMATION_VARIANTS.fadeInDown.visible,
          transition: { duration: 0.8, ease: "easeOut" }
        }
      }}
    >
      <div>
        <Image
          src="/header.svg"
          alt="Quantro Logo"
          className="w-auto mx-auto"
          width={576}
          height={576}
          style={{
            height: '8rem',
            ...NO_SELECT_STYLES,
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))'
          }}
        />
      </div>

      {/* Animated subtitle */}
      <motion.p
        className={`text-white/90 text-xl mt-6 ${poppins.className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Smart nutrition tracking, reimagined
      </motion.p>
    </motion.div>
  );
};
