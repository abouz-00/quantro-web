import { NextRequest, NextResponse } from 'next/server';
import { createBetaInvite } from '@/lib/betaAccess';
import { sendBetaInviteEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, expiresInDays, sendEmail = true } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const code = await createBetaInvite(email, expiresInDays);
    
    // Send email if requested (default: true)
    let emailResult = null;
    if (sendEmail) {
      // Get the invite details for the email
      const invite = await prisma.betaInvite.findUnique({
        where: { code }
      });

      if (invite) {
        emailResult = await sendBetaInviteEmail({
          email: invite.email,
          code: invite.code,
          expiresAt: invite.expiresAt
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Beta invite created for ${email}${sendEmail ? ' and email sent' : ''}`,
      code,
      emailSent: emailResult?.success || false
    });
  } catch (error) {
    console.error('Error creating beta invite:', error);
    return NextResponse.json(
      { error: 'Failed to create beta invite' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const invites = await prisma.betaInvite.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Error fetching beta invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beta invites' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    
    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action are required' }, { status: 400 });
    }

    if (action === 'revoke') {
      const { revokeBetaInvite } = await import('@/lib/betaAccess');
      await revokeBetaInvite(id);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Beta invite revoked successfully'
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating beta invite:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update beta invite' }, 
      { status: 500 }
    );
  }
}
