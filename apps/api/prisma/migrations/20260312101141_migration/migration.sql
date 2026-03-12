/*
  Warnings:

  - You are about to drop the column `staus` on the `OrganizationUser` table. All the data in the column will be lost.
  - Added the required column `status` to the `OrganizationUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrganizationUser" DROP COLUMN "staus",
ADD COLUMN     "status" VARCHAR(60) NOT NULL;
