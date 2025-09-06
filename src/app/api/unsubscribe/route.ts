import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find and update the user
    const user = await prisma.user.findUnique({
      where: { email }
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
