import { prisma } from '@/lib/prisma';

// List of approved beta tester emails
const BETA_EMAILS = [
  'hello@quantro.fit',        // Your main email
  'abouzelfane@icloud.com',   // Your Apple Sign-In email
  // Add more beta tester emails here
];

export async function checkBetaAccess(email: string): Promise<boolean> {
  // Check if email is in the approved list
  if (BETA_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  // Check if user has a valid beta invite
  try {
    const invite = await prisma.betaInvite.findFirst({
      where: {
        email: email.toLowerCase(),
        used: false,
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
  const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  try {
    await prisma.betaInvite.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt
      }
    });

    return code;
  } catch (error) {
    console.error('Error creating beta invite:', error);
    throw error;
  }
}
