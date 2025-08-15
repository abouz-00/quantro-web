import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json()

    if (!code || !email) {
      return NextResponse.json({ error: 'Missing code or email' }, { status: 400 })
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
