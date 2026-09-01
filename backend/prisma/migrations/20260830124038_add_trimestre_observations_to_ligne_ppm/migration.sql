/*
  Warnings:

  - Added the required column `trimestre` to the `lignes_ppm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lignes_ppm" ADD COLUMN     "observations" TEXT,
ADD COLUMN     "trimestre" INTEGER NOT NULL;
