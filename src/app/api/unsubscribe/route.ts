import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler } from '@/lib/api/handler'
import { emailOnlySchema } from '@/lib/schemas/betaInvite'

export const POST = createHandler(
  {
    rateLimit: { name: 'unsubscribe', max: 10, windowSeconds: 60 },
    schema: emailOnlySchema,
    defaultErrorMessage: 'An error occurred while processing your request',
    routeLabel: 'POST /api/unsubscribe',
  },
  async (_request, { body }) => {
    const user = await prisma.user.findUnique({ where: { email: body.email } })

    if (!user) {
      // For security, don't reveal if email exists or not.
      return NextResponse.json(
        { message: 'If this email is registered, you have been unsubscribed from marketing emails.' },
        { status: 200 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailUnsubscribed: true },
    })

    return NextResponse.json({
      message: 'You have been successfully unsubscribed from marketing emails.',
    })
  }
)
