# PLANORA 360

**Plateforme intégrée de planification, suivi-évaluation, gestion financière et pilotage de la performance.**

> *« Planifiez. Suivez. Évaluez. Agissez. Performez. »*

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS v4, React Query, Recharts |
| Backend | NestJS, Prisma ORM |
| Base de données | PostgreSQL |
| Auth | JWT (access + refresh tokens), TOTP (2FA optionnel) |
| Landing | HTML statique (Tailwind CDN, Lenis smooth scroll) |

## Structure

```
ataaba-pilot/
├── frontend/
│   ├── src/
│   │   ├── app/              # Pages Next.js (App Router)
│   │   │   ├── auth/         # Connexion, inscription
│   │   │   ├── dashboard/    # Tableau de bord
│   │   │   ├── plans/        # Plans d'action
│   │   │   ├── activities/   # Activités
│   │   │   ├── indicators/   # Indicateurs de performance
│   │   │   ├── validations/  # Circuit de validation
│   │   │   ├── reports/      # Export de rapports
│   │   │   └── super-admin/  # Administration globale
│   │   └── lib/              # API client, types, utilitaires
│   └── public/
│       └── landing.html      # Landing page statique
└── backend/
    ├── src/
    │   ├── auth/             # Authentification, inscription
    │   ├── organizations/    # Gestion des organisations
    │   ├── action-plans/     # Plans d'action
    │   ├── activities/       # Activités & sous-activités & collaborateurs
    │   ├── indicators/       # Indicateurs de performance
    │   ├── documents/        # Upload & validation fichiers
    │   ├── validations/      # Circuit de validation
    │   ├── budgets/          # Suivi budgétaire
    │   ├── reports/          # Export Excel (xlsx)
    │   ├── notifications/    # Emails (Nodemailer)
    │   └── common/           # Guards, decorators, Prisma
    └── prisma/
        └── schema.prisma
```

## Démarrage

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

> Frontend : port 3001 — Backend : port 3000

## Fonctionnalités

### Accès & authentification
- **Landing page** — page publique en français, smooth scroll, bouton retour en haut
- **Inscription** — auto-inscription des organisations (statut PENDING), validation manuelle par le super admin
- **Connexion** — JWT avec refresh token, messages d'erreur explicites (compte en attente, refusé, inactif)
- **2FA** — authentification à deux facteurs via TOTP (Google Authenticator, Authy…)
- **Changement de mot de passe** — forcé à la première connexion pour les comptes créés par un admin

### Administration (super admin)
- **Organisations** — liste, création, approbation et refus des demandes d'inscription
- **Tableau de bord global** — KPIs multi-organisations, compteur de demandes en attente
- **Gestion des rôles** — attribution des permissions par organisation

### Pilotage
- **Plans d'action** — création multi-axes, suivi par statut (Brouillon, En cours, Terminé, Archivé), budget prévisionnel, résultats attendus
- **Activités** — gestion par axe, sous-activités, responsable, co-responsables multiples, priorité, dates, taux d'avancement, résultats attendus, statuts détaillés (En préparation, En attente, Suspendue, Validée, En retard…)
- **Indicateurs de performance** — cible / réalisé / valeur de base, taux d'atteinte, rattachement optionnel à une activité, indicateurs globaux ou par activité, KPIs : atteints ≥80%, en risque 50–79%, en retard <50%
- **Checklist** — items de validation par activité, responsables, dates, progression
- **Validations** — circuit multi-étapes (Soumission → Vérification hiérarchique → Validation technique → Validation administrative → Clôture)
- **Budget** — suivi par activité : prévu, engagé, décaissé, exécuté, source de financement

### Documents
- **Upload** — attachement de fichiers aux activités et aux items de checklist
- **Validation 4 couches** — taille (max 20 Mo) → whitelist d'extensions → magic bytes (`file-type`) → cohérence extension/contenu
- **Formats acceptés** — PDF, Word (doc/docx), Excel (xls/xlsx), PowerPoint (ppt/pptx), JPEG, PNG
- **Protection** — rejette les exécutables et fichiers malveillants déguisés en documents

### Rapports
- **Export Excel** — génération à la demande : activités, plans, budget, indicateurs de performance
- **4 types de rapport** — Activités, Plans d'action, Budget, Indicateurs

### Navigation & UX
- **Pagination numérique** — toutes les listes paginées côté serveur avec ellipsis, compteur "X–Y sur N" et navigation par page
- **Notifications toast** — feedback visuel pour toutes les actions (création, modification, suppression, erreurs)
- **Responsive mobile** — sidebar rétractable, tableaux adaptatifs, layouts fluides

### Notifications
- **Email de bienvenue** — envoi automatique des identifiants temporaires à la création d'un compte

## Sécurité

| Mécanisme | Détail |
|-----------|--------|
| Auth | JWT access (15 min) + refresh token en base |
| Guards | `JwtAuthGuard` sur toutes les routes protégées |
| Isolation des données | Chaque requête filtre par `organizationId` |
| 2FA | TOTP optionnel, secret chiffré en base |
| Documents | Magic bytes + whitelist + cohérence extension/MIME |
| Mots de passe | bcrypt (coût 12) |
| Inscription | Organisations en PENDING jusqu'à approbation manuelle |

## Rôles

| Rôle | Périmètre |
|------|-----------|
| Super Admin | Accès global, gestion de toutes les organisations |
| Administrateur | Gestion complète de son organisation |
| Responsable | Gestion de ses activités et plans |
| Lecteur | Consultation uniquement |
