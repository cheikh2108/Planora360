import { ApiClient, items } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createTenant, isoDate, login, Tenant } from './helpers/fixtures';

/**
 * Module Passation de marchés : fournisseurs → PPM → demandes d'achat → procédures
 * → soumissions → commissions → évaluations → contrats.
 */
describe('Passation de marchés', () => {
  let ctx: TestContext;
  let tenant: Tenant;
  let admin: ApiClient;
  let observateur: ApiClient;

  beforeAll(async () => {
    ctx = await createTestApp();
    tenant = await createTenant(ctx.prisma, 'passation');
    admin = await login(ctx.http, tenant.users.admin);
    observateur = await login(ctx.http, tenant.users.observateur);
  });
  afterAll(() => closeTestApp(ctx));

  async function createFournisseur(api: ApiClient, name = 'Sénégal Fournitures SARL') {
    const res = await api.post('/api/passation/fournisseurs', {
      raisonSociale: `${name} ${Date.now()}`,
      identifiantFiscal: `NINEA-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      ville: 'Dakar',
      pays: 'Sénégal',
      email: 'contact@fournisseur.sn',
    });
    if (res.status !== 201) throw new Error(`fournisseur ${res.status} ${JSON.stringify(res.body)}`);
    return res.body;
  }

  async function createProcedure(api: ApiClient, extra: Record<string, any> = {}) {
    const res = await api.post('/api/passation/procedures', {
      objet: 'Acquisition de matériel informatique',
      description: 'Ordinateurs portables pour l\'équipe terrain',
      methode: 'DEMANDE_COTATION',
      montantEstimatif: 12000000,
      ...extra,
    });
    if (res.status !== 201) throw new Error(`procédure ${res.status} ${JSON.stringify(res.body)}`);
    return res.body;
  }

  describe('fournisseurs', () => {
    it('crée, lit, modifie et liste un fournisseur', async () => {
      const f = await createFournisseur(admin);
      expect(f.organizationId).toBe(tenant.org.id);
      expect((await admin.get(`/api/passation/fournisseurs/${f.id}`)).status).toBe(200);
      const upd = await admin.patch(`/api/passation/fournisseurs/${f.id}`, { telephone: '+221338000000' });
      expect(upd.status).toBe(200);
      const list = await admin.get('/api/passation/fournisseurs');
      expect(items(list.body).map((x: any) => x.id)).toContain(f.id);
    });

    it('refuse un doublon d\'identifiant fiscal dans la même organisation', async () => {
      const ninea = `NINEA-DOUBLON-${Date.now()}`;
      const a = await admin.post('/api/passation/fournisseurs', { raisonSociale: 'A', identifiantFiscal: ninea });
      expect(a.status).toBe(201);
      const b = await admin.post('/api/passation/fournisseurs', { raisonSociale: 'B', identifiantFiscal: ninea });
      expect(b.status).toBe(400);
    });

    it('[AUDIT] suspend, met sur liste noire puis réactive un fournisseur', async () => {
      const f = await createFournisseur(admin);
      for (const action of ['suspend', 'blacklist', 'activate']) {
        const res = await admin.post(`/api/passation/fournisseurs/${f.id}/${action}`, { motif: 'Test' });
        if (![200, 201].includes(res.status)) throw new Error(`${action} → ${res.status} ${JSON.stringify(res.body)}`);
      }
    });

    it('refuse un email invalide', async () => {
      const res = await admin.post('/api/passation/fournisseurs', { raisonSociale: 'X', email: 'pas-un-email' });
      expect(res.status).toBe(400);
    });
  });

  describe('PPM (plan de passation des marchés)', () => {
    let ppmId: string;

    it('crée un PPM et lui ajoute une ligne', async () => {
      const res = await admin.post('/api/passation/ppm', { year: 2027, title: 'PPM 2027' });
      expect(res.status).toBe(201);
      expect(res.body.reference).toMatch(/^PPM-2027-/);
      ppmId = res.body.id;

      const ligne = await admin.post(`/api/passation/ppm/${ppmId}/lignes`, {
        objet: 'Véhicules de terrain',
        montantEstimatif: 45000000,
        methodeProcedure: 'APPEL_OFFRES_OUVERT',
        trimestre: 2,
      });
      expect(ligne.status).toBe(201);
    });

    it('refuse deux PPM pour la même année', async () => {
      const res = await admin.post('/api/passation/ppm', { year: 2027, title: 'Doublon' });
      expect(res.status).toBe(400);
    });

    it('lit, modifie, valide et exporte le PPM', async () => {
      expect((await admin.get(`/api/passation/ppm/${ppmId}`)).status).toBe(200);
      expect((await admin.patch(`/api/passation/ppm/${ppmId}`, { title: 'PPM 2027 révisé' })).status).toBe(200);
      const validate = await admin.post(`/api/passation/ppm/${ppmId}/validate`);
      expect([200, 201]).toContain(validate.status);
      const exp = await admin.get(`/api/passation/ppm/${ppmId}/export`);
      expect(exp.status).toBe(200);
    });
  });

  describe('demandes d\'achat', () => {
    it('crée, soumet et suit une petite demande d\'achat', async () => {
      const created = await admin.post('/api/passation/demandes', {
        objet: 'Fournitures de bureau',
        description: 'Ramettes, stylos, classeurs',
        justification: 'Stock épuisé',
        montantEstimatif: 3000, // sous le seuil de validation technique (5 000)
      });
      if (created.status !== 201) throw new Error(`${created.status} ${JSON.stringify(created.body)}`);
      const id = created.body.id;
      expect((await admin.get(`/api/passation/demandes/${id}`)).status).toBe(200);
      const submit = await admin.post(`/api/passation/demandes/${id}/submit`);
      if (![200, 201].includes(submit.status)) throw new Error(`submit ${submit.status} ${JSON.stringify(submit.body)}`);
      expect((await admin.get(`/api/passation/demandes/${id}/workflow`)).status).toBe(200);
    });

    it('[AUDIT] soumet une demande d\'achat importante (validateurs technique et administratif trouvés)', async () => {
      // Le service de workflow cherche des utilisateurs de rôle "Admin", qui n'existe pas (le rôle s'appelle "Administrateur").
      const created = await admin.post('/api/passation/demandes', {
        objet: 'Véhicule de terrain',
        description: '4x4 pour les missions',
        justification: 'Remplacement',
        montantEstimatif: 250000, // au-dessus du seuil de validation technique
      });
      expect(created.status).toBe(201);
      const submit = await admin.post(`/api/passation/demandes/${created.body.id}/submit`);
      expect([200, 201]).toContain(submit.status);
    });

    it('[AUDIT] rejette une demande d\'achat au montant négatif', async () => {
      const res = await admin.post('/api/passation/demandes', {
        objet: 'Négatif',
        description: 'x',
        justification: 'x',
        montantEstimatif: -1000,
      });
      expect(res.status).toBe(400);
    });
  });

  describe('procédures, soumissions, commissions, évaluations, contrats', () => {
    it('déroule une procédure complète jusqu\'au contrat', async () => {
      const fournisseur = await createFournisseur(admin, 'Attributaire');
      const proc = await createProcedure(admin, { dateLimite: isoDate(15), dateOuverture: isoDate(16) });
      expect(proc.status).toBe('BROUILLON');
      expect(proc.organizationId).toBe(tenant.org.id);

      const pub = await admin.post(`/api/passation/procedures/${proc.id}/publish`);
      if (![200, 201].includes(pub.status)) throw new Error(`publish ${pub.status} ${JSON.stringify(pub.body)}`);

      // Même payload que CreateSoumissionModal.tsx
      const soum = await admin.post(`/api/passation/procedures/${proc.id}/soumissions`, {
        fournisseurId: fournisseur.id,
        numeroDepot: 'DEP-001',
        montantFinancier: 11500000,
        montantTotal: 11500000,
        devise: 'XOF',
        conformeAdmin: true,
        conformeTechnique: true,
        conformeFinancier: true,
        horsDelai: false,
        status: 'DEPOSEE',
      });
      if (soum.status !== 201) throw new Error(`soumission ${soum.status} ${JSON.stringify(soum.body)}`);
      // Confidentialité : les offres ne sont pas lisibles avant la date d'ouverture des plis
      expect((await admin.get(`/api/passation/procedures/${proc.id}/soumissions`)).status).toBe(403);
      await ctx.prisma.procedure.update({ where: { id: proc.id }, data: { dateOuverture: new Date(Date.now() - 60_000) } });
      expect((await admin.get(`/api/passation/procedures/${proc.id}/soumissions`)).status).toBe(200);

      const close = await admin.post(`/api/passation/procedures/${proc.id}/close`);
      if (![200, 201].includes(close.status)) throw new Error(`close ${close.status} ${JSON.stringify(close.body)}`);

      expect((await admin.get(`/api/passation/procedures/${proc.id}/evaluations`)).status).toBe(200);
      expect((await admin.get(`/api/passation/procedures/${proc.id}/evaluations/synthese`)).status).toBe(200);

      const contrat = await admin.post('/api/passation/contrats', {
        procedureId: proc.id,
        fournisseurId: fournisseur.id,
        montantInitial: 11500000,
        dateSignature: isoDate(2),
        dateDemarrage: isoDate(5),
        dateEcheance: isoDate(60),
      });
      if (contrat.status !== 201) throw new Error(`contrat ${contrat.status} ${JSON.stringify(contrat.body)}`);
      const contratId = contrat.body.id;

      expect((await admin.get(`/api/passation/contrats/${contratId}`)).status).toBe(200);
      expect((await admin.get(`/api/passation/contrats/${contratId}/dashboard`)).status).toBe(200);
      const upd = await admin.patch(`/api/passation/contrats/${contratId}`, { dateEcheance: isoDate(90) });
      expect(upd.status).toBe(200);

      const dup = await admin.post('/api/passation/contrats', {
        procedureId: proc.id,
        fournisseurId: fournisseur.id,
        montantInitial: 1,
        dateSignature: isoDate(2),
        dateEcheance: isoDate(60),
      });
      expect(dup.status).toBe(403);
    });

    it('[AUDIT] crée une commission d\'évaluation pour une procédure', async () => {
      // Le service ajoute organizationId, colonne absente du modèle Commission : PrismaClientValidationError à chaque appel.
      const proc = await createProcedure(admin);
      const res = await admin.post('/api/passation/commissions', {
        procedureId: proc.id,
        nom: 'Commission d\'ouverture',
        type: 'OUVERTURE',
        dateSeance: isoDate(1),
      });
      expect(res.status).toBe(201);
      expect((await admin.get('/api/passation/commissions')).status).toBe(200);
    });

    it('refuse un contrat sur une procédure encore en brouillon', async () => {
      const fournisseur = await createFournisseur(admin);
      const proc = await createProcedure(admin);
      const res = await admin.post('/api/passation/contrats', {
        procedureId: proc.id,
        fournisseurId: fournisseur.id,
        montantInitial: 1000,
        dateSignature: isoDate(2),
        dateEcheance: isoDate(60),
      });
      expect(res.status).toBe(403);
    });

    it('annule une procédure', async () => {
      const proc = await createProcedure(admin);
      const res = await admin.post(`/api/passation/procedures/${proc.id}/cancel`, { motif: 'Besoin annulé' });
      expect([200, 201]).toContain(res.status);
    });

    it('[AUDIT] ne permet pas de créer une procédure directement au statut ATTRIBUEE (contournement du circuit)', async () => {
      const res = await admin.post('/api/passation/procedures', {
        objet: 'Raccourci',
        description: 'x',
        methode: 'ACHAT_DIRECT',
        montantEstimatif: 1000,
        status: 'ATTRIBUEE',
      });
      expect(res.status === 400 || res.body.status === 'BROUILLON').toBe(true);
    });

    it('[AUDIT] la modification d\'un contrat ne permet pas de changer son organisation (mass assignment)', async () => {
      const other = await createTenant(ctx.prisma, 'cible');
      const fournisseur = await createFournisseur(admin);
      const proc = await createProcedure(admin);
      await ctx.prisma.procedure.update({ where: { id: proc.id }, data: { status: 'CLOTUREE_OFFRES' } });
      const contrat = await admin.post('/api/passation/contrats', {
        procedureId: proc.id,
        fournisseurId: fournisseur.id,
        montantInitial: 5000,
        dateSignature: isoDate(2),
        dateEcheance: isoDate(60),
      });
      expect(contrat.status).toBe(201);

      await admin.patch(`/api/passation/contrats/${contrat.body.id}`, { organizationId: other.org.id });
      const after = await ctx.prisma.contrat.findUnique({ where: { id: contrat.body.id } });
      expect(after?.organizationId).toBe(tenant.org.id);
    });

    it('[AUDIT] un observateur (lecture seule) ne peut pas créer de fournisseur ni de procédure', async () => {
      const f = await observateur.post('/api/passation/fournisseurs', { raisonSociale: 'Par un observateur' });
      const p = await observateur.post('/api/passation/procedures', {
        objet: 'Par un observateur',
        description: 'x',
        methode: 'ACHAT_DIRECT',
        montantEstimatif: 1000,
      });
      expect([f.status, p.status]).toEqual([403, 403]);
    });
  });

  describe('numérotation multi-organisations', () => {
    it('[AUDIT] deux organisations peuvent chacune créer leur première procédure, PPM et demande', async () => {
      const orgA = await createTenant(ctx.prisma, 'numA');
      const orgB = await createTenant(ctx.prisma, 'numB');
      const a = await login(ctx.http, orgA.users.admin);
      const b = await login(ctx.http, orgB.users.admin);

      const results: Record<string, number> = {};
      for (const [label, api] of [['A', a], ['B', b]] as [string, ApiClient][]) {
        const proc = await api.post('/api/passation/procedures', {
          objet: `Procédure ${label}`,
          description: 'x',
          methode: 'ACHAT_DIRECT',
          montantEstimatif: 1000,
        });
        results[`procedure ${label}`] = proc.status;
        const ppm = await api.post('/api/passation/ppm', { year: 2031, title: `PPM ${label}` });
        results[`ppm ${label}`] = ppm.status;
        const dem = await api.post('/api/passation/demandes', {
          objet: `Demande ${label}`,
          description: 'x',
          justification: 'x',
          montantEstimatif: 1000,
        });
        results[`demande ${label}`] = dem.status;
      }
      expect(results).toEqual({
        'procedure A': 201,
        'ppm A': 201,
        'demande A': 201,
        'procedure B': 201,
        'ppm B': 201,
        'demande B': 201,
      });
    });
  });
});
