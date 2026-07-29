# ATAABA Pilot

Plateforme de gestion et de suivi des plans d'action — tableau de bord de pilotage institutionnel.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS v4, Recharts |
| Backend | NestJS, Prisma ORM |
| Base de données | PostgreSQL |
| Auth | JWT + TOTP (2FA) |

## Structure

```
ataaba-pilot/
├── frontend/   # Next.js — port 3001
└── backend/    # NestJS — port 3000
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

## Fonctionnalités

- **Tableau de bord** — KPIs, taux d'exécution physique et budgétaire, résumé financier
- **Plans d'action** — création, suivi multi-axes, budget prévisionnel
- **Activités** — gestion par axe, statuts (En cours, Validée, En retard…)
- **Validations** — circuit de validation des activités
- **Budget** — suivi financier par plan et par axe
- **RBAC** — rôles et permissions (Super admin, Admin, Responsable, Lecteur)
