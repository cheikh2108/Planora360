import request from 'supertest';
import { ApiClient } from './helpers/api-client';
import {
  closeTestApp,
  createTestApp,
  listRoutes,
  TestContext,
} from './helpers/app';
import { createTenant, login, Tenant } from './helpers/fixtures';
import { TEST_ENV } from './setup/test-config';

/**
 * Balayage automatique de TOUTES les routes enregistrées :
 * - sans session, seules les routes publiques connues répondent ;
 * - avec session, aucune route ne doit planter (5xx) sur des identifiants inexistants ou un corps vide.
 */

// Routes volontairement publiques (méthode + chemin Express)
const PUBLIC_ROUTES = new Set([
  'GET /api/maintenance/status',
  'POST /api/auth/register',
  'GET /api/auth/verify-email/:token',
  'POST /api/auth/request-quote',
  'POST /api/auth/login',
  'POST /api/auth/refresh',
  'GET /api/auth/csrf',
  'POST /api/dexpay/webhook',
]);

const FAKE_ID = 'cnotexist000000000000000';

function fill(path: string): string {
  return path.replace(/:[A-Za-z]+/g, FAKE_ID);
}

describe("Contrôle d'accès — balayage de toutes les routes", () => {
  let ctx: TestContext;
  let routes: { method: string; path: string }[];
  let tenant: Tenant;
  let admin: ApiClient;
  let superAdmin: ApiClient;

  beforeAll(async () => {
    ctx = await createTestApp();
    routes = listRoutes(ctx.app).filter((r) => r.path.startsWith('/api/'));
    tenant = await createTenant(ctx.prisma, 'sweep');
    admin = await login(ctx.http, tenant.users.admin);
    superAdmin = await ApiClient.loggedIn(
      ctx.http,
      TEST_ENV.SEED_ADMIN_EMAIL,
      TEST_ENV.SEED_ADMIN_PASSWORD,
    );
  });
  afterAll(() => closeTestApp(ctx));

  it("détecte bien les routes de l'application", () => {
    expect(routes.length).toBeGreaterThan(150);
  });

  it('toute route non publique refuse une requête sans session', async () => {
    const leaks: string[] = [];
    for (const r of routes) {
      const key = `${r.method} ${r.path}`;
      if (PUBLIC_ROUTES.has(key)) continue;
      const res = await (request(ctx.http) as any)[r.method.toLowerCase()](
        fill(r.path),
      );
      // 401 (pas de JWT) ou 403 (CSRF manquant, vérifié avant le JWT sur les mutations)
      if (![401, 403].includes(res.status))
        leaks.push(`${key} → ${res.status}`);
    }
    expect(leaks).toEqual([]);
  });

  it('[AUDIT] GET /dexpay/status/:reference exige une session', async () => {
    const res = await request(ctx.http).get(`/api/dexpay/status/${FAKE_ID}`);
    expect([401, 403]).toContain(res.status);
  });

  it('aucune route GET ne plante (5xx) pour un administrateur avec des identifiants inexistants', async () => {
    const crashes: string[] = [];
    for (const r of routes.filter((x) => x.method === 'GET')) {
      const res = await admin.get(fill(r.path));
      if (res.status >= 500)
        crashes.push(
          `GET ${r.path} → ${res.status} ${JSON.stringify(res.body).slice(0, 120)}`,
        );
    }
    expect(crashes).toEqual([]);
  });

  it('aucune route GET ne plante (5xx) pour le super administrateur', async () => {
    const crashes: string[] = [];
    for (const r of routes.filter((x) => x.method === 'GET')) {
      const res = await superAdmin.get(fill(r.path));
      if (res.status >= 500)
        crashes.push(
          `GET ${r.path} → ${res.status} ${JSON.stringify(res.body).slice(0, 120)}`,
        );
    }
    expect(crashes).toEqual([]);
  });

  it('aucune route mutante ne plante (5xx) sur un corps vide : la validation doit renvoyer 4xx', async () => {
    const crashes: string[] = [];
    const skip = new Set(['POST /api/auth/logout']);
    for (const r of routes.filter((x) => x.method !== 'GET')) {
      const key = `${r.method} ${r.path}`;
      if (skip.has(key)) continue;
      const method = r.method.toLowerCase() as
        'post' | 'patch' | 'put' | 'delete';
      const res =
        method === 'delete'
          ? await admin.delete(fill(r.path))
          : await admin[method](fill(r.path), {});
      if (res.status >= 500)
        crashes.push(
          `${key} → ${res.status} ${JSON.stringify(res.body).slice(0, 120)}`,
        );
    }
    expect(crashes).toEqual([]);
  });

  it("en production, les réponses d'erreur ne divulguent pas de stack trace", async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const notFound = await admin.get(`/api/action-plans/${FAKE_ID}`);
      const crash = await admin.post('/api/auth/request-quote', {});
      for (const res of [notFound, crash]) {
        expect(res.body.stack).toBeUndefined();
        expect(JSON.stringify(res.body)).not.toMatch(/node_modules|\.ts:\d+/);
      }
    } finally {
      process.env.NODE_ENV = previous;
    }
  });
});
