import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import { CRASH_TEXT } from './support/monitor';
import { SEED_FILE, storageStatePath } from './support/users';

/** Droits par profil et isolation entre organisations, vus depuis l'écran. */

test.describe('Profil Observateur (lecture seule)', () => {
  test.use({ storageState: storageStatePath('observateur') });

  test('consulte les plans de son organisation', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByText('Plan de développement 2027').first()).toBeVisible();
  });

  test('[AUDIT] ne voit pas le bouton "Nouveau plan" (action réservée)', async ({ page }) => {
    await page.goto('/plans');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /Nouveau plan/ })).toHaveCount(0);
  });

  test('[AUDIT] un refus de l\'API à la création d\'un plan est signalé à l\'utilisateur', async ({ page }) => {
    await page.goto('/plans');
    await page.waitForLoadState('networkidle');
    const button = page.getByRole('button', { name: /Nouveau plan/ });
    test.skip((await button.count()) === 0, 'bouton masqué pour ce profil');
    await button.click();
    const modal = page.locator('form').filter({ hasText: 'Titre du plan' });
    await modal.getByPlaceholder('Plan d\'action annuel 2025').fill('Plan non autorisé');
    const dates = modal.locator('input[type="date"]');
    await dates.nth(0).fill('2027-01-01');
    await dates.nth(1).fill('2027-06-30');
    await modal.getByRole('button', { name: 'Créer le plan' }).click();
    await expect(page.getByText(/réservée|autorisation|refusé|interdit/i).first()).toBeVisible();
    await page.goto('/plans');
    await expect(page.getByText('Plan non autorisé')).toHaveCount(0);
  });

  test('[AUDIT] n\'accède pas à la gestion des utilisateurs', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    const blocked =
      /\/(dashboard|auth\/login)/.test(page.url()) ||
      (await page.getByText(/accès refusé|non autorisé|réservée|permission/i).count()) > 0;
    expect(blocked).toBe(true);
  });
});

test.describe('Administrateur d\'organisation', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('n\'accède pas aux organisations de l\'espace super administrateur', async ({ page }) => {
    await page.goto('/super-admin/organizations');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('E2E Autre Organisation')).toHaveCount(0);
  });

  test('gère les utilisateurs de son organisation uniquement', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByText('ui.coord@planora.test').first()).toBeVisible();
    await expect(page.getByText('ui.autre.admin@planora.test')).toHaveCount(0);
  });
});

test.describe('Isolation entre organisations à l\'écran', () => {
  test.use({ storageState: storageStatePath('autreOrgAdmin') });

  test('un autre organisme ne voit pas les plans de l\'agence de démonstration', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByText('Plan secret autre organisation').first()).toBeVisible();
    await expect(page.getByText('Plan de développement 2027')).toHaveCount(0);
  });

  test('l\'URL directe d\'un plan d\'une autre organisation n\'affiche rien de confidentiel', async ({ page }) => {
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    await page.goto(`/plans/${seed.planId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Plan de développement 2027')).toHaveCount(0);
    await expect(page.getByText('Atelier de lancement')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
  });

  test('les activités de l\'agence de démonstration n\'apparaissent pas', async ({ page }) => {
    await page.goto('/activities');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Atelier de lancement')).toHaveCount(0);
  });
});
