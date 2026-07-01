import { z } from 'zod'

const emailField = z.string().trim().toLowerCase().email().max(320)

export const createBetaInviteSchema = z.object({
  email: emailField,
  expiresInDays: z.number().int().positive().max(3650).optional(),
  sendEmail: z.boolean().optional(),
})

export const updateBetaInviteSchema = z.object({
  id: z.string().min(1),
  action: z.enum(['revoke']),
})
