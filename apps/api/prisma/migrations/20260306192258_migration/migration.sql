/*
  Warnings:

  - A unique constraint covering the columns `[adminUserId]` on the table `AdminUserRead` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminUserId` to the `AdminUserRead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminUserRead" ADD COLUMN     "adminUserId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdminUserRead_adminUserId_key" ON "AdminUserRead"("adminUserId");
