import request from 'supertest';
import { createHmac } from 'crypto';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { ApiClient } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createTenant, login, Tenant } from './helpers/fixtures';
import { NotificationsService } from '../src/notifications/notifications.service';
import { BillingService } from '../src/dexpay/billing.service';

/**
 * Paiement d'une formule avec DexPay, contre un faux serveur DexPay local qui reproduit l'API
 * documentée (POST/GET /checkout-sessions, réponses enveloppées dans « data »).
 */

const SECRET = 'sk_test_billing_secret';

interface StubSession {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  webhook_url?: string;
  success_url: string;
  failure_url: string;
  metadata: Record<string, string>;
}

/** Faux DexPay : enregistre les sessions et laisse le test changer leur statut. */
function startStubDexpay() {
  const sessions = new Map<string, StubSession>();
  const requests: { headers: IncomingMessage['headers']; body: any }[] = [];

  const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const send = (status: number, body: unknown) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(body));
      };
      if (req.headers['x-api-key'] !== 'pk_test_billing') return send(401, { message: 'Clé invalide' });

      if (req.method === 'POST' && req.url === '/api/v1/checkout-sessions') {
        const body = JSON.parse(raw || '{}');
        requests.push({ headers: req.headers, body });
        if (!Number.isInteger(body.amount)) return send(422, { errors: { amount: 'amount must be an integer' } });
        const session: StubSession = { ...body, status: 'initiated' };
        sessions.set(body.reference, session);
        return send(201, {
          status: 'success',
          data: { ...session, payment_url: `https://pay.example.test/${body.reference}`, isSandbox: true },
        });
      }
      const match = req.url?.match(/^\/api\/v1\/checkout-sessions\/(.+)$/);
      if (req.method === 'GET' && match) {
        const session = sessions.get(decodeURIComponent(match[1]));
        if (!session) return send(404, { message: 'Introuvable' });
        return send(200, { data: session });
      }
      send(404, { message: 'Route inconnue' });
    });
  });

  return new Promise<{ url: string; sessions: typeof sessions; requests: typeof requests; close: () => Promise<void> }>(
    (resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address() as AddressInfo;
        resolve({
          url: `http://127.0.0.1:${port}/api/v1`,
          sessions,
          requests,
          close: () => new Promise((r) => server.close(() => r())),
        });
      });
    },
  );
}

/** Envoie un webhook signé comme DexPay (HMAC-SHA256 hexadécimal du corps brut). */
function sendWebhook(http: any, body: Record<string, unknown>, secret = SECRET) {
  const raw = JSON.stringify(body);
  return request(http)
    .post('/api/dexpay/webhook')
    .set('Content-Type', 'application/json')
    .set('X-Webhook-Event', String(body.event))
    .set('X-Webhook-Signature', createHmac('sha256', secret).update(raw).digest('hex'))
    .send(raw);
}

const ENV_KEYS = ['DEXPAY_PUBLIC_KEY', 'DEXPAY_SECRET_KEY', 'DEXPAY_API_URL', 'API_PUBLIC_URL', 'PRICE_PRO_MONTHLY'];

describe('Paiement des formules (DexPay)', () => {
  let ctx: TestContext;
  let stub: Awaited<ReturnType<typeof startStubDexpay>>;
  const savedEnv: Record<string, string | undefined> = {};
  let tenant: Tenant;
  let admin: ApiClient;

  beforeAll(async () => {
    stub = await startStubDexpay();
    for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
    process.env.DEXPAY_PUBLIC_KEY = 'pk_test_billing';
    process.env.DEXPAY_SECRET_KEY = SECRET;
    process.env.DEXPAY_API_URL = stub.url;
    process.env.API_PUBLIC_URL = 'https://api.planora.test/api';
    delete process.env.PRICE_PRO_MONTHLY;
    ctx = await createTestApp();
    tenant = await createTenant(ctx.prisma, 'billing', { plan: 'INDIVIDUEL' });
    admin = await login(ctx.http, tenant.users.admin);
  });

  afterAll(async () => {
    await closeTestApp(ctx);
    await stub.close();
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
  });

  async function checkout(api: ApiClient, plan: string, billingCycle: string) {
    return api.post('/api/billing/checkout', { plan, billingCycle });
  }

  it('publie le catalogue avec les prix de la grille tarifaire en FCFA entiers', async () => {
    const res = await admin.get('/api/billing/plans');
    expect(res.status).toBe(200);
    expect(res.body.onlinePayment).toBe(true);
    const pro = res.body.plans.find((p: any) => p.plan === 'PRO');
    expect(pro.prices).toEqual({ MONTHLY: 25000, YEARLY: 250000 });
    const enterprise = res.body.plans.find((p: any) => p.plan === 'ENTERPRISE');
    expect(enterprise.payable).toBe(false);
  });

  it('crée une session DexPay au montant exact, avec webhook et retours vers le frontend', async () => {
    const res = await checkout(admin, 'PRO', 'MONTHLY');
    expect(res.status).toBe(201);
    expect(res.body.paymentUrl).toMatch(/^https:\/\/pay\.example\.test\//);
    expect(res.body.amount).toBe(25000);

    const sent = stub.requests.at(-1)!.body;
    expect(sent.amount).toBe(25000);
    expect(sent.currency).toBe('XOF');
    expect(sent.webhook_url).toBe('https://api.planora.test/api/dexpay/webhook');
    expect(sent.success_url).toBe(`http://localhost:3001/payment/success?ref=${res.body.reference}`);
    expect(sent.failure_url).toBe(`http://localhost:3001/payment/failed?ref=${res.body.reference}`);
    expect(sent.metadata).toMatchObject({ organization_id: tenant.org.id, plan: 'PRO', billing_cycle: 'MONTHLY' });

    const payment = await ctx.prisma.payment.findUnique({ where: { dexpayReference: res.body.reference } });
    expect(payment).toMatchObject({ status: 'pending', amount: 25000, plan: 'PRO', organizationId: tenant.org.id });
  });

  it('réserve le paiement à l\'administrateur et refuse Enterprise et les cycles inconnus', async () => {
    const coord = await login(ctx.http, tenant.users.coordinateur);
    expect((await checkout(coord, 'PRO', 'MONTHLY')).status).toBe(403);
    expect((await checkout(admin, 'ENTERPRISE', 'MONTHLY')).status).toBe(400);
    expect((await checkout(admin, 'PRO', 'WEEKLY')).status).toBe(400);
    expect((await admin.post('/api/billing/checkout', { plan: 'PRO', billingCycle: 'MONTHLY', amount: 1 })).status).toBe(400);
  });

  it('active la formule au webhook checkout.completed, une seule fois même s\'il est rejoué', async () => {
    const t = await createTenant(ctx.prisma, 'billok', { plan: 'INDIVIDUEL' });
    const api = await login(ctx.http, t.users.admin);
    const { body } = await checkout(api, 'EQUIPE', 'YEARLY');

    const event = {
      event: 'checkout.completed',
      reference: body.reference,
      checkout_session_id: 'cs_123',
      transaction_id: 'tx_123',
      status: 'success',
      amount: 500000,
      currency: 'XOF',
      operator: 'wave',
      payment_method: 'mobile_money',
      metadata: { organization_id: t.org.id, plan: 'EQUIPE', billing_cycle: 'YEARLY' },
    };
    expect((await sendWebhook(ctx.http, event)).status).toBe(200);

    const org = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: t.org.id } });
    expect(org.subscriptionPlan).toBe('EQUIPE');
    expect(org.subscriptionStatus).toBe('ACTIVE');
    expect(org.billingCycle).toBe('YEARLY');
    const inAYear = Date.now() + 365 * 24 * 3600 * 1000;
    expect(Math.abs(org.currentPeriodEnd!.getTime() - inAYear)).toBeLessThan(2 * 24 * 3600 * 1000);

    const payment = await ctx.prisma.payment.findUniqueOrThrow({ where: { dexpayReference: body.reference } });
    expect(payment).toMatchObject({ status: 'completed', paymentMethod: 'wave' });

    // Rejeu : rien ne change (pas de seconde année ajoutée)
    expect((await sendWebhook(ctx.http, event)).status).toBe(200);
    const again = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: t.org.id } });
    expect(again.currentPeriodEnd!.getTime()).toBe(org.currentPeriodEnd!.getTime());

    // La session reflète immédiatement la nouvelle formule
    const me = await api.get('/api/auth/me');
    expect(me.body.user.organization.subscriptionPlan).toBe('EQUIPE');
  });

  it('n\'active rien si le montant payé diffère du montant demandé', async () => {
    const t = await createTenant(ctx.prisma, 'billmis', { plan: 'INDIVIDUEL' });
    const api = await login(ctx.http, t.users.admin);
    const { body } = await checkout(api, 'ORGANISATION', 'MONTHLY');
    const res = await sendWebhook(ctx.http, {
      event: 'checkout.completed', reference: body.reference, amount: 100, currency: 'XOF',
      metadata: { organization_id: t.org.id, plan: 'ORGANISATION' },
    });
    expect(res.status).toBe(200);
    const org = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: t.org.id } });
    expect(org.subscriptionPlan).toBe('INDIVIDUEL');
    const payment = await ctx.prisma.payment.findUniqueOrThrow({ where: { dexpayReference: body.reference } });
    expect(payment.status).toBe('amount_mismatch');
  });

  it('refuse un webhook signé avec une autre clé et ignore une référence inconnue', async () => {
    const t = await createTenant(ctx.prisma, 'billsig', { plan: 'INDIVIDUEL' });
    const api = await login(ctx.http, t.users.admin);
    const { body } = await checkout(api, 'PRO', 'MONTHLY');
    const forged = await sendWebhook(
      ctx.http,
      { event: 'checkout.completed', reference: body.reference, amount: 25000, currency: 'XOF' },
      'sk_test_autre_cle',
    );
    expect(forged.status).toBe(400);

    const unknown = await sendWebhook(ctx.http, {
      event: 'checkout.completed', reference: 'PLN-INCONNU', amount: 25000, currency: 'XOF',
      metadata: { organization_id: t.org.id, plan: 'ENTERPRISE' },
    });
    expect(unknown.status).toBe(200);
    const org = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: t.org.id } });
    expect(org.subscriptionPlan).toBe('INDIVIDUEL');
  });

  it('active la formule au retour sur la page de succès si DexPay confirme, même sans webhook', async () => {
    const t = await createTenant(ctx.prisma, 'billret', { plan: 'INDIVIDUEL' });
    const api = await login(ctx.http, t.users.admin);
    const { body } = await checkout(api, 'PRO', 'MONTHLY');

    const pending = await api.get(`/api/dexpay/status/${body.reference}`);
    expect(pending.status).toBe(200);
    expect(pending.body.status).toBe('pending');

    stub.sessions.get(body.reference)!.status = 'completed';
    const done = await api.get(`/api/dexpay/status/${body.reference}`);
    expect(done.body).toMatchObject({ status: 'completed', plan: 'PRO' });
    const org = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: t.org.id } });
    expect(org.subscriptionPlan).toBe('PRO');
  });

  it('enregistre un paiement échoué sans changer la formule', async () => {
    const t = await createTenant(ctx.prisma, 'billko', { plan: 'INDIVIDUEL' });
    const api = await login(ctx.http, t.users.admin);
    const { body } = await checkout(api, 'PRO', 'MONTHLY');
    await sendWebhook(ctx.http, { event: 'checkout.failed', reference: body.reference, error_message: 'Solde insuffisant' });
    const status = await api.get(`/api/dexpay/status/${body.reference}`);
    expect(status.body.status).toBe('failed');
    const org = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: t.org.id } });
    expect(org.subscriptionPlan).toBe('INDIVIDUEL');
  });

  it('prolonge la période quand la même formule est repayée avant son échéance', async () => {
    const t = await createTenant(ctx.prisma, 'billext', { plan: 'INDIVIDUEL' });
    const api = await login(ctx.http, t.users.admin);
    const pay = async () => {
      const { body } = await checkout(api, 'PRO', 'MONTHLY');
      await sendWebhook(ctx.http, { event: 'checkout.completed', reference: body.reference, amount: 25000, currency: 'XOF' });
      return ctx.prisma.organization.findUniqueOrThrow({ where: { id: t.org.id } });
    };
    const first = await pay();
    const second = await pay();
    const days = (second.currentPeriodEnd!.getTime() - first.currentPeriodEnd!.getTime()) / (24 * 3600 * 1000);
    expect(days).toBeGreaterThanOrEqual(28);
    expect(days).toBeLessThanOrEqual(31);
  });

  it('montre l\'abonnement et l\'historique à l\'administrateur, pas les paiements d\'une autre organisation', async () => {
    const res = await admin.get('/api/billing/subscription');
    expect(res.status).toBe(200);
    expect(res.body.payments.length).toBeGreaterThan(0);
    expect(res.body.payments[0]).toHaveProperty('reference');

    const other = await createTenant(ctx.prisma, 'billother', { plan: 'INDIVIDUEL' });
    const otherAdmin = await login(ctx.http, other.users.admin);
    const ref = res.body.payments[0].reference;
    expect((await otherAdmin.get(`/api/dexpay/status/${ref}`)).status).toBe(404);
  });
});

/**
 * Parcours B : inscription Individuel payée directement (sans approbation), puis blocage à
 * l'échéance et relances. Même faux serveur DexPay que ci-dessus.
 */
describe('Inscription payée et échéance des abonnements', () => {
  let ctx: TestContext;
  let stub: Awaited<ReturnType<typeof startStubDexpay>>;
  const savedEnv: Record<string, string | undefined> = {};
  let notif: NotificationsService;
  let welcome: jest.SpyInstance;
  let support: jest.SpyInstance;
  let reminder: jest.SpyInstance;
  let mail: jest.SpyInstance;

  const uniq = () => `${Date.now()}.${Math.floor(Math.random() * 1e6)}`;
  const register = (body: Record<string, unknown>) =>
    request(ctx.http)
      .post('/api/auth/register')
      .set('X-Forwarded-For', `10.7.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`)
      .send({ firstName: 'Awa', lastName: 'Diop', ...body });

  beforeAll(async () => {
    stub = await startStubDexpay();
    for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
    process.env.DEXPAY_PUBLIC_KEY = 'pk_test_billing';
    process.env.DEXPAY_SECRET_KEY = SECRET;
    process.env.DEXPAY_API_URL = stub.url;
    process.env.API_PUBLIC_URL = 'https://api.planora.test/api';
    ctx = await createTestApp();
    notif = ctx.app.get(NotificationsService);
    welcome = jest.spyOn(notif, 'sendWelcomeCredentials');
    support = jest.spyOn(notif, 'sendPaidSignupToSupport');
    reminder = jest.spyOn(notif, 'sendSubscriptionReminder');
    mail = jest.spyOn(notif as any, 'sendEmail').mockResolvedValue(undefined);
  });
  afterAll(async () => {
    [welcome, support, reminder, mail].forEach((s) => s.mockRestore());
    await closeTestApp(ctx);
    await stub.close();
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
  });
  beforeEach(() => [welcome, support, reminder, mail].forEach((s) => s.mockClear()));

  it('inscription → paiement → compte activé, identifiants envoyés, connexion avec changement de mot de passe', async () => {
    const email = `signup.${uniq()}@planora.test`;
    const organizationName = `Cabinet ${uniq()}`;
    const res = await register({ organizationName, email, subscriptionPlan: 'SOLO', billingCycle: 'MONTHLY' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ status: 'PENDING_PAYMENT', amount: 5000, currency: 'XOF' });
    expect(res.body.checkoutUrl).toBe(`https://pay.example.test/${res.body.reference}`);
    const ref = res.body.reference;

    const sent = stub.sessions.get(ref)!;
    expect(sent.amount).toBe(5000);
    expect(sent.success_url).toMatch(new RegExp(`/payment/success\\?ref=${ref}&signup=1$`));
    expect(sent.failure_url).toMatch(/signup=1$/);
    expect(sent.metadata.registration).toBe('true');

    // Avant le paiement : organisation en attente, compte inactif, aucune connexion possible
    const org = await ctx.prisma.organization.findFirstOrThrow({ where: { name: organizationName } });
    expect(org.status).toBe('PENDING_PAYMENT');
    expect((await ctx.prisma.user.findFirstOrThrow({ where: { email } })).isActive).toBe(false);
    expect((await request(ctx.http).get(`/api/auth/register/payment/${ref}`)).body.status).toBe('pending');

    // Paiement confirmé par webhook
    const hook = await sendWebhook(ctx.http, { event: 'checkout.completed', reference: ref, amount: 5000, currency: 'XOF' });
    expect(hook.status).toBe(200);

    const after = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: org.id } });
    expect(after.status).toBe('ACTIVE');
    expect(after.subscriptionStatus).toBe('ACTIVE');
    expect(after.currentPeriodEnd!.getTime()).toBeGreaterThan(Date.now() + 27 * 86_400_000);
    const user = await ctx.prisma.user.findFirstOrThrow({ where: { email } });
    expect(user.isActive).toBe(true);
    expect(user.mustChangePassword).toBe(true);

    expect(welcome).toHaveBeenCalledTimes(1);
    expect(support).toHaveBeenCalledTimes(1);
    const { tempPassword } = welcome.mock.calls[0][0];
    const login = await request(ctx.http).post('/api/auth/login').send({ email, password: tempPassword });
    expect(login.status).toBe(200);
    expect((await request(ctx.http).get(`/api/auth/register/payment/${ref}`)).body.status).toBe('completed');

    // Webhook rejoué : aucun second e-mail d'identifiants
    await sendWebhook(ctx.http, { event: 'checkout.completed', reference: ref, amount: 5000, currency: 'XOF' });
    expect(welcome).toHaveBeenCalledTimes(1);

    // Plus de relance possible une fois le compte activé
    expect((await request(ctx.http).post(`/api/auth/register/payment/${ref}/retry`)).status).toBe(400);
  });

  it('paiement échoué : on peut réessayer, et une nouvelle inscription avec le même e-mail reprend la demande', async () => {
    const email = `retry.${uniq()}@planora.test`;
    // Individuel annuel : 100 000 FCFA
    const res = await register({ organizationName: `Retry ${uniq()}`, email, subscriptionPlan: 'INDIVIDUEL', billingCycle: 'YEARLY' });
    expect(res.body.amount).toBe(100000);
    await sendWebhook(ctx.http, { event: 'checkout.failed', reference: res.body.reference });
    expect((await request(ctx.http).get(`/api/auth/register/payment/${res.body.reference}`)).body.status).toBe('failed');

    const retry = await request(ctx.http).post(`/api/auth/register/payment/${res.body.reference}/retry`);
    expect(retry.status).toBe(200);
    expect(retry.body.reference).not.toBe(res.body.reference);
    expect(stub.sessions.get(retry.body.reference)!.amount).toBe(100000);

    // Même e-mail, autre nom : la demande non payée est reprise (pas de 409)
    const again = await register({ organizationName: `Retry renommé ${uniq()}`, email });
    expect(again.status).toBe(201);
    expect(again.body.organizationId).toBe(res.body.organizationId);
    expect(await ctx.prisma.user.count({ where: { email } })).toBe(1);
    expect(welcome).not.toHaveBeenCalled();
  });

  it('la formule Individuel s’achète aussi à l’inscription, à 10 000 FCFA, et les formules d’équipe restent sur devis', async () => {
    const organizationName = `Indiv ${uniq()}`;
    const res = await register({ organizationName, email: `indiv.${uniq()}@planora.test`, subscriptionPlan: 'INDIVIDUEL' });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(10000);
    const org = await ctx.prisma.organization.findFirstOrThrow({ where: { name: organizationName } });
    expect(org.subscriptionPlan).toBe('INDIVIDUEL');

    const pro = await register({ organizationName: `Pro ${uniq()}`, email: `pro.${uniq()}@planora.test`, subscriptionPlan: 'PRO' });
    expect(pro.body.requiresQuote).toBe(true);
  });

  it('refuse l’inscription avec l’e-mail d’un compte existant, sans rien créer', async () => {
    const t = await createTenant(ctx.prisma, 'signup-dup');
    const organizationName = `Doublon ${uniq()}`;
    const res = await register({ organizationName, email: t.users.admin.email });
    expect(res.status).toBe(409);
    expect(await ctx.prisma.organization.count({ where: { name: organizationName } })).toBe(0);
  });

  it('le statut public ne concerne que les paiements d’inscription', async () => {
    const t = await createTenant(ctx.prisma, 'signup-public', { plan: 'INDIVIDUEL' });
    const admin = await login(ctx.http, t.users.admin);
    const checkout = await admin.post('/api/billing/checkout', { plan: 'PRO', billingCycle: 'MONTHLY' });
    expect(checkout.status).toBe(201);
    expect((await request(ctx.http).get(`/api/auth/register/payment/${checkout.body.reference}`)).status).toBe(404);
    expect((await request(ctx.http).post(`/api/auth/register/payment/${checkout.body.reference}/retry`)).status).toBe(404);
  });

  it('abonnement expiré : API bloquée (402) sauf session et renouvellement, débloquée après paiement', async () => {
    const t = await createTenant(ctx.prisma, 'expire', { plan: 'INDIVIDUEL' });
    await ctx.prisma.organization.update({
      where: { id: t.org.id },
      data: { subscriptionStatus: 'ACTIVE', currentPeriodEnd: new Date(Date.now() - 3600_000) },
    });
    const admin = await login(ctx.http, t.users.admin);

    const blocked = await admin.get('/api/action-plans');
    expect(blocked.status).toBe(402);
    expect(blocked.body.code).toBe('SUBSCRIPTION_EXPIRED');
    expect((await admin.get('/api/auth/me')).status).toBe(200);
    expect((await admin.get('/api/billing/subscription')).status).toBe(200);
    expect((await admin.get('/api/billing/plans')).status).toBe(200);

    const checkout = await admin.post('/api/billing/checkout', { plan: 'INDIVIDUEL', billingCycle: 'MONTHLY' });
    expect(checkout.status).toBe(201);
    await sendWebhook(ctx.http, { event: 'checkout.completed', reference: checkout.body.reference, amount: 10000, currency: 'XOF' });

    expect((await admin.get('/api/action-plans')).status).toBe(200);
    const org = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: t.org.id } });
    // Période expirée : la nouvelle démarre au paiement, pas à l'ancienne échéance
    expect(org.currentPeriodEnd!.getTime()).toBeGreaterThan(Date.now() + 27 * 86_400_000);
  });

  it('une organisation sans date d’échéance (créée à la main) n’est pas bloquée', async () => {
    const t = await createTenant(ctx.prisma, 'sans-echeance', { plan: 'INDIVIDUEL' });
    const admin = await login(ctx.http, t.users.admin);
    expect((await admin.get('/api/action-plans')).status).toBe(200);
  });

  it('relances : J-7, J-1, puis expiration (statut PAST_DUE), un e-mail par étape', async () => {
    const billing = ctx.app.get(BillingService);
    const now = new Date();
    const at = (h: number) => new Date(now.getTime() + h * 3600_000);
    const tenants = {
      J7: await createTenant(ctx.prisma, 'rel-j7', { plan: 'INDIVIDUEL' }),
      J1: await createTenant(ctx.prisma, 'rel-j1', { plan: 'INDIVIDUEL' }),
      EXPIRED: await createTenant(ctx.prisma, 'rel-exp', { plan: 'INDIVIDUEL' }),
      LATER: await createTenant(ctx.prisma, 'rel-later', { plan: 'INDIVIDUEL' }),
    };
    const ends = { J7: at(6.5 * 24), J1: at(12), EXPIRED: at(-12), LATER: at(20 * 24) };
    for (const [k, t] of Object.entries(tenants)) {
      await ctx.prisma.organization.update({
        where: { id: t.org.id },
        data: { subscriptionStatus: 'ACTIVE', currentPeriodEnd: ends[k as keyof typeof ends] },
      });
    }

    await billing.sendRenewalReminders(now);
    const byEmail = new Map(reminder.mock.calls.map((c) => [c[0].email, c[0].kind]));
    expect(byEmail.get(tenants.J7.users.admin.email)).toBe('J7');
    expect(byEmail.get(tenants.J1.users.admin.email)).toBe('J1');
    expect(byEmail.get(tenants.EXPIRED.users.admin.email)).toBe('EXPIRED');
    expect(byEmail.has(tenants.LATER.users.admin.email)).toBe(false);
    // Seuls les administrateurs sont relancés
    expect(byEmail.has(tenants.J7.users.coordinateur.email)).toBe(false);
    expect(reminder.mock.calls[0][0].renewUrl).toMatch(/\/payment\/renew$/);

    const expired = await ctx.prisma.organization.findUniqueOrThrow({ where: { id: tenants.EXPIRED.org.id } });
    expect(expired.subscriptionStatus).toBe('PAST_DUE');
  });

  it('les inscriptions jamais payées sont supprimées après 7 jours', async () => {
    const billing = ctx.app.get(BillingService);
    const old = await register({ organizationName: `Ancienne ${uniq()}`, email: `old.${uniq()}@planora.test` });
    const recent = await register({ organizationName: `Récente ${uniq()}`, email: `recent.${uniq()}@planora.test` });
    await ctx.prisma.organization.update({
      where: { id: old.body.organizationId },
      data: { createdAt: new Date(Date.now() - 8 * 86_400_000) },
    });
    await billing.purgeUnpaidRegistrations();
    expect(await ctx.prisma.organization.findUnique({ where: { id: old.body.organizationId } })).toBeNull();
    expect(await ctx.prisma.organization.findUnique({ where: { id: recent.body.organizationId } })).not.toBeNull();
  });
});
