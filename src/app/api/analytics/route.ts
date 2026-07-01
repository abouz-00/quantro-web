import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api/handler';

export const POST = createHandler(
  {
    rateLimit: { name: 'analytics', max: 60, windowSeconds: 60 },
    defaultErrorMessage: 'Failed to process analytics event',
    routeLabel: 'POST /api/analytics',
  },
  async (request) => {
    const data = await request.json();

    // Log analytics event. In production this would forward to GA4 /
    // Mixpanel / Segment / a custom analytics pipeline.
    console.log('📊 Analytics Event:', {
      timestamp: new Date().toISOString(),
      ...data,
    });

    return NextResponse.json({ success: true });
  }
);
