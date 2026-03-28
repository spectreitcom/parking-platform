/*
  Warnings:

  - Added the required column `version` to the `ParkingListForAdminRead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParkingListForAdminRead" ADD COLUMN     "version" INTEGER NOT NULL;
