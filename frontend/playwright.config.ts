import { defineConfig, devices } from '@playwright/test';

/**
 * Tests d'écran Planora360.
 *
 * Prérequis : backend (http://localhost:3000) et frontend (http://localhost:3001) lancés
 * sur une base de développement/test (jamais la prod). Le global-setup crée les données
 * de démonstration via backend/test/setup/seed-ui.ts.
 *
 * Variables utiles :
 *   E2E_BASE_URL         URL du frontend (défaut http://localhost:3001)
 *   E2E_API_URL          URL de l'API (défaut http://localhost:3000/api)
 *   E2E_DATABASE_URL     base utilisée par le seed UI (défaut : DATABASE_URL du backend)
 *   E2E_SKIP_SEED=1      ne pas relancer le seed UI
 *   PW_CHROME_PATH       utiliser un Chrome déjà installé au lieu du Chromium de Playwright
 */
const chromePath = process.env.PW_CHROME_PATH;
const launchOptions = chromePath ? { executablePath: chromePath } : {};

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  globalSetup: './e2e/global-setup.ts',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/.report', open: 'never' }],
    ['json', { outputFile: 'e2e/.results/results.json' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3001',
    locale: 'fr-FR',
    timezoneId: 'Africa/Dakar',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    launchOptions,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions },
      testMatch: /responsive\.spec\.ts/,
    },
  ],
});
