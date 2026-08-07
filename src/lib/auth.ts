import NextAuth from "next-auth"
import Apple from "next-auth/providers/apple"
import Resend from "next-auth/providers/resend"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { checkBetaAccess } from "@/lib/betaAccess"
import { authConfig } from "@/lib/auth.config"
import { sendMagicLinkEmail } from "@/lib/emails/magic-link"
import { isDevelopment, serverEnv } from "@/lib/env"
import jwt from 'jsonwebtoken'
import type {} from "next-auth/jwt"

const authSecret = serverEnv.NEXTAUTH_SECRET

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string
    isAdmin?: boolean
  }
}

// Generate Apple JWT client secret on demand (expires in 6 months per Apple spec).
// Called per-request to avoid stale secrets in long-lived serverless containers.
function generateAppleJWT(): string | null {
  if (!serverEnv.APPLE_PRIVATE_KEY || !serverEnv.APPLE_TEAM_ID || !serverEnv.APPLE_PRIVATE_KEY_ID || !serverEnv.APPLE_ID) {
    return null;
  }

  let privateKey = serverEnv.APPLE_PRIVATE_KEY;

  // Handle escaped newlines from env vars (Vercel stores keys with literal \n)
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  // Wrap raw base64 key with PEM headers if missing
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    // Strip any whitespace/quotes from raw key
    const raw = privateKey.replace(/[\s"']/g, '');
    privateKey = `-----BEGIN PRIVATE KEY-----\n${raw}\n-----END PRIVATE KEY-----`;
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serverEnv.APPLE_TEAM_ID,
    iat: now,
    exp: now + 180 * 24 * 60 * 60, // 6 months (Apple max)
    aud: 'https://appleid.apple.com',
    sub: serverEnv.APPLE_ID,
  };

  try {
    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      keyid: serverEnv.APPLE_PRIVATE_KEY_ID,
    });
  } catch (error) {
    console.error('Error signing Apple JWT:', error);
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: authSecret,
  providers: [
    ...authConfig.providers,
    // Magic link email auth via Resend
    ...(serverEnv.RESEND_API_KEY ? [
      Resend({
        apiKey: serverEnv.RESEND_API_KEY,
        from: "Quantro <hello@quantro.fit>",
        maxAge: 10 * 60, // 10 minutes
        async sendVerificationRequest({ identifier: to, url }) {
          await sendMagicLinkEmail({ to, url })
        },
      })
    ] : []),
    ...(() => {
      // Only include Apple provider if env vars are present
      const hasAppleConfig = serverEnv.APPLE_ID &&
              serverEnv.APPLE_PRIVATE_KEY &&
              serverEnv.APPLE_TEAM_ID &&
              serverEnv.APPLE_PRIVATE_KEY_ID &&
              serverEnv.APPLE_ID !== 'your-apple-service-id';
      if (!hasAppleConfig) return [];

      // Generate JWT (6-month expiry; regenerated on every cold start)
      const appleJWT = generateAppleJWT();
      if (!appleJWT) {
        console.warn('[Auth] Apple Sign-In disabled: failed to generate JWT from APPLE_PRIVATE_KEY');
        return [];
      }

      return [
        Apple({
          clientId: serverEnv.APPLE_ID!,
          clientSecret: appleJWT,
        })
      ];
    })(),
    // Development credentials provider with enhanced security
    ...(isDevelopment ? [
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
          if (!serverEnv.DEV_SIGNIN_PASSWORD) {
            console.log('DEV_SIGNIN_PASSWORD is not configured');
            return null;
          }
          if (!password || password !== serverEnv.DEV_SIGNIN_PASSWORD) {
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

          // Get or create user in database
          let dbUser = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!dbUser) {
            // Create user if doesn't exist
            dbUser = await prisma.user.create({
              data: {
                email: email,
                name: "Development User",
                isApproved: true,
              },
            });
            console.log('Created new dev user:', dbUser.id);
          } else {
            console.log('Found existing user:', dbUser.id);
          }

          // Return user with actual database ID
          const user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || "Development User",
            image: dbUser.image,
          };
          
          console.log('Dev sign-in successful for:', email, 'with ID:', user.id);
          return user;
        }
      })
    ] : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Overrides the edge-compatible jwt callback: also stamps the token with
    // the user's current isAdmin flag at sign-in time (requires Prisma, so
    // this only runs in the Node.js runtime — never in middleware). Because
    // the flag is cached in the JWT, promoting/demoting an admin only takes
    // effect the next time that user signs in; the admin API routes still
    // re-check isAdmin against the database on every request as the
    // authoritative source of truth.
    async jwt({ user, token }) {
      if (user && user.id) {
        token.uid = user.id;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isAdmin: true },
          });
          token.isAdmin = dbUser?.isAdmin ?? false;
        } catch (error) {
          console.error('[Auth] Failed to load isAdmin flag for token:', error);
          token.isAdmin = false;
        }
      }
      return token;
    },
    async signIn({ user, account }) {
      if (!user.email) return false;

      // If Google/Apple OAuth itself returned an error the user object may be
      // partial but NextAuth still fires the callback.  Log the provider to
      // help distinguish "provider blocked" from "beta check blocked".
      console.log(`[Auth] signIn callback: email=${user.email}, provider=${account?.provider ?? 'unknown'}`);

      try {
        const hasAccess = await checkBetaAccess(user.email);

        if (!hasAccess) {
          console.log('[Auth] Beta access denied for:', user.email);
          return false;
        }
      } catch (error) {
        console.error('[Auth] checkBetaAccess threw – denying sign-in:', error);
        return false;
      }

            // For development, ensure user is approved in database
      if (isDevelopment) {
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
  },
})
