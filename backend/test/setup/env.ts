// Exécuté dans chaque worker Jest AVANT l'import de l'application :
// force la base de test et neutralise les services externes.
import { TEST_ENV, resolveTestDatabaseUrl } from './test-config';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = resolveTestDatabaseUrl();
for (const [key, value] of Object.entries(TEST_ENV)) {
  process.env[key] = value;
}
