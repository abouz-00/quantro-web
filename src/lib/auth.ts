import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { checkBetaAccess } from "@/lib/betaAccess"
import jwt from 'jsonwebtoken'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Function to generate Apple JWT token
function generateAppleJWT() {
  if (!process.env.APPLE_PRIVATE_KEY || !process.env.APPLE_TEAM_ID || !process.env.APPLE_PRIVATE_KEY_ID || !process.env.APPLE_ID) {
    return null;
  }
  
  // Ensure private key is properly formatted
  let privateKey = process.env.APPLE_PRIVATE_KEY;
  
  // Handle both encoded and raw private keys
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  // Ensure the key has proper PEM formatting
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    return null;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 15 * 60, // 15 minutes
    aud: 'https://appleid.apple.com',
    sub: process.env.APPLE_ID,
  };

  try {
    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      keyid: process.env.APPLE_PRIVATE_KEY_ID,
    });
  } catch (error) {
    console.error('Error signing Apple JWT:', error);
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(() => {
      // Generate Apple JWT and only include Apple provider if successful
      const appleJWT = generateAppleJWT();
      return (process.env.APPLE_ID && 
              process.env.APPLE_PRIVATE_KEY && 
              process.env.APPLE_TEAM_ID && 
              process.env.APPLE_PRIVATE_KEY_ID && 
              process.env.APPLE_ID !== 'your-apple-service-id' &&
              appleJWT) ? [
        Apple({
          clientId: process.env.APPLE_ID,
          clientSecret: appleJWT,
        })
      ] : [];
    })(),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      
      // Check if user has beta access
      const hasAccess = await checkBetaAccess(user.email);
      
      if (!hasAccess) {
        // Redirect to a "not invited" page
        return '/auth/not-invited';
      }

      // Don't mark invite as used here - will be handled by InviteHandler on dashboard
      
      return true;
    },
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
})
