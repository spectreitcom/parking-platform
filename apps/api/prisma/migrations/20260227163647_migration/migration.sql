-- CreateTable
CREATE TABLE "ParkingType" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingType_pkey" PRIMARY KEY ("id")
);
