# Architecture technique

## 1. Vue d'ensemble

```
┌─────────────────┐        ┌──────────────────┐        ┌────────────────┐
│   Next.js Web    │ <───>  │   NestJS API      │ <───>  │  PostgreSQL     │
│  (Tailwind CSS)  │  REST  │  (Prisma ORM)     │        │  (multi-tenant) │
└─────────────────┘        └──────────────────┘        └────────────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
              ┌────────────┐  ┌────────────┐  ┌──────────────┐
              │ Backblaze  │  │ SMTP /     │  │  Puppeteer / │
              │ B2 (docs)  │  │ Resend     │  │  ExcelJS     │
              └────────────┘  └────────────┘  └──────────────┘
```

## 2. Backend — NestJS

### 2.1 Arborescence proposée

```
src/
  auth/                 # login, refresh, 2FA, guards
  organizations/         # gestion des organisations (tenants)
  users/                 # utilisateurs + rôles
  action-plans/          # plans d'action
  activities/             # activités et sous-activités
  checklist/              # check-lists opérationnelles
  validations/            # circuit de validation, moteur d'états
  budgets/                # suivi budgétaire
  documents/              # gestion documentaire (Backblaze B2)
  dashboards/              # agrégations et KPIs
  reports/                 # génération PDF/Excel
  notifications/           # alertes email/SMS/WhatsApp
  common/
    guards/                # TenantGuard, RolesGuard
    interceptors/
    prisma/                # PrismaService + middleware multi-tenant
    decorators/            # @CurrentUser(), @CurrentOrg(), @Roles()
  main.ts
```

### 2.2 Isolation multi-tenant (point critique)

Toutes les tables métier portent une colonne `organizationId`. Un middleware Prisma intercepte **chaque requête** et injecte automatiquement le filtre `organizationId` correspondant à l'utilisateur connecté (récupéré depuis le JWT), afin qu'aucune requête ne puisse accidentellement retourner ou modifier des données d'une autre organisation.

Règle non négociable pour Claude Code : **aucune requête Prisma sur une table tenant-scoped ne doit être écrite sans passer par ce middleware ou sans filtre explicite `organizationId`.**

### 2.3 Authentification

- JWT (access token courte durée ~15 min) + refresh token (rotatif, stocké en base, révocable)
- 2FA via TOTP (compatible Google Authenticator) — activable par organisation ou par utilisateur
- Déconnexion automatique après inactivité (durée configurable par organisation)
- Politique de mots de passe configurable (longueur, complexité, expiration)

### 2.4 RBAC

Voir `05-rbac-roles.md` pour le détail. Le contrôle d'accès se fait via un `RolesGuard` + `PermissionsGuard` NestJS, jamais uniquement côté frontend.

## 3. Frontend — Next.js

- App Router, Server Components pour les vues de lecture (dashboards), Client Components pour les formulaires interactifs (check-lists dynamiques, éditeur de plan d'action)
- Tailwind CSS pour le design system, cohérent avec une charte personnalisable par organisation (logo, couleurs — cf. Formule Organisation)
- Librairie de graphiques pour les tableaux de bord (ex. Recharts)
- Gestion d'état serveur via React Query (cache, invalidation après mutation)

## 4. Base de données

PostgreSQL, schéma détaillé dans `03-schema-bdd.md`. Migrations gérées par Prisma Migrate.

## 5. Stockage documentaire

Backblaze B2, organisé par convention de clé :

```
{organizationId}/{planId}/{activityId}/{type}/{filename}
```

Accès aux fichiers via URLs signées à durée limitée (jamais d'accès public direct).

## 6. Notifications

- Email : SMTP transactionnel (Resend ou équivalent)
- SMS / WhatsApp Business : Twilio (option activable par organisation, formules Professionnelle+)
- Un job planifié (cron NestJS `@nestjs/schedule`) scanne quotidiennement : échéances proches, retards, dépassements budgétaires, validations en attente

## 7. Rapports automatisés

- PDF : rendu HTML (template) → Puppeteer → PDF
- Excel : ExcelJS, génération de classeurs avec feuilles multiples (activités, budget, indicateurs)
- Génération à la demande + génération planifiée (mensuelle/trimestrielle/annuelle) via cron

## 8. Sécurité

- HTTPS obligatoire (certificats via reverse proxy, ex. Caddy ou Nginx + Let's Encrypt)
- Chiffrement des données sensibles au repos (colonnes sensibles chiffrées applicativement si nécessaire)
- Sauvegardes automatiques PostgreSQL (pg_dump planifié + rétention)
- Journal des connexions et modifications (table `audit_log`)
- Conformité protection des données personnelles (minimisation, durée de conservation définie)

## 9. Déploiement

- Conteneurisation Docker (backend, frontend, reverse proxy)
- Base de données PostgreSQL managée ou sur serveur dédié selon la formule client (mutualisé pour Essentielle/Professionnelle/Organisation, dédié pour Formule sur mesure — cf. cahier des charges section 6.4)
- CI/CD simple (build + tests + déploiement) — à définir selon l'hébergeur choisi

## 10. Intégrations futures (Formule sur mesure)

Prévoir des connecteurs modulaires (pattern adaptateur) pour : Power BI, KoboToolbox, DHIS2, Google Workspace, Microsoft 365. Ne pas développer en Phase 1 — prévoir seulement des interfaces (ports) pour ne pas bloquer l'architecture.
