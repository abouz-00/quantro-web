import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

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
    metadata?: Record<string, any>;
    serverTimestamp?: string;
    environment?: string;
  };
  fingerprint?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const errorLog: ErrorLog = await request.json();

    // Add session context
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

    // Log to console (in production, this would go to structured logging)
    console.error('🚨 Client Error Report:', JSON.stringify(enrichedLog, null, 2));

    // In production, you would:
    // 1. Send to structured logging service (e.g., Winston, Pino)
    // 2. Store in database for analysis
    // 3. Send alerts for critical errors
    // 4. Forward to external services (DataDog, New Relic, etc.)

    // Example structured logging (uncomment in production):
    /*
    const winston = require('winston');
    const logger = winston.createLogger({
      level: 'error',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'error.log' }),
        new winston.transports.Console(),
      ],
    });
    
    logger.error('Client error', enrichedLog);
    */

    // Example database storage (uncomment when database schema is ready):
    /*
    await prisma.errorLog.create({
      data: {
        message: enrichedLog.message,
        stack: enrichedLog.stack,
        fingerprint: enrichedLog.fingerprint,
        severity: enrichedLog.context?.severity || 'medium',
        category: enrichedLog.context?.category || 'unknown',
        userId: enrichedLog.context?.userId,
        url: enrichedLog.context?.url,
        userAgent: enrichedLog.context?.userAgent,
        metadata: enrichedLog.context?.metadata ? JSON.stringify(enrichedLog.context.metadata) : null,
        timestamp: new Date(enrichedLog.context?.timestamp || Date.now()),
      },
    });
    */

    // Send to external monitoring services
    await Promise.allSettled([
      sendToSlack(enrichedLog),
      sendToWebhooks(enrichedLog),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process error log:', error);
    return NextResponse.json(
      { error: 'Failed to process error log' },
      { status: 500 }
    );
  }
}

async function sendToSlack(errorLog: ErrorLog) {
  const webhookUrl = process.env.SLACK_ERROR_WEBHOOK;
  if (!webhookUrl || process.env.NODE_ENV !== 'production') return;

  const severity = errorLog.context?.severity || 'medium';
  const emoji = {
    low: '⚠️',
    medium: '🚨',
    high: '🔥',
    critical: '💀',
  }[severity] || '⚠️';

  const message = {
    text: `${emoji} Error in Quantro`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${emoji} Error in Quantro*\n*Severity:* ${severity}\n*Message:* ${errorLog.message}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*User:* ${errorLog.context?.userId || 'Anonymous'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Category:* ${errorLog.context?.category || 'Unknown'}`,
          },
          {
            type: 'mrkdwn',
            text: `*URL:* ${errorLog.context?.url || 'Unknown'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:* ${new Date(errorLog.context?.timestamp || Date.now()).toISOString()}`,
          },
        ],
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Failed to send error to Slack:', error);
  }
}

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
