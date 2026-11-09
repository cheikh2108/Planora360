import { expect, test, type Page } from '@playwright/test';
import { attachHealth, monitor } from './support/monitor';
import { storageStatePath } from './support/users';

/**
 * Parcours de paiement d'une formule. Les réponses de facturation sont simulées (page.route) :
 * l'écran est testé de bout en bout sans appeler DexPay. Le backend est couvert par billing.e2e-spec.ts.
 */

const PLANS = {
  currency: 'XOF',
  onlinePayment: true,
  plans: [
    { plan: 'INDIVIDUEL', label: 'Individuel', payable: true, currency: 'XOF', prices: { MONTHLY: 10000, YEARLY: 100000 }, limits: { maxUsers: 1, maxPlans: 3 } },
    { plan: 'PRO', label: 'Pro', payable: true, currency: 'XOF', prices: { MONTHLY: 25000, YEARLY: 250000 }, limits: { maxUsers: 3, maxPlans: 10 } },
    { plan: 'EQUIPE', label: 'Équipe', payable: true, currency: 'XOF', prices: { MONTHLY: 50000, YEARLY: 500000 }, limits: { maxUsers: 10, maxPlans: 25 } },
    { plan: 'ORGANISATION', label: 'Organisation', payable: true, currency: 'XOF', prices: { MONTHLY: 100000, YEARLY: 1000000 }, limits: { maxUsers: 25, maxPlans: 50 } },
    { plan: 'ENTERPRISE', label: 'Enterprise', payable: false, currency: 'XOF', prices: null, limits: { maxUsers: 9999, maxPlans: 9999 } },
  ],
};

const SUBSCRIPTION = {
  subscriptionPlan: 'PRO',
  subscriptionStatus: 'ACTIVE',
  billingCycle: 'MONTHLY',
  currentPeriodEnd: '2027-01-15T00:00:00.000Z',
  nextPaymentDate: '2027-01-15T00:00:00.000Z',
  trialEndsAt: null,
  onlinePayment: true,
  payments: [
    { reference: 'PLN-ANCIEN-0001', status: 'completed', plan: 'PRO', amount: 25000, currency: 'XOF', billingCycle: 'MONTHLY', periodEnd: '2027-01-15T00:00:00.000Z', paidAt: '2026-12-15T10:00:00.000Z', createdAt: '2026-12-15T09:59:00.000Z', paymentMethod: 'wave' },
  ],
};

async function mockBilling(page: Page, overrides: { plans?: object; subscription?: object } = {}) {
  await page.route('**/api/billing/plans', (r) => r.fulfill({ json: { ...PLANS, ...overrides.plans } }));
  await page.route('**/api/billing/subscription', (r) => r.fulfill({ json: { ...SUBSCRIPTION, ...overrides.subscription } }));
}

test.describe('Abonnement (administrateur)', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('choisit une formule supérieure, paie en annuel et revient sur la confirmation', async ({ page }, testInfo) => {
    const health = monitor(page);
    await mockBilling(page);
    let checkoutBody: unknown = null;
    await page.route('**/api/billing/checkout', async (route) => {
      checkoutBody = route.request().postDataJSON();
      // DexPay renverrait sa page de paiement ; ici on revient directement sur la page de succès
      await route.fulfill({
        status: 201,
        json: { reference: 'PLN-TEST-0001', paymentUrl: '/payment/success?ref=PLN-TEST-0001', amount: 500000, currency: 'XOF' },
      });
    });
    await page.route('**/api/dexpay/status/PLN-TEST-0001', (r) =>
      r.fulfill({
        json: { reference: 'PLN-TEST-0001', status: 'completed', plan: 'EQUIPE', amount: 500000, currency: 'XOF', billingCycle: 'YEARLY', periodEnd: '2027-12-15T00:00:00.000Z', paidAt: '2026-12-15T10:00:00.000Z' },
      }),
    );

    await page.goto('/settings?section=Abonnement');
    await expect(page.getByText('Formule active')).toBeVisible();
    await expect(page.getByText(/Valable jusqu.au 15 janvier 2027/)).toBeVisible();
    await expect(page.getByText('Historique des paiements')).toBeVisible();
    await expect(page.getByText('PLN-ANCIEN-0001', { exact: false })).toBeVisible();

    // Formule Équipe : 50 000 FCFA / mois affiché, puis choix de l'annuel
    await expect(page.getByText(/50\s000 FCFA \/ mois/)).toBeVisible();
    const equipeCard = page.locator('div.relative.rounded-2xl').filter({ hasText: 'Équipe' }).first();
    await equipeCard.getByRole('button', { name: 'Choisir' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Formule Équipe')).toBeVisible();
    await dialog.getByRole('radio', { name: /Annuel/ }).click();
    await expect(dialog.getByText(/100\s000 FCFA économisés/)).toBeVisible();
    await dialog.getByRole('button', { name: /Payer 500\s000 FCFA/ }).click();

    await expect(page).toHaveURL(/\/payment\/success\?ref=PLN-TEST-0001/);
    expect(checkoutBody).toEqual({ plan: 'EQUIPE', billingCycle: 'YEARLY' });
    await expect(page.getByRole('heading', { name: 'Paiement confirmé' })).toBeVisible();
    await expect(page.getByText(/La formule\s+Équipe\s+est active/)).toBeVisible();

    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
  });

  test('renouveler la formule actuelle annonce la prolongation de la période', async ({ page }) => {
    await mockBilling(page);
    await page.goto('/settings?section=Abonnement');
    const proCard = page.locator('div.relative.rounded-2xl').filter({ hasText: 'Votre formule' }).first();
    await proCard.getByRole('button', { name: 'Renouveler' }).click();
    await expect(page.getByRole('dialog').getByText(/prolongée à partir du 15 janvier 2027/)).toBeVisible();
  });

  test('affiche le message du serveur si le paiement ne peut pas démarrer', async ({ page }) => {
    await mockBilling(page);
    await page.route('**/api/billing/checkout', (r) =>
      r.fulfill({ status: 502, json: { message: 'Le service de paiement est indisponible, réessayez dans un instant' } }),
    );
    await page.goto('/settings?section=Abonnement');
    const card = page.locator('div.relative.rounded-2xl').filter({ hasText: 'Organisation' }).first();
    await card.getByRole('button', { name: 'Choisir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: /Payer/ }).click();
    await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('sans paiement en ligne configuré, les boutons sont désactivés et le support est indiqué', async ({ page }) => {
    await mockBilling(page, { plans: { onlinePayment: false }, subscription: { onlinePayment: false } });
    await page.goto('/settings?section=Abonnement');
    await expect(page.getByText(/paiement en ligne n.est pas encore activé/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choisir' }).first()).toBeDisabled();
  });

  test('page d\'échec : rien n\'est débité et le lien ramène à l\'abonnement', async ({ page }) => {
    await page.route('**/api/dexpay/status/PLN-KO-0001', (r) =>
      r.fulfill({ json: { reference: 'PLN-KO-0001', status: 'failed', plan: 'PRO', amount: 25000, currency: 'XOF', billingCycle: 'MONTHLY', periodEnd: null, paidAt: null } }),
    );
    await page.goto('/payment/failed?ref=PLN-KO-0001');
    await expect(page.getByRole('heading', { name: 'Paiement non abouti' })).toBeVisible();
    await expect(page.getByText('Référence : PLN-KO-0001')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Réessayer' })).toHaveAttribute('href', '/settings?section=Abonnement');
  });

  test('page de succès sans référence', async ({ page }) => {
    await page.goto('/payment/success');
    await expect(page.getByRole('heading', { name: 'Paiement introuvable' })).toBeVisible();
  });
});
