/*
  Warnings:

  - A unique constraint covering the columns `[organizationUserId]` on the table `OrganizationUserRead` will be added. If there are existing duplicate values, this will fail.
  - The required column `organizationUserId` was added to the `OrganizationUserRead` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "OrganizationUserRead" ADD COLUMN     "organizationUserId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUserRead_organizationUserId_key" ON "OrganizationUserRead"("organizationUserId");
