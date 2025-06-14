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
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
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
    const {
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbGoal,
      dailyFatGoal,
      weightUnit,
      heightUnit,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dailyCalorieGoal,
        dailyProteinGoal,
        dailyCarbGoal,
        dailyFatGoal,
        weightUnit,
        heightUnit,
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
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
