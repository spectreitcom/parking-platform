-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "OutboxMessage" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "boundedContext" TEXT,
    "aggregateType" TEXT,
    "aggregateId" TEXT,
    "payload" JSONB NOT NULL,
    "headers" JSONB,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboxMessage_status_nextRetryAt_idx" ON "OutboxMessage"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "OutboxMessage_boundedContext_idx" ON "OutboxMessage"("boundedContext");

-- CreateIndex
CREATE INDEX "OutboxMessage_aggregateType_aggregateId_idx" ON "OutboxMessage"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "OutboxMessage_createdAt_idx" ON "OutboxMessage"("createdAt");
