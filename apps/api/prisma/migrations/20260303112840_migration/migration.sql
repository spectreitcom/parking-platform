-- AlterTable
ALTER TABLE "OutboxMessage" ALTER COLUMN "deduplicationKey" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ParkingFeature" (
    "id" UUID NOT NULL,
    "level" VARCHAR(60) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ParkingFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingFeature_name_key" ON "ParkingFeature"("name");
