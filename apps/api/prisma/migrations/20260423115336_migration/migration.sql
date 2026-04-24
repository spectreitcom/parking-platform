-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "addons" SET DEFAULT ARRAY[]::VARCHAR(90)[];
