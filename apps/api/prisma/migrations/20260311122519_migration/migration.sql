/*
  Warnings:

  - You are about to drop the column `userId` on the `OrganizationOrganizationUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organizationUserId]` on the table `OrganizationOrganizationUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationUserId` to the `OrganizationOrganizationUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "OrganizationOrganizationUser_userId_key";

-- AlterTable
ALTER TABLE "OrganizationOrganizationUser" DROP COLUMN "userId",
ADD COLUMN     "organizationUserId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationOrganizationUser_organizationUserId_key" ON "OrganizationOrganizationUser"("organizationUserId");

-- CreateIndex
CREATE INDEX "OrganizationOrganizationUser_organizationUserId_idx" ON "OrganizationOrganizationUser"("organizationUserId");
