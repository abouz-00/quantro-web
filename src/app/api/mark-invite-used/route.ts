import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler } from '@/lib/api/handler'
import { ApiError } from '@/lib/api/errors'

export const POST = createHandler(
  {
    auth: 'session',
    rateLimit: { name: 'mark-invite-used', max: 10, windowSeconds: 60 },
    defaultErrorMessage: 'Failed to mark invite as used',
    routeLabel: 'POST /api/mark-invite-used',
  },
  async (request, { session }) => {
    if (!session?.user?.email) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { code, email } = await request.json()

    if (!code || !email) {
      throw new ApiError(400, 'Missing code or email')
    }

    // An invite can only be burned by the signed-in owner of that email —
    // otherwise any authenticated user could invalidate someone else's
    // pending invite just by knowing their email + code.
    if (session.user.email.toLowerCase() !== String(email).toLowerCase()) {
      throw new ApiError(403, 'Forbidden')
    }

    const invite = await prisma.betaInvite.findFirst({
      where: {
        code,
        email: email.toLowerCase(),
        used: false,
        revoked: false,
      },
    })

    if (!invite) {
      throw new ApiError(404, 'Invite not found or already used')
    }

    await prisma.betaInvite.update({
      where: { id: invite.id },
      data: { used: true, usedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  }
)
