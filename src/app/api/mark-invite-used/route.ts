import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimitOrError } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimitOrError('mark-invite-used', request, { max: 10, windowSeconds: 60 })
    if (limited) return limited

    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, email } = await request.json()

    if (!code || !email) {
      return NextResponse.json({ error: 'Missing code or email' }, { status: 400 })
    }

    // An invite can only be burned by the signed-in owner of that email —
    // otherwise any authenticated user could invalidate someone else's
    // pending invite just by knowing their email + code.
    if (session.user.email.toLowerCase() !== String(email).toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find the specific invite by code and email
    const invite = await prisma.betaInvite.findFirst({
      where: {
        code,
        email: email.toLowerCase(),
        used: false,
        revoked: false
      }
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found or already used' }, { status: 404 })
    }

    // Mark the specific invite as used
    await prisma.betaInvite.update({
      where: { id: invite.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking invite as used:', error)
    return NextResponse.json({ error: 'Failed to mark invite as used' }, { status: 500 })
  }
}
