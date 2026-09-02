-- CreateTable
CREATE TABLE "action_plan_zones" (
    "id" TEXT NOT NULL,
    "actionPlanId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_plan_zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "action_plan_zones_actionPlanId_idx" ON "action_plan_zones"("actionPlanId");

-- CreateIndex
CREATE INDEX "action_plan_zones_zoneId_idx" ON "action_plan_zones"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "action_plan_zones_actionPlanId_zoneId_key" ON "action_plan_zones"("actionPlanId", "zoneId");

-- AddForeignKey
ALTER TABLE "action_plan_zones" ADD CONSTRAINT "action_plan_zones_actionPlanId_fkey" FOREIGN KEY ("actionPlanId") REFERENCES "action_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plan_zones" ADD CONSTRAINT "action_plan_zones_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "geographic_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
