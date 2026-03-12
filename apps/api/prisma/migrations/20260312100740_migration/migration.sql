/*
  Warnings:

  - You are about to alter the column `status` on the `AdminUser` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.
  - You are about to alter the column `status` on the `AdminUserRead` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.

*/
-- AlterTable
ALTER TABLE "AdminUser" ALTER COLUMN "status" SET DATA TYPE VARCHAR(60);

-- AlterTable
ALTER TABLE "AdminUserRead" ALTER COLUMN "status" SET DATA TYPE VARCHAR(60);

-- CreateTable
CREATE TABLE "OrganizationUser" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT,
    "displayName" VARCHAR(120) NOT NULL,
    "staus" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUser_email_key" ON "OrganizationUser"("email");
