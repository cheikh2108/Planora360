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
    tenant = await createTenant(ctx.prisma, 'plan-solo', { plan: 'SOLO' });
    admin = await ApiClient.loggedIn(ctx.http, tenant.users.admin.email, tenant.users.admin.password);
  });
  afterAll(() => closeTestApp(ctx));

  it('Solo : 5 000 FCFA/mois, 3 projets ; Individuel : 10 000 FCFA/mois, 10 projets ; 1 utilisateur chacun', async () => {
    const res = await admin.get('/api/billing/plans');
    expect(res.status).toBe(200);
    const solo = res.body.plans.find((p: any) => p.plan === 'SOLO');
    expect(solo).toMatchObject({ label: 'Solo', payable: true, prices: { MONTHLY: 5000, YEARLY: 50000 }, limits: { maxUsers: 1, maxPlans: 3 } });
    const indiv = res.body.plans.find((p: any) => p.plan === 'INDIVIDUEL');
    expect(indiv).toMatchObject({ prices: { MONTHLY: 10000, YEARLY: 100000 }, limits: { maxUsers: 1, maxPlans: 10 } });
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
  ])('la formule Solo accède à %s', async (path) => {
    const res = await admin.get(path);
    expect({ path, status: res.status }).toEqual({ path, status: 200 });
  });

  it('la formule Solo reste limitée à 3 plans d’action actifs', async () => {
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
