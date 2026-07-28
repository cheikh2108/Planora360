# Cahier des charges fonctionnel

## 1. Objectif général

Permettre aux organisations clientes de suivre, en temps réel, l'exécution de leurs plans d'action et de prendre des décisions à partir de données fiables.

## 2. Objectifs spécifiques

- Concevoir et structurer plusieurs plans d'action
- Affecter les activités aux responsables concernés
- Définir une check-list pour chaque activité
- Suivre délais, budgets et niveaux d'exécution
- Centraliser les preuves et documents justificatifs
- Organiser le circuit de validation des activités
- Identifier les retards et points de blocage
- Générer automatiquement tableaux de bord et rapports
- Mesurer la performance des équipes, services et projets
- Assurer la traçabilité des actions réalisées

## 3. Module — Gestion des organisations

Chaque organisation (tenant) dispose d'un espace sécurisé et isolé comprenant :
- Logo et informations institutionnelles
- Directions, services, départements ou projets internes
- Utilisateurs
- Rôles et niveaux d'accès
- Plans d'action propres
- Tableaux de bord personnalisés

## 4. Module — Gestion des plans d'action

Création de plans annuels, trimestriels, mensuels ou spécifiques à un projet, avec :
- Intitulé
- Période de mise en œuvre (date début / fin)
- Objectifs stratégiques
- Résultats attendus
- Axes ou composantes
- Activités et sous-activités rattachées
- Responsables
- Échéances
- Indicateurs et cibles
- Budget prévisionnel global

## 5. Module — Gestion des activités

Pour chaque activité :
- Description
- Responsable principal
- Collaborateurs associés
- Date de début / date d'échéance
- Niveau de priorité
- Budget prévu / budget exécuté
- Résultats attendus
- Indicateurs concernés
- Risques et contraintes
- Statut d'avancement

**Statuts d'activité** : `non_demarree`, `en_preparation`, `en_cours`, `en_attente`, `suspendue`, `terminee`, `validee`, `en_retard`, `annulee`

## 6. Module — Check-list opérationnelle

Chaque activité possède une check-list de tâches, chacune avec :
- Libellé de la tâche
- Responsable
- Échéance
- Caractère obligatoire ou facultatif
- Niveau d'avancement
- Observations
- Pièces justificatives attendues
- Statut de validation

**Règle métier clé** : le taux d'exécution de l'activité est **calculé automatiquement** à partir des tâches réalisées et validées (pondération possible entre tâches obligatoires/facultatives — à trancher en phase de conception détaillée).

## 7. Module — Circuit de validation

Niveaux de validation configurables, dans l'ordre :
1. Soumission par le responsable de l'activité
2. Vérification par le supérieur hiérarchique / chef de projet
3. Validation technique
4. Validation administrative ou financière
5. Clôture définitive de l'activité

Toute validation, observation ou modification est enregistrée dans un **journal de traçabilité** immuable (voir `06-workflow-validation.md`).

## 8. Module — Suivi budgétaire

Comparaison, par activité/projet/service/période/bailleur/source de financement :
- Budget prévisionnel
- Budget engagé
- Budget décaissé
- Budget exécuté
- Solde disponible
- Taux d'exécution financière

## 9. Module — Gestion documentaire

Pièces jointes possibles : termes de référence, budgets, contrats, listes de présence, rapports, procès-verbaux, factures, photographies, livrables, documents de validation.

Classement par : plan, activité, période, type de pièce.

## 10. Module — Tableau de bord dynamique

Indicateurs affichés :
- Nombre total d'activités / réalisées / en cours / en retard
- Taux d'exécution physique et financière
- Performance par service / par responsable
- Prochaines échéances
- Activités critiques
- Résultats atteints vs cibles
- Principaux risques et blocages

Filtres disponibles : année, trimestre, mois, projet, programme, service, responsable, zone géographique, source de financement, statut.

## 11. Module — Alertes et notifications

Déclencheurs : échéances proches, activités en retard, tâches non réalisées, validations en attente, documents manquants, dépassements budgétaires, indicateurs sous cible, activités récemment terminées.

Canaux : tableau de bord interne, e-mail, SMS (option), WhatsApp Business (option).

## 12. Module — Rapports automatisés

Génération automatique de : rapport mensuel, trimestriel, annuel, par projet, par service, par responsable, des activités en retard, des recommandations, d'exécution budgétaire, tableau de suivi des indicateurs, chronogramme actualisé, matrice des risques.

Formats d'export : PDF, Word, Excel.

## 13. Sécurité et confidentialité (exigences non-fonctionnelles)

- Connexion HTTPS
- Authentification forte + 2FA
- Gestion des accès par rôle
- Cloisonnement des données entre organisations
- Chiffrement des données sensibles
- Sauvegardes automatiques
- Journal des connexions et modifications
- Déconnexion automatique après inactivité
- Politique de gestion des mots de passe
- Restauration des données en cas d'incident
- Hébergement cloud sécurisé
- Conformité protection des données personnelles

## 14. Modèle de commercialisation (impact sur le développement)

| Formule | Plans | Utilisateurs | Fonctionnalités incluses |
|---|---|---|---|
| Essentielle | 1 plan actif | ≤ 5 | Activités, check-lists, dashboard standard, alertes e-mail, exports PDF/Excel |
| Professionnelle | Plusieurs plans | ≤ 20 | + suivi budgétaire, circuits de validation, dashboards avancés, GED, rapports auto, alertes personnalisées |
| Organisation | Plusieurs plans | Élevé | + accès partenaires/bailleurs, intégrations externes, accompagnement, dashboards personnalisés |
| Sur mesure | — | — | Hébergement dédié, intégrations spécifiques (Power BI, Kobo, DHIS2, Google Workspace, M365), migration de données, maintenance annuelle |

**Implication technique** : le système de permissions/feature-flags doit être piloté par la formule d'abonnement de l'organisation (table `subscription_plan` + vérification des accès aux fonctionnalités selon la formule active).
