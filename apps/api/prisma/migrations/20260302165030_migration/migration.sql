-- AlterEnum
ALTER TYPE "OutboxStatus" ADD VALUE 'DEAD_LETTER';

-- CreateIndex
CREATE INDEX "OutboxMessage_updatedAt_idx" ON "OutboxMessage"("updatedAt");
