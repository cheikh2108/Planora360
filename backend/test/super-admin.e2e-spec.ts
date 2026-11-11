import request from 'supertest';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ApiClient } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { TEST_ENV } from './setup/test-config';
import { createTenant, createUser, Tenant } from './helpers/fixtures';

/** Espace super admin : validation des inscriptions, édition, suppression, restauration. */
describe('Super admin — organisations', () => {
  let ctx: TestContext;
  let sa: ApiClient;
  let tenant: Tenant;
  let notif: NotificationsService;
  let welcome: jest.SpyInstance;
  let mail: jest.SpyInstance;

  const register = async (label: string) => {
    const stamp = `${label}.${Date.now()}.${Math.floor(Math.random() * 1e6)}`;
    const email = `${stamp}@planora.test`;
    const res = await request(ctx.http)
      .post('/api/auth/register')
      .set('X-Forwarded-For', `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`)
      .send({ organizationName: `Org ${stamp}`, firstName: 'Awa', lastName: 'Diop', email });
    expect(res.status).toBe(201);
    return { id: res.body.organizationId as string, email };
  };

  beforeAll(async () => {
    ctx = await createTestApp();
    sa = await ApiClient.loggedIn(ctx.http, TEST_ENV.SEED_ADMIN_EMAIL, TEST_ENV.SEED_ADMIN_PASSWORD);
    tenant = await createTenant(ctx.prisma, 'sa-cible');
    notif = ctx.app.get(NotificationsService);
    welcome = jest.spyOn(notif, 'sendWelcomeCredentials');
    mail = jest.spyOn(notif as any, 'sendEmail').mockResolvedValue(undefined);
  });
  afterAll(async () => {
    welcome.mockRestore();
    mail.mockRestore();
    await closeTestApp(ctx);
  });
  beforeEach(() => {
    welcome.mockClear();
    mail.mockClear();
  });

  it('les routes super admin sont refusées à un administrateur d’organisation', async () => {
    const admin = await ApiClient.loggedIn(ctx.http, tenant.users.admin.email, tenant.users.admin.password);
    for (const [method, path] of [
      ['get', '/api/organizations'],
      ['get', '/api/organizations/pending'],
      ['patch', `/api/organizations/${tenant.org.id}/approve`],
      ['delete', `/api/organizations/${tenant.org.id}`],
    ] as const) {
      expect((await (admin as any)[method](path)).status).toBe(403);
    }
  });

  it('approuver : active le compte, impose le changement de mot de passe, n’active que l’administrateur', async () => {
    const { id, email } = await register('approve');
    // Un second compte ajouté dans l'organisation en attente ne doit pas recevoir le même mot de passe
    const extra = await createUser(ctx.prisma, id, 'Observateur', 'extra', { isActive: false });
    const extraBefore = await ctx.prisma.user.findUnique({ where: { id: extra.id } });

    const pending = await sa.get('/api/organizations/pending');
    expect(pending.body.map((o: any) => o.id)).toContain(id);

    const res = await sa.patch(`/api/organizations/${id}/approve`);
    expect(res.status).toBe(200);
    expect(welcome).toHaveBeenCalledTimes(1);
    const tempPassword = welcome.mock.calls[0][0].tempPassword;

    const user = await ctx.prisma.user.findFirst({ where: { email } });
    expect(user?.isActive).toBe(true);
    expect(user?.mustChangePassword).toBe(true);
    const extraAfter = await ctx.prisma.user.findUnique({ where: { id: extra.id } });
    expect(extraAfter?.passwordHash).toBe(extraBefore?.passwordHash);

    const login = await request(ctx.http).post('/api/auth/login').send({ email, password: tempPassword });
    expect(login.status).toBe(200);

    expect((await sa.patch(`/api/organizations/${id}/approve`)).status).toBe(400);
  });

  it('rejeter : statut REJECTED, la personne est prévenue par e-mail et ne peut pas se connecter', async () => {
    const { id, email } = await register('reject');
    const res = await sa.patch(`/api/organizations/${id}/reject`, { reason: 'Dossier <incomplet>' });
    expect(res.status).toBe(200);
    expect((await ctx.prisma.organization.findUnique({ where: { id } }))?.status).toBe('REJECTED');
    const toUser = mail.mock.calls.find((c) => c[0] === email);
    expect(toUser).toBeDefined();
    expect(toUser![2]).toContain('Dossier &lt;incomplet&gt;');
  });

  it('modifier une organisation avec des champs non applicables renvoie 400, pas 500', async () => {
    const ok = await sa.patch(`/api/organizations/${tenant.org.id}`, { subscriptionPlan: 'PRO' });
    expect(ok.status).toBe(200);
    expect(ok.body.subscriptionPlan).toBe('PRO');
    const bad = await sa.patch(`/api/organizations/${tenant.org.id}`, { adminEmail: 'x@y.test' });
    expect(bad.status).toBe(400);
  });

  it('supprimer, restaurer puis supprimer définitivement une organisation qui a des données', async () => {
    const t = await createTenant(ctx.prisma, 'sa-data');
    const coord = await ApiClient.loggedIn(ctx.http, t.users.coordinateur.email, t.users.coordinateur.password);
    const plan = await coord.post('/api/action-plans', {
      title: 'Plan à supprimer',
      periodStart: '2026-01-01',
      periodEnd: '2026-12-31',
    });
    expect(plan.status).toBe(201);
    await ctx.prisma.auditLog.create({
      data: { organizationId: t.org.id, userId: t.users.admin.id, action: 'X', entityType: 'Activity', entityId: 'x' },
    });

    expect((await sa.delete(`/api/organizations/${t.org.id}`)).status).toBe(204);
    const deleted = await sa.get('/api/organizations/deleted');
    expect(deleted.body.map((o: any) => o.id)).toContain(t.org.id);
    expect((await sa.patch(`/api/organizations/${t.org.id}/restore`)).status).toBe(200);

    expect((await sa.delete(`/api/organizations/${t.org.id}`)).status).toBe(204);
    const hard = await sa.delete(`/api/organizations/${t.org.id}/hard`);
    expect(hard.status).toBe(204);
    expect(await ctx.prisma.organization.findUnique({ where: { id: t.org.id } })).toBeNull();
    expect(await ctx.prisma.user.count({ where: { organizationId: t.org.id } })).toBe(0);
  });

  it('le journal d’audit du super admin couvre toutes les organisations, filtrable par organisation', async () => {
    const a = await createTenant(ctx.prisma, 'sa-audit-a');
    const b = await createTenant(ctx.prisma, 'sa-audit-b');
    for (const t of [a, b]) {
      await ctx.prisma.auditLog.create({
        data: { organizationId: t.org.id, userId: t.users.admin.id, action: 'SA_AUDIT_PROBE', entityType: 'Activity', entityId: 'p' },
      });
    }
    const all = await sa.get('/api/audit/search?action=SA_AUDIT_PROBE&limit=50');
    expect(all.status).toBe(200);
    const orgs = all.body.entries.map((e: any) => e.organization?.id);
    expect(orgs).toEqual(expect.arrayContaining([a.org.id, b.org.id]));

    const onlyA = await sa.get(`/api/audit/search?action=SA_AUDIT_PROBE&organizationId=${a.org.id}`);
    expect(onlyA.body.entries.every((e: any) => e.organizationId === a.org.id)).toBe(true);
    expect(onlyA.body.entries[0].organization.name).toBe(a.org.name);
  });

  it('restaurer ne réactive pas un utilisateur supprimé avant la suppression de l’organisation', async () => {
    const t = await createTenant(ctx.prisma, 'sa-restore');
    const gone = await createUser(ctx.prisma, t.org.id, 'Observateur', 'gone', {
      deletedAt: new Date(Date.now() - 86_400_000),
      isActive: false,
    });
    expect((await sa.delete(`/api/organizations/${t.org.id}`)).status).toBe(204);
    expect((await sa.patch(`/api/organizations/${t.org.id}/restore`)).status).toBe(200);
    const u = await ctx.prisma.user.findUnique({ where: { id: gone.id } });
    expect(u?.deletedAt).not.toBeNull();
    const admin = await ctx.prisma.user.findUnique({ where: { id: t.users.admin.id } });
    expect(admin?.deletedAt).toBeNull();
    expect(admin?.isActive).toBe(true);
  });
});
