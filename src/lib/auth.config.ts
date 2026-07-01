import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import { serverEnv } from "@/lib/env"

/**
 * Edge-compatible auth config (no Prisma/Node.js dependencies).
 * Used by middleware for session validation only.
 * The full auth config with PrismaAdapter is in auth.ts.
 */
export const authConfig = {
  providers: [
    ...(serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET && serverEnv.GOOGLE_CLIENT_ID !== 'your-google-client-id' ? [
      Google({
        clientId: serverEnv.GOOGLE_CLIENT_ID,
        clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
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
    // Edge-compatible: only copies fields already present on the token onto
    // the session. The `isAdmin` flag itself is populated by the Node-only
    // jwt callback in auth.ts (which can query Prisma), so it is set at
    // sign-in time and cached in the encrypted JWT for up to `maxAge`.
    async session({ session, token }) {
      if (session?.user && token?.uid && typeof token.uid === 'string') {
        session.user.id = token.uid;
      }
      if (session?.user) {
        session.user.isAdmin = token?.isAdmin === true;
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
