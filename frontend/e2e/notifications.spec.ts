import { expect, test, type Page } from '@playwright/test';
import { attachHealth, monitor } from './support/monitor';
import { storageStatePath } from './support/users';

/**
 * Notifications : cloche et page (fil simulé pour être déterministe), préférences d'e-mails (vrai backend).
 * Le backend du fil est couvert par backend/test/notifications.e2e-spec.ts.
 */

const now = Date.now();
const FEED = {
  entries: [
    { id: 'n1', action: 'ACTIVITY_CREATED', entityType: 'Activity', entityId: 'a1', metadata: { title: 'Atelier régional' }, user: { id: 'u1', firstName: 'Ousmane', lastName: 'Diop' }, createdAt: new Date(now - 5 * 60_000).toISOString(), read: false },
    { id: 'n2', action: 'DOCUMENT_UPLOADED', entityType: 'Document', entityId: 'd1', metadata: { title: 'Rapport T3' }, user: { id: 'u2', firstName: 'Aminata', lastName: 'Fall' }, createdAt: new Date(now - 26 * 3600_000).toISOString(), read: true },
  ],
  total: 2,
  page: 1,
  limit: 20,
  unreadCount: 1,
  readAt: null,
};

async function mockFeed(page: Page) {
  let read = false;
  let readCalls = 0;
  await page.route('**/api/notifications?*', (r) =>
    r.fulfill({
      json: read
        ? { ...FEED, unreadCount: 0, entries: FEED.entries.map((e) => ({ ...e, read: true })) }
        : FEED,
    }),
  );
  await page.route('**/api/notifications/read-all', (r) => {
    readCalls += 1;
    read = true;
    return r.fulfill({ json: { readAt: new Date().toISOString(), unreadCount: 0 } });
  });
  return { readCalls: () => readCalls };
}

test.describe('Notifications (observateur)', () => {
  test.use({ storageState: storageStatePath('observateur') });

  test('la cloche affiche le nombre de non-lues et « Tout lire » l’enregistre côté serveur', async ({ page }, testInfo) => {
    const health = monitor(page);
    const feed = await mockFeed(page);
    await page.goto('/dashboard');

    const bell = page.getByRole('button', { name: 'Notifications' });
    await expect(bell).toContainText('1');
    await bell.click();
    await expect(page.getByText('Atelier régional')).toBeVisible();
    await page.getByRole('button', { name: 'Tout lire' }).click();
    await expect.poll(feed.readCalls).toBe(1);
    await expect(page.getByRole('button', { name: 'Tout lire' })).toHaveCount(0);
    await expect(bell).not.toContainText('1');

    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
  });

  test('la page liste les notifications et permet de tout marquer comme lu', async ({ page }, testInfo) => {
    const health = monitor(page);
    const feed = await mockFeed(page);
    await page.goto('/notifications');

    await expect(page.getByRole('heading', { name: '1 non lue' })).toBeVisible();
    await expect(page.getByText('Rapport T3')).toBeVisible();
    await page.getByRole('button', { name: 'Tout marquer comme lu' }).click();
    await expect.poll(feed.readCalls).toBe(1);
    await expect(page.getByRole('heading', { name: 'Tout est lu' })).toBeVisible();

    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
  });

  test('les préférences d’e-mails sont enregistrées et survivent au rechargement', async ({ page }, testInfo) => {
    const health = monitor(page);
    await page.goto('/settings?section=Notifications');

    const toggle = page.getByRole('switch', { name: /Échéances proches/ });
    await expect(toggle).toBeEnabled();
    const initial = await toggle.isChecked();

    const saved = page.waitForResponse((r) => r.url().endsWith('/api/notifications/preferences') && r.request().method() === 'PATCH');
    await toggle.click({ force: true });
    expect((await saved).status()).toBe(200);
    await page.reload();
    await expect(page.getByRole('switch', { name: /Échéances proches/ })).toBeChecked({ checked: !initial });

    // Remise dans l'état initial pour ne pas influencer les autres tests
    const restored = page.waitForResponse((r) => r.url().endsWith('/api/notifications/preferences') && r.request().method() === 'PATCH');
    await page.getByRole('switch', { name: /Échéances proches/ }).click({ force: true });
    expect((await restored).status()).toBe(200);

    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
  });
});
