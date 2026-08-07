import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { serverEnv } from '@/lib/env';

function getBetaAllowlist(): string[] {
  const raw = serverEnv.BETA_ALLOWLIST_EMAILS ?? 'dev@quantro.local';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function checkBetaAccess(email: string): Promise<boolean> {
  if (getBetaAllowlist().includes(email.toLowerCase())) {
    return true;
  }

  if (!prisma) {
    console.error('Prisma client is not initialized');
    return false;
  }

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
  const code = randomBytes(24).toString('base64url');
  
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  try {
    const existingInvite = await prisma.betaInvite.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingInvite) {
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
            createdAt: new Date()
          }
        });
        
        return code;
      } else {
        throw new Error('An active invite already exists for this email');
      }
    } else {
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
