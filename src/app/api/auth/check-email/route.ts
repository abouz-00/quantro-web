import { NextResponse } from 'next/server';
import { checkBetaAccess } from '@/lib/betaAccess';
import { createHandler } from '@/lib/api/handler';
import { emailOnlySchema } from '@/lib/schemas/betaInvite';

export const POST = createHandler(
  {
    // 5 attempts per 15 minutes per IP, backed by Upstash Redis when
    // configured so the limit holds across serverless instances.
    rateLimit: { name: 'check-email', max: 5, windowSeconds: 15 * 60 },
    schema: emailOnlySchema,
    routeLabel: 'POST /api/auth/check-email',
  },
  async (_request, { body }) => {
    const hasAccess = await checkBetaAccess(body.email);

    // Intentionally vague — never reveal whether an email exists in the system.
    if (!hasAccess) {
      return NextResponse.json({ allowed: false }, { status: 200 });
    }

    return NextResponse.json({ allowed: true });
  }
);
