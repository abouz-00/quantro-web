import { NextRequest, NextResponse } from 'next/server';
import { createHandler } from '@/lib/api/handler';
import { createFoodLogSchema, updateFoodLogSchema } from '@/lib/schemas/foodLog';
import {
  createFoodLogForUser,
  deleteFoodLogForUser,
  getFoodLogsForUser,
  updateFoodLogForUser,
} from '@/server/foodLogs';
import { ApiError } from '@/lib/api/errors';

export const GET = createHandler(
  { auth: 'session', rateLimit: { name: 'food-logs-get', max: 120, windowSeconds: 60 }, routeLabel: 'GET /api/food-logs' },
  async (request, { session }) => {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const foodLogs = await getFoodLogsForUser(session!.user.id, searchParams.get('date'));
    const totalTime = Date.now() - startTime;

    return NextResponse.json(foodLogs, {
      headers: {
        // Food logs are user-specific and reordered client-side, so stale cache breaks drag persistence.
        'Cache-Control': 'private, no-store',
        'X-Response-Time': `${totalTime}ms`,
      },
    });
  }
);

export const POST = createHandler(
  {
    auth: 'session',
    rateLimit: { name: 'food-logs-post', max: 60, windowSeconds: 60 },
    schema: createFoodLogSchema,
    routeLabel: 'POST /api/food-logs',
  },
  async (_request, { session, body }) => {
    const foodLog = await createFoodLogForUser(session!.user.id, body);
    return NextResponse.json(foodLog, { status: 201 });
  }
);

export const PUT = createHandler(
  {
    auth: 'session',
    rateLimit: { name: 'food-logs-put', max: 60, windowSeconds: 60 },
    schema: updateFoodLogSchema,
    routeLabel: 'PUT /api/food-logs',
  },
  async (_request, { session, body }) => {
    const updatedFoodLog = await updateFoodLogForUser(session!.user.id, body);
    return NextResponse.json(updatedFoodLog);
  }
);

export const DELETE = createHandler(
  { auth: 'session', rateLimit: { name: 'food-logs-delete', max: 60, windowSeconds: 60 }, routeLabel: 'DELETE /api/food-logs' },
  async (request: NextRequest, { session }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ApiError(400, 'Food log ID is required');
    }

    await deleteFoodLogForUser(session!.user.id, id);
    return NextResponse.json({ message: 'Food log deleted successfully' });
  }
);
