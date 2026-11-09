import request from 'supertest';
import { ApiClient } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createTenant, createUser, DEFAULT_PASSWORD, login, Tenant } from './helpers/fixtures';
import { TEST_ENV } from './setup/test-config';

describe('Auth (login, session, CSRF, inscription)', () => {
  let ctx: TestContext;
  let tenant: Tenant;

  beforeAll(async () => {
    ctx = await createTestApp();
    tenant = await createTenant(ctx.prisma, 'auth');
  });
  afterAll(() => closeTestApp(ctx));

  describe('POST /auth/login', () => {
    it('connecte un utilisateur valide et pose les cookies de session', async () => {
      const res = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: tenant.users.admin.email, password: DEFAULT_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(tenant.users.admin.email);
      expect(res.body.user.organizationId).toBe(tenant.org.id);
      expect(res.body.csrfToken).toEqual(expect.any(String));
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.user.twoFactorSecret).toBeUndefined();

      const cookies: string[] = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
      const access = cookies.find((c) => c.startsWith('accessToken='));
      const refresh = cookies.find((c) => c.startsWith('refreshToken='));
      const csrf = cookies.find((c) => c.startsWith('csrf-token='));
      expect(access).toMatch(/HttpOnly/i);
      expect(refresh).toMatch(/HttpOnly/i);
      expect(csrf).toBeDefined();
      expect(csrf).not.toMatch(/HttpOnly/i); // lisible par le frontend
    });

    it('refuse un mauvais mot de passe (401) sans révéler lequel des deux est faux', async () => {
      const bad = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: tenant.users.admin.email, password: 'mauvais-mdp' });
      const unknown = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: 'inconnu@planora.test', password: 'mauvais-mdp' });
      expect(bad.status).toBe(401);
      expect(unknown.status).toBe(401);
      expect(bad.body.message).toEqual(unknown.body.message);
    });

    it('valide le format des champs (400)', async () => {
      const res = await request(ctx.http).post('/api/auth/login').send({ email: 'pas-un-email', password: '1' });
      expect(res.status).toBe(400);
    });

    it('rejette les champs inconnus (whitelist)', async () => {
      const res = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: tenant.users.admin.email, password: DEFAULT_PASSWORD, isAdmin: true });
      expect(res.status).toBe(400);
    });

    it('refuse un compte désactivé', async () => {
      const inactive = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'inactive', { isActive: false });
      const res = await request(ctx.http).post('/api/auth/login').send({ email: inactive.email, password: DEFAULT_PASSWORD });
      expect(res.status).toBe(401);
    });

    it('refuse un compte supprimé (soft delete)', async () => {
      const deleted = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'deleted', { deletedAt: new Date() });
      const res = await request(ctx.http).post('/api/auth/login').send({ email: deleted.email, password: DEFAULT_PASSWORD });
      expect(res.status).toBe(401);
    });

    it('refuse la connexion aux membres d\'une organisation rejetée', async () => {
      const rejected = await createTenant(ctx.prisma, 'rejected', { status: 'REJECTED' });
      const res = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: rejected.users.admin.email, password: DEFAULT_PASSWORD });
      expect(res.status).toBe(401);
    });

    it('[AUDIT] refuse la connexion aux membres d\'une organisation suspendue', async () => {
      const suspended = await createTenant(ctx.prisma, 'suspended', { status: 'SUSPENDED' });
      const res = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: suspended.users.admin.email, password: DEFAULT_PASSWORD });
      expect(res.status).toBe(401);
    });

    it('[AUDIT] ne révèle pas le statut d\'une organisation sans mot de passe valide', async () => {
      const rejected = await createTenant(ctx.prisma, 'oracle', { status: 'REJECTED' });
      const wrongPwd = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: rejected.users.admin.email, password: 'mauvais-mdp' });
      const unknown = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: 'inconnu2@planora.test', password: 'mauvais-mdp' });
      expect(wrongPwd.body.message).toEqual(unknown.body.message);
    });
  });

  describe('session', () => {
    it('GET /auth/me renvoie l\'utilisateur connecté', async () => {
      const api = await login(ctx.http, tenant.users.coordinateur);
      const res = await api.get('/api/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.email ?? res.body.user?.email).toBe(tenant.users.coordinateur.email);
    });

    it('GET /auth/me sans session → 401', async () => {
      const res = await request(ctx.http).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('accepte aussi le header Authorization: Bearer', async () => {
      const res = await request(ctx.http)
        .post('/api/auth/login')
        .send({ email: tenant.users.admin.email, password: DEFAULT_PASSWORD });
      const token = ([] as string[])
        .concat(res.headers['set-cookie'])
        .find((c) => c.startsWith('accessToken='))!
        .split(';')[0]
        .split('=')[1];
      const me = await request(ctx.http).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(me.status).toBe(200);
    });

    it('refuse un JWT signé avec une autre clé', async () => {
      const forged =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ4Iiwib3JnYW5pemF0aW9uSWQiOiJ4In0.dGhpc19pc19ub3RfdmFsaWQ';
      const res = await request(ctx.http).get('/api/auth/me').set('Cookie', `accessToken=${forged}`);
      expect(res.status).toBe(401);
    });

    it('[AUDIT] invalide la session d\'un utilisateur supprimé après sa connexion', async () => {
      const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'later-deleted');
      const api = await login(ctx.http, user);
      await ctx.prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date() } });
      const res = await api.get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('POST /auth/logout ferme la session', async () => {
      const api = await login(ctx.http, tenant.users.observateur);
      const out = await api.post('/api/auth/logout');
      expect([200, 201, 204]).toContain(out.status);
      const me = await api.get('/api/auth/me');
      expect(me.status).toBe(401);
    });

    it('POST /auth/refresh renouvelle la session quand le refresh token est envoyé dans le corps', async () => {
      const api = await login(ctx.http, tenant.users.validateur);
      expect(api.cookies.refreshToken).toBeTruthy();
      const res = await api.post('/api/auth/refresh', { refreshToken: api.cookies.refreshToken });
      expect([200, 201]).toContain(res.status);
    });

    it('[AUDIT] POST /auth/refresh fonctionne avec le seul cookie, comme l\'appelle le frontend (corps vide)', async () => {
      const api = await login(ctx.http, tenant.users.validateur);
      const res = await api.post('/api/auth/refresh', {});
      expect([200, 201]).toContain(res.status);
    });

    it('GET /auth/ws-token délivre un token WebSocket', async () => {
      const api = await login(ctx.http, tenant.users.admin);
      const res = await api.get('/api/auth/ws-token');
      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));
    });
  });

  describe('CSRF', () => {
    it('refuse une requête mutante sans header x-csrf-token (403)', async () => {
      const api = await login(ctx.http, tenant.users.admin);
      const res = await api.agent.post('/api/action-plans').send({ title: 'Sans CSRF' });
      expect(res.status).toBe(403);
    });

    it('refuse un header CSRF qui ne correspond pas au cookie', async () => {
      const api = await login(ctx.http, tenant.users.admin);
      const res = await api.agent.post('/api/action-plans').set('x-csrf-token', 'faux').send({ title: 'x' });
      expect(res.status).toBe(403);
    });

    it('les GET ne demandent pas de CSRF', async () => {
      const api = await login(ctx.http, tenant.users.admin);
      const res = await api.agent.get('/api/action-plans');
      expect(res.status).toBe(200);
    });
  });

  describe('changement de mot de passe', () => {
    it('refuse un mot de passe trop faible', async () => {
      const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'weakpwd');
      const api = await login(ctx.http, user);
      const res = await api.patch('/api/auth/change-password', { currentPassword: user.password, newPassword: '123' });
      expect(res.status).toBe(400);
    });

    it('change le mot de passe et permet de se reconnecter avec', async () => {
      const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'chgpwd');
      const api = await login(ctx.http, user);
      const res = await api.patch('/api/auth/change-password', {
        currentPassword: user.password,
        newPassword: 'Nouveau#Mdp2026!',
      });
      expect(res.status).toBe(200);
      await expect(ApiClient.loggedIn(ctx.http, user.email, 'Nouveau#Mdp2026!')).resolves.toBeDefined();
    });

    it('refuse le changement si le mot de passe actuel est faux', async () => {
      const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'badcur');
      const api = await login(ctx.http, user);
      const res = await api.patch('/api/auth/change-password', {
        currentPassword: 'Pas-le-bon#2026',
        newPassword: 'Autre#Mdp2026!',
      });
      expect([400, 401]).toContain(res.status);
      // L'ancien mot de passe reste valable
      await expect(ApiClient.loggedIn(ctx.http, user.email, user.password)).resolves.toBeDefined();
    });

    it('[AUDIT] exige le mot de passe actuel pour en définir un nouveau', async () => {
      const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'curpwd');
      const api = await login(ctx.http, user);
      const res = await api.patch('/api/auth/change-password', { newPassword: 'Autre#Mdp2026!' });
      expect(res.status).toBe(400);
    });
  });

  describe('2FA (TOTP)', () => {
    it('POST /auth/2fa/setup renvoie un QR code et un secret', async () => {
      const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'totp');
      const api = await login(ctx.http, user);
      const res = await api.post('/api/auth/2fa/setup');
      expect([200, 201]).toContain(res.status);
      expect(res.body.qrCode).toMatch(/^data:image/);
      expect(res.body.secret).toEqual(expect.any(String));
    });

    it('refuse d\'activer la 2FA avec un code faux', async () => {
      const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'totp2');
      const api = await login(ctx.http, user);
      await api.post('/api/auth/2fa/setup');
      const res = await api.post('/api/auth/2fa/enable', { token: '000000' });
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('inscription publique', () => {
    it('crée une organisation INDIVIDUEL en attente d\'approbation, compte inactif', async () => {
      const email = `inscription.${Date.now()}@planora.test`;
      const res = await request(ctx.http).post('/api/auth/register').send({
        organizationName: `Org inscrite ${Date.now()}`,
        firstName: 'Awa',
        lastName: 'Diop',
        email,
      });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('PENDING_APPROVAL');

      const login = await request(ctx.http).post('/api/auth/login').send({ email, password: 'nimportequoi' });
      expect(login.status).toBe(401);
    });

    it('renvoie une demande de devis pour les plans non INDIVIDUEL', async () => {
      const res = await request(ctx.http).post('/api/auth/register').send({
        organizationName: `Org devis ${Date.now()}`,
        subscriptionPlan: 'ENTERPRISE',
        firstName: 'Moussa',
        lastName: 'Ba',
        email: `devis.${Date.now()}@planora.test`,
      });
      expect(res.status).toBe(201);
      expect(res.body.requiresQuote).toBe(true);
    });

    it('refuse un email déjà utilisé', async () => {
      const res = await request(ctx.http).post('/api/auth/register').send({
        organizationName: `Org doublon ${Date.now()}`,
        firstName: 'Fatou',
        lastName: 'Sall',
        email: tenant.users.admin.email,
      });
      expect(res.status).toBe(409);
    });

    it('refuse une couleur de marque invalide', async () => {
      const res = await request(ctx.http).post('/api/auth/register').send({
        organizationName: `Org couleur ${Date.now()}`,
        brandColor: 'red; background:url(x)',
        firstName: 'Fatou',
        lastName: 'Sall',
        email: `couleur.${Date.now()}@planora.test`,
      });
      expect(res.status).toBe(400);
    });
  });

  describe('super admin seed', () => {
    it('le compte super admin du seed peut se connecter', async () => {
      const api = await ApiClient.loggedIn(ctx.http, TEST_ENV.SEED_ADMIN_EMAIL, TEST_ENV.SEED_ADMIN_PASSWORD);
      expect(api.user.role.name).toBe('Super administrateur');
    });
  });
});

describe('Auth — rate limiting réel', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestApp({ realThrottler: true });
  });
  afterAll(() => closeTestApp(ctx));

  it('bloque après 5 tentatives de login par minute (429)', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await request(ctx.http).post('/api/auth/login').send({ email: 'bruteforce@planora.test', password: `essai-${i}` });
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 5).every((s) => s === 401)).toBe(true);
    expect(statuses).toContain(429);
  });
});
