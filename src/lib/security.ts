import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export function rateLimit(options: RateLimitOptions) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const now = Date.now()
    const key = `${ip}-${request.nextUrl.pathname}`
    
    const limit = rateLimitMap.get(key)
    
    if (!limit || now > limit.resetTime) {
      // Reset the limit
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      })
      return null // No rate limit exceeded
    }
    
    if (limit.count >= options.maxRequests) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Increment the count
    limit.count++
    return null
  }
}

interface ValidationRule {
  required?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

export function validateInput(data: Record<string, unknown>, schema: ValidationSchema) {
  // Basic input validation - extend with Zod or similar in production
  const errors: string[] = []
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key]
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`)
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} must be a string`)
      }
      
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${key} must be a number`)
      }
      
      if ('min' in rules && typeof value === 'number' && rules.min && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`)
      }
      
      if ('max' in rules && typeof value === 'number' && rules.max && value > rules.max) {
        errors.push(`${key} must be at most ${rules.max}`)
      }
      
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`${key} has invalid format`)
      }
    }
  }
  
  return errors
}

export function sanitizeString(input: string): string {
  // Basic string sanitization
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 1000) // Limit length
}

export async function requireAuth(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  return token
}
