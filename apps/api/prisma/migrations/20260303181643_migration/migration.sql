/*
  Warnings:

  - Added the required column `ownerId` to the `Parking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parking" ADD COLUMN     "ownerId" UUID NOT NULL;
