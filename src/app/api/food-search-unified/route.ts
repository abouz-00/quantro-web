import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { unifiedFoodSearch } from '@/lib/services/unified-food-search';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const query = searchParams.get('query');
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10', 10) || 10, 1), 50);
    const source = (searchParams.get('source') || 'all') as 'all' | 'usda' | 'fatsecret';

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    if (!['all', 'usda', 'fatsecret'].includes(source)) {
      return NextResponse.json({ error: 'Invalid source. Must be all, usda, or fatsecret' }, { status: 400 });
    }

    const results = await unifiedFoodSearch(query, pageSize, source);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
