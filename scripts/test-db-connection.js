#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔗 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test table existence and structure
    console.log('\n📋 Testing table structure...');
    
    // Try to query users table
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible (${userCount} users)`);
    } catch (error) {
      console.error('❌ User table error:', error.message);
    }
    
    // Try to query food logs table
    try {
      const foodLogCount = await prisma.foodLog.count();
      console.log(`✅ FoodLog table accessible (${foodLogCount} food logs)`);
    } catch (error) {
      console.error('❌ FoodLog table error:', error.message);
    }
    
    // Test creating a sample user (for test database only)
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('test.db')) {
      console.log('\n🧪 Testing CRUD operations on test database...');
      
      try {
        // Create test user
        const testUser = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User',
            isApproved: true,
          }
        });
        console.log('✅ User creation successful');
        
        // Create test food log
        const testFoodLog = await prisma.foodLog.create({
          data: {
            userId: testUser.id,
            foodName: 'Test Food',
            quantity: 1.0,
            unit: 'cup',
            mealType: 'breakfast',
            calories: 100,
            protein: 5,
            carbs: 15,
            fat: 2,
          }
        });
        console.log('✅ FoodLog creation successful');
        
        // Test querying
        const queriedFoodLogs = await prisma.foodLog.findMany({
          where: { userId: testUser.id }
        });
        console.log(`✅ FoodLog query successful (found ${queriedFoodLogs.length} logs)`);
        
        // Clean up test data
        await prisma.foodLog.delete({ where: { id: testFoodLog.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
        console.log('✅ Test data cleanup successful');
        
      } catch (error) {
        console.error('❌ CRUD operation failed:', error.message);
        console.error('Full error:', error);
      }
    }
    
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check environment
console.log('🌍 Environment Check:');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL || 'Not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log('');

testDatabaseConnection().catch(console.error);
