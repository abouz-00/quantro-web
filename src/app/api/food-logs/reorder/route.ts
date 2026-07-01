import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api/handler';
import { reorderFoodLogSchema } from '@/lib/schemas/foodLog';
import { reorderFoodLogsForUser } from '@/server/foodLogs';

export const POST = createHandler(
  {
    auth: 'session',
    rateLimit: { name: 'food-logs-reorder', max: 60, windowSeconds: 60 },
    schema: reorderFoodLogSchema,
    routeLabel: 'POST /api/food-logs/reorder',
  },
  async (_request, { session, body }) => {
    await reorderFoodLogsForUser(session!.user.id, body.entryIds);
    return NextResponse.json({ message: 'Order updated successfully' });
  }
);
