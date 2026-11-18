import { expect, test } from '@playwright/test';
import { attachHealth, monitor } from './support/monitor';
import { storageStatePath } from './support/users';

/**
 * Parcours B : inscription Individuel payée directement, puis renouvellement à l'échéance.
 * DexPay est simulé (réponses de l'API mockées) ; le backend est couvert par billing.e2e-spec.ts.
 */

test.describe('Inscription payée (visiteur)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('le formulaire envoie vers le paiement DexPay au prix de la formule', async ({ page }, testInfo) => {
    const health = monitor(page);
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/auth/register', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        json: {
          success: true,
          status: 'PENDING_PAYMENT',
          reference: 'PLN-SIGNUP-1',
          // DexPay renverrait sa page ; on revient directement sur la page de succès
          checkoutUrl: '/payment/success?ref=PLN-SIGNUP-1&signup=1',
          amount: 50000,
          currency: 'XOF',
        },
      });
    });
    await page.route('**/api/auth/register/payment/PLN-SIGNUP-1', (r) =>
      r.fulfill({ json: { reference: 'PLN-SIGNUP-1', status: 'completed', plan: 'INDIVIDUEL', amount: 50000, currency: 'XOF', billingCycle: 'YEARLY' } }),
    );

    await page.goto('/auth/register?plan=individuel');
    await page.getByPlaceholder("Ex: Ministère de l'Agriculture").fill('Cabinet Ndiaye');
    await page.getByRole('button', { name: /Annuel/ }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByText(/Vous allez payer 50 000 FCFA\/an sur la page sécurisée DexPay/)).toBeVisible();
    await page.getByPlaceholder('Jean').fill('Awa');
    await page.getByPlaceholder('Dupont').fill('Ndiaye');
    await page.getByPlaceholder('vous@organisation.com').fill('awa@cabinet.test');
    await page.getByRole('button', { name: 'Payer 50 000 FCFA/an' }).click();

    await expect(page).toHaveURL(/\/payment\/success\?ref=PLN-SIGNUP-1&signup=1/);
    expect(sent).toMatchObject({ organizationName: 'Cabinet Ndiaye', subscriptionPlan: 'INDIVIDUEL', billingCycle: 'YEARLY', email: 'awa@cabinet.test' });
    await expect(page.getByRole('heading', { name: 'Votre compte est prêt' })).toBeVisible();
    await expect(page.getByText(/identifiants de connexion viennent/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/auth/login');

    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
  });

  test('paiement échoué : « Réessayer le paiement » relance DexPay sans compte', async ({ page }, testInfo) => {
    const health = monitor(page);
    let retried = 0;
    await page.route('**/api/auth/register/payment/PLN-SIGNUP-2', (r) =>
      r.fulfill({ json: { reference: 'PLN-SIGNUP-2', status: 'failed', plan: 'INDIVIDUEL', amount: 5000, currency: 'XOF', billingCycle: 'MONTHLY' } }),
    );
    await page.route('**/api/auth/register/payment/PLN-SIGNUP-2/retry', (r) => {
      retried += 1;
      return r.fulfill({ json: { reference: 'PLN-SIGNUP-3', checkoutUrl: '/payment/success?ref=PLN-SIGNUP-3&signup=1' } });
    });
    await page.route('**/api/auth/register/payment/PLN-SIGNUP-3', (r) =>
      r.fulfill({ json: { reference: 'PLN-SIGNUP-3', status: 'completed', plan: 'INDIVIDUEL', amount: 5000, currency: 'XOF', billingCycle: 'MONTHLY' } }),
    );

    await page.goto('/payment/failed?ref=PLN-SIGNUP-2&signup=1');
    await expect(page.getByText(/votre compte n.est pas encore créé/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Retour au tableau de bord' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Réessayer le paiement' }).click();
    await expect(page).toHaveURL(/ref=PLN-SIGNUP-3/);
    expect(retried).toBe(1);
    await expect(page.getByRole('heading', { name: 'Votre compte est prêt' })).toBeVisible();

    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
  });
});

test.describe('Abonnement expiré (administrateur)', () => {
  test.use({ storageState: storageStatePath('admin') });

  const SUBSCRIPTION = {
    subscriptionPlan: 'INDIVIDUEL',
    subscriptionStatus: 'PAST_DUE',
    billingCycle: 'MONTHLY',
    currentPeriodEnd: '2026-11-01T00:00:00.000Z',
    trialEndsAt: null,
    onlinePayment: true,
    payments: [],
  };
  const PLANS = {
    currency: 'XOF',
    onlinePayment: true,
    plans: [{ plan: 'INDIVIDUEL', label: 'Individuel', payable: true, currency: 'XOF', prices: { MONTHLY: 5000, YEARLY: 50000 }, limits: { maxUsers: 1, maxPlans: 3 } }],
  };

  test('l’application renvoie vers le renouvellement, qui lance le paiement', async ({ page }, testInfo) => {
    const health = monitor(page);
    // Toute l'API métier répond 402 SUBSCRIPTION_EXPIRED ; session et abonnement restent ouverts
    await page.route(/\/api\/(?!auth\/|billing\/|dexpay\/)/, (r) =>
      r.fulfill({ status: 402, json: { statusCode: 402, code: 'SUBSCRIPTION_EXPIRED', message: 'Votre abonnement a expiré.' } }),
    );
    await page.route('**/api/billing/subscription', (r) => r.fulfill({ json: SUBSCRIPTION }));
    await page.route('**/api/billing/plans', (r) => r.fulfill({ json: PLANS }));
    let checkoutBody: unknown = null;
    await page.route('**/api/billing/checkout', async (r) => {
      checkoutBody = r.request().postDataJSON();
      await r.fulfill({ status: 201, json: { reference: 'PLN-RENEW-1', paymentUrl: '/payment/success?ref=PLN-RENEW-1', amount: 50000, currency: 'XOF' } });
    });
    await page.route('**/api/dexpay/status/PLN-RENEW-1', (r) =>
      r.fulfill({ json: { reference: 'PLN-RENEW-1', status: 'completed', plan: 'INDIVIDUEL', amount: 50000, currency: 'XOF', billingCycle: 'YEARLY', periodEnd: '2027-11-18T00:00:00.000Z', paidAt: '2026-11-18T10:00:00.000Z' } }),
    );

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/payment\/renew$/);
    await expect(page.getByRole('heading', { name: 'Votre abonnement a expiré' })).toBeVisible();
    await expect(page.getByText(/expirée le 1 novembre 2026/)).toBeVisible();

    await page.getByRole('radio', { name: /Annuel/ }).click();
    await page.getByRole('button', { name: 'Payer 50 000 FCFA' }).click();
    await expect(page).toHaveURL(/\/payment\/success\?ref=PLN-RENEW-1/);
    expect(checkoutBody).toEqual({ plan: 'INDIVIDUEL', billingCycle: 'YEARLY' });

    await attachHealth(testInfo, health);
    expect(health.pageErrors).toEqual([]);
  });
});
