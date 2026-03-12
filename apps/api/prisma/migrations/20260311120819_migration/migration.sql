/*
  Warnings:

  - Added the required column `organizationId` to the `OrganizationRead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrganizationRead" ADD COLUMN     "organizationId" UUID NOT NULL;
