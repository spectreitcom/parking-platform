-- CreateTable
CREATE TABLE "Reservation" (
    "id" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "parkingSpotId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "arrival" INTEGER NOT NULL,
    "departure" INTEGER NOT NULL,
    "lines" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "registrationNumber" VARCHAR(20) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);
