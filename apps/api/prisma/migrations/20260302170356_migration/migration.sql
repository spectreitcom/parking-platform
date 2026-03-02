/*
  Warnings:

  - A unique constraint covering the columns `[deduplicationKey]` on the table `OutboxMessage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deduplicationKey` to the `OutboxMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OutboxMessage" ADD COLUMN     "deduplicationKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OutboxMessage_deduplicationKey_key" ON "OutboxMessage"("deduplicationKey");
