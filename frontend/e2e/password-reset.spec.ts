import { expect, test } from '@playwright/test';

/** Mot de passe oublié, hors session. */
test.describe('Mot de passe oublié', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('depuis la connexion : demande d\'un lien, message identique quel que soit le compte', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: 'Mot de passe oublié ?' }).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password$/);

    await page.getByLabel('Adresse e-mail').fill('inconnu@exemple.invalid');
    await page.getByRole('button', { name: 'Envoyer le lien' }).click();
    await expect(page.getByRole('heading', { name: 'Vérifiez votre boîte e-mail' })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Si un compte actif correspond');
    await page.getByRole('link', { name: /Retour à la connexion/ }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('un lien invalide propose une nouvelle demande', async ({ page }) => {
    await page.goto('/auth/reset-password?token=' + 'x'.repeat(43));
    await expect(page.getByRole('heading', { name: 'Lien invalide ou expiré' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Faire une nouvelle demande' })).toHaveAttribute('href', '/auth/forgot-password');
  });

  test('sans jeton dans l\'adresse, le lien est signalé invalide', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await expect(page.getByRole('heading', { name: 'Lien invalide ou expiré' })).toBeVisible();
  });

  test('lien valide : règles affichées, confirmation vérifiée, puis succès', async ({ page }) => {
    await page.route('**/api/auth/reset-password/check', (r) => r.fulfill({ json: { valid: true } }));
    let sent: unknown = null;
    await page.route('**/api/auth/reset-password', async (r) => {
      sent = r.request().postDataJSON();
      await r.fulfill({ json: { message: 'Mot de passe modifié.' } });
    });

    await page.goto('/auth/reset-password?token=jeton-de-test-suffisamment-long-0001');
    await expect(page.getByRole('heading', { name: 'Nouveau mot de passe' })).toBeVisible();

    await page.getByLabel('Nouveau mot de passe').fill('Nouveau1Secret');
    await page.getByLabel('Confirmer le mot de passe').fill('Autre1Secret');
    await page.getByRole('button', { name: 'Enregistrer le mot de passe' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'ne correspondent pas' })).toBeVisible();
    expect(sent).toBeNull();

    await page.getByLabel('Confirmer le mot de passe').fill('Nouveau1Secret');
    await page.getByRole('button', { name: 'Enregistrer le mot de passe' }).click();
    await expect(page.getByRole('heading', { name: 'Mot de passe modifié' })).toBeVisible();
    expect(sent).toEqual({ token: 'jeton-de-test-suffisamment-long-0001', newPassword: 'Nouveau1Secret' });

    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
