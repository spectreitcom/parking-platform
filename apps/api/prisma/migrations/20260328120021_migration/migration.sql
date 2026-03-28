/*
  Warnings:

  - Added the required column `version` to the `OrganizationListForAdminRead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrganizationListForAdminRead" ADD COLUMN     "version" INTEGER NOT NULL;
