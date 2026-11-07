# Tests automatisés — Planora360

Deux suites :

| Suite | Outil | Dossier | Ce qu'elle couvre |
|-------|-------|---------|-------------------|
| API | Jest + Supertest (+ socket.io-client) | `backend/test/` | Les 208 routes : auth, CSRF, parcours métier, passation, isolation entre organisations, rôles, webhook DexPay, fichiers, WebSocket |
| Écrans | Playwright | `frontend/e2e/` | Connexion, les 36 écrans (admin + super admin), création plan → axe → activité, droits par profil, isolation, affichage mobile |

Les tests marqués **`[AUDIT]`** décrivent le comportement attendu sur un défaut connu de l'audit :
ils échouent tant que le défaut n'est pas corrigé, puis passent au vert une fois corrigé.

## 1. Tests API

Ils démarrent l'application complète en mémoire (même config que `main.ts`) sur une **base dédiée,
vidée à chaque lancement**. Le nom de la base doit contenir `test` (garde-fou).

```bash
# Une seule fois : créer et migrer la base de test
createdb planora_test
cd backend
DATABASE_URL=postgresql://postgres@localhost:5432/planora_test npx prisma migrate deploy

# À chaque lancement
TEST_DATABASE_URL=postgresql://postgres@localhost:5432/planora_test npm run test:e2e

# Un seul fichier
TEST_DATABASE_URL=... npx jest --config test/jest-e2e.json test/tenant-isolation.e2e-spec.ts --runInBand --forceExit
```

| Fichier | Contenu |
|---------|---------|
| `auth.e2e-spec.ts` | login, cookies, session, refresh, CSRF, 2FA, inscription, rate limiting réel |
| `access-control.e2e-spec.ts` | balayage automatique de toutes les routes : sans session → 401/403 ; aucune route ne plante (5xx) |
| `core-flow.e2e-spec.ts` | plans, axes, activités, checklist, indicateurs, budgets, circuit de validation complet, rapports Excel/PDF, zones, PTA, recommandations, capitalisation, participants, administration |
| `passation.e2e-spec.ts` | fournisseurs, PPM, demandes d'achat, procédures, offres, commissions, contrats, numérotation multi-organisations |
| `tenant-isolation.e2e-spec.ts` | une organisation B tente 59 lectures/écritures + 20 suppressions sur les données de A |
| `security.e2e-spec.ts` | escalade de privilèges, modules sans contrôle de rôle, webhook DexPay, uploads, WebSocket, en-têtes, CORS |

Les services externes (Resend, PostHog, Sentry, Redis, Backblaze, DexPay) sont neutralisés via `test/setup/test-config.ts`.

## 2. Tests d'écran

Prérequis : backend sur `http://localhost:3000` et frontend sur `http://localhost:3001`,
branchés sur une base de **développement** (jamais la prod), avec le seed de base (`npx prisma db seed`).

```bash
# Frontend : pointer l'API directement sur le backend local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > frontend/.env.local

# Navigateur Playwright (une fois)
cd frontend && npx playwright install chromium

# Lancer (le global-setup crée les données "E2E ..." via backend/test/setup/seed-ui.ts)
npm run test:e2e
npm run test:e2e:report   # rapport HTML avec une capture de chaque écran
```

Variables : `E2E_BASE_URL`, `E2E_API_URL`, `E2E_DATABASE_URL`, `E2E_SKIP_SEED=1`,
`E2E_SUPERADMIN_EMAIL` / `E2E_SUPERADMIN_PASSWORD` (comptes du seed), `PW_CHROME_PATH` (Chrome déjà installé).

Le login étant limité à 5 tentatives par minute, la suite attend automatiquement la fin de la fenêtre
quand c'est nécessaire (compter ~6 minutes pour l'ensemble).

## 3. Migration de rattrapage

`backend/prisma/migrations/20260901000000_add_missing_zones_payments_billing` ajoute ce que `schema.prisma`
déclare mais qu'aucune migration ne créait (tables `geographic_zones`, `activity_zones`,
`organization_zone_configs`, `payments`, colonnes de facturation des organisations, valeurs
`PENDING_PAYMENT`, `PENDING_VERIFICATION`, `PENDING_APPROVAL`, `SUSPENDED` de `OrganizationStatus`).
Sans elle, `prisma migrate deploy` échoue sur une base neuve. Toutes ses instructions sont idempotentes
(`IF NOT EXISTS`), elle ne modifie rien sur une base déjà à jour.
