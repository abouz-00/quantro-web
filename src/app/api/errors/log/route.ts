import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api/handler';

interface ErrorLog {
  message: string;
  stack?: string;
  context?: {
    userId?: string;
    sessionId?: string;
    url?: string;
    userAgent?: string;
    timestamp?: number;
    severity?: string;
    category?: string;
    tags?: Record<string, string>;
    metadata?: Record<string, unknown>;
    serverTimestamp?: string;
    environment?: string;
  };
  fingerprint?: string;
}

function isBatchPayload(payload: unknown): payload is { errors: ErrorLog[] } {
  return Boolean(payload) && Array.isArray((payload as { errors?: unknown }).errors);
}

export const POST = createHandler(
  {
    auth: 'optional',
    rateLimit: { name: 'errors-log', max: 30, windowSeconds: 60 },
    defaultErrorMessage: 'Failed to process error log',
    routeLabel: 'POST /api/errors/log',
  },
  async (request, { session }) => {
    const payload = await request.json();
    // `errorService` on the client sends batches as `{ errors: [...] }`; a
    // single log object (as sent by older/simpler callers) is normalized to
    // a one-item batch so both shapes are handled identically below.
    const logs: ErrorLog[] = isBatchPayload(payload) ? payload.errors : [payload as ErrorLog];

    for (const errorLog of logs) {
      const enrichedLog: ErrorLog = {
        ...errorLog,
        context: {
          ...errorLog.context,
          userId: session?.user?.id,
          sessionId: session?.user?.email || undefined,
          serverTimestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
      };

      // Log to console (in production, structured logs are also captured by Sentry).
      console.error('🚨 Client Error Report:', JSON.stringify(enrichedLog, null, 2));

      await sendToWebhooks(enrichedLog);
    }

    return NextResponse.json({ success: true });
  }
);

async function sendToWebhooks(errorLog: ErrorLog) {
  const webhooks = process.env.ERROR_WEBHOOKS?.split(',') || [];

  const promises = webhooks.map(async (webhook) => {
    try {
      await fetch(webhook.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog),
      });
    } catch (error) {
      console.error(`Failed to send to webhook ${webhook}:`, error);
    }
  });

  await Promise.allSettled(promises);
}
