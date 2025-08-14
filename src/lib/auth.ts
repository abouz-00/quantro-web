import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { checkBetaAccess, markInviteAsUsed } from "@/lib/betaAccess"

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.APPLE_ID && process.env.APPLE_PRIVATE_KEY && process.env.APPLE_ID !== 'your-apple-service-id' ? [
      Apple({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_PRIVATE_KEY,
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      // Check if user has beta access
      const hasAccess = await checkBetaAccess(user.email);
      
      if (!hasAccess) {
        // Redirect to a "not invited" page
        return '/auth/not-invited';
      }

      // Mark invite as used if it exists
      await markInviteAsUsed(user.email);
      
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
