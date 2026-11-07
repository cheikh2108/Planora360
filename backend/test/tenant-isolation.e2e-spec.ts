import { randomUUID } from 'crypto';
import { ApiClient, items } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createPlanWithActivity, createTenant, isoDate, login, Tenant } from './helpers/fixtures';

/**
 * Isolation multi-tenant : un administrateur de l'organisation B ne doit pouvoir
 * ni lire, ni modifier, ni supprimer aucune ressource de l'organisation A,
 * et ne doit jamais la voir dans ses listes.
 */

const MINI_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);

type Ids = Record<string, string>;
type Method = 'get' | 'post' | 'patch' | 'delete';
// [description, méthode, url, corps]
type Attempt = [string, Method, (ids: Ids, a: Tenant) => string, ((ids: Ids) => any)?];

const ATTEMPTS: Attempt[] = [
  ['lire un plan', 'get', (i) => `/api/action-plans/${i.plan}`],
  ['modifier un plan', 'patch', (i) => `/api/action-plans/${i.plan}`, () => ({ title: 'Piraté' })],
  ['ajouter un axe à un plan', 'post', (i) => `/api/action-plans/${i.plan}/axes`, () => ({ title: 'Axe pirate' })],
  ['modifier un axe', 'patch', (i) => `/api/action-plans/axes/${i.axis}`, () => ({ title: 'Piraté' })],
  ['lire la progression d\'un plan', 'get', (i) => `/api/dashboards/plan/${i.plan}/progress`],
  ['lire le résumé budgétaire d\'un plan', 'get', (i) => `/api/budgets/summary/plan/${i.plan}`],
  ['lire une activité', 'get', (i) => `/api/activities/${i.activity}`],
  ['modifier une activité', 'patch', (i) => `/api/activities/${i.activity}`, () => ({ title: 'Piraté' })],
  ['changer le statut d\'une activité', 'patch', (i) => `/api/activities/${i.activity}/status`, () => ({ status: 'EN_PREPARATION' })],
  ['créer une activité dans un axe', 'post', () => '/api/activities', (i) => ({ title: 'Intrusion', axisId: i.axis })],
  ['lire la checklist', 'get', (i) => `/api/activities/${i.activity}/checklist`],
  ['ajouter une tâche', 'post', (i) => `/api/activities/${i.activity}/checklist`, () => ({ label: 'Intrusion' })],
  ['modifier une tâche', 'patch', (i) => `/api/activities/${i.activity}/checklist/${i.checklist}`, () => ({ progress: 100 })],
  ['lire les budgets', 'get', (i) => `/api/activities/${i.activity}/budgets`],
  ['ajouter un budget', 'post', (i) => `/api/activities/${i.activity}/budgets`, () => ({ planned: 1 })],
  ['modifier un budget', 'patch', (i) => `/api/budgets/${i.budget}`, () => ({ planned: 999999 })],
  ['lire l\'historique de validation', 'get', (i) => `/api/activities/${i.activity}/validations`],
  ['valider une activité', 'post', (i) => `/api/activities/${i.activity}/validate`, () => ({ toStep: 'VERIFICATION_HIERARCHIQUE', decision: 'APPROUVE' })],
  ['lister les documents', 'get', (i) => `/api/activities/${i.activity}/documents`],
  ['télécharger un document', 'get', (i) => `/api/documents/${i.document}/download`],
  ['lire un indicateur', 'get', (i) => `/api/indicators/${i.indicator}`],
  ['modifier un indicateur', 'patch', (i) => `/api/indicators/${i.indicator}`, () => ({ achieved: 99 })],
  ['lire une zone', 'get', (i) => `/api/zones/${i.zone}`],
  ['modifier une zone', 'patch', (i) => `/api/zones/${i.zone}`, () => ({ name: 'Pirate' })],
  ['créer une sous-zone', 'post', () => '/api/zones', (i) => ({ name: 'Sous-zone pirate', level: 1, parentId: i.zone })],
  ['lire un PTA', 'get', (i) => `/api/planning/annual-work-plans/${i.awp}`],
  ['valider un PTA', 'patch', (i) => `/api/planning/annual-work-plans/${i.awp}/validate`],
  ['lire une recommandation', 'get', (i) => `/api/recommendations/${i.recommendation}`],
  ['modifier une recommandation', 'patch', (i) => `/api/recommendations/${i.recommendation}`, () => ({ title: 'Piraté' })],
  ['commenter une recommandation', 'post', (i) => `/api/recommendations/${i.recommendation}/comments`, () => ({ content: 'Intrusion' })],
  ['lire les commentaires d\'une recommandation', 'get', (i) => `/api/recommendations/${i.recommendation}/comments`],
  ['modifier une action de recommandation', 'patch', (i) => `/api/recommendations/actions/${i.recoAction}`, () => ({ title: 'Piraté' })],
  ['lire une fiche de capitalisation', 'get', (i) => `/api/capitalization/${i.capitalization}`],
  ['modifier une fiche de capitalisation', 'patch', (i) => `/api/capitalization/${i.capitalization}`, () => ({ title: 'Piraté' })],
  ['lister les participants', 'get', (i) => `/api/participants/activity/${i.activity}`],
  ['ajouter un participant', 'post', () => '/api/participants', (i) => ({ activityId: i.activity, firstName: 'X', lastName: 'Y', phone: '+221700000000', paymentMode: 'WAVE' })],
  ['lire un utilisateur', 'get', (i) => `/api/users/${i.userA}`],
  ['modifier un utilisateur', 'patch', (i) => `/api/users/${i.userA}`, () => ({ firstName: 'Piraté' })],
  ['lire un rôle personnalisé', 'get', (i) => `/api/roles/${i.role}`],
  ['modifier un rôle personnalisé', 'patch', (i) => `/api/roles/${i.role}`, () => ({ permissions: ['*'] })],
  ['lire l\'organisation', 'get', (_i, a) => `/api/organizations/${a.org.id}`],
  ['lire le journal d\'audit d\'une activité', 'get', (i) => `/api/audit/activity/${i.activity}`],
  ['lire une conversation', 'get', (i) => `/api/messagerie/conversations/${i.conversation}`],
  ['lire les messages d\'une conversation', 'get', (i) => `/api/messagerie/conversations/${i.conversation}/messages`],
  ['écrire dans une conversation', 'post', (i) => `/api/messagerie/conversations/${i.conversation}/messages`, () => ({ content: 'Intrusion' })],
  ['lire un fournisseur', 'get', (i) => `/api/passation/fournisseurs/${i.fournisseur}`],
  ['modifier un fournisseur', 'patch', (i) => `/api/passation/fournisseurs/${i.fournisseur}`, () => ({ ville: 'Pirate' })],
  ['lire un PPM', 'get', (i) => `/api/passation/ppm/${i.ppm}`],
  ['exporter un PPM', 'get', (i) => `/api/passation/ppm/${i.ppm}/export`],
  ['ajouter une ligne à un PPM', 'post', (i) => `/api/passation/ppm/${i.ppm}/lignes`, () => ({ objet: 'x', montantEstimatif: 1, methodeProcedure: 'ACHAT_DIRECT', trimestre: 1 })],
  ['lire une demande d\'achat', 'get', (i) => `/api/passation/demandes/${i.demande}`],
  ['modifier une demande d\'achat', 'patch', (i) => `/api/passation/demandes/${i.demande}`, () => ({ objet: 'Piraté' })],
  ['lire une procédure', 'get', (i) => `/api/passation/procedures/${i.procedure}`],
  ['modifier une procédure', 'patch', (i) => `/api/passation/procedures/${i.procedure}`, () => ({ objet: 'Piraté' })],
  ['[AUDIT] déposer une offre sur une procédure', 'post', (i) => `/api/passation/procedures/${i.procedure}/soumissions`, (i) => ({ fournisseurId: i.fournisseur, numeroDepot: 'X', montantFinancier: 1, montantTotal: 1 })],
  ['créer une commission sur une procédure', 'post', () => '/api/passation/commissions', (i) => ({ procedureId: i.procedure, nom: 'x', type: 'x', dateSeance: isoDate(1) })],
  ['lire un contrat', 'get', (i) => `/api/passation/contrats/${i.contrat}`],
  ['modifier un contrat', 'patch', (i) => `/api/passation/contrats/${i.contrat}`, () => ({ montantInitial: 1 })],
  ['lire le tableau de bord d\'un contrat', 'get', (i) => `/api/passation/contrats/${i.contrat}/dashboard`],
];

describe('Isolation entre organisations', () => {
  let ctx: TestContext;
  let orgA: Tenant;
  let orgB: Tenant;
  let adminA: ApiClient;
  let adminB: ApiClient;
  const ids: Ids = {};

  beforeAll(async () => {
    ctx = await createTestApp();
    orgA = await createTenant(ctx.prisma, 'orgA');
    orgB = await createTenant(ctx.prisma, 'orgB');
    adminA = await login(ctx.http, orgA.users.admin);
    adminB = await login(ctx.http, orgB.users.admin);

    // --- Ressources de l'organisation A, créées par l'API ---
    const { plan, axisId, activity } = await createPlanWithActivity(adminA, 'Plan confidentiel A');
    ids.plan = plan.id;
    ids.axis = axisId;
    ids.activity = activity.id;

    ids.checklist = (await adminA.post(`/api/activities/${ids.activity}/checklist`, { label: 'Tâche A' })).body.id;
    ids.indicator = (await adminA.post('/api/indicators', { title: 'Indicateur A', target: 100, activityId: ids.activity })).body.id;
    ids.budget = (await adminA.post(`/api/activities/${ids.activity}/budgets`, { planned: 1000 })).body.id;
    ids.zone = (await adminA.post('/api/zones', { name: 'Zone A', code: `ZA-${Date.now()}`, level: 0 })).body.id;
    ids.awp = (await adminA.post('/api/planning/annual-work-plans', { year: 2028, title: 'PTA A', objectives: { general: 'A' } })).body.id;
    // Créée en base : le code REC-AAAA-NNNN est unique globalement mais numéroté par organisation
    // (voir le test [AUDIT] de numérotation dans core-flow.e2e-spec).
    ids.recommendation = (
      await (ctx.prisma as any).recommendation.create({
        data: {
          code: `REC-A-${randomUUID().slice(0, 8)}`,
          title: 'Recommandation A',
          description: 'Confidentielle',
          source: 'AUDIT_INTERNE',
          organizationId: orgA.org.id,
          issuedAt: new Date(),
          dueDate: new Date(Date.now() + 30 * 86400000),
          responsibleId: orgA.users.admin.id,
          createdById: orgA.users.admin.id,
          priority: 'MOYENNE',
        },
      })
    ).id;
    ids.recoAction = (await adminA.post(`/api/recommendations/${ids.recommendation}/actions`, { title: 'Action A' })).body.id;
    ids.capitalization = (
      await adminA.post('/api/capitalization', {
        type: 'GUIDE', title: 'Guide A', context: 'c', challenges: 'c', solutions: 'c', results: 'c', lessons: 'c',
      })
    ).body.id;
    ids.participant = (
      await adminA.post('/api/participants', {
        activityId: ids.activity, firstName: 'Awa', lastName: 'A', phone: '+221770000001', paymentMode: 'WAVE',
      })
    ).body.id;
    ids.document = (
      await adminA.upload(`/api/activities/${ids.activity}/documents`, 'file', MINI_PDF, 'rapport-A.pdf', 'application/pdf', { type: 'RAPPORT' })
    ).body.id;
    ids.role = (await adminA.post('/api/roles', { name: `Rôle A ${Date.now()}`, permissions: ['plan.read'] })).body.id;
    ids.userA = orgA.users.coordinateur.id;
    ids.conversation = (
      await adminA.post('/api/messagerie/conversations', { type: 'GROUP', name: 'Équipe A', participantIds: [orgA.users.coordinateur.id] })
    ).body.id;
    await adminA.post(`/api/messagerie/conversations/${ids.conversation}/messages`, { content: 'Message secret de A' });

    // --- Passation de A : créée en base avec des références uniques
    // (la numérotation par l'API entre en collision entre organisations, voir passation.e2e-spec) ---
    const suffix = randomUUID().slice(0, 8);
    const db: any = ctx.prisma;
    ids.fournisseur = (await db.fournisseur.create({ data: { organizationId: orgA.org.id, raisonSociale: 'Fournisseur A' } })).id;
    ids.ppm = (
      await db.planPassationMarche.create({
        data: { organizationId: orgA.org.id, year: 2040, title: 'PPM A', reference: `PPM-A-${suffix}`, createdBy: orgA.users.admin.id },
      })
    ).id;
    ids.demande = (
      await db.demandeAchat.create({
        data: {
          organizationId: orgA.org.id, reference: `DA-A-${suffix}`, objet: 'Demande A', description: 'd', justification: 'j',
          montantEstimatif: 1000, demandeurId: orgA.users.admin.id,
        },
      })
    ).id;
    ids.procedure = (
      await db.procedure.create({
        data: {
          organizationId: orgA.org.id, reference: `PROC-A-${suffix}`, methode: 'ACHAT_DIRECT', objet: 'Procédure A', description: 'd',
          montantEstimatif: 1000, responsableId: orgA.users.admin.id, status: 'CLOTUREE_OFFRES',
        },
      })
    ).id;
    ids.contrat = (
      await db.contrat.create({
        data: {
          organizationId: orgA.org.id, reference: `CONT-A-${suffix}`, procedureId: ids.procedure, fournisseurId: ids.fournisseur,
          montantInitial: 1000, dateSignature: new Date(), dateEcheance: new Date(Date.now() + 30 * 86400000), gestionnaire: orgA.users.admin.id,
        },
      })
    ).id;

    const missing = Object.entries(ids).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) throw new Error(`Fixtures de l'organisation A non créées : ${missing.join(', ')}`);
  });

  afterAll(() => closeTestApp(ctx));

  const title = (name: string) =>
    name.startsWith('[AUDIT] ')
      ? `[AUDIT] l'organisation B ne peut pas ${name.slice(8)} de A`
      : `l'organisation B ne peut pas ${name} de A`;

  it.each(ATTEMPTS.map((a) => [title(a[0]), a]))('%s', async (_name, attempt) => {
    const [, method, url, body] = attempt as Attempt;
    const target = url(ids, orgA);
    const res = method === 'get' || method === 'delete' ? await adminB[method](target) : await adminB[method](target, body ? body(ids) : {});
    const ok = res.status >= 200 && res.status < 300;
    const payload = JSON.stringify(res.body ?? '');
    // Données de A présentes dans la réponse ? (identifiants ou libellés)
    const leaked = Object.values(ids).some((id) => payload.includes(id)) || /Message secret de A|confidentiel A|Tâche A|Indicateur A|Guide A|Fournisseur A/.test(payload);

    if (method === 'get') {
      // En lecture, un 200 vide (liste filtrée par organisation) est acceptable ; une donnée de A ne l'est pas.
      expect(ok && leaked ? `${res.status} avec des données de A : ${payload.slice(0, 300)}` : 'aucune donnée de A').toBe('aucune donnée de A');
    } else {
      // En écriture, tout succès est une faille.
      expect(ok ? `${res.status} (écriture acceptée) : ${payload.slice(0, 300)}` : 'refusé').toBe('refusé');
    }
  });

  it('aucune tentative de B n\'a modifié les données de A', async () => {
    const plan = await ctx.prisma.actionPlan.findUnique({ where: { id: ids.plan } });
    const activity = await ctx.prisma.activity.findUnique({ where: { id: ids.activity } });
    const budget = await ctx.prisma.budget.findUnique({ where: { id: ids.budget } });
    const role = await ctx.prisma.role.findUnique({ where: { id: ids.role } });
    const user = await ctx.prisma.user.findUnique({ where: { id: ids.userA } });
    const contrat = await ctx.prisma.contrat.findUnique({ where: { id: ids.contrat } });
    expect(plan?.title).toBe('Plan confidentiel A');
    expect(activity?.title).toBe('Plan confidentiel A - activité');
    expect(Number(budget?.planned)).toBe(1000);
    expect(role?.permissions).toEqual(['plan.read']);
    expect(user?.firstName).not.toBe('Piraté');
    expect(Number(contrat?.montantInitial)).toBe(1000);
    const intruderMessages = await ctx.prisma.message.count({ where: { conversationId: ids.conversation, content: 'Intrusion' } });
    expect(intruderMessages).toBe(0);
  });

  const lists: [string, string, string][] = [
    ['plans d\'action', '/api/action-plans', 'plan'],
    ['activités', '/api/activities', 'activity'],
    ['indicateurs', '/api/indicators', 'indicator'],
    ['zones', '/api/zones', 'zone'],
    ['PTA', '/api/planning/annual-work-plans', 'awp'],
    ['recommandations', '/api/recommendations', 'recommendation'],
    ['fiches de capitalisation', '/api/capitalization', 'capitalization'],
    ['utilisateurs', '/api/users', 'userA'],
    ['rôles', '/api/roles', 'role'],
    ['conversations', '/api/messagerie/conversations', 'conversation'],
    ['fournisseurs', '/api/passation/fournisseurs', 'fournisseur'],
    ['PPM', '/api/passation/ppm', 'ppm'],
    ['demandes d\'achat', '/api/passation/demandes', 'demande'],
    ['procédures', '/api/passation/procedures', 'procedure'],
    ['contrats', '/api/passation/contrats', 'contrat'],
    ['validations en attente', '/api/validations/pending', 'activity'],
  ];

  it.each(lists)('la liste des %s de B ne contient rien de A', async (_label, url, key) => {
    const res = await adminB.get(url);
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain(ids[key]);
  });

  it('le tableau de bord de B ne contient pas les données de A', async () => {
    const res = await adminB.get('/api/dashboards/overview');
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('Plan confidentiel A');
  });

  it('[AUDIT] B ne peut pas ouvrir une conversation avec un membre de A', async () => {
    const res = await adminB.post('/api/messagerie/conversations', { type: 'DIRECT', participantIds: [orgA.users.admin.id] });
    expect([400, 403, 404]).toContain(res.status);
  });

  it('[AUDIT] B ne peut pas attribuer à un utilisateur un rôle personnalisé de A', async () => {
    const res = await adminB.post('/api/users', {
      email: `emprunt.${Date.now()}@planora.test`,
      firstName: 'Emprunt',
      lastName: 'Role',
      roleId: ids.role,
    });
    expect([400, 403, 404]).toContain(res.status);
  });

  it('les suppressions de B sur les ressources de A échouent', async () => {
    const deletions = [
      `/api/action-plans/${ids.plan}`,
      `/api/activities/${ids.activity}`,
      `/api/indicators/${ids.indicator}`,
      `/api/budgets/${ids.budget}`,
      `/api/zones/${ids.zone}`,
      `/api/documents/${ids.document}`,
      `/api/recommendations/${ids.recommendation}`,
      `/api/capitalization/${ids.capitalization}`,
      `/api/participants/${ids.participant}`,
      `/api/users/${ids.userA}`,
      `/api/roles/${ids.role}`,
      `/api/messagerie/conversations/${ids.conversation}`,
      `/api/passation/fournisseurs/${ids.fournisseur}`,
      `/api/passation/ppm/${ids.ppm}`,
      `/api/passation/demandes/${ids.demande}`,
      `/api/passation/procedures/${ids.procedure}`,
      `/api/activities/${ids.activity}/checklist/${ids.checklist}`,
      `/api/action-plans/axes/${ids.axis}`,
      `/api/recommendations/actions/${ids.recoAction}`,
      `/api/planning/annual-work-plans/${ids.awp}`,
    ];
    const succeeded: string[] = [];
    for (const url of deletions) {
      const res = await adminB.delete(url);
      if (res.status >= 200 && res.status < 300) succeeded.push(`${url} → ${res.status}`);
    }
    expect(succeeded).toEqual([]);
    expect(await ctx.prisma.actionPlan.count({ where: { id: ids.plan } })).toBe(1);
    expect(await ctx.prisma.activity.count({ where: { id: ids.activity } })).toBe(1);
  });

  it('les utilisateurs de A voient toujours leurs données', async () => {
    const res = await adminA.get('/api/action-plans');
    expect(items(res.body).map((p: any) => p.id)).toContain(ids.plan);
  });
});
