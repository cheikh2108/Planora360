import request from 'supertest';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ApiClient } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createTenant, Tenant } from './helpers/fixtures';

/** Notifications in-app : ouvertes à tous, sans ses propres actions, sans champs sensibles, lecture côté serveur. */
describe('Notifications', () => {
  let ctx: TestContext;
  let tenant: Tenant;
  let other: Tenant;

  const log = (orgId: string, userId: string, action: string, entityType = 'Activity', at = new Date()) =>
    ctx.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action,
        entityType,
        entityId: 'e-' + action,
        metadata: { title: `Titre ${action}` },
        ipAddress: '10.1.2.3',
        userAgent: 'secret-agent',
        oldValues: { budget: 1 },
        newValues: { budget: 2 },
        createdAt: at,
      },
    });

  beforeAll(async () => {
    ctx = await createTestApp();
    // Formule de base : GET /audit y est interdit, les notifications doivent quand même marcher
    tenant = await createTenant(ctx.prisma, 'notif', { plan: 'INDIVIDUEL' });
    other = await createTenant(ctx.prisma, 'notif-other');
    const { admin, coordinateur, observateur } = tenant.users;
    const t0 = Date.now() - 60_000;
    await log(tenant.org.id, coordinateur.id, 'ACTIVITY_CREATED', 'Activity', new Date(t0));
    await log(tenant.org.id, admin.id, 'USER_CREATED', 'User', new Date(t0 + 1000));
    await log(tenant.org.id, observateur.id, 'DOCUMENT_UPLOADED', 'Document', new Date(t0 + 2000));
    await log(other.org.id, other.users.admin.id, 'ACTIVITY_CREATED', 'Activity', new Date(t0 + 3000));
  });
  afterAll(() => closeTestApp(ctx));

  it('est accessible sur la formule Individuel et exclut ses propres actions et les autres organisations', async () => {
    const api = await ApiClient.loggedIn(ctx.http, tenant.users.coordinateur.email, tenant.users.coordinateur.password);
    expect((await api.get('/api/audit')).status).toBe(403);

    const res = await api.get('/api/notifications');
    expect(res.status).toBe(200);
    const actions = res.body.entries.map((e: any) => e.action);
    expect(actions).toEqual(['DOCUMENT_UPLOADED', 'USER_CREATED']);
    expect(res.body.total).toBe(2);
    expect(res.body.unreadCount).toBe(2);
  });

  it('ne renvoie aucun champ sensible', async () => {
    const api = await ApiClient.loggedIn(ctx.http, tenant.users.admin.email, tenant.users.admin.password);
    const res = await api.get('/api/notifications');
    const entry = res.body.entries[0];
    expect(Object.keys(entry).sort()).toEqual(
      ['action', 'createdAt', 'entityId', 'entityType', 'id', 'metadata', 'read', 'user'].sort(),
    );
    expect(Object.keys(entry.user).sort()).toEqual(['firstName', 'id', 'lastName']);
    expect(JSON.stringify(res.body)).not.toMatch(/10\.1\.2\.3|secret-agent|budget/);
  });

  it('masque les événements de gestion des comptes aux rôles opérationnels', async () => {
    const api = await ApiClient.loggedIn(ctx.http, tenant.users.validateur.email, tenant.users.validateur.password);
    const actions = (await api.get('/api/notifications')).body.entries.map((e: any) => e.action);
    expect(actions).toContain('ACTIVITY_CREATED');
    expect(actions).not.toContain('USER_CREATED');
  });

  it('enregistre la lecture côté serveur et ne compte ensuite que les nouveaux événements', async () => {
    const { validateur, observateur } = tenant.users;
    const api = await ApiClient.loggedIn(ctx.http, validateur.email, validateur.password);
    expect((await api.get('/api/notifications')).body.unreadCount).toBe(2);

    const read = await api.post('/api/notifications/read-all');
    expect(read.status).toBe(200);
    const after = await api.get('/api/notifications');
    expect(after.body.unreadCount).toBe(0);
    expect(after.body.entries.every((e: any) => e.read)).toBe(true);

    // Une autre session (autre appareil) voit le même état
    const api2 = await ApiClient.loggedIn(ctx.http, validateur.email, validateur.password);
    expect((await api2.get('/api/notifications')).body.unreadCount).toBe(0);

    await log(tenant.org.id, observateur.id, 'COMMENT_ADDED', 'Activity', new Date(Date.now() + 1000));
    const fresh = await api.get('/api/notifications');
    expect(fresh.body.unreadCount).toBe(1);
    expect(fresh.body.entries[0]).toMatchObject({ action: 'COMMENT_ADDED', read: false });
  });

  it('borne la pagination', async () => {
    const api = await ApiClient.loggedIn(ctx.http, tenant.users.admin.email, tenant.users.admin.password);
    const res = await api.get('/api/notifications?limit=5000&page=-3');
    expect(res.body.limit).toBe(50);
    expect(res.body.page).toBe(1);
  });

  it('exige une connexion, et le jeton CSRF pour marquer comme lu', async () => {
    expect((await request(ctx.http).get('/api/notifications')).status).toBe(401);
    const api = await ApiClient.loggedIn(ctx.http, tenant.users.admin.email, tenant.users.admin.password);
    expect((await api.agent.post('/api/notifications/read-all')).status).toBe(403);
  });

  it('enregistre les préférences d\'e-mails et rejette les clés inconnues', async () => {
    const api = await ApiClient.loggedIn(ctx.http, tenant.users.observateur.email, tenant.users.observateur.password);
    expect((await api.get('/api/notifications/preferences')).body).toEqual({
      validationRequests: true,
      validationResults: true,
      overdueActivities: true,
      upcomingDeadlines: true,
    });
    const res = await api.patch('/api/notifications/preferences', { upcomingDeadlines: false });
    expect(res.status).toBe(200);
    expect(res.body.upcomingDeadlines).toBe(false);
    expect(res.body.overdueActivities).toBe(true);
    expect((await api.get('/api/notifications/preferences')).body.upcomingDeadlines).toBe(false);
    expect((await api.patch('/api/notifications/preferences', { weeklyReport: true })).status).toBe(400);
    expect((await api.patch('/api/notifications/preferences', { overdueActivities: 'oui' })).status).toBe(400);
  });

  describe('alertes e-mail', () => {
    let sent: jest.SpyInstance;
    let service: NotificationsService;

    beforeAll(() => {
      service = ctx.app.get(NotificationsService);
      sent = jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);
    });
    afterAll(() => sent.mockRestore());
    beforeEach(() => sent.mockClear());

    const makeActivity = async (responsibleId: string, title: string, dueInDays: number) => {
      const plan = await ctx.prisma.actionPlan.create({
        data: {
          organizationId: tenant.org.id,
          title: `Plan ${title}`,
          periodStart: new Date('2026-01-01'),
          periodEnd: new Date('2026-12-31'),
        },
      });
      const axis = await ctx.prisma.axis.create({ data: { actionPlanId: plan.id, title: 'Axe' } });
      return ctx.prisma.activity.create({
        data: {
          organizationId: tenant.org.id,
          axisId: axis.id,
          title,
          responsibleId,
          startDate: new Date(Date.now() - 30 * 86_400_000),
          dueDate: new Date(Date.now() + dueInDays * 86_400_000),
        },
      });
    };

    it('n\'envoie l\'alerte de retard qu\'une fois, échappe le titre et respecte les préférences', async () => {
      const { coordinateur, validateur } = tenant.users;
      await makeActivity(coordinateur.id, '<b>Retard</b> & co', -2);
      await makeActivity(validateur.id, 'Retard muet', -2);
      await ctx.prisma.user.update({
        where: { id: validateur.id },
        data: { notificationPreferences: { overdueActivities: false } },
      });

      await service.notifyOverdueActivities(tenant.org.id);
      expect(sent).toHaveBeenCalledTimes(1);
      const [to, , html] = sent.mock.calls[0];
      expect(to).toBe(coordinateur.email);
      expect(html).toContain('&lt;b&gt;Retard&lt;/b&gt; &amp; co');
      expect(html).not.toContain('<b>Retard</b>');
      // Le statut passe quand même en retard, même sans e-mail
      expect(await ctx.prisma.activity.count({ where: { title: 'Retard muet', status: 'EN_RETARD' } })).toBe(1);

      // Le lendemain : déjà EN_RETARD, aucun nouvel e-mail
      sent.mockClear();
      await service.notifyOverdueActivities(tenant.org.id);
      expect(sent).not.toHaveBeenCalled();
    });

    it('respecte la préférence « échéances proches »', async () => {
      const { observateur, financier } = tenant.users; // observateur a coupé upcomingDeadlines plus haut
      await makeActivity(observateur.id, 'Bientôt muet', 1);
      await makeActivity(financier.id, 'Bientôt', 1);
      await service.notifyUpcomingDeadlines(tenant.org.id, 3);
      const recipients = sent.mock.calls.map((c) => c[0]);
      expect(recipients).toContain(financier.email);
      expect(recipients).not.toContain(observateur.email);
    });
  });
});

