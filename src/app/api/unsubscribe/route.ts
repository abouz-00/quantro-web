import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimitOrError } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimitOrError('unsubscribe', request, { max: 10, windowSeconds: 60 })
    if (limited) return limited

    const { email } = await request.json()

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Find and update the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // For security, don't reveal if email exists or not
      return NextResponse.json(
        { message: 'If this email is registered, you have been unsubscribed from marketing emails.' },
        { status: 200 }
      )
    }

    // Update the user's unsubscribe status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailUnsubscribed: true }
    })

    return NextResponse.json({
      message: 'You have been successfully unsubscribed from marketing emails.'
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
