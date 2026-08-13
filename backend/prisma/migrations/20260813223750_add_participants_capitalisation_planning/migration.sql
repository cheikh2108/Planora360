-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capitalization_records" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "challenges" TEXT NOT NULL,
    "solutions" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "lessons" TEXT NOT NULL,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'BROUILLON',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capitalization_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "capitalizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annual_work_plans" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "objectives" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BROUILLON',
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "annual_work_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results_matrices" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_matrices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "participants_organizationId_idx" ON "participants"("organizationId");

-- CreateIndex
CREATE INDEX "participants_activityId_idx" ON "participants"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "participants_phone_activityId_key" ON "participants"("phone", "activityId");

-- CreateIndex
CREATE INDEX "capitalization_records_organizationId_idx" ON "capitalization_records"("organizationId");

-- CreateIndex
CREATE INDEX "capitalization_records_authorId_idx" ON "capitalization_records"("authorId");

-- CreateIndex
CREATE INDEX "media_capitalizationId_idx" ON "media"("capitalizationId");

-- CreateIndex
CREATE INDEX "annual_work_plans_organizationId_idx" ON "annual_work_plans"("organizationId");

-- CreateIndex
CREATE INDEX "annual_work_plans_year_idx" ON "annual_work_plans"("year");

-- CreateIndex
CREATE UNIQUE INDEX "results_matrices_organizationId_key" ON "results_matrices"("organizationId");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capitalization_records" ADD CONSTRAINT "capitalization_records_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_capitalizationId_fkey" FOREIGN KEY ("capitalizationId") REFERENCES "capitalization_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annual_work_plans" ADD CONSTRAINT "annual_work_plans_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results_matrices" ADD CONSTRAINT "results_matrices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
