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
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 15 * 60, // 15 minutes
    aud: 'https://appleid.apple.com',
    sub: process.env.APPLE_ID,
  };

  return jwt.sign(payload, process.env.APPLE_PRIVATE_KEY, {
    algorithm: 'ES256',
    keyid: process.env.APPLE_PRIVATE_KEY_ID,
  });
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
    ...(process.env.APPLE_ID && process.env.APPLE_PRIVATE_KEY && process.env.APPLE_TEAM_ID && process.env.APPLE_PRIVATE_KEY_ID && process.env.APPLE_ID !== 'your-apple-service-id' ? [
      Apple({
        clientId: process.env.APPLE_ID,
        clientSecret: generateAppleJWT() || undefined,
      })
    ] : []),
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
