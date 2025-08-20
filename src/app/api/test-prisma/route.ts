import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test basic query
    const invite = await prisma.betaInvite.findFirst();
    if (!invite) {
      return NextResponse.json({ error: 'No invite found' }, { status: 404 });
    }

    console.log('Found invite:', invite.id);
    console.log('Has revoked field:', 'revoked' in invite);
    console.log('Invite object keys:', Object.keys(invite));

    // Try the problematic update
    const result = await prisma.betaInvite.update({
      where: { id: invite.id },
      data: { 
        revoked: true,
        revokedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Update worked!',
      updatedInvite: result
    });

  } catch (error) {
    console.error('API Test Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
