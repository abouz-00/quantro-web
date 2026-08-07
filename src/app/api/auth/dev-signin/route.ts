import { NextResponse } from 'next/server';
import { checkBetaAccess } from '@/lib/betaAccess';
import { isDevelopment, serverEnv } from '@/lib/env';

// Add CORS headers for Safari compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    console.log('Dev sign-in API called');

    // Only allow in development
    if (!isDevelopment) {
      console.log('Not in development mode');
      return NextResponse.json(
        { error: 'Not available in production' }, 
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    console.log('Dev sign-in attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    if (!serverEnv.DEV_SIGNIN_PASSWORD) {
      return NextResponse.json(
        { error: 'DEV_SIGNIN_PASSWORD is not configured' },
        { status: 503, headers: corsHeaders }
      );
    }

    if (password !== serverEnv.DEV_SIGNIN_PASSWORD) {
      console.log('Invalid development password');
      return NextResponse.json(
        { error: 'Invalid password' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if email has beta access
    const hasAccess = await checkBetaAccess(email);
    console.log('Beta access result:', hasAccess);

    if (!hasAccess) {
      console.log('No beta access for:', email);
      return NextResponse.json(
        { error: 'No beta access' }, 
        { status: 403, headers: corsHeaders }
      );
    }

    console.log('Dev sign-in successful for:', email);
    return NextResponse.json(
      { success: true, email }, 
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Dev sign-in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
