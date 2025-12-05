// src/components/landing/FloatingFoodParticles.tsx
/* eslint-disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FOOD_EMOJIS } from '../../constants/ui';

export const FloatingFoodParticles = () => {
  // Generate stable random values once on mount using useMemo with empty deps
  // Math.random() is called inside useMemo to ensure values don't change on re-render
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      scale: 0.6 + Math.random() * 0.8,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-2xl opacity-30"
          style={{
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
            scale: particle.scale,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
};
