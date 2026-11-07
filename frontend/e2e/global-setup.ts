import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { uiLogin } from './support/login';
import { SEED_FILE, SUPER_ADMIN, UI_PASSWORD, USERS, UserKey, storageStatePath } from './support/users';

/**
 * 1. Crée les données de démonstration (organisations E2E, utilisateurs, plan, activités).
 * 2. Se connecte par l'écran de login avec chaque profil et enregistre la session
 *    (cookies httpOnly + localStorage) pour les tests.
 */
export default async function globalSetup(config: FullConfig) {
  const authDir = path.dirname(storageStatePath('admin'));
  fs.mkdirSync(authDir, { recursive: true });

  if (!process.env.E2E_SKIP_SEED) {
    const backendDir = path.join(__dirname, '..', '..', 'backend');
    const env = { ...process.env };
    if (process.env.E2E_DATABASE_URL) env.DATABASE_URL = process.env.E2E_DATABASE_URL;
    const out = execSync('npx ts-node test/setup/seed-ui.ts', { cwd: backendDir, env, encoding: 'utf8' });
    const json = out.trim().split('\n').pop() ?? '{}';
    fs.writeFileSync(SEED_FILE, json);
  }

  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3001';
  const launchOptions = config.projects[0].use.launchOptions ?? {};
  const browser = await chromium.launch(launchOptions);

  const logins: [UserKey | 'superAdmin', string, string][] = [
    ...(Object.keys(USERS) as UserKey[]).map((k) => [k, USERS[k].email, UI_PASSWORD] as [UserKey, string, string]),
    ['superAdmin', SUPER_ADMIN.email, SUPER_ADMIN.password],
  ];

  for (const [key, email, password] of logins) {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await uiLogin(page, email, password);
    await context.storageState({ path: storageStatePath(key) });
    await context.close();
  }

  await browser.close();
}
