-- CreateTable
CREATE TABLE "AdminUserRead" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL,
    "displayName" VARCHAR(120) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUserRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUserRead_email_key" ON "AdminUserRead"("email");

-- CreateIndex
CREATE INDEX "AdminUserRead_email_idx" ON "AdminUserRead"("email");

-- CreateIndex
CREATE INDEX "AdminUserRead_displayName_idx" ON "AdminUserRead"("displayName");

-- CreateIndex
CREATE INDEX "AdminUserRead_status_idx" ON "AdminUserRead"("status");
