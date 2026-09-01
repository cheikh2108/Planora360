# PLANORA 360

**Plateforme intégrée de planification, suivi-évaluation, gestion financière et pilotage de la performance.**

> *« Planifiez. Suivez. Évaluez. Agissez. Performez. »*

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS v4, React Query, Recharts |
| Backend | NestJS, Prisma ORM |
| Base de données | PostgreSQL (Neon) |
| Auth | JWT httpOnly cookies + CSRF protection, TOTP (2FA optionnel) |
| Storage | Backblaze B2 (uploads, documents) |
| Messagerie | Socket.io (WebSocket temps réel) |
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
│   │   │   ├── passation/    # Passation de marchés (PPM, procédures, contrats)
│   │   │   ├── messagerie/   # Messagerie professionnelle temps réel
│   │   │   └── super-admin/  # Administration globale
│   │   └── lib/              # API client, types, utilitaires
│   └── public/
│       └── landing.html      # Landing page statique
└── backend/
    ├── src/
    │   ├── auth/             # Authentification, inscription, CSRF
    │   ├── organizations/    # Gestion des organisations
    │   ├── action-plans/     # Plans d'action
    │   ├── activities/       # Activités & sous-activités & collaborateurs
    │   ├── indicators/       # Indicateurs de performance
    │   ├── documents/        # Upload & validation fichiers
    │   ├── validations/      # Circuit de validation
    │   ├── budgets/          # Suivi budgétaire
    │   ├── reports/          # Export Excel (xlsx)
    │   ├── notifications/    # Emails (Nodemailer)
    │   ├── passation/        # Module passation de marchés
    │   │   ├── ppm/          # Plan de Passation des Marchés
    │   │   ├── demandes/     # Demandes d'achat
    │   │   ├── fournisseurs/ # Fournisseurs et évaluations
    │   │   ├── procedures/   # Procédures de consultation
    │   │   ├── soumissions/  # Soumissions/offres fournisseurs
    │   │   ├── commissions/  # Commissions d'évaluation
    │   │   ├── evaluations/  # Évaluations des offres
    │   │   └── contrats/     # Contrats, avenants, livrables, paiements
    │   ├── messagerie/       # Module messagerie professionnelle
    │   │   ├── conversations/ # Conversations contextuelles
    │   │   ├── messages/     # Messages, réactions, mentions
    │   │   └── gateway/      # WebSocket Gateway (Socket.io)
    │   ├── storage/          # Backblaze B2 storage service
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

### Forfaits & Limites

| Forfait | Prix mensuel | Utilisateurs | Projets | Cible |
|---------|--------------|--------------|---------|-------|
| **Individuel** | 10 000 FCFA | 1 | 3 | Consultants, chefs de projet |
| **Pro** | 25 000 FCFA | 3 | 10 | Petites structures, consultants |
| **Équipe** | 50 000 FCFA | 10 | 25 | PME, associations, cabinets |
| **Organisation** | 100 000 FCFA | 25 | 50 | ONG, programmes, entreprises |
| **Enterprise** | À partir de 250 000 FCFA | Illimité | Illimité | Institutions, grandes ONG |

- **Application des limites** : création d'utilisateur et de projets bloquée automatiquement si limite atteinte
- **Message d'upgrade** : affichage d'un message invitant à passer à un forfait supérieur

### Accès & authentification
- **Landing page** — page publique en français, smooth scroll, grille tarifaire 5 forfaits
- **Inscription** — auto-inscription avec sélection du forfait (statut PENDING), validation manuelle par le super admin
- **Connexion** — JWT httpOnly cookies + CSRF protection, messages d'erreur explicites (compte en attente, refusé, inactif)
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
- **Storage** — Backblaze B2 cloud storage avec URLs signées (sécurité)
- **Validation 4 couches** — taille (max 20 Mo) → whitelist d'extensions → magic bytes (`file-type`) → cohérence extension/contenu
- **Formats acceptés** — PDF, Word (doc/docx), Excel (xls/xlsx), PowerPoint (ppt/pptx), JPEG, PNG
- **Protection** — rejette les exécutables et fichiers malveillants déguisés en documents

### Passation de marchés
- **Plan de Passation des Marchés (PPM)** — création, validation, suivi annuel des lignes budgétaires
- **Demandes d'achat** — workflow de validation (demandeur → hiérarchie → technique → administratif → clôture)
- **Fournisseurs** — base de données, documents, évaluations, statuts (actif/suspendu/blacklisté)
- **Procédures** — consultations (AO, DC, GG, BC), publication, dossiers d'appel d'offres (DAO/TDR)
- **Soumissions** — dépôt d'offres par fournisseurs, confidentialité avant date d'ouverture
- **Commissions d'évaluation** — membres, grilles de notation, synthèses
- **Évaluations** — notation administrative, technique, financière, classement des offres
- **Contrats** — attribution, avenants, livrables, PV de réception, paiements, clôture
- **Traçabilité complète** — journal d'audit de toutes les opérations sensibles

### Messagerie professionnelle
- **Conversations contextuelles** — rattachées aux projets, activités, demandes, procédures, contrats
- **Temps réel** — WebSocket (Socket.io) pour messagerie instantanée
- **Messages** — texte, fichiers (max 10 Mo), mentions (@utilisateur), réponses en fil
- **Réactions** — emoji reactions sur messages
- **Typing indicators** — affichage "en train d'écrire..."
- **Statuts** — messages lus/non lus, épinglage, archivage, mute
- **Participants** — gestion des membres, rôles (admin/membre), ajout/retrait
- **Rate limiting** — 10 messages/minute, 5 fichiers/minute (protection anti-spam)

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
| Auth | JWT httpOnly cookies (protection XSS) + refresh token rotation |
| CSRF | Double-submit cookie pattern avec validation HMAC-SHA256 |
| Guards | `JwtAuthGuard`, `SubscriptionGuard`, `SoumissionConfidentialityGuard` |
| Isolation des données | Chaque requête filtre par `organizationId` |
| Forfaits | Validation automatique des limites utilisateurs/projets par forfait |
| 2FA | TOTP optionnel, secret chiffré en base |
| Documents | Magic bytes + whitelist + cohérence extension/MIME |
| Storage | Backblaze B2 avec URLs signées (expiration 1h) |
| Mots de passe | bcrypt (coût 12) |
| Inscription | Organisations en PENDING jusqu'à approbation manuelle |
| Passation | Soumissions confidentielles avant date d'ouverture |
| Messagerie | Rate limiting (10 msg/min, 5 fichiers/min) |
| Audit | Traçabilité complète (utilisateur, date, action, ancienne/nouvelle valeur) |

## Rôles

| Rôle | Périmètre |
|------|-----------|
| Super Admin | Accès global, gestion de toutes les organisations |
| Administrateur | Gestion complète de son organisation |
| Responsable | Gestion de ses activités et plans |
| Lecteur | Consultation uniquement |
