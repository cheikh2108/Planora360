import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { ApiClient, items } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createPlanWithActivity, createTenant, createUser, isoDate, login, Tenant } from './helpers/fixtures';

/**
 * Non-régression des failles corrigées après l'audit (escalade de rôles, fichiers, IDOR,
 * circuits de statut, messagerie, cache). Chaque test vérifie le comportement attendu.
 */

const MINI_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);
// PNG 1×1 transparent
const MINI_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

describe('Remédiation de l\'audit', () => {
  let ctx: TestContext;
  let a: Tenant;
  let b: Tenant;
  let adminA: ApiClient;
  let coordA: ApiClient;
  let adminB: ApiClient;

  beforeAll(async () => {
    ctx = await createTestApp();
    a = await createTenant(ctx.prisma, 'remA');
    b = await createTenant(ctx.prisma, 'remB');
    adminA = await login(ctx.http, a.users.admin);
    coordA = await login(ctx.http, a.users.coordinateur);
    adminB = await login(ctx.http, b.users.admin);
  });
  afterAll(() => closeTestApp(ctx));

  describe('rôles', () => {
    it('refuse un rôle personnalisé portant le nom d\'un rôle système (même casse différente)', async () => {
      for (const name of ['Super administrateur', 'administrateur']) {
        const res = await adminA.post('/api/roles', { name, permissions: ['dashboard.view'] });
        expect({ name, status: res.status }).toEqual({ name, status: 409 });
      }
    });

    it('un administrateur ne peut pas promouvoir un membre Super administrateur via PATCH /users/:id', async () => {
      const superRole = await ctx.prisma.role.findFirst({ where: { name: 'Super administrateur', organizationId: null } });
      const res = await adminA.patch(`/api/users/${a.users.observateur.id}`, { roleId: superRole!.id });
      expect(res.status).toBe(403);
      const user = await ctx.prisma.user.findUnique({ where: { id: a.users.observateur.id } });
      expect(user!.roleId).not.toBe(superRole!.id);
    });

    it('un administrateur ne peut pas attribuer le rôle personnalisé d\'une autre organisation', async () => {
      const foreign = await adminB.post('/api/roles', { name: `Rôle B ${Date.now()}`, permissions: ['dashboard.view'] });
      expect(foreign.status).toBe(201);
      const res = await adminA.patch(`/api/users/${a.users.observateur.id}`, { roleId: foreign.body.id });
      expect([400, 403, 404]).toContain(res.status);
    });
  });

  describe('fichiers (/api/files)', () => {
    let activityId: string;
    let fileUrl: string;

    beforeAll(async () => {
      activityId = (await createPlanWithActivity(coordA, 'Plan fichiers remédiation')).activity.id;
      const up = await coordA.upload(`/api/activities/${activityId}/documents`, 'file', MINI_PDF, 'note.pdf', 'application/pdf');
      expect(up.status).toBe(201);
      const doc: any = await ctx.prisma.document.findUnique({ where: { id: up.body.id } });
      const key: string = doc.storageKey ?? doc.fileKey ?? doc.path ?? doc.url;
      expect(key.startsWith(`${a.org.id}/`) || key.startsWith(`/api/files/${a.org.id}/`)).toBe(true);
      fileUrl = key.startsWith('/api/files/') ? key : `/api/files/${key}`;
    });

    it('refuse l\'accès sans session', async () => {
      expect((await request(ctx.http).get(fileUrl)).status).toBe(401);
    });

    it('refuse l\'accès à un membre d\'une autre organisation', async () => {
      expect([403, 404]).toContain((await adminB.get(fileUrl)).status);
    });

    it('sert le fichier à un membre de l\'organisation', async () => {
      const res = await adminA.get(fileUrl);
      expect([200, 302]).toContain(res.status);
    });

    it('refuse un chemin qui sort du dossier de stockage', async () => {
      const res = await adminA.get(`/api/files/${a.org.id}/..%2F..%2Fpackage.json`);
      expect([400, 403, 404]).toContain(res.status);
    });
  });

  describe('IDOR (identifiants d\'autres organisations)', () => {
    it('ne supprime pas le média d\'une fiche de capitalisation via une autre fiche', async () => {
      const fiche = (body: string) => ({
        type: 'BONNE_PRATIQUE', title: body, context: 'c', challenges: 'c', solutions: 's', results: 'r', lessons: 'l',
      });
      const ficheA = await adminA.post('/api/capitalization', fiche('Fiche A'));
      expect(ficheA.status).toBe(201);
      const media = await adminA.upload(`/api/capitalization/${ficheA.body.id}/media`, 'file', MINI_PNG, 'photo.png', 'image/png');
      expect(media.status).toBe(201);

      const ficheB = await adminB.post('/api/capitalization', fiche('Fiche B'));
      expect(ficheB.status).toBe(201);
      const res = await adminB.delete(`/api/capitalization/${ficheB.body.id}/media/${media.body.id}`);
      expect([403, 404]).toContain(res.status);
      expect(await ctx.prisma.media.findUnique({ where: { id: media.body.id } })).not.toBeNull();
    });

    it('refuse un média dont le contenu n\'est pas une image', async () => {
      const fiche = await adminA.post('/api/capitalization', {
        type: 'GUIDE', title: 'Guide', context: 'c', challenges: 'c', solutions: 's', results: 'r', lessons: 'l',
      });
      const res = await adminA.upload(`/api/capitalization/${fiche.body.id}/media`, 'file', Buffer.from('<svg onload=alert(1)>'), 'x.png', 'image/png');
      expect([400, 415, 422]).toContain(res.status);
    });

    it('commissions : n\'ajoute pas un utilisateur d\'une autre organisation et ne retire pas un membre d\'une autre commission', async () => {
      const proc = await adminA.post('/api/passation/procedures', {
        objet: 'Travaux', methode: 'DEMANDE_COTATION', montantEstimatif: 5000000,
      });
      expect(proc.status).toBe(201);
      const commission = await adminA.post('/api/passation/commissions', {
        procedureId: proc.body.id, nom: 'Commission A', type: 'OUVERTURE', dateSeance: isoDate(3),
      });
      expect(commission.status).toBe(201);

      const intrus = await adminA.post(`/api/passation/commissions/${commission.body.id}/membres`, {
        userId: b.users.admin.id, role: 'MEMBRE',
      });
      expect([400, 404]).toContain(intrus.status);

      const ajout = await adminA.post(`/api/passation/commissions/${commission.body.id}/membres`, {
        userId: a.users.validateur.id, role: 'RAPPORTEUR',
      });
      expect(ajout.status).toBe(201);
      const membre = await ctx.prisma.membreCommission.findFirst({
        where: { commissionId: commission.body.id, userId: a.users.validateur.id },
      });

      // Organisation B : sa propre commission, mais l'identifiant de membre de A
      const procB = await adminB.post('/api/passation/procedures', { objet: 'B', methode: 'DEMANDE_COTATION', montantEstimatif: 1000 });
      const commB = await adminB.post('/api/passation/commissions', {
        procedureId: procB.body.id, nom: 'Commission B', type: 'OUVERTURE', dateSeance: isoDate(3),
      });
      const res = await adminB.delete(`/api/passation/commissions/${commB.body.id}/membres/${membre!.id}`);
      expect([403, 404]).toContain(res.status);
      expect(await ctx.prisma.membreCommission.findUnique({ where: { id: membre!.id } })).not.toBeNull();
    });

    it('recommandations : le responsable d\'une action doit appartenir à l\'organisation', async () => {
      const rec = await coordA.post('/api/recommendations', {
        title: 'Rec', description: 'd', source: 'AUDIT_INTERNE', issuedAt: isoDate(-1), dueDate: isoDate(30),
        responsibleId: a.users.coordinateur.id, priority: 'MOYENNE',
      });
      expect(rec.status).toBe(201);
      const bad = await coordA.post(`/api/recommendations/${rec.body.id}/actions`, { title: 'X', responsibleId: b.users.admin.id });
      expect(bad.status).toBe(400);
      const ok = await coordA.post(`/api/recommendations/${rec.body.id}/actions`, { title: 'Y' });
      expect(ok.status).toBe(201);
      const upd = await coordA.patch(`/api/recommendations/actions/${ok.body.id}`, { responsibleId: b.users.admin.id });
      expect(upd.status).toBe(400);
      const done = await coordA.patch(`/api/recommendations/actions/${ok.body.id}`, { status: 'TERMINEE' });
      expect(done.status).toBe(200);
      expect(done.body.completedAt).toBeTruthy();
      const champInconnu = await coordA.patch(`/api/recommendations/actions/${ok.body.id}`, { recommendationId: rec.body.id });
      expect(champInconnu.status).toBe(400);
    });

    it('messagerie : une conversation ne peut pas inclure un utilisateur d\'une autre organisation', async () => {
      const res = await adminA.post('/api/messagerie/conversations', {
        type: 'GROUP', name: 'Mixte', participantIds: [b.users.admin.id],
      });
      expect(res.status).toBe(400);
    });
  });

  describe('circuits et cohérence des données', () => {
    it('une procédure ne saute pas d\'étape (BROUILLON → ATTRIBUEE refusé)', async () => {
      const proc = await adminA.post('/api/passation/procedures', { objet: 'Circuit', methode: 'DEMANDE_COTATION', montantEstimatif: 1000 });
      const res = await adminA.patch(`/api/passation/procedures/${proc.body.id}`, { status: 'ATTRIBUEE' });
      expect(res.status).toBe(400);
      const ok = await adminA.patch(`/api/passation/procedures/${proc.body.id}`, { objet: 'Circuit renommé' });
      expect(ok.status).toBe(200);
      expect(ok.body.objet).toBe('Circuit renommé');
    });

    it('un contrat ne fixe ni le montant payé ni le statut à la création', async () => {
      const res = await adminA.post('/api/passation/contrats', {
        procedureId: 'x', fournisseurId: 'y', montantInitial: 1, dateSignature: isoDate(1), dateEcheance: isoDate(10),
        montantPaye: 1, status: 'TERMINE',
      });
      expect(res.status).toBe(400);
    });

    it('un plan d\'action se termine après son début', async () => {
      const res = await adminA.post('/api/action-plans', {
        title: 'Plan à l\'envers', periodStart: isoDate(30), periodEnd: isoDate(1), axes: [{ title: 'Axe' }],
      });
      expect(res.status).toBe(400);
      const { plan } = await createPlanWithActivity(adminA, 'Plan à modifier');
      const upd = await adminA.patch(`/api/action-plans/${plan.id}`, { periodEnd: isoDate(-365) });
      expect(upd.status).toBe(400);
    });

    it('GET /zones/config n\'est pas capturé par /zones/:id', async () => {
      const res = await adminA.get('/api/zones/config');
      expect(res.status).toBe(200);
      expect((await adminA.get('/api/zones/config/presets')).status).toBe(200);
    });

    it('les références sont numérotées par organisation et sans doublon', async () => {
      const refs: string[] = [];
      for (let i = 0; i < 3; i++) {
        const p = await adminB.post('/api/passation/procedures', { objet: `Num ${i}`, methode: 'DEMANDE_COTATION', montantEstimatif: 1000 });
        expect(p.status).toBe(201);
        refs.push(p.body.reference);
      }
      expect(new Set(refs).size).toBe(3);
      refs.forEach((r) => expect(r).toMatch(/^PROC-\d{4}-\d{4}$/));
    });

    it('une demande d\'achat n\'est jamais validée par son propre demandeur', async () => {
      const solo = await createTenant(ctx.prisma, 'solo');
      const demandeur = await login(ctx.http, solo.users.coordinateur);
      const da = await demandeur.post('/api/passation/demandes', {
        objet: 'Fournitures', justification: 'Besoin', montantEstimatif: 1_000_000,
      });
      expect(da.status).toBe(201);
      expect(da.body.reference).toMatch(/^DA-\d{4}-\d{4}$/);
      const submit = await demandeur.post(`/api/passation/demandes/${da.body.id}/submit`);
      expect([200, 201]).toContain(submit.status);
      const validations = await ctx.prisma.validationDemande.findMany({ where: { demandeId: da.body.id } });
      expect(validations.length).toBeGreaterThan(0);
      expect(validations.map((v) => v.validateurId)).not.toContain(solo.users.coordinateur.id);
    });

    it('une demande d\'achat soumise n\'est plus modifiable', async () => {
      const da = await coordA.post('/api/passation/demandes', { objet: 'Gel', justification: 'J', montantEstimatif: 1000 });
      await coordA.post(`/api/passation/demandes/${da.body.id}/submit`);
      const res = await coordA.patch(`/api/passation/demandes/${da.body.id}`, { objet: 'Modifié après soumission' });
      expect(res.status).toBe(403);
    });

    it('le cache des tableaux de bord est invalidé après une mutation', async () => {
      const t = await createTenant(ctx.prisma, 'cache');
      const api = await login(ctx.http, t.users.admin);
      const before = await api.get('/api/dashboards/overview');
      expect(before.status).toBe(200);
      await createPlanWithActivity(api, 'Plan pour le cache');
      const after = await api.get('/api/dashboards/overview');
      expect(JSON.stringify(after.body)).not.toEqual(JSON.stringify(before.body));
    });
  });

  describe('session', () => {
    it('la déconnexion révoque le jeton d\'accès déjà émis', async () => {
      const user = await createUser(ctx.prisma, a.org.id, 'Coordinateur', 'logout');
      const api = await login(ctx.http, user);
      const access = api.cookies.accessToken;
      expect((await api.post('/api/auth/logout')).status).toBeLessThan(300);
      const res = await request(ctx.http).get('/api/auth/me').set('Cookie', `accessToken=${access}`);
      expect(res.status).toBe(401);
    });

    it('la déconnexion d\'un appareil laisse les autres sessions ouvertes', async () => {
      const user = await createUser(ctx.prisma, a.org.id, 'Coordinateur', 'multi');
      const laptop = await login(ctx.http, user);
      const phone = await login(ctx.http, user);
      const laptopAccess = laptop.cookies.accessToken;
      expect((await laptop.post('/api/auth/logout')).status).toBeLessThan(300);
      expect((await phone.get('/api/auth/me')).status).toBe(200);
      const res = await request(ctx.http).get('/api/auth/me').set('Cookie', `accessToken=${laptopAccess}`);
      expect(res.status).toBe(401);
    });

    it('changer son mot de passe ferme les autres sessions mais garde la session en cours', async () => {
      const user = await createUser(ctx.prisma, a.org.id, 'Coordinateur', 'pwdsess');
      const current = await login(ctx.http, user);
      const other = await login(ctx.http, user);
      const res = await current.patch('/api/auth/change-password', {
        currentPassword: user.password,
        newPassword: 'Nouveau1Mdp2026',
      });
      expect(res.status).toBe(200);
      expect((await current.get('/api/auth/me')).status).toBe(200);
      const stale = await request(ctx.http).get('/api/auth/me').set('Cookie', `accessToken=${other.cookies.accessToken}`);
      expect(stale.status).toBe(401);
    });
  });
});

describe('Remédiation — WebSocket', () => {
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

  function tryConnect(token: string): Promise<boolean> {
    const socket = io(`${baseUrl}/messagerie`, { query: { token }, transports: ['websocket'], forceNew: true });
    sockets.push(socket);
    return new Promise<boolean>((resolve) => {
      // Le serveur accepte le transport puis déconnecte si l'authentification échoue
      socket.on('disconnect', () => resolve(false));
      socket.on('connect_error', () => resolve(false));
      setTimeout(() => resolve(socket.connected), 1500);
    });
  }

  it('refuse un jeton d\'accès HTTP à la place du jeton WebSocket', async () => {
    const t = await createTenant(ctx.prisma, 'wsscope');
    const api = await login(ctx.http, t.users.admin);
    expect(await tryConnect(api.cookies.accessToken)).toBe(false);
    const { body } = await api.get('/api/auth/ws-token');
    expect(await tryConnect(body.token)).toBe(true);
  });

  it('refuse le jeton WebSocket d\'un membre dont l\'organisation a été suspendue', async () => {
    const t = await createTenant(ctx.prisma, 'wssusp');
    const api = await login(ctx.http, t.users.admin);
    const { body } = await api.get('/api/auth/ws-token');
    await ctx.prisma.organization.update({ where: { id: t.org.id }, data: { status: 'SUSPENDED' } });
    expect(await tryConnect(body.token)).toBe(false);
  });

  it('la présence n\'est diffusée qu\'à l\'organisation', async () => {
    const orgA = await createTenant(ctx.prisma, 'presA');
    const orgB = await createTenant(ctx.prisma, 'presB');
    const watcher = await login(ctx.http, orgB.users.admin);
    const { body: wt } = await watcher.get('/api/auth/ws-token');
    const ws = io(`${baseUrl}/messagerie`, { query: { token: wt.token }, transports: ['websocket'], forceNew: true });
    sockets.push(ws);
    await new Promise((r) => ws.on('connect', r));
    const seen: string[] = [];
    ws.on('user:online', (d: any) => seen.push(d.userId));

    const other = await login(ctx.http, orgA.users.admin);
    const { body: ot } = await other.get('/api/auth/ws-token');
    expect(await tryConnect(ot.token)).toBe(true);
    await new Promise((r) => setTimeout(r, 300));
    expect(seen).not.toContain(orgA.users.admin.id);
    void items;
  });
});
