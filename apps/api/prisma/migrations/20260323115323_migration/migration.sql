/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `ParkingAddonRead` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `ParkingAddonRead` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ParkingAddonRead_name_priceInPln_idx";

-- AlterTable
ALTER TABLE "ParkingAddonRead" ADD COLUMN     "code" VARCHAR(60) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ParkingAddonRead_code_key" ON "ParkingAddonRead"("code");

-- CreateIndex
CREATE INDEX "ParkingAddonRead_name_code_priceInPln_idx" ON "ParkingAddonRead"("name", "code", "priceInPln");
