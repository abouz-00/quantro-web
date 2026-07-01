import { NextResponse } from 'next/server'
import type { ZodType } from 'zod'

/**
 * Parses `data` against `schema`. Returns either the typed, validated data
 * or a ready-to-return 400 NextResponse describing what was wrong — callers
 * should `return` the error response directly.
 */
export function parseOrError<T>(
  schema: ZodType<T>,
  data: unknown
): { data: T; error?: undefined } | { data?: undefined; error: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      error: NextResponse.json(
        {
          error: 'Invalid request',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    }
  }
  return { data: result.data }
}
