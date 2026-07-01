import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/errors';
import { unifiedFoodSearch } from '@/lib/services/unified-food-search';

export const GET = createHandler(
  {
    auth: 'session',
    rateLimit: { name: 'food-search-unified', max: 30, windowSeconds: 60 },
    routeLabel: 'GET /api/food-search-unified',
  },
  async (request) => {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('query');
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10', 10) || 10, 1), 50);
    const source = (searchParams.get('source') || 'all') as 'all' | 'usda' | 'fatsecret';

    if (!query || query.length < 2) {
      throw new ApiError(400, 'Query must be at least 2 characters');
    }

    if (!['all', 'usda', 'fatsecret'].includes(source)) {
      throw new ApiError(400, 'Invalid source. Must be all, usda, or fatsecret');
    }

    const results = await unifiedFoodSearch(query, pageSize, source);
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    });
  }
);
