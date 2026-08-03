-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "expectedResults" TEXT;

-- CreateTable
CREATE TABLE "activity_collaborators" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "activityId" TEXT,
    "title" TEXT NOT NULL,
    "unit" TEXT,
    "baseline" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "target" DOUBLE PRECISION NOT NULL,
    "achieved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_collaborators_activityId_idx" ON "activity_collaborators"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_collaborators_activityId_userId_key" ON "activity_collaborators"("activityId", "userId");

-- CreateIndex
CREATE INDEX "indicators_organizationId_idx" ON "indicators"("organizationId");

-- CreateIndex
CREATE INDEX "indicators_activityId_idx" ON "indicators"("activityId");

-- AddForeignKey
ALTER TABLE "activity_collaborators" ADD CONSTRAINT "activity_collaborators_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_collaborators" ADD CONSTRAINT "activity_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
