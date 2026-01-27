import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface DebugResponse {
  timestamp: string;
  session: {
    exists: boolean;
    userId: string | null;
    userEmail: string | null;
  };
  database: {
    connected: boolean;
    userExists: boolean;
    foodLogCount: number;
    recentEntries: Array<{
      id: string;
      foodName: string;
      date: Date;
      calories: number;
      createdAt: Date;
    }>;
    error?: string;
  };
  environment: {
    nodeEnv: string | undefined;
    databaseUrl: string;
  };
}

 
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Debug API called');
    
    // Check session
    const session = await auth();
    console.log('🧪 Session check:', session?.user?.id ? `User ID: ${session.user.id}` : 'No session');
    
    const response: DebugResponse = {
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null
      },
      database: {
        connected: false,
        userExists: false,
        foodLogCount: 0,
        recentEntries: []
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    };

    // Test database connection
    try {
      await prisma.$connect();
      response.database.connected = true;
      console.log('🧪 Database connected');

      // Check if user exists in database
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id }
        });
        response.database.userExists = !!user;
        console.log('🧪 User exists in DB:', !!user);

        if (user) {
          // Get food log count for user
          const foodLogCount = await prisma.foodLog.count({
            where: { userId: session.user.id }
          });
          response.database.foodLogCount = foodLogCount;
          console.log('🧪 User food log count:', foodLogCount);

          // Get recent entries
          const recentEntries = await prisma.foodLog.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              foodName: true,
              date: true,
              calories: true,
              createdAt: true
            }
          });
          response.database.recentEntries = recentEntries;
          console.log('🧪 Recent entries:', recentEntries.length);
        }
      }
    } catch (dbError) {
      console.error('🧪 Database error:', dbError);
      response.database = {
        connected: false,
        userExists: false,
        foodLogCount: 0,
        recentEntries: [],
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      } as typeof response.database;
    }

    console.log('🧪 Debug response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('🧪 Debug API error:', error);
    return NextResponse.json({ 
      error: 'Debug API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
