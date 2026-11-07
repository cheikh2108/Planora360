/**
 * Configuration partagée des tests e2e.
 * Les comptes seed sont créés dans la base de test uniquement.
 */
export const TEST_ENV = {
  JWT_SECRET: 'e2e-jwt-secret-0123456789abcdef0123456789abcdef',
  JWT_EXPIRES_IN: '1h',
  CSRF_SECRET: 'e2e-csrf-secret-0123456789abcdef',
  FRONTEND_URL: 'http://localhost:3001',
  SUPPORT_EMAIL: 'support@planora.test',
  SEED_ADMIN_EMAIL: 'superadmin@planora.test',
  SEED_ADMIN_PASSWORD: 'SuperAdmin#2026',
  SEED_TEST_EMAIL: 'coordinateur.seed@planora.test',
  SEED_TEST_PASSWORD: 'Coord#2026pass',
  // Services externes désactivés en test
  RESEND_API_KEY: '',
  REDIS_URL: '',
  POSTHOG_KEY: '',
  SENTRY_DSN_BACKEND: '',
  B2_KEY_ID: '',
  B2_APP_KEY: '',
  DEXPAY_SECRET_KEY: '',
};

export function resolveTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL est requis pour les tests e2e (ex: postgresql://postgres@localhost:5432/planora_test). ' +
        'La base est VIDÉE à chaque lancement.',
    );
  }
  const dbName = new URL(url).pathname.replace('/', '');
  if (!/test/i.test(dbName)) {
    throw new Error(
      `Refus de lancer les tests sur la base "${dbName}" : son nom doit contenir "test" (la base est vidée à chaque lancement).`,
    );
  }
  return url;
}
