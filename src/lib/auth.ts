import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
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
    // Development credentials provider with enhanced security
    ...(process.env.NODE_ENV === 'development' ? [
      Credentials({
        id: 'credentials',
        name: "Development",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Dev Password", type: "password" }
        },
        async authorize(credentials) {
          console.log('Dev auth attempt with credentials:', { email: credentials?.email, hasPassword: !!credentials?.password });
          
          const email = credentials?.email;
          const password = credentials?.password;
          
          if (!email || typeof email !== 'string') {
            console.log('No email provided');
            return null;
          }
          
          // Require development password
          const DEV_PASSWORD = process.env.DEV_SIGNIN_PASSWORD || 'quantro-dev-2024';
          if (!password || password !== DEV_PASSWORD) {
            console.log('Invalid or missing development password');
            return null;
          }
          
          // Check if email has beta access
          const hasAccess = await checkBetaAccess(email);
          console.log('Beta access check result:', hasAccess);
          
          if (!hasAccess) {
            console.log('Email does not have beta access');
            return null;
          }

          // Return a mock user for development
          const user = {
            id: `dev-${email}`,
            email: email,
            name: "Development User",
            image: null,
          };
          
          console.log('Dev sign-in successful for:', email);
          return user;
        }
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      
      // Check if user has beta access
      const hasAccess = await checkBetaAccess(user.email);
      
      if (!hasAccess) {
        console.log('User does not have beta access:', user.email);
        return false; // Return false to deny sign-in
      }

            // For development, ensure user is approved in database
      if (process.env.NODE_ENV === 'development') {
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name,
              isApproved: true, // Ensure development users are approved
            },
            create: {
              id: user.id, // Use the same ID as in the session
              email: user.email,
              name: user.name,
              isApproved: true, // Auto-approve development users
            },
          });
          console.log('Dev user ensured in database:', user.id);
        } catch (error) {
          console.error('Error ensuring dev user in database:', error);
          // Continue with sign-in even if database update fails
        }
      }

      // Don't mark invite as used here - will be handled by InviteHandler on dashboard
      
      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.uid && typeof token.uid === 'string') {
        session.user.id = token.uid;
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user && user.id) {
        // Let PrismaAdapter handle user creation and ID assignment
        // The token will be populated with the correct user ID from the database
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt", // Use JWT strategy for development with SQLite
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
})
