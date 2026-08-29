-- CreateEnum
CREATE TYPE "MethodeProcedure" AS ENUM ('ACHAT_DIRECT', 'DEMANDE_COTATION', 'CONSULTATION_RESTREINTE', 'APPEL_OFFRES_OUVERT', 'APPEL_OFFRES_RESTREINT', 'DEMANDE_PROPOSITIONS', 'MANIFESTATION_INTERET', 'SELECTION_CONSULTANT', 'PROCEDURE_URGENCE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatusPPM" AS ENUM ('BROUILLON', 'VALIDE', 'EN_COURS', 'CLOTURE');

-- CreateEnum
CREATE TYPE "StatusDemandeAchat" AS ENUM ('BROUILLON', 'SOUMISE', 'EN_VALIDATION', 'APPROUVEE', 'REJETEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatusProcedure" AS ENUM ('BROUILLON', 'PUBLIEE', 'EN_COURS', 'CLOTUREE_OFFRES', 'EVALUATION', 'ATTRIBUEE', 'INFRUCTUEUSE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatusContrat" AS ENUM ('SIGNE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'CLOTURE', 'RESILIE');

-- CreateEnum
CREATE TYPE "StatusFournisseur" AS ENUM ('A_VALIDER', 'ACTIF', 'SUSPENDU', 'BLACKLISTE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP', 'CHANNEL_PROJECT', 'CHANNEL_TEAM', 'CONTEXTUAL');

-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('ADMIN', 'MEMBER', 'OBSERVER');

-- CreateEnum
CREATE TYPE "MessageContentType" AS ENUM ('TEXT', 'HTML', 'MARKDOWN');

-- CreateEnum
CREATE TYPE "MentionType" AS ENUM ('USER', 'TEAM', 'EVERYONE');

-- CreateTable
CREATE TABLE "plan_passation_marches" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" TEXT,
    "status" "StatusPPM" NOT NULL DEFAULT 'BROUILLON',
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_passation_marches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_ppm" (
    "id" TEXT NOT NULL,
    "ppmId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "objet" TEXT NOT NULL,
    "activityId" TEXT,
    "montantEstimatif" DECIMAL(14,2) NOT NULL,
    "sourceFinancement" TEXT,
    "ligneBudgetaire" TEXT,
    "methodeProcedure" "MethodeProcedure" NOT NULL,
    "dateLancement" TIMESTAMP(3),
    "dateAttribution" TIMESTAMP(3),
    "dateSignature" TIMESTAMP(3),
    "dateExecution" TIMESTAMP(3),
    "responsableId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREVISIONNEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lignes_ppm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_achat" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "lignePPMId" TEXT,
    "activityId" TEXT,
    "objet" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION,
    "specifications" TEXT,
    "montantEstimatif" DECIMAL(14,2) NOT NULL,
    "ligneBudgetaire" TEXT,
    "sourceFinancement" TEXT,
    "echeanceSouhaitee" TIMESTAMP(3),
    "status" "StatusDemandeAchat" NOT NULL DEFAULT 'BROUILLON',
    "demandeurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_achat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validations_demande" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "etape" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "validateurId" TEXT NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaire" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validations_demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "identifiantFiscal" TEXT,
    "registreCommerce" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'Sénégal',
    "telephone" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "nomContact" TEXT,
    "prenomContact" TEXT,
    "fonctionContact" TEXT,
    "telephoneContact" TEXT,
    "emailContact" TEXT,
    "domainesActivite" TEXT[],
    "categoriesBiens" TEXT[],
    "zonesIntervention" TEXT[],
    "status" "StatusFournisseur" NOT NULL DEFAULT 'A_VALIDER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseur_documents" (
    "id" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "dateExpiration" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fournisseur_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedures" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "demandeAchatId" TEXT,
    "lignePPMId" TEXT,
    "methode" "MethodeProcedure" NOT NULL,
    "objet" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "montantEstimatif" DECIMAL(14,2) NOT NULL,
    "datePublication" TIMESTAMP(3),
    "dateLimite" TIMESTAMP(3),
    "dateOuverture" TIMESTAMP(3),
    "dateClarification" TIMESTAMP(3),
    "dateAttribution" TIMESTAMP(3),
    "responsableId" TEXT NOT NULL,
    "status" "StatusProcedure" NOT NULL DEFAULT 'BROUILLON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossier_consultation" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "documentUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dossier_consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soumissions" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "numeroDepot" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "montantTechnique" DECIMAL(14,2),
    "montantFinancier" DECIMAL(14,2) NOT NULL,
    "montantTotal" DECIMAL(14,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "conformeAdmin" BOOLEAN,
    "conformeTechnique" BOOLEAN,
    "conformeFinancier" BOOLEAN,
    "dateDepot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horsDelai" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DEPOSEE',

    CONSTRAINT "soumissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soumission_documents" (
    "id" TEXT NOT NULL,
    "soumissionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soumission_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateSeance" TIMESTAMP(3) NOT NULL,
    "presidentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membres_commission" (
    "id" TEXT NOT NULL,
    "commissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "membres_commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "soumissionId" TEXT NOT NULL,
    "commissionId" TEXT NOT NULL,
    "evaluateurId" TEXT NOT NULL,
    "scoreAdmin" DOUBLE PRECISION,
    "scoreTechnique" DOUBLE PRECISION,
    "scoreFinancier" DOUBLE PRECISION,
    "scoreGlobal" DOUBLE PRECISION,
    "criteres" JSONB NOT NULL,
    "commentaires" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "soumissionId" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "montantInitial" DECIMAL(14,2) NOT NULL,
    "montantRevise" DECIMAL(14,2),
    "montantPaye" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "dateSignature" TIMESTAMP(3) NOT NULL,
    "dateDemarrage" TIMESTAMP(3),
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "dateReceptionProv" TIMESTAMP(3),
    "dateReceptionDef" TIMESTAMP(3),
    "modalitesAvance" TEXT,
    "modalitesAcompte" TEXT,
    "modalitesRetenue" TEXT,
    "garanties" TEXT,
    "gestionnaire" TEXT NOT NULL,
    "status" "StatusContrat" NOT NULL DEFAULT 'SIGNE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avenants" (
    "id" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "motif" TEXT NOT NULL,
    "impactMontant" DECIMAL(14,2),
    "impactDelai" INTEGER,
    "impactObjet" TEXT,
    "dateSignature" TIMESTAMP(3) NOT NULL,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'BROUILLON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livrables" (
    "id" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "responsableId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livrables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receptions_livrable" (
    "id" TEXT NOT NULL,
    "livrableId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantitePrevue" DOUBLE PRECISION,
    "quantiteRecue" DOUBLE PRECISION,
    "conforme" BOOLEAN NOT NULL DEFAULT true,
    "reserves" TEXT,
    "dateReception" TIMESTAMP(3) NOT NULL,
    "receptionneurId" TEXT NOT NULL,
    "pvUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receptions_livrable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements_contrat" (
    "id" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montantBrut" DECIMAL(14,2) NOT NULL,
    "taxes" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "penalites" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "montantNet" DECIMAL(14,2) NOT NULL,
    "dateEcheance" TIMESTAMP(3),
    "datePaiement" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "referenceComptable" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_contrat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations_fournisseur" (
    "id" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "contratId" TEXT,
    "qualite" DOUBLE PRECISION,
    "delais" DOUBLE PRECISION,
    "conformite" DOUBLE PRECISION,
    "disponibilite" DOUBLE PRECISION,
    "serviceAV" DOUBLE PRECISION,
    "respectContractuel" DOUBLE PRECISION,
    "rapportQualitePrix" DOUBLE PRECISION,
    "noteGlobale" DOUBLE PRECISION NOT NULL,
    "commentaires" TEXT,
    "evaluateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "avatarUrl" TEXT,
    "projectId" TEXT,
    "activityId" TEXT,
    "recommendationId" TEXT,
    "procedureId" TEXT,
    "contratId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ConversationRole" NOT NULL DEFAULT 'MEMBER',
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "lastReadAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "MessageContentType" NOT NULL DEFAULT 'TEXT',
    "parentId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reads" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_mentions" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MentionType" NOT NULL DEFAULT 'USER',
    "startPos" INTEGER,
    "endPos" INTEGER,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_passation_marches_organizationId_idx" ON "plan_passation_marches"("organizationId");

-- CreateIndex
CREATE INDEX "plan_passation_marches_year_idx" ON "plan_passation_marches"("year");

-- CreateIndex
CREATE INDEX "plan_passation_marches_projectId_idx" ON "plan_passation_marches"("projectId");

-- CreateIndex
CREATE INDEX "lignes_ppm_ppmId_idx" ON "lignes_ppm"("ppmId");

-- CreateIndex
CREATE INDEX "lignes_ppm_activityId_idx" ON "lignes_ppm"("activityId");

-- CreateIndex
CREATE INDEX "lignes_ppm_responsableId_idx" ON "lignes_ppm"("responsableId");

-- CreateIndex
CREATE INDEX "lignes_ppm_status_idx" ON "lignes_ppm"("status");

-- CreateIndex
CREATE UNIQUE INDEX "demandes_achat_reference_key" ON "demandes_achat"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "demandes_achat_lignePPMId_key" ON "demandes_achat"("lignePPMId");

-- CreateIndex
CREATE INDEX "demandes_achat_organizationId_idx" ON "demandes_achat"("organizationId");

-- CreateIndex
CREATE INDEX "demandes_achat_activityId_idx" ON "demandes_achat"("activityId");

-- CreateIndex
CREATE INDEX "demandes_achat_demandeurId_idx" ON "demandes_achat"("demandeurId");

-- CreateIndex
CREATE INDEX "demandes_achat_status_idx" ON "demandes_achat"("status");

-- CreateIndex
CREATE INDEX "validations_demande_demandeId_idx" ON "validations_demande"("demandeId");

-- CreateIndex
CREATE INDEX "validations_demande_validateurId_idx" ON "validations_demande"("validateurId");

-- CreateIndex
CREATE INDEX "fournisseurs_organizationId_idx" ON "fournisseurs"("organizationId");

-- CreateIndex
CREATE INDEX "fournisseurs_status_idx" ON "fournisseurs"("status");

-- CreateIndex
CREATE INDEX "fournisseur_documents_fournisseurId_idx" ON "fournisseur_documents"("fournisseurId");

-- CreateIndex
CREATE UNIQUE INDEX "procedures_reference_key" ON "procedures"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "procedures_demandeAchatId_key" ON "procedures"("demandeAchatId");

-- CreateIndex
CREATE UNIQUE INDEX "procedures_lignePPMId_key" ON "procedures"("lignePPMId");

-- CreateIndex
CREATE INDEX "procedures_organizationId_idx" ON "procedures"("organizationId");

-- CreateIndex
CREATE INDEX "procedures_responsableId_idx" ON "procedures"("responsableId");

-- CreateIndex
CREATE INDEX "procedures_status_idx" ON "procedures"("status");

-- CreateIndex
CREATE INDEX "dossier_consultation_procedureId_idx" ON "dossier_consultation"("procedureId");

-- CreateIndex
CREATE UNIQUE INDEX "soumissions_numeroDepot_key" ON "soumissions"("numeroDepot");

-- CreateIndex
CREATE INDEX "soumissions_procedureId_idx" ON "soumissions"("procedureId");

-- CreateIndex
CREATE INDEX "soumissions_fournisseurId_idx" ON "soumissions"("fournisseurId");

-- CreateIndex
CREATE INDEX "soumissions_status_idx" ON "soumissions"("status");

-- CreateIndex
CREATE INDEX "soumission_documents_soumissionId_idx" ON "soumission_documents"("soumissionId");

-- CreateIndex
CREATE INDEX "commissions_procedureId_idx" ON "commissions"("procedureId");

-- CreateIndex
CREATE INDEX "membres_commission_commissionId_idx" ON "membres_commission"("commissionId");

-- CreateIndex
CREATE UNIQUE INDEX "membres_commission_commissionId_userId_key" ON "membres_commission"("commissionId", "userId");

-- CreateIndex
CREATE INDEX "evaluations_soumissionId_idx" ON "evaluations"("soumissionId");

-- CreateIndex
CREATE INDEX "evaluations_commissionId_idx" ON "evaluations"("commissionId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_soumissionId_evaluateurId_key" ON "evaluations"("soumissionId", "evaluateurId");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_reference_key" ON "contrats"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_procedureId_key" ON "contrats"("procedureId");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_soumissionId_key" ON "contrats"("soumissionId");

-- CreateIndex
CREATE INDEX "contrats_organizationId_idx" ON "contrats"("organizationId");

-- CreateIndex
CREATE INDEX "contrats_fournisseurId_idx" ON "contrats"("fournisseurId");

-- CreateIndex
CREATE INDEX "contrats_gestionnaire_idx" ON "contrats"("gestionnaire");

-- CreateIndex
CREATE INDEX "contrats_status_idx" ON "contrats"("status");

-- CreateIndex
CREATE INDEX "avenants_contratId_idx" ON "avenants"("contratId");

-- CreateIndex
CREATE INDEX "livrables_contratId_idx" ON "livrables"("contratId");

-- CreateIndex
CREATE INDEX "receptions_livrable_livrableId_idx" ON "receptions_livrable"("livrableId");

-- CreateIndex
CREATE INDEX "paiements_contrat_contratId_idx" ON "paiements_contrat"("contratId");

-- CreateIndex
CREATE INDEX "paiements_contrat_status_idx" ON "paiements_contrat"("status");

-- CreateIndex
CREATE INDEX "evaluations_fournisseur_fournisseurId_idx" ON "evaluations_fournisseur"("fournisseurId");

-- CreateIndex
CREATE INDEX "conversations_organizationId_idx" ON "conversations"("organizationId");

-- CreateIndex
CREATE INDEX "conversations_type_idx" ON "conversations"("type");

-- CreateIndex
CREATE INDEX "conversations_projectId_idx" ON "conversations"("projectId");

-- CreateIndex
CREATE INDEX "conversations_activityId_idx" ON "conversations"("activityId");

-- CreateIndex
CREATE INDEX "conversations_recommendationId_idx" ON "conversations"("recommendationId");

-- CreateIndex
CREATE INDEX "conversations_procedureId_idx" ON "conversations"("procedureId");

-- CreateIndex
CREATE INDEX "conversations_contratId_idx" ON "conversations"("contratId");

-- CreateIndex
CREATE INDEX "conversations_lastMessageAt_idx" ON "conversations"("lastMessageAt");

-- CreateIndex
CREATE INDEX "conversation_participants_conversationId_idx" ON "conversation_participants"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_participants_userId_idx" ON "conversation_participants"("userId");

-- CreateIndex
CREATE INDEX "conversation_participants_isPinned_idx" ON "conversation_participants"("isPinned");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "conversation_participants"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_authorId_idx" ON "messages"("authorId");

-- CreateIndex
CREATE INDEX "messages_parentId_idx" ON "messages"("parentId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_isDeleted_idx" ON "messages"("isDeleted");

-- CreateIndex
CREATE INDEX "message_attachments_messageId_idx" ON "message_attachments"("messageId");

-- CreateIndex
CREATE INDEX "message_reactions_messageId_idx" ON "message_reactions"("messageId");

-- CreateIndex
CREATE INDEX "message_reactions_userId_idx" ON "message_reactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_messageId_userId_emoji_key" ON "message_reactions"("messageId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "message_reads_messageId_idx" ON "message_reads"("messageId");

-- CreateIndex
CREATE INDEX "message_reads_userId_idx" ON "message_reads"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_reads_messageId_userId_key" ON "message_reads"("messageId", "userId");

-- CreateIndex
CREATE INDEX "message_mentions_messageId_idx" ON "message_mentions"("messageId");

-- CreateIndex
CREATE INDEX "message_mentions_userId_idx" ON "message_mentions"("userId");

-- CreateIndex
CREATE INDEX "message_mentions_notified_idx" ON "message_mentions"("notified");

-- AddForeignKey
ALTER TABLE "plan_passation_marches" ADD CONSTRAINT "plan_passation_marches_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_passation_marches" ADD CONSTRAINT "plan_passation_marches_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "action_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ppm" ADD CONSTRAINT "lignes_ppm_ppmId_fkey" FOREIGN KEY ("ppmId") REFERENCES "plan_passation_marches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ppm" ADD CONSTRAINT "lignes_ppm_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ppm" ADD CONSTRAINT "lignes_ppm_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_achat" ADD CONSTRAINT "demandes_achat_lignePPMId_fkey" FOREIGN KEY ("lignePPMId") REFERENCES "lignes_ppm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_achat" ADD CONSTRAINT "demandes_achat_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_achat" ADD CONSTRAINT "demandes_achat_demandeurId_fkey" FOREIGN KEY ("demandeurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations_demande" ADD CONSTRAINT "validations_demande_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "demandes_achat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations_demande" ADD CONSTRAINT "validations_demande_validateurId_fkey" FOREIGN KEY ("validateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fournisseur_documents" ADD CONSTRAINT "fournisseur_documents_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_demandeAchatId_fkey" FOREIGN KEY ("demandeAchatId") REFERENCES "demandes_achat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_lignePPMId_fkey" FOREIGN KEY ("lignePPMId") REFERENCES "lignes_ppm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_consultation" ADD CONSTRAINT "dossier_consultation_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soumissions" ADD CONSTRAINT "soumissions_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soumissions" ADD CONSTRAINT "soumissions_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soumission_documents" ADD CONSTRAINT "soumission_documents_soumissionId_fkey" FOREIGN KEY ("soumissionId") REFERENCES "soumissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_presidentId_fkey" FOREIGN KEY ("presidentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres_commission" ADD CONSTRAINT "membres_commission_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "commissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres_commission" ADD CONSTRAINT "membres_commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_soumissionId_fkey" FOREIGN KEY ("soumissionId") REFERENCES "soumissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "commissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluateurId_fkey" FOREIGN KEY ("evaluateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_soumissionId_fkey" FOREIGN KEY ("soumissionId") REFERENCES "soumissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_gestionnaire_fkey" FOREIGN KEY ("gestionnaire") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avenants" ADD CONSTRAINT "avenants_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livrables" ADD CONSTRAINT "livrables_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livrables" ADD CONSTRAINT "livrables_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receptions_livrable" ADD CONSTRAINT "receptions_livrable_livrableId_fkey" FOREIGN KEY ("livrableId") REFERENCES "livrables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receptions_livrable" ADD CONSTRAINT "receptions_livrable_receptionneurId_fkey" FOREIGN KEY ("receptionneurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements_contrat" ADD CONSTRAINT "paiements_contrat_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations_fournisseur" ADD CONSTRAINT "evaluations_fournisseur_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations_fournisseur" ADD CONSTRAINT "evaluations_fournisseur_evaluateurId_fkey" FOREIGN KEY ("evaluateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "action_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_mentions" ADD CONSTRAINT "message_mentions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_mentions" ADD CONSTRAINT "message_mentions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
