import { prisma } from '@/lib/prisma';

async function testAppPrisma() {
  try {
    console.log('Testing app-style Prisma import...');
    
    // Try to find a beta invite
    const invite = await prisma.betaInvite.findFirst();
    if (invite) {
      console.log('Found invite:', invite.id);
      console.log('Invite has revoked field:', 'revoked' in invite);
      
      // Try the update that's failing
      console.log('Attempting update with revoked field...');
      await prisma.betaInvite.update({
        where: { id: invite.id },
        data: { 
          revoked: true,
          revokedAt: new Date()
        }
      });
      console.log('Update successful!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAppPrisma();
