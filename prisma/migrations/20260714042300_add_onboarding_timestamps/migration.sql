-- Add nullable onboarding markers used by the User Prisma model.
ALTER TABLE "users" ADD COLUMN "goalsUpdatedAt" DATETIME;
ALTER TABLE "users" ADD COLUMN "firstLoggedAt" DATETIME;
