# Roadmap de développement — phases livrables

> Chaque phase doit être fonctionnelle et testable avant de passer à la suivante. Ne pas paralléliser les phases avec Claude Code — les traiter séquentiellement pour garder un contexte propre.

## Phase 0 — Socle technique
- Initialisation des repos (backend NestJS, frontend Next.js)
- Configuration PostgreSQL + Prisma + première migration (schéma de base)
- Configuration Docker (dev + prod)
- Mise en place du middleware multi-tenant (`organizationId`)
- CI basique (lint + build)

## Phase 1 — Authentification & organisations
- Inscription / connexion, JWT + refresh token
- 2FA (TOTP)
- CRUD Organisation (super admin uniquement)
- CRUD Utilisateur + attribution de rôle
- Guards RBAC (voir `05-rbac-roles.md`)

## Phase 2 — Plans d'action & activités
- CRUD Plan d'action (axes, objectifs, résultats attendus)
- CRUD Activités et sous-activités
- Gestion des statuts d'activité
- Affectation responsable/collaborateurs

## Phase 3 — Check-list & calcul d'exécution
- CRUD check-list par activité
- Calcul automatique du taux d'exécution
- Upload de pièces justificatives liées aux tâches

## Phase 4 — Circuit de validation
- Moteur de workflow à étapes (voir `06-workflow-validation.md`)
- Journal de traçabilité (audit log)
- Notifications de validation en attente

## Phase 5 — Suivi budgétaire
- CRUD budgets par activité
- Agrégations par projet/service/période/bailleur
- Calcul des taux d'exécution financière

## Phase 6 — Gestion documentaire
- Intégration Backblaze B2
- Upload/téléchargement sécurisé (URLs signées)
- Classement par plan/activité/période/type

## Phase 7 — Tableaux de bord
- Agrégations backend (KPIs)
- Composants de visualisation frontend (Recharts)
- Filtres multi-critères

## Phase 8 — Alertes & notifications
- Job planifié (cron) de détection des seuils (retards, échéances, dépassements)
- Envoi email (SMTP)
- Intégration SMS/WhatsApp (Twilio) — optionnelle, activable par organisation

## Phase 9 — Rapports automatisés
- Génération PDF (Puppeteer) : rapports mensuel/trimestriel/annuel
- Génération Excel (ExcelJS)
- Planification automatique des rapports périodiques

## Phase 10 — Commercialisation & feature-flags
- Gestion des formules d'abonnement (Essentielle/Professionnelle/Organisation/Sur mesure)
- Vérification des accès aux fonctionnalités selon la formule active
- Limites (nombre d'utilisateurs, nombre de plans actifs)

## Phase 11 — Durcissement sécurité & mise en production
- Politique de mots de passe, verrouillage après tentatives échouées
- Sauvegardes automatiques + procédure de restauration
- Déconnexion automatique après inactivité
- Revue de sécurité générale (cloisonnement multi-tenant, chiffrement)
- Déploiement production

## Phase 12 (optionnelle) — Intégrations sur mesure
- Connecteurs Power BI, KoboToolbox, DHIS2, Google Workspace, Microsoft 365
- À développer uniquement à la demande d'un client Formule sur mesure
