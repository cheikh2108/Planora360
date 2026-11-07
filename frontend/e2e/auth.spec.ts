import { expect, test } from '@playwright/test';
import { uiLogin } from './support/login';
import { SUPER_ADMIN, UI_PASSWORD, USERS } from './support/users';

// Le login est limité à 5 tentatives/minute : certains tests attendent la fin de la fenêtre.
test.describe.configure({ timeout: 200_000 });

test.describe('Connexion', () => {
  test('la page de connexion s\'affiche avec ses champs', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeEnabled();
  });

  test('[AUDIT] affiche une erreur avec un mauvais mot de passe et reste sur la page', async ({ page }) => {
    // Le client API recharge /auth/login sur tout 401, y compris la réponse du login : le message est perdu.
    const outcome = await uiLogin(page, USERS.admin.email, 'mauvais-mot-de-passe', { expectSuccess: false });
    expect(outcome).toBe('refused');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('un administrateur se connecte et arrive sur le tableau de bord', async ({ page }) => {
    await uiLogin(page, USERS.admin.email, UI_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(USERS.admin.name).first()).toBeVisible();
  });

  test('le super administrateur est redirigé vers l\'espace super admin', async ({ page }) => {
    await uiLogin(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
    await expect(page).toHaveURL(/\/super-admin/);
  });

  test('[AUDIT] les libellés des champs sont reliés aux champs (accessibilité)', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel('Adresse e-mail')).toBeVisible({ timeout: 3_000 });
  });

  test('[AUDIT] la limitation des tentatives de connexion affiche un message compréhensible', async ({ page }) => {
    // Épuise la limite (5/min) puis vérifie le message montré à l'utilisateur.
    let shown = '';
    for (let i = 0; i < 8 && !shown; i++) {
      await page.goto('/auth/login');
      await page.locator('#email').fill(`inconnu${i}@planora.test`);
      await page.locator('input[type="password"]').fill('mauvais-mdp');
      await page.getByRole('button', { name: 'Se connecter' }).click();
      await page.waitForTimeout(2_000);
      const alert = page.getByText(/Too Many Requests|ThrottlerException|trop de (tentatives|requêtes)/i).first();
      if (await alert.isVisible()) shown = (await alert.textContent()) ?? '';
    }
    expect(shown, 'aucun message de limitation affiché').not.toBe('');
    await page.waitForTimeout(61_000); // laisse la fenêtre de limitation se refermer pour les tests suivants
    expect(shown).not.toMatch(/ThrottlerException|Too Many Requests/);
  });

  test('une page protégée renvoie vers la connexion sans session', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });
});

test.describe('Déconnexion', () => {
  test('le bouton de déconnexion ferme la session', async ({ page }) => {
    // Session dédiée, pour ne pas invalider les sessions partagées des autres tests
    await uiLogin(page, USERS.coordinateur.email, UI_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByTitle('Se déconnecter').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await page.goto('/plans');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });
});
