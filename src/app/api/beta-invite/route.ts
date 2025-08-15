import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 })
  }

  try {
    // Find the invite by code
    const invite = await prisma.betaInvite.findFirst({
      where: {
        code,
        used: false,
        revoked: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    if (!invite) {
      return NextResponse.json({ 
        error: 'Invalid, expired, or revoked invite code' 
      }, { status: 404 })
    }

    // Return invite details
    return NextResponse.json({
      valid: true,
      email: invite.email,
      code: invite.code,
      expiresAt: invite.expiresAt
    })
  } catch (error) {
    console.error('Error validating invite:', error)
    return NextResponse.json({ 
      error: 'Failed to validate invite' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, action } = await request.json()

    if (!code || action !== 'accept') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Find and validate the invite (but don't mark as used yet)
    const invite = await prisma.betaInvite.findFirst({
      where: {
        code,
        used: false,
        revoked: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    if (!invite) {
      return NextResponse.json({ 
        error: 'Invalid, expired, or revoked invite code' 
      }, { status: 404 })
    }

    // Don't mark as used yet - just validate and allow redirect to sign-in
    return NextResponse.json({
      success: true,
      message: 'Beta invite validated! Redirecting to sign in...',
      email: invite.email
    })
  } catch (error) {
    console.error('Error accepting invite:', error)
    return NextResponse.json({ 
      error: 'Failed to accept invite' 
    }, { status: 500 })
  }
}
