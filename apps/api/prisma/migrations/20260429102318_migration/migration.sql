/*
  Warnings:

  - The `parkingAddonIds` column on the `ParkingRead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parkingFeatureIds` column on the `ParkingRead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ParkingRead" DROP COLUMN "parkingAddonIds",
ADD COLUMN     "parkingAddonIds" UUID[] DEFAULT ARRAY[]::UUID[],
DROP COLUMN "parkingFeatureIds",
ADD COLUMN     "parkingFeatureIds" UUID[] DEFAULT ARRAY[]::UUID[];
