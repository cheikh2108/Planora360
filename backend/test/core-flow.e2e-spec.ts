import { ApiClient, items } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import {
  createPlanWithActivity,
  createTenant,
  isoDate,
  login,
  Tenant,
} from './helpers/fixtures';

/**
 * Parcours métier principal : plan d'action → axes → activités → checklist → indicateurs
 * → budgets → circuit de validation → tableaux de bord → rapports.
 */
describe('Parcours métier — plans, activités, suivi, validation', () => {
  let ctx: TestContext;
  let tenant: Tenant;
  let admin: ApiClient;
  let coord: ApiClient;
  let validateur: ApiClient;
  let financier: ApiClient;
  let observateur: ApiClient;

  beforeAll(async () => {
    ctx = await createTestApp();
    tenant = await createTenant(ctx.prisma, 'flow');
    admin = await login(ctx.http, tenant.users.admin);
    coord = await login(ctx.http, tenant.users.coordinateur);
    validateur = await login(ctx.http, tenant.users.validateur);
    financier = await login(ctx.http, tenant.users.financier);
    observateur = await login(ctx.http, tenant.users.observateur);
  });
  afterAll(() => closeTestApp(ctx));

  describe("plans d'action et axes", () => {
    let planId: string;

    it('crée un plan avec ses axes', async () => {
      const res = await coord.post('/api/action-plans', {
        title: 'Plan stratégique 2027',
        periodStart: isoDate(0),
        periodEnd: isoDate(365),
        strategicGoals: 'Réduire les délais',
        budgetPrevisional: 15000000,
        axes: [{ title: 'Gouvernance' }, { title: 'Opérations' }],
      });
      expect(res.status).toBe(201);
      expect(res.body.organizationId).toBe(tenant.org.id);
      expect(res.body.axes).toHaveLength(2);
      planId = res.body.id;
    });

    it('refuse un plan sans titre ni dates (400)', async () => {
      const res = await coord.post('/api/action-plans', { title: 'X' });
      expect(res.status).toBe(400);
    });

    it('[AUDIT] refuse un plan dont la date de fin précède la date de début', async () => {
      const res = await coord.post('/api/action-plans', {
        title: 'Plan incohérent',
        periodStart: isoDate(100),
        periodEnd: isoDate(0),
      });
      expect(res.status).toBe(400);
    });

    it("liste et lit les plans de l'organisation", async () => {
      const list = await observateur.get('/api/action-plans');
      expect(list.status).toBe(200);
      expect(items(list.body).map((p: any) => p.id)).toContain(planId);

      const one = await observateur.get(`/api/action-plans/${planId}`);
      expect(one.status).toBe(200);
      expect(one.body.title).toBe('Plan stratégique 2027');
    });

    it('met à jour un plan', async () => {
      const res = await coord.patch(`/api/action-plans/${planId}`, {
        title: 'Plan stratégique 2027 (révisé)',
      });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Plan stratégique 2027 (révisé)');
    });

    it('ajoute, renomme et supprime un axe', async () => {
      const add = await coord.post(`/api/action-plans/${planId}/axes`, {
        title: 'Partenariats',
      });
      expect(add.status).toBe(201);
      const upd = await coord.patch(`/api/action-plans/axes/${add.body.id}`, {
        title: 'Partenariats & bailleurs',
      });
      expect(upd.status).toBe(200);
      const del = await coord.delete(`/api/action-plans/axes/${add.body.id}`);
      expect([200, 204]).toContain(del.status);
    });

    it('un observateur ne peut pas créer de plan', async () => {
      const res = await observateur.post('/api/action-plans', {
        title: 'Interdit',
        periodStart: isoDate(0),
        periodEnd: isoDate(30),
      });
      expect(res.status).toBe(403);
    });

    it('un observateur ne peut pas supprimer de plan', async () => {
      const res = await observateur.delete(`/api/action-plans/${planId}`);
      expect(res.status).toBe(403);
    });
  });

  describe('activités, checklist, indicateurs, budgets', () => {
    let activityId: string;
    let axisId: string;
    let planId: string;

    beforeAll(async () => {
      const created = await createPlanWithActivity(coord, 'Plan suivi');
      activityId = created.activity.id;
      axisId = created.axisId;
      planId = created.plan.id;
    });

    it("lit le détail d'une activité", async () => {
      const res = await coord.get(`/api/activities/${activityId}`);
      expect(res.status).toBe(200);
      expect(res.body.axisId ?? res.body.axis?.id).toBe(axisId);
    });

    it('refuse une activité rattachée à un axe inexistant', async () => {
      const res = await coord.post('/api/activities', {
        title: 'Orpheline',
        axisId: 'cnotexist000000000000000',
      });
      expect([400, 404]).toContain(res.status);
    });

    it('crée une sous-activité', async () => {
      const res = await coord.post('/api/activities', {
        title: 'Sous-activité',
        axisId,
        parentActivityId: activityId,
      });
      expect(res.status).toBe(201);
      expect(res.body.parentActivityId).toBe(activityId);
    });

    it('filtre la liste des activités', async () => {
      const res = await coord.get('/api/activities');
      expect(res.status).toBe(200);
      expect(items(res.body).length).toBeGreaterThan(0);
    });

    it('fait avancer le statut selon les transitions autorisées', async () => {
      const prep = await coord.patch(`/api/activities/${activityId}/status`, {
        status: 'EN_PREPARATION',
      });
      expect(prep.status).toBe(200);
      const run = await coord.patch(`/api/activities/${activityId}/status`, {
        status: 'EN_COURS',
      });
      expect(run.status).toBe(200);
      expect(run.body.status).toBe('EN_COURS');
    });

    it('refuse une transition de statut interdite (EN_COURS → VALIDEE réservé au circuit de validation)', async () => {
      const res = await coord.patch(`/api/activities/${activityId}/status`, {
        status: 'VALIDEE',
      });
      expect(res.status).toBe(400);
    });

    it('refuse un statut inconnu', async () => {
      const res = await coord.patch(`/api/activities/${activityId}/status`, {
        status: 'FINI',
      });
      expect(res.status).toBe(400);
    });

    it("gère la checklist et recalcule le taux d'avancement", async () => {
      const a = await coord.post(`/api/activities/${activityId}/checklist`, {
        label: 'Rédiger les TDR',
        isMandatory: true,
      });
      const b = await coord.post(`/api/activities/${activityId}/checklist`, {
        label: "Lancer l'atelier",
      });
      expect(a.status).toBe(201);
      expect(b.status).toBe(201);

      const list = await coord.get(`/api/activities/${activityId}/checklist`);
      expect(list.status).toBe(200);
      expect(items(list.body)).toHaveLength(2);

      const done = await coord.patch(
        `/api/activities/${activityId}/checklist/${a.body.id}`,
        { progress: 100 },
      );
      expect(done.status).toBe(200);

      const act = await coord.get(`/api/activities/${activityId}`);
      expect(Number(act.body.completionRate)).toBeCloseTo(50, 0);

      const del = await coord.delete(
        `/api/activities/${activityId}/checklist/${b.body.id}`,
      );
      expect([200, 204]).toContain(del.status);
    });

    it('gère les indicateurs (création, lecture, mise à jour, suppression)', async () => {
      const created = await coord.post('/api/indicators', {
        title: 'Taux de couverture',
        unit: '%',
        baseline: 20,
        target: 80,
        activityId,
      });
      expect(created.status).toBe(201);
      const id = created.body.id;

      expect((await coord.get('/api/indicators')).status).toBe(200);
      expect((await coord.get(`/api/indicators/${id}`)).body.target).toBe(80);

      const upd = await coord.patch(`/api/indicators/${id}`, { achieved: 45 });
      expect(upd.status).toBe(200);
      expect(upd.body.achieved).toBe(45);

      const neg = await coord.post('/api/indicators', {
        title: 'Négatif',
        target: -5,
      });
      expect(neg.status).toBe(400);

      const del = await coord.delete(`/api/indicators/${id}`);
      expect([200, 204]).toContain(del.status);
    });

    it('gère les budgets et respecte la cascade planifié ≥ engagé ≥ exécuté', async () => {
      const ok = await financier.post(`/api/activities/${activityId}/budgets`, {
        planned: 1000000,
        committed: 600000,
        executed: 400000,
        fundingSource: 'Bailleur A',
      });
      expect(ok.status).toBe(201);

      const incoherent = await financier.post(
        `/api/activities/${activityId}/budgets`,
        {
          planned: 100,
          committed: 500,
          executed: 900,
        },
      );
      expect(incoherent.status).toBe(400);

      const list = await financier.get(`/api/activities/${activityId}/budgets`);
      expect(items(list.body)).toHaveLength(1);

      const summary = await financier.get('/api/budgets/summary');
      expect(summary.status).toBe(200);
      const planSummary = await financier.get(
        `/api/budgets/summary/plan/${planId}`,
      );
      expect(planSummary.status).toBe(200);

      const upd = await financier.patch(`/api/budgets/${ok.body.id}`, {
        executed: 500000,
      });
      expect(upd.status).toBe(200);

      const badUpd = await financier.patch(`/api/budgets/${ok.body.id}`, {
        executed: 5000000,
      });
      expect(badUpd.status).toBe(400);
    });

    it('un observateur ne peut pas modifier un budget', async () => {
      const res = await observateur.post(
        `/api/activities/${activityId}/budgets`,
        { planned: 10 },
      );
      expect(res.status).toBe(403);
    });
  });

  describe('circuit de validation', () => {
    let activityId: string;

    beforeAll(async () => {
      const created = await createPlanWithActivity(coord, 'Plan validation');
      activityId = created.activity.id;
      await coord.patch(`/api/activities/${activityId}`, {
        responsibleId: tenant.users.coordinateur.id,
      });
    });

    it("seul le responsable peut soumettre l'activité", async () => {
      const res = await validateur.post(`/api/activities/${activityId}/submit`);
      expect(res.status).toBe(403);
    });

    it("bloque la soumission tant qu'une tâche obligatoire n'est pas faite", async () => {
      const item = await coord.post(`/api/activities/${activityId}/checklist`, {
        label: 'Obligatoire',
        isMandatory: true,
      });
      const blocked = await coord.post(`/api/activities/${activityId}/submit`);
      expect(blocked.status).toBe(400);
      const done = await coord.patch(
        `/api/activities/${activityId}/checklist/${item.body.id}`,
        { progress: 100 },
      );
      expect(done.status).toBe(200);
    });

    it("fait passer l'activité par toutes les étapes jusqu'à la clôture", async () => {
      const submit = await coord.post(`/api/activities/${activityId}/submit`);
      expect([200, 201]).toContain(submit.status);

      // Le rôle exigé est celui de l'étape EN COURS (STEP_ROLES[currentStep]).
      const steps: [ApiClient, string][] = [
        [coord, 'VERIFICATION_HIERARCHIQUE'], // sort de SOUMISSION
        [coord, 'VALIDATION_TECHNIQUE'], // sort de VERIFICATION_HIERARCHIQUE
        [validateur, 'VALIDATION_ADMINISTRATIVE'], // sort de VALIDATION_TECHNIQUE
        [financier, 'CLOTURE'], // sort de VALIDATION_ADMINISTRATIVE
      ];
      for (const [actor, toStep] of steps) {
        const res = await actor.post(`/api/activities/${activityId}/validate`, {
          toStep,
          decision: 'APPROUVE',
          comment: `OK ${toStep}`,
        });
        expect({ toStep, status: res.status }).toEqual({
          toStep,
          status: expect.any(Number),
        });
        if (![200, 201].includes(res.status))
          throw new Error(
            `${toStep} → ${res.status} ${JSON.stringify(res.body)}`,
          );
      }

      const act = await coord.get(`/api/activities/${activityId}`);
      expect(act.body.status).toBe('VALIDEE');

      const history = await coord.get(
        `/api/activities/${activityId}/validations`,
      );
      expect(items(history.body).length).toBeGreaterThanOrEqual(5);
    });

    it('refuse une transition qui saute une étape', async () => {
      const { activity } = await createPlanWithActivity(coord, 'Plan saut');
      await coord.patch(`/api/activities/${activity.id}`, {
        responsibleId: tenant.users.coordinateur.id,
      });
      await coord.post(`/api/activities/${activity.id}/submit`);
      const res = await admin.post(`/api/activities/${activity.id}/validate`, {
        toStep: 'CLOTURE',
        decision: 'APPROUVE',
      });
      expect(res.status).toBe(400);
    });

    it("un rejet en vérification technique renvoie l'activité à la soumission", async () => {
      const { activity } = await createPlanWithActivity(coord, 'Plan rejet');
      await coord.patch(`/api/activities/${activity.id}`, {
        responsibleId: tenant.users.coordinateur.id,
      });
      await coord.post(`/api/activities/${activity.id}/submit`);
      await coord.post(`/api/activities/${activity.id}/validate`, {
        toStep: 'VERIFICATION_HIERARCHIQUE',
        decision: 'APPROUVE',
      });

      const bad = await validateur.post(
        `/api/activities/${activity.id}/validate`,
        { toStep: 'VALIDATION_ADMINISTRATIVE', decision: 'REJETE' },
      );
      expect(bad.status).toBe(400); // un rejet doit revenir à SOUMISSION
      const ok = await coord.post(`/api/activities/${activity.id}/validate`, {
        toStep: 'SOUMISSION',
        decision: 'REJETE',
        comment: 'Pièces manquantes',
      });
      expect([200, 201]).toContain(ok.status);
    });

    it('[AUDIT] le vérificateur hiérarchique peut rejeter une activité tout juste soumise', async () => {
      const { activity } = await createPlanWithActivity(
        coord,
        'Plan rejet direct',
      );
      await coord.patch(`/api/activities/${activity.id}`, {
        responsibleId: tenant.users.coordinateur.id,
      });
      await coord.post(`/api/activities/${activity.id}/submit`);
      const res = await admin.post(`/api/activities/${activity.id}/validate`, {
        toStep: 'SOUMISSION',
        decision: 'REJETE',
        comment: 'Incomplet',
      });
      expect([200, 201]).toContain(res.status);
    });

    it('un observateur ne peut valider aucune étape', async () => {
      const { activity } = await createPlanWithActivity(coord, 'Plan obs');
      await coord.patch(`/api/activities/${activity.id}`, {
        responsibleId: tenant.users.coordinateur.id,
      });
      await coord.post(`/api/activities/${activity.id}/submit`);
      const res = await observateur.post(
        `/api/activities/${activity.id}/validate`,
        { toStep: 'VERIFICATION_HIERARCHIQUE', decision: 'APPROUVE' },
      );
      expect(res.status).toBe(403);
    });

    it('liste les validations en attente', async () => {
      const res = await validateur.get('/api/validations/pending');
      expect(res.status).toBe(200);
    });
  });

  describe('tableaux de bord et rapports', () => {
    it("renvoie la vue d'ensemble et la performance", async () => {
      const overview = await coord.get('/api/dashboards/overview');
      expect(overview.status).toBe(200);
      const perf = await coord.get('/api/dashboards/performance');
      expect(perf.status).toBe(200);
    });

    it("renvoie la progression d'un plan", async () => {
      const { plan } = await createPlanWithActivity(coord, 'Plan dashboard');
      const res = await coord.get(`/api/dashboards/plan/${plan.id}/progress`);
      expect(res.status).toBe(200);
    });

    const binary = (r: any, cb: any) => {
      const chunks: Buffer[] = [];
      r.on('data', (c: Buffer) => chunks.push(c));
      r.on('end', () => cb(null, Buffer.concat(chunks)));
    };
    const reportTypes = [
      'activites',
      'budget',
      'performance',
      'retards',
      'indicateurs',
    ];
    for (const type of reportTypes) {
      it(`génère le rapport "${type}" en Excel`, async () => {
        const res = await coord
          .post('/api/reports/generate', { type, format: 'excel' })
          .buffer(true)
          .parse(binary);
        expect([200, 201]).toContain(res.status);
        expect((res.body as Buffer).subarray(0, 2).toString()).toBe('PK'); // un .xlsx est une archive zip
      });

      it(`génère le rapport "${type}" en PDF`, async () => {
        const res = await coord
          .post('/api/reports/generate', { type, format: 'pdf' })
          .buffer(true)
          .parse(binary);
        expect([200, 201]).toContain(res.status);
        expect((res.body as Buffer).subarray(0, 4).toString()).toBe('%PDF');
      });
    }

    it('refuse un type de rapport inconnu', async () => {
      const res = await coord.post('/api/reports/generate', {
        type: 'secret',
        format: 'excel',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('zones géographiques', () => {
    it("crée une hiérarchie de zones et renvoie l'arbre", async () => {
      const pays = await admin.post('/api/zones', {
        name: 'Sénégal',
        code: `SN-${Date.now()}`,
        level: 0,
      });
      expect(pays.status).toBe(201);
      const region = await admin.post('/api/zones', {
        name: 'Thiès',
        code: `TH-${Date.now()}`,
        level: 1,
        parentId: pays.body.id,
      });
      expect(region.status).toBe(201);

      const tree = await admin.get('/api/zones/tree');
      expect(tree.status).toBe(200);
      const stats = await admin.get('/api/zones/stats');
      expect(stats.status).toBe(200);

      const upd = await admin.patch(`/api/zones/${region.body.id}`, {
        name: 'Région de Thiès',
      });
      expect(upd.status).toBe(200);
    });

    it('rattache des zones à un plan', async () => {
      const zone = await admin.post('/api/zones', {
        name: 'Dakar',
        code: `DK-${Date.now()}`,
        level: 1,
      });
      const plan = await coord.post('/api/action-plans', {
        title: 'Plan zoné',
        periodStart: isoDate(0),
        periodEnd: isoDate(200),
        zoneIds: [zone.body.id],
      });
      expect(plan.status).toBe(201);
    });

    it('liste les presets de configuration des niveaux', async () => {
      expect((await admin.get('/api/zones/config/presets')).status).toBe(200);
    });

    it('[AUDIT] GET /zones/config renvoie la configuration (et non "Zone introuvable" via /zones/:id)', async () => {
      const cfg = await admin.get('/api/zones/config');
      expect(cfg.status).toBe(200);
    });
  });

  describe('planification annuelle, recommandations, capitalisation, participants', () => {
    it('crée et valide un plan de travail annuel', async () => {
      const created = await coord.post('/api/planning/annual-work-plans', {
        year: 2027,
        title: 'PTA 2027',
        objectives: {
          general: 'Améliorer le suivi',
          specifiques: ['Objectif 1'],
        },
      });
      expect(created.status).toBe(201);
      expect((await coord.get('/api/planning/annual-work-plans')).status).toBe(
        200,
      );
      const validated = await admin.patch(
        `/api/planning/annual-work-plans/${created.body.id}/validate`,
      );
      expect([200, 201]).toContain(validated.status);
    });

    it('met à jour la matrice de résultats', async () => {
      const res = await admin.patch('/api/planning/results-matrix', {
        data: { impact: ['I1'], outcomes: [] },
      });
      expect([200, 201]).toContain(res.status);
      const read = await admin.get('/api/planning/results-matrix');
      expect(read.status).toBe(200);
    });

    it('suit une recommandation (création, action, commentaire, statistiques)', async () => {
      const created = await coord.post('/api/recommendations', {
        title: 'Renforcer le contrôle interne',
        description: "Suite à la mission d'audit",
        source: 'AUDIT_INTERNE',
        issuedAt: isoDate(-10),
        dueDate: isoDate(60),
        responsibleId: tenant.users.coordinateur.id,
        priority: 'ELEVEE',
      });
      if (created.status !== 201)
        throw new Error(`${created.status} ${JSON.stringify(created.body)}`);
      const id = created.body.id;

      const action = await coord.post(`/api/recommendations/${id}/actions`, {
        title: 'Former les équipes',
        dueDate: isoDate(30),
      });
      expect(action.status).toBe(201);
      const comment = await coord.post(`/api/recommendations/${id}/comments`, {
        content: 'Lancement prévu lundi',
      });
      expect(comment.status).toBe(201);
      expect(
        (await coord.get(`/api/recommendations/${id}/comments`)).status,
      ).toBe(200);
      expect((await coord.get('/api/recommendations/stats')).status).toBe(200);
    });

    it('[AUDIT] deux organisations peuvent chacune créer leur première recommandation', async () => {
      // Le code REC-AAAA-NNNN est numéroté par organisation mais déclaré unique pour toute la base.
      const statuses: number[] = [];
      for (const label of ['recoA', 'recoB']) {
        const t = await createTenant(ctx.prisma, label);
        const api = await login(ctx.http, t.users.coordinateur);
        const res = await api.post('/api/recommendations', {
          title: `Recommandation ${label}`,
          description: 'x',
          source: 'AUDIT_INTERNE',
          issuedAt: isoDate(-1),
          dueDate: isoDate(30),
          responsibleId: t.users.coordinateur.id,
          priority: 'FAIBLE',
        });
        statuses.push(res.status);
      }
      expect(statuses).toEqual([201, 201]);
    });

    it('publie une fiche de capitalisation', async () => {
      const res = await coord.post('/api/capitalization', {
        type: 'BONNE_PRATIQUE',
        title: 'Comités de suivi mensuels',
        context: 'Contexte',
        challenges: 'Défis',
        solutions: 'Solutions',
        results: 'Résultats',
        lessons: 'Leçons',
        tags: ['gouvernance'],
        status: 'PUBLIE',
      });
      expect(res.status).toBe(201);
      expect((await coord.get('/api/capitalization')).status).toBe(200);
      expect(
        (await coord.get(`/api/capitalization/${res.body.id}`)).status,
      ).toBe(200);
    });

    it('enregistre un participant à une activité', async () => {
      const { activity } = await createPlanWithActivity(
        coord,
        'Plan participants',
      );
      const res = await coord.post('/api/participants', {
        activityId: activity.id,
        firstName: 'Ibrahima',
        lastName: 'Ndiaye',
        phone: '+221770000000',
        paymentMode: 'WAVE',
        amount: 5000,
      });
      expect(res.status).toBe(201);
      const list = await coord.get(`/api/participants/activity/${activity.id}`);
      expect(items(list.body)).toHaveLength(1);
    });
  });

  describe("administration de l'organisation", () => {
    it("l'administrateur crée un utilisateur de son organisation", async () => {
      const roles = await admin.get('/api/users/roles');
      expect(roles.status).toBe(200);
      const coordRole = items(roles.body).find(
        (r: any) => r.name === 'Coordinateur',
      );
      const res = await admin.post('/api/users', {
        email: `nouveau.${Date.now()}@planora.test`,
        firstName: 'Nouveau',
        lastName: 'Membre',
        password: 'Membre#2026pass',
        roleId: coordRole.id,
      });
      expect(res.status).toBe(201);
      expect(res.body.organizationId).toBe(tenant.org.id);
      expect(res.body.passwordHash).toBeUndefined();
    });

    it("un coordinateur ne peut pas créer d'utilisateur administrateur", async () => {
      const roles = await admin.get('/api/users/roles');
      const adminRole = items(roles.body).find(
        (r: any) => r.name === 'Administrateur',
      );
      const res = await coord.post('/api/users', {
        email: `escalade.${Date.now()}@planora.test`,
        firstName: 'Esc',
        lastName: 'Alade',
        roleId: adminRole.id,
      });
      expect(res.status).toBe(403);
    });

    it('personnalise la couleur de marque', async () => {
      const res = await admin.patch('/api/organizations/my/brand-color', {
        brandColor: '#0e7c66',
      });
      expect(res.status).toBe(200);
    });

    it("consulte le journal d'audit", async () => {
      const res = await admin.get('/api/audit');
      expect(res.status).toBe(200);
    });
  });
});
