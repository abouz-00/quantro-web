import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

// List of approved beta tester emails
const BETA_EMAILS = [
  'hello@quantro.fit',        // Your main email
  'abouzelfane@icloud.com',   // Your Apple Sign-In email
  'aymanbouzelfane1@gmail.com', // Your Google Sign-In email
  'dev@quantro.local',        // Development email for testing
  // Add more beta tester emails here
];

export async function checkBetaAccess(email: string): Promise<boolean> {
  // Check if email is in the approved list
  if (BETA_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  // Check if prisma is properly initialized
  if (!prisma) {
    console.error('Prisma client is not initialized');
    return false;
  }

  // Check if user has a valid beta invite
  try {
    const invite = await prisma.betaInvite.findFirst({
      where: {
        email: email.toLowerCase(),
        used: false,
        revoked: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    return !!invite;
  } catch (error) {
    console.error('Error checking beta access:', error);
    return false;
  }
}

export async function markInviteAsUsed(email: string): Promise<void> {
  try {
    await prisma.betaInvite.updateMany({
      where: { email: email.toLowerCase() },
      data: { 
        used: true,
        usedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error marking invite as used:', error);
  }
}

export async function createBetaInvite(email: string, expiresInDays?: number): Promise<string> {
  // Cryptographically secure code — Math.random() is not safe for anything
  // that gates access, since its output is predictable.
  const code = randomBytes(24).toString('base64url');
  
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  try {
    // Check if an invite already exists for this email
    const existingInvite = await prisma.betaInvite.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingInvite) {
      // If the existing invite is revoked or used, reactivate it with new code and expiration
      if (existingInvite.revoked || existingInvite.used) {
        await prisma.betaInvite.update({
          where: { email: email.toLowerCase() },
          data: {
            code,
            expiresAt,
            used: false,
            usedAt: null,
            revoked: false,
            revokedAt: null,
            createdAt: new Date() // Update created date to reflect new invite
          }
        });
        
        return code;
      } else {
        // If there's already an active invite, throw an error
        throw new Error('An active invite already exists for this email');
      }
    } else {
      // Create new invite if none exists
      await prisma.betaInvite.create({
        data: {
          email: email.toLowerCase(),
          code,
          expiresAt
        }
      });

      return code;
    }
  } catch (error) {
    console.error('Error creating beta invite:', error);
    throw error;
  }
}

export async function revokeBetaInvite(id: string): Promise<boolean> {
  try {
    const invite = await prisma.betaInvite.findUnique({
      where: { id }
    });

    if (!invite) {
      throw new Error('Invite not found');
    }

    if (invite.used) {
      throw new Error('Cannot revoke an invite that has already been used');
    }

    await prisma.betaInvite.update({
      where: { id },
      data: { 
        revoked: true,
        revokedAt: new Date()
      }
    });

    return true;
  } catch (error) {
    console.error('Error revoking beta invite:', error);
    throw error;
  }
}
