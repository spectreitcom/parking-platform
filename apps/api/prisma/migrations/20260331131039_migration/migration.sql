/*
  Warnings:

  - Added the required column `version` to the `PlaceRead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaceRead" ADD COLUMN     "version" INTEGER NOT NULL;
