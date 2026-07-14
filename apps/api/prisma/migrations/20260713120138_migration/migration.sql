-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "reservationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reservationId_key" ON "Payment"("reservationId");
