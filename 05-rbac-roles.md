# RBAC — Rôles et permissions

## Rôles prévus

| Rôle | Responsabilité principale |
|---|---|
| Super administrateur | Gestion globale des organisations clientes (plateforme) |
| Administrateur de l'organisation | Paramétrage de l'espace de l'organisation |
| Coordonnateur / Directeur | Supervision générale |
| Responsable de projet / programme | Gestion des plans d'action |
| Chef de service | Suivi des activités de son service |
| Responsable d'activité | Mise à jour des activités et check-lists |
| Validateur | Contrôle et validation des activités |
| Responsable financier | Suivi budgétaire |
| Utilisateur en lecture seule | Consultation des résultats |
| Auditeur / partenaire | Accès limité à certains rapports et justificatifs |

## Matrice de permissions (indicative)

| Action | Super admin | Admin org | Coordonnateur | Resp. projet | Chef service | Resp. activité | Validateur | Resp. financier | Lecture seule | Auditeur |
|---|---|---|---|---|---|---|---|---|---|---|
| Gérer les organisations | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gérer utilisateurs/rôles de son org | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Créer/modifier un plan d'action | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Créer/modifier une activité | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Mettre à jour check-list / statut activité | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Soumettre une activité pour validation | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Valider / rejeter une étape | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ (étape financière) | ❌ | ❌ |
| Saisir/modifier données budgétaires | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Consulter tableaux de bord | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (limité) |
| Télécharger documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (limité) |
| Générer/exporter rapports | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ (limité) |

> Cette matrice est un point de départ. À affiner avec le client ATAABA lors de la conception détaillée — notamment la portée exacte de "Auditeur / partenaire" (quels rapports, quelles activités).

## Implémentation technique recommandée

- Stocker les permissions sous forme de tableau de chaînes dans `Role.permissions` (ex. `["plan.create", "activity.validate.technical", "budget.edit"]`)
- Guard NestJS `@Permissions('plan.create')` sur chaque endpoint sensible
- Ne jamais se fier uniquement à l'affichage conditionnel côté frontend — le contrôle réel se fait côté API
- Le rôle **Auditeur/partenaire** doit avoir un scope additionnel (liste des plans/activités auxquels il a explicitement accès), pas seulement un rôle global
