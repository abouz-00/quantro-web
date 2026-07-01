import { NextRequest, NextResponse } from 'next/server';
import { checkBetaAccess } from '@/lib/betaAccess';
import { rateLimitOrError } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // 5 attempts per 15 minutes per IP, backed by Upstash Redis when
  // configured so the limit holds across serverless instances.
  const limited = await rateLimitOrError('check-email', request, { max: 5, windowSeconds: 15 * 60 });
  if (limited) return limited;

  let email: string;
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const hasAccess = await checkBetaAccess(email);

  // Intentionally vague — never reveal whether an email exists in the system
  if (!hasAccess) {
    return NextResponse.json(
      { allowed: false },
      { status: 200 },
    );
  }

  return NextResponse.json({ allowed: true });
}
