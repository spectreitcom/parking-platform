-- AlterTable
ALTER TABLE "Parking" ADD COLUMN     "parkingAddonIds" UUID[] DEFAULT ARRAY[]::UUID[];
