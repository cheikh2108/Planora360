# ATAABA Pilot

Plateforme de gestion et de suivi des plans d'action — tableau de bord de pilotage institutionnel pour organisations publiques et privées.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS v4, Recharts |
| Backend | NestJS, Prisma ORM |
| Base de données | PostgreSQL |
| Auth | JWT + TOTP (2FA) |
| Landing | HTML statique (Tailwind CDN, Lenis smooth scroll) |

## Structure

```
ataaba-pilot/
├── frontend/
│   ├── src/app/         # Pages Next.js (App Router)
│   └── public/
│       └── landing.html # Landing page statique
└── backend/             # NestJS — port 3000
```

## Démarrage

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

> Frontend : port 3001 — Backend : port 3000

## Fonctionnalités

- **Landing page** — page d'accueil publique, entièrement en français, smooth scroll Lenis
- **Inscription** — auto-inscription des organisations (statut PENDING), validation manuelle par le super admin
- **Tableau de bord** — KPIs, taux d'exécution physique et budgétaire, résumé financier
- **Plans d'action** — création, suivi multi-axes, budget prévisionnel
- **Activités** — gestion par axe, statuts (En cours, Validée, En retard…)
- **Validations** — circuit de validation des activités
- **Documents** — upload sécurisé avec vérification magic bytes (PDF, Word, Excel, images)
- **Budget** — suivi financier par plan et par axe
- **RBAC** — rôles et permissions (Super admin, Admin, Responsable, Lecteur)

## Sécurité documents

Les fichiers uploadés passent par 4 couches de validation :
1. Taille max 20 Mo
2. Whitelist d'extensions (pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, png)
3. Détection magic bytes (`file-type`) — rejette les exécutables déguisés
4. Cohérence extension ↔ contenu réel
