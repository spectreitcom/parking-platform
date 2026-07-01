-- CreateTable
CREATE TABLE "Availability" (
    "id" UUID NOT NULL,
    "parkingSpotId" UUID NOT NULL,
    "available" BOOLEAN NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);
