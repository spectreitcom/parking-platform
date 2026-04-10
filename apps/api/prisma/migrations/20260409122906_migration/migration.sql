-- CreateTable
CREATE TABLE "UserRead" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "provider" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRead_userId_key" ON "UserRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRead_email_key" ON "UserRead"("email");

-- CreateIndex
CREATE INDEX "UserRead_email_name_provider_idx" ON "UserRead"("email", "name", "provider");
