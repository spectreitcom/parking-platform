/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Parking` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `Parking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parking" DROP COLUMN "ownerId",
ADD COLUMN     "organizationId" UUID NOT NULL;
