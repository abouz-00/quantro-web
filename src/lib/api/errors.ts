/**
 * Thrown by route handlers/services to signal an expected, user-facing HTTP
 * error (404 not found, 403 forbidden, 400 bad request, etc). Caught by
 * `createHandler` (see `./handler.ts`), which turns it into a JSON response
 * with `status` and `{ error: message, details? }` — the same shape every
 * route already returns today, just without every route re-implementing the
 * try/catch that produces it.
 */
export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}
