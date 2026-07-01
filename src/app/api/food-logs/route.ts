import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createFoodLogSchema, updateFoodLogSchema } from '@/lib/schemas/foodLog';
import { parseOrError } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const whereClause: { userId: string; date?: { gte: Date; lte: Date } } = {
      userId: session.user.id,
    };

    if (date) {
      // Parse YYYY-MM-DD string as local date components to avoid UTC shift.
      // new Date("YYYY-MM-DD") parses as UTC midnight, which gives the wrong
      // local date for timezones west of UTC (e.g. PDT: Mar 18 UTC = Mar 17 local).
      const [year, month, day] = date.split('-').map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    const foodLogs = await prisma.foodLog.findMany({
      where: whereClause,
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    const totalTime = Date.now() - startTime;
    return NextResponse.json(foodLogs, {
      headers: {
        // Food logs are user-specific and reordered client-side, so stale cache breaks drag persistence.
        'Cache-Control': 'private, no-store',
        'X-Response-Time': `${totalTime}ms`,
      },
    });
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

    const rawBody = await request.json();
    const { data: body, error: validationError } = parseOrError(createFoodLogSchema, rawBody);
    if (validationError) return validationError;

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
      // Micronutrients
      vitaminB1,
      vitaminB2,
      vitaminB3,
      vitaminB5,
      vitaminB6,
      vitaminB12,
      biotin,
      folate,
      vitaminA,
      vitaminC,
      vitaminD,
      vitaminK,
      calcium,
      copper,
      iron,
      magnesium,
      manganese,
      phosphorus,
      potassium,
      selenium,
      zinc,
      omega3,
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
        date: targetDate,
        orderIndex: nextOrderIndex,
        // Micronutrients
        vitaminB1: vitaminB1 || null,
        vitaminB2: vitaminB2 || null,
        vitaminB3: vitaminB3 || null,
        vitaminB5: vitaminB5 || null,
        vitaminB6: vitaminB6 || null,
        vitaminB12: vitaminB12 || null,
        biotin: biotin || null,
        folate: folate || null,
        vitaminA: vitaminA || null,
        vitaminC: vitaminC || null,
        vitaminD: vitaminD || null,
        vitaminK: vitaminK || null,
        calcium: calcium || null,
        copper: copper || null,
        iron: iron || null,
        magnesium: magnesium || null,
        manganese: manganese || null,
        phosphorus: phosphorus || null,
        potassium: potassium || null,
        selenium: selenium || null,
        zinc: zinc || null,
        omega3: omega3 || null,
      },
    });

    // Set firstLoggedAt if this is the user's first food log
    try {
      await prisma.user.updateMany({
        where: { id: session.user.id, firstLoggedAt: null },
        data: { firstLoggedAt: new Date() },
      });
    } catch (e) {
      console.error('Failed to set firstLoggedAt:', e);
    }

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

    const rawBody = await request.json();
    const { data: body, error: validationError } = parseOrError(updateFoodLogSchema, rawBody);
    if (validationError) return validationError;

    const { id, quantity, calories, protein, carbs, fat, mealType, orderIndex,
      vitaminB1, vitaminB2, vitaminB3, vitaminB5, vitaminB6, vitaminB12,
      biotin, folate, vitaminA, vitaminC, vitaminD, vitaminK,
      calcium, copper, iron, magnesium, manganese, phosphorus,
      potassium, selenium, zinc, omega3 } = body;

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
        ...(vitaminB1 !== undefined && { vitaminB1 }),
        ...(vitaminB2 !== undefined && { vitaminB2 }),
        ...(vitaminB3 !== undefined && { vitaminB3 }),
        ...(vitaminB5 !== undefined && { vitaminB5 }),
        ...(vitaminB6 !== undefined && { vitaminB6 }),
        ...(vitaminB12 !== undefined && { vitaminB12 }),
        ...(biotin !== undefined && { biotin }),
        ...(folate !== undefined && { folate }),
        ...(vitaminA !== undefined && { vitaminA }),
        ...(vitaminC !== undefined && { vitaminC }),
        ...(vitaminD !== undefined && { vitaminD }),
        ...(vitaminK !== undefined && { vitaminK }),
        ...(calcium !== undefined && { calcium }),
        ...(copper !== undefined && { copper }),
        ...(iron !== undefined && { iron }),
        ...(magnesium !== undefined && { magnesium }),
        ...(manganese !== undefined && { manganese }),
        ...(phosphorus !== undefined && { phosphorus }),
        ...(potassium !== undefined && { potassium }),
        ...(selenium !== undefined && { selenium }),
        ...(zinc !== undefined && { zinc }),
        ...(omega3 !== undefined && { omega3 }),
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
