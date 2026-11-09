import { expect, test } from '@playwright/test';
import { attachHealth, CRASH_TEXT, monitor } from './support/monitor';
import { storageStatePath } from './support/users';

/** Corrections de l'audit vérifiées à l'écran. */

test.describe('Passation — procédure (administrateur)', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('crée une procédure et ne propose que les statuts suivants du circuit', async ({ page }, testInfo) => {
    const health = monitor(page);
    const objet = `Procédure écran ${Date.now()}`;

    await page.goto('/passation/procedures');
    await page.getByRole('button', { name: /Nouvelle procédure/ }).first().click();
    await page.getByLabel('Objet de la procédure').fill(objet);
    await page.getByLabel('Montant estimé (XOF)').fill('2500000');
    await page.getByRole('button', { name: 'Créer la procédure' }).click();
    await expect(page.getByText('Procédure créée avec succès').first()).toBeVisible();

    await page.goto('/passation/procedures');
    await page.getByText(objet).first().click();
    await expect(page).toHaveURL(/\/passation\/procedures\/[^/]+$/);
    await page.getByRole('button', { name: /Changer le statut/ }).click();
    const options = page.getByLabel('Nouveau statut').locator('option');
    await expect(options).toHaveText(['Publiée', 'Annulée']);

    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
    expect(health.serverErrors).toEqual([]);
  });

  test('refuse une date limite antérieure à la date de publication', async ({ page }) => {
    await page.goto('/passation/procedures');
    await page.getByRole('button', { name: /Nouvelle procédure/ }).first().click();
    await page.getByLabel('Objet de la procédure').fill('Dates inversées');
    await page.getByLabel('Montant estimé (XOF)').fill('1000');
    await page.getByLabel('Date de publication').fill('2027-03-10');
    await page.getByLabel('Date limite de dépôt').fill('2027-03-01');
    await page.getByRole('button', { name: 'Créer la procédure' }).click();
    await expect(page.getByText(/ne peut pas précéder/).first()).toBeVisible();
  });

  test('le formulaire de contrat ne propose que les procédures clôturées ou attribuées', async ({ page }) => {
    await page.goto('/passation/contrats');
    await page.getByRole('button', { name: /Nouveau contrat/i }).first().click();
    const procedure = page.getByRole('combobox', { name: 'Procédure', exact: true });
    await expect(procedure).toBeVisible();
    const labels = await procedure.locator('option').allTextContents();
    for (const label of labels.slice(1)) {
      expect(label).toMatch(/^\[(Attribuée|Clôturée)\]/);
    }
  });
});

test.describe('Comptes et accès', () => {
  test.use({ storageState: storageStatePath('coordinateur') });

  test('le changement de mot de passe demande le mot de passe actuel', async ({ page }) => {
    await page.goto('/auth/change-password');
    await expect(page.getByLabel('Mot de passe actuel (ou provisoire)')).toBeVisible();
    await expect(page.getByLabel('Nouveau mot de passe', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirmer le mot de passe', { exact: true })).toBeVisible();
  });

  test('la gestion des rôles est réservée à l\'administrateur', async ({ page }) => {
    await page.goto('/admin/roles');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('la page de paiement simulé n\'existe plus', async ({ page }) => {
    const res = await page.goto('/payment-mock?ref=x&amount=100');
    expect(res?.status()).toBe(404);
  });

  test('les en-têtes de sécurité sont envoyés', async ({ page }) => {
    const res = await page.goto('/dashboard');
    const headers = res!.headers();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
  });

  test('le menu mobile a un nom accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Ouvrir le menu de navigation' })).toBeVisible();
  });
});
