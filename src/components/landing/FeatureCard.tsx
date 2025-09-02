// src/components/landing/FeatureCard.tsx
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { COLORS, NO_SELECT_STYLES, ANIMATION_VARIANTS } from '../../constants/ui';
import type { FeatureCardProps } from './types';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      className="group cursor-pointer"
      initial="hidden"
      animate={controls}
      variants={{
        ...ANIMATION_VARIANTS.featureCard,
        visible: {
          ...ANIMATION_VARIANTS.featureCard.visible,
          transition: {
            ...ANIMATION_VARIANTS.featureCard.visible.transition,
            delay: delay,
          }
        }
      }}
      whileHover={{
        rotateX: 5,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      style={{ perspective: 1000 }}
    >
      <div className="backdrop-blur-sm rounded-xl shadow-lg h-full relative overflow-hidden group-hover:shadow-2xl transition-shadow duration-300"
           style={{ backgroundColor: COLORS.cardBackground, ...NO_SELECT_STYLES }}>
        {/* Hover gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />

        <div className="p-6 h-full flex flex-col items-center text-center relative z-10">
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h3 className={`font-semibold text-gray-800 mb-2 text-lg ${poppins.className} group-hover:text-violet-700 transition-colors duration-300`}>
              {title}
            </h3>
            <p className={`text-gray-600 text-sm leading-relaxed ${poppins.className}`}>
              {description}
            </p>
          </div>
        </div>

        {/* Bottom border animation */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600"
          initial={{ width: "0%" }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};
