#!/usr/bin/env node
/**
 * Applique les migrations Prisma en attente avant la compilation (`npm run build`).
 *
 * Hostinger lance directement dist/main.js, sans passer par `npm start` : le build est la seule
 * étape où appliquer les migrations. En cas d'échec, le build échoue et la version précédente
 * reste en ligne.
 *
 * Ignoré sans DATABASE_URL (build en CI) ou avec SKIP_DB_MIGRATIONS=1 (build local sans base).
 */
require('dotenv/config');
const { execSync } = require('child_process');

if (process.env.SKIP_DB_MIGRATIONS === '1') {
  console.log('[migrations] SKIP_DB_MIGRATIONS=1 : migrations ignorées');
  process.exit(0);
}
if (!process.env.DATABASE_URL) {
  console.log('[migrations] DATABASE_URL absente : migrations ignorées');
  process.exit(0);
}

console.log('[migrations] Application des migrations en attente (prisma migrate deploy)…');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch {
  console.error('[migrations] Échec : le build est interrompu, la version en ligne reste inchangée.');
  process.exit(1);
}
