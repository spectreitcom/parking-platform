-- CreateTable
CREATE TABLE "OrganizationUserRead" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(120) NOT NULL,
    "statusText" VARCHAR(80) NOT NULL,

    CONSTRAINT "OrganizationUserRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUserRead_email_key" ON "OrganizationUserRead"("email");

-- CreateIndex
CREATE INDEX "OrganizationUserRead_email_displayName_idx" ON "OrganizationUserRead"("email", "displayName");
