-- Correctifs d'audit (novembre 2026). Idempotent.

-- 1. Références lisibles uniques PAR ORGANISATION (et non pour toute la base) :
--    la 2e organisation obtenait une erreur 500 en créant sa première procédure, son premier PPM, etc.
DROP INDEX IF EXISTS "plan_passation_marches_reference_key";
DROP INDEX IF EXISTS "demandes_achat_reference_key";
DROP INDEX IF EXISTS "procedures_reference_key";
DROP INDEX IF EXISTS "contrats_reference_key";
DROP INDEX IF EXISTS "recommendations_code_key";

CREATE UNIQUE INDEX IF NOT EXISTS "plan_passation_marches_organizationId_reference_key" ON "plan_passation_marches"("organizationId", "reference");
CREATE UNIQUE INDEX IF NOT EXISTS "demandes_achat_organizationId_reference_key" ON "demandes_achat"("organizationId", "reference");
CREATE UNIQUE INDEX IF NOT EXISTS "procedures_organizationId_reference_key" ON "procedures"("organizationId", "reference");
CREATE UNIQUE INDEX IF NOT EXISTS "contrats_organizationId_reference_key" ON "contrats"("organizationId", "reference");
CREATE UNIQUE INDEX IF NOT EXISTS "recommendations_organizationId_code_key" ON "recommendations"("organizationId", "code");

-- 2. Numéro de dépôt d'une offre unique PAR PROCÉDURE
DROP INDEX IF EXISTS "soumissions_numeroDepot_key";
CREATE UNIQUE INDEX IF NOT EXISTS "soumissions_procedureId_numeroDepot_key" ON "soumissions"("procedureId", "numeroDepot");

-- 3. Email : unique uniquement parmi les comptes non supprimés.
--    La migration 20260825164727 supprimait une CONTRAINTE inexistante : l'index unique global restait.
DROP INDEX IF EXISTS "users_email_key";
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_active_key" ON "users"("email") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- 4. Révocation des jetons d'accès à la déconnexion
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tokensValidAfter" TIMESTAMP(3);

-- 5. Motif de suspension / mise sur liste noire d'un fournisseur
ALTER TABLE "fournisseurs" ADD COLUMN IF NOT EXISTS "motifStatut" TEXT;
