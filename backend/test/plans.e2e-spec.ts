import { ApiClient } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createTenant, Tenant } from './helpers/fixtures';

/**
 * Formules : tous les modules sont ouverts à toutes les formules (dont Individuel, 5 000 FCFA/mois).
 * Les formules se distinguent uniquement par le nombre d'utilisateurs et de plans d'action actifs.
 */
describe('Formules — accès aux modules et limites', () => {
  let ctx: TestContext;
  let tenant: Tenant;
  let admin: ApiClient;

  beforeAll(async () => {
    ctx = await createTestApp();
    tenant = await createTenant(ctx.prisma, 'plan-indiv', { plan: 'INDIVIDUEL' });
    admin = await ApiClient.loggedIn(ctx.http, tenant.users.admin.email, tenant.users.admin.password);
  });
  afterAll(() => closeTestApp(ctx));

  it('la formule Individuel coûte 5 000 FCFA par mois et 50 000 par an', async () => {
    const res = await admin.get('/api/billing/plans');
    expect(res.status).toBe(200);
    const indiv = res.body.plans.find((p: any) => p.plan === 'INDIVIDUEL');
    expect(indiv.prices).toEqual({ MONTHLY: 5000, YEARLY: 50000 });
    expect(indiv.limits).toEqual({ maxUsers: 1, maxPlans: 3 });
  });

  it.each([
    '/api/indicators',
    '/api/zones',
    '/api/recommendations',
    '/api/capitalization',
    '/api/messagerie/conversations',
    '/api/passation/fournisseurs',
    '/api/passation/ppm',
    '/api/audit',
  ])('la formule Individuel accède à %s', async (path) => {
    const res = await admin.get(path);
    expect({ path, status: res.status }).toEqual({ path, status: 200 });
  });

  it('la formule Individuel reste limitée à 3 plans d’action actifs', async () => {
    const coord = await ApiClient.loggedIn(ctx.http, tenant.users.coordinateur.email, tenant.users.coordinateur.password);
    const statuses: number[] = [];
    for (let i = 1; i <= 4; i++) {
      const r = await coord.post('/api/action-plans', {
        title: `Projet ${i}`,
        periodStart: '2026-01-01',
        periodEnd: '2026-12-31',
      });
      statuses.push(r.status);
    }
    expect(statuses).toEqual([201, 201, 201, 400]);
  });
});
