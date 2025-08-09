import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const whereClause: { userId: string; date?: { gte: Date; lte: Date } } = {
      userId: session.user.id,
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const foodLogs = await prisma.foodLog.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(foodLogs);
  } catch (error) {
    console.error('Error fetching food logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
      sugar,
      sodium,
    } = body;

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
        fiber,
        sugar,
        sodium,
      },
    });

    return NextResponse.json(foodLog, { status: 201 });
  } catch (error) {
    console.error('Error creating food log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
    console.error('Error deleting food log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, quantity, calories, protein, carbs, fat } = body;
    
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
        quantity,
        calories,
        protein,
        carbs,
        fat,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedFoodLog);
  } catch (error) {
    console.error('Error updating food log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
