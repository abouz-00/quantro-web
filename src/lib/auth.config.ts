import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"

/**
 * Edge-compatible auth config (no Prisma/Node.js dependencies).
 * Used by middleware for session validation only.
 * The full auth config with PrismaAdapter is in auth.ts.
 */
export const authConfig = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    // Apple provider requires jwt signing which is not edge-compatible,
    // but middleware only needs to validate sessions, not initiate sign-in.
    // The full Apple provider config is in auth.ts.
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.uid && typeof token.uid === 'string') {
        session.user.id = token.uid;
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user && user.id) {
        token.uid = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig
