import { execSync } from 'child_process';
import * as path from 'path';
import { Client } from 'pg';
import { TEST_ENV, resolveTestDatabaseUrl } from './test-config';

/**
 * Vide la base de test (le schéma doit déjà être migré) puis rejoue le seed.
 * Migrer la base de test une fois : DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy
 */
export default async function globalSetup() {
  const url = resolveTestDatabaseUrl();

  const client = new Client({ connectionString: url });
  await client.connect();
  const { rows } = await client.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
  );
  if (rows.length === 0) {
    await client.end();
    throw new Error('La base de test ne contient aucune table : lancez les migrations Prisma dessus.');
  }
  await client.query(
    `TRUNCATE ${rows.map((r) => `"${r.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
  await client.end();

  execSync('npx ts-node prisma/seed.ts', {
    cwd: path.join(__dirname, '..', '..'),
    env: { ...process.env, ...TEST_ENV, DATABASE_URL: url },
    stdio: 'pipe',
  });
}
