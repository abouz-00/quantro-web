import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryIds } = body;
    
    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json({ error: 'Invalid entry IDs' }, { status: 400 });
    }

    // Verify all entries belong to the user
    const existingEntries = await prisma.foodLog.findMany({
      where: {
        id: { in: entryIds },
        userId: session.user.id,
      },
    });

    if (existingEntries.length !== entryIds.length) {
      return NextResponse.json({ error: 'Some entries not found or unauthorized' }, { status: 404 });
    }

    // Update order indices based on the array order
    const updatePromises = entryIds.map((id: string, index: number) =>
      prisma.foodLog.update({
        where: { id },
        data: { orderIndex: index },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating food log order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
