import { expect, test } from '@playwright/test';
import { attachHealth, CRASH_TEXT, monitor } from './support/monitor';
import { storageStatePath } from './support/users';

/**
 * Parcours métier à l'écran : créer un plan, lui ajouter un axe et une activité,
 * puis retrouver l'activité dans la liste.
 */
test.describe('Plans d\'action — parcours à l\'écran (coordinateur)', () => {
  test.use({ storageState: storageStatePath('coordinateur') });

  test('crée un plan, un axe et une activité', async ({ page }, testInfo) => {
    const health = monitor(page);
    const stamp = Date.now();
    const planTitle = `Plan écran ${stamp}`;
    const axisTitle = `Axe écran ${stamp}`;
    const activityTitle = `Activité écran ${stamp}`;

    // 1. Création du plan
    await page.goto('/plans');
    await page.getByRole('button', { name: /Nouveau plan/ }).click();
    const planModal = page.locator('form').filter({ hasText: 'Titre du plan' });
    await planModal.getByPlaceholder('Plan d\'action annuel 2025').fill(planTitle);
    const dates = planModal.locator('input[type="date"]');
    await dates.nth(0).fill('2027-01-01');
    await dates.nth(1).fill('2027-12-31');
    await planModal.getByRole('button', { name: 'Créer le plan' }).click();
    await expect(page.getByText(planTitle).first()).toBeVisible();

    // 2. Ouverture du plan
    await page.getByText(planTitle).first().click();
    await expect(page).toHaveURL(/\/plans\/c[a-z0-9]+/);
    await expect(page.getByText(planTitle).first()).toBeVisible();

    // 3. Ajout d'un axe
    await page.getByRole('button', { name: 'Ajouter un axe' }).first().click();
    await page.getByPlaceholder('Axe stratégique 1').fill(axisTitle);
    await page.getByRole('button', { name: 'Créer l\'axe' }).click();
    await expect(page.getByText(axisTitle).first()).toBeVisible();

    // 4. Ajout d'une activité dans l'axe
    await page.getByRole('button', { name: /Ajouter une activité/ }).last().click();
    await page.getByPlaceholder('Titre de l\'activité').fill(activityTitle);
    await page.getByRole('button', { name: 'Créer l\'activité' }).click();
    await expect(page.getByText(activityTitle).first()).toBeVisible();

    // 5. L'activité apparaît dans l'écran Activités
    await page.goto('/activities');
    await expect(page.getByText(activityTitle).first()).toBeVisible();

    await testInfo.attach('activites.png', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
    expect(health.serverErrors).toEqual([]);
  });

  test('refuse une date de fin antérieure à la date de début', async ({ page }) => {
    await page.goto('/plans');
    await page.getByRole('button', { name: /Nouveau plan/ }).click();
    const planModal = page.locator('form').filter({ hasText: 'Titre du plan' });
    await planModal.getByPlaceholder('Plan d\'action annuel 2025').fill('Plan incohérent');
    const dates = planModal.locator('input[type="date"]');
    await dates.nth(0).fill('2027-12-31');
    await dates.nth(1).fill('2027-01-01');
    await planModal.getByRole('button', { name: 'Créer le plan' }).click();
    await expect(page.getByText('La date de fin doit être après la date de début')).toBeVisible();
  });

  test('ouvre le plan de démonstration et affiche ses activités', async ({ page }) => {
    await page.goto('/plans');
    await page.getByText('Plan de développement 2027').first().click();
    await expect(page.getByText('Atelier de lancement').first()).toBeVisible();
    await expect(page.getByText('Formation des agents').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
  });

  test('le détail d\'une activité s\'affiche', async ({ page }) => {
    const health = monitor(page);
    await page.goto('/activities');
    await page.getByText('Atelier de lancement').first().click();
    await expect(page).toHaveURL(/\/activities\/c[a-z0-9]+/);
    await expect(page.getByText('Atelier de lancement').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
    expect(health.serverErrors).toEqual([]);
  });

  test('[AUDIT] l\'écran Activités passe par le client API configuré (pas de fetch("/api/...") codé en dur)', async ({ page }) => {
    const health = monitor(page);
    await page.goto('/activities');
    await page.waitForLoadState('networkidle');
    expect(health.hardcodedApiCalls).toEqual([]);
  });
});

test.describe('Rapports — écran', () => {
  test.use({ storageState: storageStatePath('coordinateur') });

  test('l\'écran Rapports propose les exports', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByText(/Excel|PDF/i).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
  });
});
