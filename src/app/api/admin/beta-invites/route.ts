import { NextResponse } from 'next/server';
import { createBetaInvite, revokeBetaInvite } from '@/lib/betaAccess';
import { sendBetaInviteEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { createHandler } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/errors';
import { createBetaInviteSchema, updateBetaInviteSchema } from '@/lib/schemas/betaInvite';

export const POST = createHandler(
  {
    auth: 'admin',
    rateLimit: { name: 'admin-beta-invites-post', max: 30, windowSeconds: 60 },
    schema: createBetaInviteSchema,
    defaultErrorMessage: 'Failed to create beta invite',
    routeLabel: 'POST /api/admin/beta-invites',
  },
  async (_request, { body }) => {
    const { email, expiresInDays, sendEmail = true } = body;

    const code = await createBetaInvite(email, expiresInDays);

    let emailResult = null;
    if (sendEmail) {
      const invite = await prisma.betaInvite.findUnique({ where: { code } });
      if (invite) {
        emailResult = await sendBetaInviteEmail({
          email: invite.email,
          code: invite.code,
          expiresAt: invite.expiresAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Beta invite created for ${email}${sendEmail ? ' and email sent' : ''}`,
      code,
      emailSent: emailResult?.success || false,
    });
  }
);

export const GET = createHandler(
  {
    auth: 'admin',
    rateLimit: { name: 'admin-beta-invites-get', max: 30, windowSeconds: 60 },
    defaultErrorMessage: 'Failed to fetch beta invites',
    routeLabel: 'GET /api/admin/beta-invites',
  },
  async () => {
    const invites = await prisma.betaInvite.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ invites });
  }
);

export const PATCH = createHandler(
  {
    auth: 'admin',
    rateLimit: { name: 'admin-beta-invites-patch', max: 30, windowSeconds: 60 },
    schema: updateBetaInviteSchema,
    routeLabel: 'PATCH /api/admin/beta-invites',
  },
  async (_request, { body }) => {
    const { id } = body;

    try {
      await revokeBetaInvite(id);
    } catch (error) {
      throw new ApiError(500, error instanceof Error ? error.message : 'Failed to update beta invite');
    }

    return NextResponse.json({ success: true, message: 'Beta invite revoked successfully' });
  }
);
