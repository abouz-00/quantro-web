-- AlterTable
ALTER TABLE "food_logs" ADD COLUMN "biotin" REAL;
ALTER TABLE "food_logs" ADD COLUMN "calcium" REAL;
ALTER TABLE "food_logs" ADD COLUMN "copper" REAL;
ALTER TABLE "food_logs" ADD COLUMN "folate" REAL;
ALTER TABLE "food_logs" ADD COLUMN "iron" REAL;
ALTER TABLE "food_logs" ADD COLUMN "magnesium" REAL;
ALTER TABLE "food_logs" ADD COLUMN "manganese" REAL;
ALTER TABLE "food_logs" ADD COLUMN "omega3" REAL;
ALTER TABLE "food_logs" ADD COLUMN "phosphorus" REAL;
ALTER TABLE "food_logs" ADD COLUMN "potassium" REAL;
ALTER TABLE "food_logs" ADD COLUMN "selenium" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminA" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminB1" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminB12" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminB2" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminB3" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminB5" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminB6" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminC" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminD" REAL;
ALTER TABLE "food_logs" ADD COLUMN "vitaminK" REAL;
ALTER TABLE "food_logs" ADD COLUMN "zinc" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "invitedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailUnsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "dailyCalorieGoal" INTEGER DEFAULT 2000,
    "dailyProteinGoal" REAL DEFAULT 150,
    "dailyCarbGoal" REAL DEFAULT 250,
    "dailyFatGoal" REAL DEFAULT 67,
    "weightUnit" TEXT NOT NULL DEFAULT 'lbs',
    "heightUnit" TEXT NOT NULL DEFAULT 'ft'
);
INSERT INTO "new_users" ("createdAt", "dailyCalorieGoal", "dailyCarbGoal", "dailyFatGoal", "dailyProteinGoal", "email", "emailUnsubscribed", "emailVerified", "heightUnit", "id", "image", "invitedBy", "isApproved", "name", "updatedAt", "weightUnit") SELECT "createdAt", "dailyCalorieGoal", "dailyCarbGoal", "dailyFatGoal", "dailyProteinGoal", "email", "emailUnsubscribed", "emailVerified", "heightUnit", "id", "image", "invitedBy", "isApproved", "name", "updatedAt", "weightUnit" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "food_logs_userId_date_idx" ON "food_logs"("userId", "date");
