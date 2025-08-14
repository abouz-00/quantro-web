import { NextRequest, NextResponse } from 'next/server';
import { createBetaInvite } from '@/lib/betaAccess';

export async function POST(req: NextRequest) {
  try {
    const { email, expiresInDays } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const code = await createBetaInvite(email, expiresInDays);
    
    return NextResponse.json({ 
      success: true, 
      message: `Beta invite created for ${email}`,
      code 
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
  // Simple check - in production, add proper authentication
  return NextResponse.json({
    message: 'Beta invite API endpoint',
    usage: 'POST with { email: "user@example.com", expiresInDays: 30 }'
  });
}
