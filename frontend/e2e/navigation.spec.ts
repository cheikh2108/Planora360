import { expect, test } from '@playwright/test';
import { attachHealth, CRASH_TEXT, monitor } from './support/monitor';
import { storageStatePath } from './support/users';

/**
 * Parcourt chaque écran du menu en tant qu'administrateur :
 * l'écran doit s'afficher sans plantage, sans erreur JavaScript et sans erreur 5xx de l'API.
 * Une capture pleine page est jointe au rapport pour chaque écran.
 */
const SCREENS: [string, string][] = [
  ['/dashboard', 'Tableau de bord'],
  ['/plans', 'Plans d\'action'],
  ['/plans/archives', 'Archives des plans'],
  ['/activities', 'Activités'],
  ['/indicators', 'Indicateurs'],
  ['/budgets', 'Budgets'],
  ['/validations', 'Validations'],
  ['/documents', 'Documents'],
  ['/reports', 'Rapports'],
  ['/recommendations', 'Recommandations'],
  ['/planification', 'Planification'],
  ['/planification/results-matrix', 'Matrice de résultats'],
  ['/capitalisation', 'Capitalisation'],
  ['/participants', 'Participants'],
  ['/dashboards/territorial', 'Tableau de bord territorial'],
  ['/passation', 'Passation de marchés'],
  ['/passation/dashboard', 'Passation — tableau de bord'],
  ['/passation/ppm', 'PPM'],
  ['/passation/demandes', 'Demandes d\'achat'],
  ['/passation/fournisseurs', 'Fournisseurs'],
  ['/passation/procedures', 'Procédures'],
  ['/passation/contrats', 'Contrats'],
  ['/messagerie', 'Messagerie'],
  ['/notifications', 'Notifications'],
  ['/admin/users', 'Utilisateurs'],
  ['/admin/roles', 'Rôles'],
  ['/admin/help', 'Aide'],
  ['/settings', 'Paramètres'],
];

test.describe('Navigation — tous les écrans (administrateur)', () => {
  test.use({ storageState: storageStatePath('admin') });

  for (const [route, label] of SCREENS) {
    test(`${label} (${route}) s'affiche sans erreur`, async ({ page }, testInfo) => {
      const health = monitor(page);
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
      await expect(page.locator('h1, h2').first()).toBeVisible();

      await testInfo.attach(`${route.replace(/\//g, '_')}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
      await attachHealth(testInfo, health);

      expect(health.pageErrors, 'erreurs JavaScript non capturées').toEqual([]);
      expect(health.serverErrors, 'réponses 5xx de l\'API').toEqual([]);
    });
  }

  test('[AUDIT] aucun écran du menu ne lève d\'erreur dans la console', async ({ page }) => {
    test.setTimeout(240_000);
    const health = monitor(page);
    for (const [route] of SCREENS) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }
    expect(health.consoleErrors).toEqual([]);
  });

  test('le menu latéral mène bien à chaque section', async ({ page }) => {
    await page.goto('/dashboard');
    for (const [name, url] of [['Plans', /\/plans/], ['Activités', /\/activities/], ['Indicateurs', /\/indicators/]] as const) {
      await page.getByRole('link', { name: new RegExp(`^\\s*${name}`, 'i') }).first().click();
      await expect(page).toHaveURL(url);
      await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
    }
  });
});

test.describe('Navigation — espace super administrateur', () => {
  test.use({ storageState: storageStatePath('superAdmin') });

  const ADMIN_SCREENS = [
    '/super-admin',
    '/super-admin/organizations',
    '/super-admin/organizations/deleted',
    '/super-admin/roles',
    '/super-admin/audit-logs',
    '/super-admin/security',
    '/super-admin/sessions',
    '/super-admin/settings',
  ];

  for (const route of ADMIN_SCREENS) {
    test(`${route} s'affiche sans erreur`, async ({ page }, testInfo) => {
      const health = monitor(page);
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
      await testInfo.attach(`${route.replace(/\//g, '_')}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
      await attachHealth(testInfo, health);
      expect(health.pageErrors).toEqual([]);
      expect(health.serverErrors).toEqual([]);
    });
  }

  test('la liste des organisations contient l\'organisation de démonstration', async ({ page }) => {
    await page.goto('/super-admin/organizations');
    await expect(page.getByText('E2E Agence Démo').first()).toBeVisible();
  });
});
