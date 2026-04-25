-- CreateTable
CREATE TABLE "ReservationRead" (
    "id" UUID NOT NULL,
    "reservationId" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "parkingSpotId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "arrival" INTEGER NOT NULL,
    "departure" INTEGER NOT NULL,
    "lines" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "registrationNumber" VARCHAR(20) NOT NULL,
    "addons" VARCHAR(90)[] DEFAULT ARRAY[]::VARCHAR(90)[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservationRead_reservationId_key" ON "ReservationRead"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationRead_registrationNumber_status_arrival_departure_idx" ON "ReservationRead"("registrationNumber", "status", "arrival", "departure", "userId");
