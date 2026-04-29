/*
  Warnings:

  - Added the required column `parkingId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parkingId` to the `ReservationRead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "parkingId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ReservationRead" ADD COLUMN     "parkingId" UUID NOT NULL;
