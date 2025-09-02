// src/components/landing/BackgroundAnimation.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundAnimation = () => {
  return (
    <motion.div
      className="absolute inset-0 opacity-20"
      animate={{
        background: [
          "radial-gradient(circle at 20% 50%, rgba(139, 69, 255, 0.3) 0%, transparent 50%)",
          "radial-gradient(circle at 80% 50%, rgba(139, 69, 255, 0.3) 0%, transparent 50%)",
          "radial-gradient(circle at 20% 50%, rgba(139, 69, 255, 0.3) 0%, transparent 50%)"
        ]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};
