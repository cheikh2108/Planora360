import { createHmac } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { ApiClient, items } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createPlanWithActivity, createTenant, createUser, isoDate, login, Tenant } from './helpers/fixtures';

/**
 * Tests de sécurité ciblés : escalade de privilèges, rôles manquants,
 * webhook de paiement, fichiers, WebSocket.
 */

const MINI_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);

describe('Sécurité — rôles et privilèges', () => {
  let ctx: TestContext;
  let tenant: Tenant;
  let admin: ApiClient;
  let observateur: ApiClient;

  beforeAll(async () => {
    ctx = await createTestApp();
    tenant = await createTenant(ctx.prisma, 'secu');
    admin = await login(ctx.http, tenant.users.admin);
    observateur = await login(ctx.http, tenant.users.observateur);
  });
  afterAll(() => closeTestApp(ctx));

  it('un administrateur d\'organisation n\'a pas accès aux routes super admin', async () => {
    for (const url of ['/api/organizations', '/api/organizations/pending', '/api/organizations/deleted']) {
      const res = await admin.get(url);
      expect({ url, status: res.status }).toEqual({ url, status: 403 });
    }
    const maintenance = await admin.put('/api/maintenance', { enabled: true });
    expect(maintenance.status).toBe(403);
  });

  it('un administrateur ne peut pas créer d\'utilisateur avec le rôle Super administrateur', async () => {
    const role = await ctx.prisma.role.findFirst({ where: { name: 'Super administrateur', organizationId: null } });
    const res = await admin.post('/api/users', {
      email: `super.${Date.now()}@planora.test`,
      firstName: 'Faux',
      lastName: 'Super',
      roleId: role!.id,
    });
    expect(res.status).toBe(403);
  });

  it('un administrateur ne peut pas créer d\'utilisateur dans une autre organisation', async () => {
    const other = await createTenant(ctx.prisma, 'autre-org');
    const coordRole = await ctx.prisma.role.findFirst({ where: { name: 'Coordinateur', organizationId: null } });
    const res = await admin.post('/api/users', {
      email: `infiltre.${Date.now()}@planora.test`,
      firstName: 'Infiltré',
      lastName: 'Test',
      roleId: coordRole!.id,
      organizationId: other.org.id,
    });
    if (res.status === 201) {
      expect(res.body.organizationId).toBe(tenant.org.id);
    } else {
      expect([400, 403]).toContain(res.status);
    }
  });

  it('[AUDIT] un administrateur ne peut pas se fabriquer un rôle avec la permission joker "*"', async () => {
    const role = await admin.post('/api/roles', { name: `Support ${Date.now()}`, permissions: ['*'] });
    expect(role.status).toBe(400);
  });

  it('[AUDIT] un rôle personnalisé "*" ne donne pas accès aux routes super admin (escalade)', async () => {
    const role = await admin.post('/api/roles', { name: `Escalade ${Date.now()}`, permissions: ['*'] });
    if (role.status !== 201) return; // déjà bloqué en amont : rien à exploiter
    const email = `escalade.${Date.now()}@planora.test`;
    const user = await admin.post('/api/users', {
      email,
      firstName: 'Escalade',
      lastName: 'Test',
      password: 'Escalade#2026pass',
      roleId: role.body.id,
    });
    expect(user.status).toBe(201);
    const attacker = await ApiClient.loggedIn(ctx.http, email, 'Escalade#2026pass');
    const orgs = await attacker.get('/api/organizations');
    expect(orgs.status === 200 ? `accès à ${items(orgs.body).length} organisations` : orgs.status).toBe(403);
  });

  it('[AUDIT] les permissions d\'un rôle sont limitées à une liste connue', async () => {
    const res = await admin.post('/api/roles', { name: `Inventé ${Date.now()}`, permissions: ['nimporte.quoi'] });
    expect(res.status).toBe(400);
  });

  it('un observateur ne peut pas créer de rôle ni d\'utilisateur', async () => {
    const role = await observateur.post('/api/roles', { name: 'X', permissions: ['plan.read'] });
    expect(role.status).toBe(403);
    const coordRole = await ctx.prisma.role.findFirst({ where: { name: 'Coordinateur', organizationId: null } });
    const user = await observateur.post('/api/users', {
      email: `obs.${Date.now()}@planora.test`,
      firstName: 'Obs',
      lastName: 'Test',
      roleId: coordRole!.id,
    });
    expect(user.status).toBe(403);
  });

  describe('modules sans contrôle de rôle', () => {
    let activityId: string;
    beforeAll(async () => {
      const { activity } = await createPlanWithActivity(admin, 'Plan observateur');
      activityId = activity.id;
    });

    const cases: [string, (id: string) => [string, string, any]][] = [
      ['créer une zone', () => ['post', '/api/zones', { name: 'Zone observateur', level: 0 }]],
      ['créer un PTA', () => ['post', '/api/planning/annual-work-plans', { year: 2035, title: 'PTA obs', objectives: { a: 1 } }]],
      ['modifier la matrice de résultats', () => ['patch', '/api/planning/results-matrix', { data: { x: 1 } }]],
      ['créer une fiche de capitalisation', () => ['post', '/api/capitalization', { type: 'GUIDE', title: 'Obs', context: 'c', challenges: 'c', solutions: 'c', results: 'c', lessons: 'c' }]],
      ['ajouter un participant', (id) => ['post', '/api/participants', { activityId: id, firstName: 'X', lastName: 'Y', phone: '+221700000000', paymentMode: 'WAVE' }]],
      ['créer un fournisseur', () => ['post', '/api/passation/fournisseurs', { raisonSociale: 'Obs SARL' }]],
      ['créer un PPM', () => ['post', '/api/passation/ppm', { year: 2036, title: 'PPM obs' }]],
    ];

    it.each(cases)('[AUDIT] un observateur (lecture seule) ne peut pas %s', async (_label, build) => {
      const [method, url, body] = build(activityId);
      const res = await (observateur as any)[method](url, body);
      expect(res.status).toBe(403);
    });
  });
});

describe('Sécurité — webhook de paiement DexPay', () => {
  describe('sans secret DexPay configuré', () => {
    let ctx: TestContext;
    beforeAll(async () => {
      process.env.DEXPAY_SECRET_KEY = '';
      ctx = await createTestApp();
    });
    afterAll(() => closeTestApp(ctx));

    it('[AUDIT] un webhook forgé ne peut pas changer le plan d\'abonnement d\'une organisation', async () => {
      const victim = await createTenant(ctx.prisma, 'webhook', { plan: 'INDIVIDUEL' });
      // N'importe quel utilisateur obtient un token CSRF valide (non lié à la session)
      const attacker = await login(ctx.http, victim.users.observateur);
      await request(ctx.http)
        .post('/api/dexpay/webhook')
        .set('Cookie', `csrf-token=${attacker.csrf}`)
        .set('x-csrf-token', attacker.csrf)
        .send({
          event: 'checkout.completed',
          data: {
            id: `chk_${Date.now()}`,
            reference: `ref_${Date.now()}`,
            amount: 1,
            currency: 'XOF',
            payment_method: 'wave',
            metadata: { organization_id: victim.org.id, plan: 'ENTERPRISE' },
          },
        });
      const org = await ctx.prisma.organization.findUnique({ where: { id: victim.org.id } });
      expect(org?.subscriptionPlan).toBe('INDIVIDUEL');
    });
  });

  describe('avec secret DexPay configuré', () => {
    let ctx: TestContext;
    const SECRET = 'dexpay-test-secret';
    beforeAll(async () => {
      process.env.DEXPAY_SECRET_KEY = SECRET;
      ctx = await createTestApp();
    });
    afterAll(async () => {
      await closeTestApp(ctx);
      process.env.DEXPAY_SECRET_KEY = '';
    });

    const payload = (orgId: string) => ({
      event: 'checkout.failed',
      data: { id: `chk_${Date.now()}`, reference: `ref_${Date.now()}`, metadata: { organization_id: orgId } },
    });

    it('refuse un webhook à la signature invalide', async () => {
      const t = await createTenant(ctx.prisma, 'sig');
      const api = await login(ctx.http, t.users.admin);
      const res = await request(ctx.http)
        .post('/api/dexpay/webhook')
        .set('Cookie', `csrf-token=${api.csrf}`)
        .set('x-csrf-token', api.csrf)
        .set('X-Webhook-Signature', 'mauvaise-signature')
        .send(payload(t.org.id));
      expect(res.status).toBe(400);
    });

    it('[AUDIT] accepte un webhook DexPay correctement signé, envoyé serveur à serveur (sans cookie CSRF)', async () => {
      const t = await createTenant(ctx.prisma, 'sig2');
      const body = payload(t.org.id);
      const signature = createHmac('sha256', SECRET).update(JSON.stringify(body)).digest('hex');
      const res = await request(ctx.http).post('/api/dexpay/webhook').set('X-Webhook-Signature', signature).send(body);
      expect([200, 201]).toContain(res.status);
    });
  });
});

describe('Sécurité — fichiers', () => {
  let ctx: TestContext;
  let tenant: Tenant;
  let coord: ApiClient;
  let activityId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
    tenant = await createTenant(ctx.prisma, 'files');
    coord = await login(ctx.http, tenant.users.coordinateur);
    activityId = (await createPlanWithActivity(coord, 'Plan fichiers')).activity.id;
  });
  afterAll(() => closeTestApp(ctx));

  it('téléverse un PDF puis le télécharge', async () => {
    const up = await coord.upload(`/api/activities/${activityId}/documents`, 'file', MINI_PDF, 'compte-rendu.pdf', 'application/pdf', { type: 'RAPPORT' });
    expect(up.status).toBe(201);
    const list = await coord.get(`/api/activities/${activityId}/documents`);
    expect(items(list.body).map((d: any) => d.id)).toContain(up.body.id);
    const dl = await coord.get(`/api/documents/${up.body.id}/download`);
    expect([200, 302]).toContain(dl.status);
  });

  it('refuse un fichier dont l\'extension n\'est pas autorisée', async () => {
    const res = await coord.upload(`/api/activities/${activityId}/documents`, 'file', Buffer.from('MZ\x90\x00'), 'outil.exe', 'application/octet-stream');
    expect([400, 415, 422]).toContain(res.status);
  });

  it('refuse un fichier déguisé (contenu HTML avec extension .pdf)', async () => {
    const res = await coord.upload(`/api/activities/${activityId}/documents`, 'file', Buffer.from('<html><script>alert(1)</script></html>'), 'faux.pdf', 'application/pdf');
    expect([400, 415, 422]).toContain(res.status);
  });

  it('un nom de fichier avec "../" ne permet pas d\'écrire hors du dossier uploads', async () => {
    const marker = `evasion-${Date.now()}.pdf`;
    const res = await coord.upload(`/api/activities/${activityId}/documents`, 'file', MINI_PDF, `../../../../../${marker}`, 'application/pdf');
    expect(res.status).toBeLessThan(500);
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const escaped = [path.join(process.cwd(), marker), path.join(process.cwd(), '..', marker), path.join(uploadsDir, '..', marker)];
    expect(escaped.filter((p) => fs.existsSync(p))).toEqual([]);
  });

  it('[AUDIT] un fichier téléversé n\'est pas accessible sans session via /uploads', async () => {
    const up = await coord.upload(`/api/activities/${activityId}/documents`, 'file', MINI_PDF, 'confidentiel.pdf', 'application/pdf');
    expect(up.status).toBe(201);
    const doc: any = await ctx.prisma.document.findUnique({ where: { id: up.body.id } });
    const key: string = doc.storageKey ?? doc.fileKey ?? doc.path ?? doc.url;
    expect(key).toBeTruthy();
    const publicUrl = key.startsWith('/uploads/') ? key : `/uploads/${key}`;
    const res = await request(ctx.http).get(encodeURI(publicUrl));
    expect(res.status === 200 ? 'fichier servi sans authentification' : 'protégé').toBe('protégé');
  });
});

describe('Sécurité — messagerie temps réel (WebSocket)', () => {
  let ctx: TestContext;
  let baseUrl: string;
  const sockets: Socket[] = [];

  beforeAll(async () => {
    ctx = await createTestApp();
    await ctx.app.listen(0);
    const address: any = ctx.app.getHttpServer().address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });
  afterAll(async () => {
    sockets.forEach((s) => s.disconnect());
    await closeTestApp(ctx);
  });

  async function connect(api: ApiClient): Promise<Socket> {
    const { body } = await api.get('/api/auth/ws-token');
    const socket = io(`${baseUrl}/messagerie`, { query: { token: body.token }, transports: ['websocket'], forceNew: true });
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', reject);
      setTimeout(() => reject(new Error('connexion WebSocket impossible')), 5000);
    });
    await new Promise((r) => setTimeout(r, 200)); // laisse le serveur rejoindre les rooms
    return socket;
  }

  it('refuse une connexion sans token', async () => {
    const socket = io(`${baseUrl}/messagerie`, { transports: ['websocket'], forceNew: true });
    sockets.push(socket);
    const disconnected = await new Promise<boolean>((resolve) => {
      socket.on('disconnect', () => resolve(true));
      socket.on('connect_error', () => resolve(true));
      setTimeout(() => resolve(false), 3000);
    });
    expect(disconnected).toBe(true);
  });

  it('un participant reçoit les messages de sa conversation en temps réel', async () => {
    const org = await createTenant(ctx.prisma, 'ws');
    const a = await login(ctx.http, org.users.admin);
    const b = await login(ctx.http, org.users.coordinateur);
    const conv = await a.post('/api/messagerie/conversations', { type: 'GROUP', name: 'Équipe WS', participantIds: [org.users.coordinateur.id] });
    expect(conv.status).toBe(201);

    const sa = await connect(a);
    const sb = await connect(b);
    const received = new Promise<any>((resolve) => sb.on('message:new', resolve));
    sa.emit('message:send', { conversationId: conv.body.id, content: 'Bonjour équipe' });
    const msg = await Promise.race([received, new Promise((r) => setTimeout(() => r(null), 4000))]);
    expect((msg as any)?.content).toBe('Bonjour équipe');
  });

  it('[AUDIT] un utilisateur d\'une autre organisation ne peut pas écouter une conversation en rejoignant sa room', async () => {
    const orgA = await createTenant(ctx.prisma, 'wsA');
    const orgB = await createTenant(ctx.prisma, 'wsB');
    const a = await login(ctx.http, orgA.users.admin);
    const spy = await login(ctx.http, orgB.users.admin);
    const conv = await a.post('/api/messagerie/conversations', { type: 'GROUP', name: 'Direction A', participantIds: [orgA.users.coordinateur.id] });

    const sa = await connect(a);
    const sspy = await connect(spy);
    await new Promise((resolve) => sspy.emit('conversation:join', { conversationId: conv.body.id }, resolve));

    const intercepted = new Promise<any>((resolve) => sspy.on('message:new', resolve));
    sa.emit('message:send', { conversationId: conv.body.id, content: 'Budget confidentiel 2027' });
    const msg = await Promise.race([intercepted, new Promise((r) => setTimeout(() => r(null), 3000))]);
    expect(msg === null ? 'rien intercepté' : `intercepté : ${(msg as any).content}`).toBe('rien intercepté');
  });
});

describe('Sécurité — divers', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestApp();
  });
  afterAll(() => closeTestApp(ctx));

  it('[AUDIT] l\'API envoie des en-têtes de sécurité (X-Content-Type-Options, X-Frame-Options)', async () => {
    const res = await request(ctx.http).get('/api/maintenance/status');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options'] ?? res.headers['content-security-policy']).toBeDefined();
  });

  it('CORS refuse une origine inconnue', async () => {
    const res = await request(ctx.http).get('/api/maintenance/status').set('Origin', 'https://site-malveillant.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('CORS autorise le frontend configuré avec les credentials', async () => {
    const res = await request(ctx.http).get('/api/maintenance/status').set('Origin', 'http://localhost:3001');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('un utilisateur désactivé après connexion perd l\'accès', async () => {
    const t = await createTenant(ctx.prisma, 'deact');
    const u = await createUser(ctx.prisma, t.org.id, 'Coordinateur', 'deact');
    const api = await login(ctx.http, u);
    await ctx.prisma.user.update({ where: { id: u.id }, data: { isActive: false } });
    expect((await api.get('/api/action-plans')).status).toBe(401);
  });

  it('[AUDIT] les membres d\'une organisation supprimée perdent l\'accès', async () => {
    const t = await createTenant(ctx.prisma, 'orgdel');
    const api = await login(ctx.http, t.users.admin);
    await ctx.prisma.organization.update({ where: { id: t.org.id }, data: { deletedAt: new Date() } });
    expect((await api.get('/api/action-plans')).status).toBe(401);
  });

  it('[AUDIT] les membres d\'une organisation suspendue perdent l\'accès', async () => {
    const t = await createTenant(ctx.prisma, 'orgsusp');
    const api = await login(ctx.http, t.users.admin);
    await ctx.prisma.organization.update({ where: { id: t.org.id }, data: { status: 'SUSPENDED' } });
    expect([401, 403]).toContain((await api.get('/api/action-plans')).status);
  });

  it('les dates invalides sont refusées proprement', async () => {
    const t = await createTenant(ctx.prisma, 'dates');
    const api = await login(ctx.http, t.users.admin);
    const res = await api.post('/api/action-plans', { title: 'Dates', periodStart: 'demain', periodEnd: isoDate(10) });
    expect(res.status).toBe(400);
  });
});
