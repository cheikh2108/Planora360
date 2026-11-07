import { expect, test } from '@playwright/test';
import { CRASH_TEXT } from './support/monitor';
import { storageStatePath } from './support/users';

/** Affichage sur mobile (Pixel 7) : pas de débordement horizontal, menu accessible. */

test.describe('Mobile — connexion', () => {
  test('la page de connexion tient dans l\'écran', async ({ page }, testInfo) => {
    await page.goto('/auth/login');
    await expect(page.locator('#email')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await testInfo.attach('login-mobile.png', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('Mobile — écrans principaux', () => {
  test.use({ storageState: storageStatePath('admin') });

  for (const route of ['/dashboard', '/plans', '/activities', '/passation', '/messagerie']) {
    test(`${route} s'affiche sans débordement horizontal`, async ({ page }, testInfo) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).not.toContainText(CRASH_TEXT);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      await testInfo.attach(`${route.replace(/\//g, '_')}-mobile.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
      expect(overflow, 'pixels qui dépassent à droite').toBeLessThanOrEqual(1);
    });
  }

  test('le menu mobile s\'ouvre et permet de naviguer', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('header button').first().click();
    await page.getByRole('link', { name: /^\s*Plans/i }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/plans/);
  });

  test('[AUDIT] le bouton du menu mobile a un nom accessible (lecteurs d\'écran)', async ({ page }) => {
    await page.goto('/dashboard');
    const name = await page.locator('header button').first().evaluate(
      (el) => el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent?.trim() || '',
    );
    expect(name).not.toBe('');
  });
});
