# ATAABA Pilot — Plateforme de pilotage des plans d'action

Ce dossier contient l'ensemble des spécifications nécessaires pour développer la plateforme avec **Claude Code**, de A à Z.

## Comment utiliser ce dossier

1. Ouvre ce dossier comme racine de projet dans Claude Code.
2. Demande à Claude Code de lire les fichiers dans l'ordre ci-dessous avant de commencer à coder.
3. Développe **phase par phase** (voir `04-phases-roadmap.md`) — ne pas tout attaquer en même temps.
4. À chaque nouvelle session Claude Code, redonne le contexte : "Lis 00 à 04 avant de continuer, on est à la phase X."

## Ordre de lecture recommandé

| Fichier                     | Contenu                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `00-README.md`              | Ce fichier — vue d'ensemble                                      |
| `01-architecture.md`        | Stack technique, choix structurants, arborescence des projets    |
| `02-cahier-des-charges.md`  | Spécifications fonctionnelles complètes (modules, règles métier) |
| `03-schema-bdd.md`          | Modèle de données Prisma (schéma complet)                        |
| `04-phases-roadmap.md`      | Découpage du développement en phases livrables                   |
| `05-rbac-roles.md`          | Rôles, permissions, matrice d'accès                              |
| `06-workflow-validation.md` | Circuit de validation des activités, moteur d'états              |

## Nom du produit

**ATAABA Pilot** — c'est le nom commercial retenu pour la plateforme. À utiliser dans le code (nom de repo, package.json, branding UI) et dans toute communication.

## Résumé du projet

Plateforme web **multi-organisations (SaaS)** permettant à des ONG, projets, programmes publics, collectivités et entreprises de planifier, exécuter, suivre et valider leurs plans d'action, avec tableaux de bord, alertes, gestion documentaire, suivi budgétaire et rapports automatisés.

**Positionnement** : solution autonome, multisectorielle, commercialisée par abonnement (4 formules : Essentielle, Professionnelle, Organisation, Sur mesure).

## Stack retenue

- **Backend** : NestJS + PostgreSQL + Prisma
- **Frontend** : Next.js + Tailwind CSS
- **Stockage fichiers** : Backblaze B2
- **Notifications** : Resend (email) + systeme de notification interne
- **Rapports** : Puppeteer (PDF), ExcelJS (Excel)
- **Auth** : JWT + refresh tokens + 2FA (TOTP)
- **Multi-tenant** : colonne `organizationId` + middleware Prisma d'isolation automatique

## Principe directeur pour Claude Code

À chaque fonctionnalité développée, vérifier systématiquement :

- Le filtrage par `organizationId` est bien appliqué (aucune fuite de données entre organisations)
- Les permissions RBAC sont vérifiées côté backend (jamais uniquement côté frontend)
- Toute action sensible (validation, modification de statut, suppression) est journalisée (traçabilité)
