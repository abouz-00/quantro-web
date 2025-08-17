import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('Testing Prisma client...');
    
    // First, let's see what fields are available by inspecting the model
    console.log('Available BetaInvite fields from schema:');
    
    // Try to find a beta invite and see its structure
    const invite = await prisma.betaInvite.findFirst();
    if (invite) {
      console.log('Sample invite structure:', Object.keys(invite));
      console.log('Sample invite data:', invite);
    }
    
    // Try to query with revoked field
    console.log('\nTrying to find invites with revoked field...');
    const revokedInvites = await prisma.betaInvite.findMany({
      where: {
        revoked: false
      }
    });
    console.log(`Found ${revokedInvites.length} non-revoked invites`);
    
    // Try a simple update without revoked field first
    if (invite) {
      console.log('\nTrying update without revoked...');
      await prisma.betaInvite.update({
        where: { id: invite.id },
        data: { 
          // Just update email to the same value
          email: invite.email
        }
      });
      console.log('Basic update successful');
      
      // Now try with revoked field
      console.log('\nTrying update WITH revoked field...');
      await prisma.betaInvite.update({
        where: { id: invite.id },
        data: { 
          revoked: true,
          revokedAt: new Date()
        }
      });
      console.log('Revoked field update successful!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
