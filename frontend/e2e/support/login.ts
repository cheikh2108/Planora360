import { expect, Page } from '@playwright/test';

/**
 * Connexion par l'écran de login.
 * Le backend limite le login à 5 tentatives/minute par IP : si l'écran affiche
 * la limitation, on attend la fin de la fenêtre puis on réessaie.
 */
export async function uiLogin(page: Page, email: string, password: string, opts: { expectSuccess?: boolean } = {}) {
  const expectSuccess = opts.expectSuccess ?? true;
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/auth/login');
    await page.locator('#email').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    const throttled = page.getByText(/Too Many Requests|trop de (tentatives|requêtes)/i);
    const outcome = await Promise.race([
      page.waitForURL(/\/(dashboard|super-admin|auth\/change-password)/, { timeout: 15_000 }).then(() => 'ok' as const),
      throttled.first().waitFor({ timeout: 15_000 }).then(() => 'throttled' as const),
      page.getByText(/identifiants|incorrect|invalide/i).first().waitFor({ timeout: 15_000 }).then(() => 'refused' as const),
    ]).catch(() => 'timeout' as const);

    if (outcome === 'throttled') {
      await page.waitForTimeout(61_000);
      continue;
    }
    if (expectSuccess) expect(outcome, `connexion de ${email}`).toBe('ok');
    return outcome;
  }
  throw new Error(`Connexion impossible pour ${email} : limitation persistante`);
}
