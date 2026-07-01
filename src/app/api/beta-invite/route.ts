import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createHandler } from '@/lib/api/handler'
import { ApiError } from '@/lib/api/errors'
import { acceptBetaInviteSchema } from '@/lib/schemas/betaInvite'

async function findActiveInvite(where: { code: string }) {
  return prisma.betaInvite.findFirst({
    where: {
      ...where,
      used: false,
      revoked: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  })
}

export const GET = createHandler(
  {
    rateLimit: { name: 'beta-invite-get', max: 20, windowSeconds: 60 },
    defaultErrorMessage: 'Failed to validate invite',
    routeLabel: 'GET /api/beta-invite',
  },
  async (request) => {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      throw new ApiError(400, 'Invalid invite code')
    }

    const invite = await findActiveInvite({ code })
    if (!invite) {
      throw new ApiError(404, 'Invalid, expired, or revoked invite code')
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      code: invite.code,
      expiresAt: invite.expiresAt,
    })
  }
)

export const POST = createHandler(
  {
    rateLimit: { name: 'beta-invite-post', max: 20, windowSeconds: 60 },
    schema: acceptBetaInviteSchema,
    defaultErrorMessage: 'Failed to accept invite',
    routeLabel: 'POST /api/beta-invite',
  },
  async (_request, { body }) => {
    // Don't mark as used yet — just validate and allow redirect to sign-in.
    // Burning the invite happens later via /api/mark-invite-used, once the
    // user has actually signed in as that email.
    const invite = await findActiveInvite({ code: body.code })
    if (!invite) {
      throw new ApiError(404, 'Invalid, expired, or revoked invite code')
    }

    return NextResponse.json({
      success: true,
      message: 'Beta invite validated! Redirecting to sign in...',
      email: invite.email,
    })
  }
)
