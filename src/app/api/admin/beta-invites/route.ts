import { NextRequest, NextResponse } from 'next/server';
import { createBetaInvite } from '@/lib/betaAccess';
import { sendBetaInviteEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createBetaInviteSchema, updateBetaInviteSchema } from '@/lib/schemas/betaInvite';
import { parseOrError } from '@/lib/validation';

// Helper function to check if user is admin
async function checkAdminAccess(): Promise<{ isAdmin: boolean; error?: NextResponse }> {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { 
      isAdmin: false, 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });
  
  if (!user?.isAdmin) {
    return { 
      isAdmin: false, 
      error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    };
  }
  
  return { isAdmin: true };
}

export async function POST(req: NextRequest) {
  // Check admin access
  const { isAdmin, error } = await checkAdminAccess();
  if (!isAdmin) return error!;
  
  try {
    const rawBody = await req.json();
    const { data: body, error: validationError } = parseOrError(createBetaInviteSchema, rawBody);
    if (validationError) return validationError;

    const { email, expiresInDays, sendEmail = true } = body;

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
  // Check admin access
  const { isAdmin, error } = await checkAdminAccess();
  if (!isAdmin) return error!;
  
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
  // Check admin access
  const { isAdmin, error } = await checkAdminAccess();
  if (!isAdmin) return error!;
  
  try {
    const rawBody = await req.json();
    const { data: body, error: validationError } = parseOrError(updateBetaInviteSchema, rawBody);
    if (validationError) return validationError;

    const { id, action } = body;

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
