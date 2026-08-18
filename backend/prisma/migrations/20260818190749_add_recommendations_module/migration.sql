-- CreateEnum
CREATE TYPE "RecommendationSource" AS ENUM ('MISSION_SUPERVISION', 'VISITE_TERRAIN', 'AUDIT_INTERNE', 'AUDIT_EXTERNE', 'EVALUATION_PROJET', 'EVALUATION_PROGRAMME', 'REUNION_COORDINATION', 'REVUE_PERFORMANCE', 'CONTROLE_INTERNE', 'CONTROLE_QUALITE', 'REVUE_BUDGETAIRE', 'REVUE_FINANCIERE', 'OBSERVATION_BAILLEUR', 'OBSERVATION_PARTENAIRE', 'REVUE_GOUVERNANCE', 'INSPECTION', 'REVUE_DOCUMENTAIRE', 'VERIFICATION_CONFORMITE', 'AUTRE');

-- CreateEnum
CREATE TYPE "RecommendationPriority" AS ENUM ('CRITIQUE', 'ELEVEE', 'MOYENNE', 'FAIBLE');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('NON_DEMARREE', 'EN_COURS', 'PARTIELLEMENT_MISE_EN_OEUVRE', 'REALISEE_A_VALIDER', 'EN_RETARD', 'SUSPENDUE', 'VALIDEE', 'ROUVERTE');

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" "RecommendationSource" NOT NULL,
    "sourceReference" TEXT,
    "sourceDocumentUrl" TEXT,
    "actionPlanId" TEXT,
    "activityId" TEXT,
    "organizationId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "issuerId" TEXT,
    "issuerExternal" TEXT,
    "responsibleId" TEXT NOT NULL,
    "validatorId" TEXT,
    "createdById" TEXT NOT NULL,
    "priority" "RecommendationPriority" NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'NON_DEMARREE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "suspendedReason" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "reopenedReason" TEXT,
    "reopenedAt" TIMESTAMP(3),
    "reopenedBy" TEXT,
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_contributors" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_contributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_actions" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "responsibleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NON_DEMARREE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_evidences" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "description" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_comments" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendation_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_history" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "comment" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_code_key" ON "recommendations"("code");

-- CreateIndex
CREATE INDEX "recommendations_organizationId_idx" ON "recommendations"("organizationId");

-- CreateIndex
CREATE INDEX "recommendations_actionPlanId_idx" ON "recommendations"("actionPlanId");

-- CreateIndex
CREATE INDEX "recommendations_activityId_idx" ON "recommendations"("activityId");

-- CreateIndex
CREATE INDEX "recommendations_responsibleId_idx" ON "recommendations"("responsibleId");

-- CreateIndex
CREATE INDEX "recommendations_status_idx" ON "recommendations"("status");

-- CreateIndex
CREATE INDEX "recommendations_priority_idx" ON "recommendations"("priority");

-- CreateIndex
CREATE INDEX "recommendations_dueDate_idx" ON "recommendations"("dueDate");

-- CreateIndex
CREATE INDEX "recommendations_source_idx" ON "recommendations"("source");

-- CreateIndex
CREATE INDEX "recommendation_contributors_recommendationId_idx" ON "recommendation_contributors"("recommendationId");

-- CreateIndex
CREATE INDEX "recommendation_contributors_userId_idx" ON "recommendation_contributors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_contributors_recommendationId_userId_key" ON "recommendation_contributors"("recommendationId", "userId");

-- CreateIndex
CREATE INDEX "recommendation_actions_recommendationId_idx" ON "recommendation_actions"("recommendationId");

-- CreateIndex
CREATE INDEX "recommendation_actions_responsibleId_idx" ON "recommendation_actions"("responsibleId");

-- CreateIndex
CREATE INDEX "recommendation_evidences_recommendationId_idx" ON "recommendation_evidences"("recommendationId");

-- CreateIndex
CREATE INDEX "recommendation_evidences_uploadedById_idx" ON "recommendation_evidences"("uploadedById");

-- CreateIndex
CREATE INDEX "recommendation_comments_recommendationId_idx" ON "recommendation_comments"("recommendationId");

-- CreateIndex
CREATE INDEX "recommendation_comments_authorId_idx" ON "recommendation_comments"("authorId");

-- CreateIndex
CREATE INDEX "recommendation_history_recommendationId_idx" ON "recommendation_history"("recommendationId");

-- CreateIndex
CREATE INDEX "recommendation_history_userId_idx" ON "recommendation_history"("userId");

-- CreateIndex
CREATE INDEX "recommendation_history_action_idx" ON "recommendation_history"("action");

-- CreateIndex
CREATE INDEX "recommendation_history_createdAt_idx" ON "recommendation_history"("createdAt");

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_actionPlanId_fkey" FOREIGN KEY ("actionPlanId") REFERENCES "action_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_contributors" ADD CONSTRAINT "recommendation_contributors_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_contributors" ADD CONSTRAINT "recommendation_contributors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_actions" ADD CONSTRAINT "recommendation_actions_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_actions" ADD CONSTRAINT "recommendation_actions_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_evidences" ADD CONSTRAINT "recommendation_evidences_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_evidences" ADD CONSTRAINT "recommendation_evidences_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_comments" ADD CONSTRAINT "recommendation_comments_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_comments" ADD CONSTRAINT "recommendation_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_history" ADD CONSTRAINT "recommendation_history_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_history" ADD CONSTRAINT "recommendation_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
