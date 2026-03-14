-- CreateTable
CREATE TABLE "Cart" (
    "id" UUID NOT NULL,
    "parkingSpotId" UUID NOT NULL,
    "arrival" INTEGER NOT NULL,
    "departure" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,
    "priceByDay" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" UUID,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_id_parkingSpotId_key" ON "Cart"("id", "parkingSpotId");
