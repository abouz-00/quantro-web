import { NextResponse } from 'next/server';
import { checkBetaAccess } from '@/lib/betaAccess';

export async function POST(request: Request) {
  try {
    console.log('Dev sign-in API called');

    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      console.log('Not in development mode');
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password } = body;

    console.log('Dev sign-in attempt for:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check development password
    const DEV_PASSWORD = process.env.DEV_SIGNIN_PASSWORD || 'quantro-dev-2024';
    if (password !== DEV_PASSWORD) {
      console.log('Invalid development password');
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Check if email has beta access
    const hasAccess = await checkBetaAccess(email);
    console.log('Beta access result:', hasAccess);

    if (!hasAccess) {
      console.log('No beta access for:', email);
      return NextResponse.json({ error: 'No beta access' }, { status: 403 });
    }

    console.log('Dev sign-in successful for:', email);
    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error('Dev sign-in API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
