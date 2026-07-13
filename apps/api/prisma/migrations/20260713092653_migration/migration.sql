/*
  Warnings:

  - Added the required column `addons` to the `Search` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Search" ADD COLUMN     "addonIds" UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN     "addons" JSONB NOT NULL;
