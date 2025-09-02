import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('🔍 [DEBUG] GET /api/food-logs called');
  try {
    const session = await auth();
    console.log('🔍 [DEBUG] Session:', session?.user?.id ? `User ID: ${session.user.id}` : 'No session');
    
    if (!session?.user?.id) {
      console.log('🔍 [DEBUG] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    console.log('🔍 [DEBUG] Requested date:', date);
    
    const whereClause: { userId: string; date?: { gte: Date; lte: Date } } = {
      userId: session.user.id,
    };

    if (date) {
      // Parse date and create date range for the entire day in local timezone
      const targetDate = new Date(date);
      // Normalize to start of day in local timezone
      const normalizedDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      
      const startOfDay = new Date(normalizedDate);
      const endOfDay = new Date(normalizedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      console.log('🔍 [DEBUG] Date range:', { startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString() });
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }    const foodLogs = await prisma.foodLog.findMany({
      where: whereClause,
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    console.log('🔍 [DEBUG] Found', foodLogs.length, 'entries');
    return NextResponse.json(foodLogs);
  } catch (error) {
    console.error('Error fetching food logs:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation: 'GET /api/food-logs',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      foodName,
      brand,
      quantity,
      unit,
      mealType,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
      date,
    } = body;

    // Calculate the next orderIndex for this meal type and date
    const targetDate = date ? new Date(date) : new Date();
    // For querying, normalize to start of day in local timezone
    const queryDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    const startOfDay = new Date(queryDate);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find the highest orderIndex for entries with the same mealType on the same date
    const lastEntryInMeal = await prisma.foodLog.findFirst({
      where: {
        userId: session.user.id,
        mealType: mealType,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        orderIndex: 'desc',
      },
    });

    // Set orderIndex to be after the last entry in this meal type, or 0 if none exist
    const nextOrderIndex = lastEntryInMeal && lastEntryInMeal.orderIndex !== null 
      ? lastEntryInMeal.orderIndex + 1 
      : 0;

    const foodLog = await prisma.foodLog.create({
      data: {
        userId: session.user.id,
        foodName,
        brand,
        quantity,
        unit,
        mealType,
        calories,
        protein,
        carbs,
        fat,
        fiber: fiber || 0,
        sodium: sodium || 0,
        date: targetDate, // Preserve the actual timestamp when the entry was created
        orderIndex: nextOrderIndex,
      },
    });

    return NextResponse.json(foodLog, { status: 201 });
  } catch (error) {
    console.error('Error creating food log:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation: 'POST /api/food-logs',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Food log ID is required' }, { status: 400 });
    }

    // Verify the food log belongs to the user before deleting
    const foodLog = await prisma.foodLog.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!foodLog) {
      return NextResponse.json({ error: 'Food log not found' }, { status: 404 });
    }

    await prisma.foodLog.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Food log deleted successfully' });
  } catch (error) {
    console.error('Error deleting food log:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation: 'DELETE /api/food-logs',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, quantity, calories, protein, carbs, fat, mealType, orderIndex } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Food log ID is required' }, { status: 400 });
    }

    // Verify the food log belongs to the user before updating
    const existingFoodLog = await prisma.foodLog.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingFoodLog) {
      return NextResponse.json({ error: 'Food log not found' }, { status: 404 });
    }

    const updatedFoodLog = await prisma.foodLog.update({
      where: { id: id },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(calories !== undefined && { calories }),
        ...(protein !== undefined && { protein }),
        ...(carbs !== undefined && { carbs }),
        ...(fat !== undefined && { fat }),
        ...(mealType !== undefined && { mealType }),
        ...(orderIndex !== undefined && { orderIndex }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedFoodLog);
  } catch (error) {
    console.error('Error updating food log:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation: 'PUT /api/food-logs',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
