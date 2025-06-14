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
    
    const whereClause: any = {
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
