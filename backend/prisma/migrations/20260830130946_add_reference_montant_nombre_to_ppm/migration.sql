-- AlterTable
ALTER TABLE "plan_passation_marches" ADD COLUMN "reference" TEXT NOT NULL DEFAULT '',
ADD COLUMN "montantTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN "nombreLignes" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "plan_passation_marches_reference_key" ON "plan_passation_marches"("reference");

-- Remplir les références pour les PPM existants
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
BEGIN
  counter := 1;
  FOR rec IN
    SELECT id, year, "organizationId"
    FROM plan_passation_marches
    ORDER BY year DESC, "createdAt" ASC
  LOOP
    UPDATE plan_passation_marches
    SET reference = 'PPM-' || rec.year || '-' || LPAD(counter::TEXT, 3, '0')
    WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Recalculer montantTotal et nombreLignes pour les PPM existants
UPDATE plan_passation_marches ppm
SET
  "montantTotal" = COALESCE((
    SELECT SUM("montantEstimatif")
    FROM lignes_ppm
    WHERE "ppmId" = ppm.id
  ), 0),
  "nombreLignes" = (
    SELECT COUNT(*)
    FROM lignes_ppm
    WHERE "ppmId" = ppm.id
  );
