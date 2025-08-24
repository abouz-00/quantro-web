"use client";

import * as React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ChartPieIcon, BeakerIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

// Theme constants
const COLORS = {
  primary: '#6e44ff',
  cardBackground: '#EADFCA',
  black: '#000000',
  hover: '#1f2937',
} as const;

// Reusable styles
const NO_SELECT_STYLES = {
  userSelect: 'none' as const,
  WebkitUserSelect: 'none' as const,
};

// Animation variants
const ANIMATION_VARIANTS = {
  fadeInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  featureCard: {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }
} as const;

// Icon Components
const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.037-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
    <path d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.883-1.454 2.298-1.273 3.649 1.338.104 2.715-.688 3.56-1.637z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const XIcon = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="text-white" 
    style={{ width: '32px', height: '32px', display: 'block' }}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    fill="currentColor" 
    viewBox="0 0 32 32" 
    className="text-white" 
    style={{ width: '32px', height: '32px', display: 'block' }} 
    aria-hidden="true"
  >
    <path d="M16 0C11.658 0 11.112.02 9.406.096 7.7.172 6.538.444 5.52.84a7.8 7.8 0 0 0-2.834 1.846A7.8 7.8 0 0 0 .84 5.52C.444 6.538.172 7.7.096 9.406.02 11.112 0 11.654 0 16.002c0 4.342.02 4.884.096 6.59.076 1.706.348 2.868.744 3.886.41 1.052.956 1.944 1.846 2.834a7.8 7.8 0 0 0 2.834 1.846c1.018.396 2.18.668 3.886.744C11.112 31.98 11.654 32 16 32s4.884-.02 6.59-.096c1.706-.076 2.868-.348 3.886-.744a7.8 7.8 0 0 0 2.834-1.846c.89-.89 1.436-1.782 1.846-2.834.394-1.018.666-2.18.744-3.886C31.98 20.886 32 20.344 32 16s-.02-4.886-.096-6.594c-.076-1.706-.35-2.868-.744-3.886a7.8 7.8 0 0 0-1.846-2.834A7.8 7.8 0 0 0 26.48.84c-1.018-.396-2.18-.668-3.886-.744C20.886.02 20.344 0 16 0zm-1.434 2.884h1.436c4.272 0 4.778.014 6.464.092 1.56.07 2.408.332 2.972.55.746.29 1.28.638 1.84 1.198.56.56.908 1.092 1.198 1.84.218.564.48 1.412.55 2.972.078 1.686.094 2.192.094 6.464s-.016 4.778-.094 6.464c-.07 1.56-.332 2.408-.55 2.972a5 5 0 0 1-1.198 1.838c-.56.56-1.094.908-1.84 1.198-.564.218-1.412.48-2.972.55-1.686.078-2.192.094-6.464.094s-4.78-.016-6.466-.094c-1.56-.07-2.408-.332-2.972-.55a5 5 0 0 1-1.84-1.198 5 5 0 0 1-1.2-1.838c-.218-.564-.48-1.412-.55-2.972-.078-1.686-.092-2.192-.092-6.466s.014-4.778.092-6.464c.07-1.56.332-2.408.55-2.972.29-.746.638-1.28 1.198-1.84.56-.56 1.094-.908 1.84-1.198.564-.218 1.412-.48 2.972-.55 1.476-.068 2.048-.088 5.03-.09zm9.976 2.656a1.92 1.92 0 1 0 0 3.84 1.92 1.92 0 0 0 0-3.84zm-8.54 2.244a8.218 8.218 0 1 0 0 16.436 8.218 8.218 0 0 0 0-16.436zm0 2.882a5.334 5.334 0 1 1 0 10.668 5.334 5.334 0 0 1 0-10.668z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg 
    width="32" 
    height="32" 
    fill="currentColor" 
    viewBox="0 0 24 24" 
    role="img" 
    xmlns="http://www.w3.org/2000/svg" 
    className="text-white" 
    style={{ width: '32px', height: '32px', display: 'block' }}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <title>TikTok icon</title>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path>
    </g>
  </svg>
);

// Floating food particles component
const FloatingFoodParticles = () => {
  const foodEmojis = useMemo(() => ['🥗', '🍎', '🥑', '🍊', '🥕', '🫐', '🍇', '🥦', '🍌', '🫒'], []);
  
  const particles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      scale: 0.6 + Math.random() * 0.8,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
    })), [foodEmojis]
  );

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

// 3D Feature Card Component
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, delay = 0 }) => {
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

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleAppleSignIn = () => {
    signIn('apple', { callbackUrl: '/dashboard' });
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative" style={{ backgroundColor: COLORS.primary, ...NO_SELECT_STYLES }}>
      {/* Floating food particles background */}
      <FloatingFoodParticles />
      
      {/* Animated background gradient */}
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

      {/* Main content area */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-16 relative z-10">
        {/* Logo section with enhanced animation */}
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

        {/* Enhanced Features section with wider spread */}
        <div className="w-full max-w-7xl mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard
              icon={BeakerIcon}
              title="Smart Tracking"
              description="Intelligent food logging with comprehensive nutrition data and AI-powered insights"
              delay={0.2}
            />
            
            <FeatureCard
              icon={ChartPieIcon}
              title="Analytics"
              description="Detailed insights into your nutritional patterns with beautiful visualizations"
              delay={0.4}
            />
            
            <FeatureCard
              icon={CursorArrowRaysIcon}
              title="Goals"
              description="Personalized targets and progress tracking with smart recommendations"
              delay={0.6}
            />
          </div>
        </div>

        {/* Enhanced Sign-in buttons section */}
        <motion.div 
          className="w-full max-w-lg"
          initial="hidden"
          animate="visible"
          variants={{
            ...ANIMATION_VARIANTS.fadeInUp,
            visible: {
              ...ANIMATION_VARIANTS.fadeInUp.visible,
              transition: { duration: 0.8, delay: 0.8 }
            }
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Apple Sign In Button */}
            <motion.button 
              onClick={handleAppleSignIn}
              className="w-full sm:flex-1 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: COLORS.black,
                ...NO_SELECT_STYLES
              }}
              whileHover={{ scale: 1.02, backgroundColor: COLORS.hover }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <AppleIcon />
              <span className={poppins.className}>Sign in with Apple</span>
            </motion.button>
            
            {/* Google Sign In Button */}
            <motion.button 
              onClick={handleGoogleSignIn}
              className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-lg hover:shadow-xl border border-gray-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <GoogleIcon />
              <span className={poppins.className}>Sign in with Google</span>
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6">
        {/* Social media icons moved up */}
        <div className="flex justify-center items-center mb-6">
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://x.com/quantroapp" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Follow Quantro on X (Twitter)"
              className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center"
            >
              <XIcon />
            </a>
            <a
              href="https://instagram.com/quantro_app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Quantro on Instagram"
              className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://tiktok.com/@quantro_app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Quantro on TikTok"
              className="focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center"
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
    </div>
  );
}
