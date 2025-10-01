'use client';

import * as React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LogoSection,
  FeaturesSection,
  SignInButtons,
  SignInModal,
  Footer,
  FloatingFoodParticles,
  COLORS
} from './index';



export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showDevModal, setShowDevModal] = React.useState(false);
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleDevSignInSubmit = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password');
      return;
    }

    setIsSigningIn(true);
    console.log('🚀 Starting dev sign-in...');

    try {
      console.log('📧 Signing in with:', email);

      // First, try the API approach to validate credentials
      const apiResponse = await fetch('/api/auth/dev-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.log('Sign-in failed:', errorData.error || 'Invalid credentials');
        alert('Sign-in failed: ' + (errorData.error || 'Invalid credentials'));
        return;
      }

      console.log('✅ Credentials validated');

      // Now use NextAuth to establish session
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/log',
        redirect: false
      });

      console.log('🔍 NextAuth result:', result);

      if (result?.error) {
        console.log('NextAuth failed:', result.error);
        alert('Session establishment failed: ' + result.error);
        return;
      }

      // Sign-in successful
      console.log('✅ Sign-in successful, redirecting to /log...');
      setShowDevModal(false);

      // Longer delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check session multiple times if needed
      let sessionData = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !sessionData?.user) {
        try {
          const sessionCheck = await fetch('/api/auth/session');
          sessionData = await sessionCheck.json();
          console.log(`Session check attempt ${attempts + 1}:`, sessionData?.user ? '✅ Found' : '⏳ Waiting');

          if (!sessionData?.user) {
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch {
          console.log('Session check failed, proceeding anyway...');
          attempts = maxAttempts; // Exit the loop
        }
      }

      if (sessionData?.user) {
        console.log('🎉 Session established, redirecting...');
      } else {
        console.log('ℹ️ Proceeding with redirect (session may still be establishing)...');
      }

      // Always redirect to /log - the page will handle authentication
      router.push('/log');

    } catch (error) {
      console.error('💥 Error during dev sign-in:', error);
      alert('Error during sign-in: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSigningIn(false);
    }
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
    <div className="min-h-screen w-full flex flex-col relative" style={{ backgroundColor: COLORS.primary }}>
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
        <LogoSection />
        <FeaturesSection />
        <SignInButtons onDevSignIn={() => setShowDevModal(true)} />
      </main>

      <Footer />

      {/* Development Sign In Modal */}
      <SignInModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onSubmit={handleDevSignInSubmit}
        isSigningIn={isSigningIn}
      />
    </div>
  );
}
