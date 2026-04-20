import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbGoal: true,
        dailyFatGoal: true,
        weightUnit: true,
        heightUnit: true,
        goalsUpdatedAt: true,
        firstLoggedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, {
      headers: {
        // Cache user profile for 5 minutes
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
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
    const {
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbGoal,
      dailyFatGoal,
      weightUnit,
      heightUnit,
    } = body;

    // If any goal fields are being updated, set goalsUpdatedAt
    const isGoalUpdate = dailyCalorieGoal !== undefined || dailyProteinGoal !== undefined ||
      dailyCarbGoal !== undefined || dailyFatGoal !== undefined;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dailyCalorieGoal,
        dailyProteinGoal,
        dailyCarbGoal,
        dailyFatGoal,
        weightUnit,
        heightUnit,
        ...(isGoalUpdate && { goalsUpdatedAt: new Date() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbGoal: true,
        dailyFatGoal: true,
        weightUnit: true,
        heightUnit: true,
        goalsUpdatedAt: true,
        firstLoggedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
