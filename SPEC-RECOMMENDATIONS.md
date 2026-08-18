# 📋 Spécifications Techniques - Module Suivi des Recommandations

**Projet** : PLANORA 360  
**Module** : Suivi des Recommandations (Recommendations Tracking)  
**Version** : 1.0  
**Date** : Août 2026  
**Statut** : Spécification technique

---

## 📌 TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Objectifs fonctionnels](#2-objectifs-fonctionnels)
3. [Modèle de données](#3-modèle-de-données)
4. [Workflow et statuts](#4-workflow-et-statuts)
5. [API Endpoints](#5-api-endpoints)
6. [Alertes et notifications](#6-alertes-et-notifications)
7. [Tableau de bord et indicateurs](#7-tableau-de-bord-et-indicateurs)
8. [Rôles et permissions](#8-rôles-et-permissions)
9. [Intégrations](#9-intégrations)
10. [Frontend - Écrans principaux](#10-frontend---écrans-principaux)
11. [Règles métier](#11-règles-métier)
12. [Plan d'implémentation](#12-plan-dimplémentation)

---

## 1. Vue d'ensemble

### 1.1 Finalité

Le module **Suivi des Recommandations** centralise et pilote toutes les recommandations issues de :
- Missions de supervision / visites terrain
- Audits internes/externes
- Évaluations de projet/programme
- Réunions de coordination
- Contrôles internes/qualité
- Revues budgétaires
- Observations de bailleurs/partenaires
- Inspections et vérifications de conformité

### 1.2 Valeur ajoutée

✅ **Traçabilité complète** : de l'émission à la clôture  
✅ **Responsabilisation** : affectation claire et échéances formalisées  
✅ **Automatisation** : alertes, relances et escalades  
✅ **Mesure** : taux de mise en œuvre, délais, récurrences  
✅ **Redevabilité** : rapports exploitables pour direction/partenaires

### 1.3 Résultat attendu

> **Aucune recommandation importante ne doit rester sans responsable, sans échéance, sans preuve de suivi ou sans décision de clôture.**

---

## 2. Objectifs fonctionnels

| Objectif | Description |
| --- | --- |
| **Centralisation** | Fini les recommandations perdues dans Excel/emails/CR |
| **Responsabilisation** | Chaque recommandation a un responsable et une échéance |
| **Automatisation** | Alertes avant échéance + relances en cas de retard |
| **Mesure** | Taux de réalisation, délais moyens, récurrences |
| **Reporting** | Tableaux de bord et exports pour direction/partenaires |

---

## 3. Modèle de données

### 3.1 Schema Prisma

```prisma
// ========================================
// ENUMS
// ========================================

enum RecommendationSource {
  SUPERVISION_MISSION    // Mission de supervision
  FIELD_VISIT           // Visite de terrain
  INTERNAL_AUDIT        // Audit interne
  EXTERNAL_AUDIT        // Audit externe
  PROJECT_EVALUATION    // Évaluation de projet
  PROGRAM_EVALUATION    // Évaluation de programme
  COORDINATION_MEETING  // Réunion de coordination
  PERFORMANCE_REVIEW    // Revue de performance
  INTERNAL_CONTROL      // Contrôle interne
  QUALITY_CONTROL       // Contrôle qualité
  BUDGET_REVIEW         // Revue budgétaire
  FINANCIAL_REVIEW      // Revue financière
  DONOR_OBSERVATION     // Observation bailleur
  PARTNER_OBSERVATION   // Observation partenaire
  GOVERNANCE_REVIEW     // Revue gouvernance
  INSPECTION            // Inspection
  DOCUMENT_REVIEW       // Revue documentaire
  COMPLIANCE_CHECK      // Vérification conformité
  OTHER                 // Autre (paramétrable)
}

enum RecommendationPriority {
  CRITICAL  // Critique
  HIGH      // Élevée
  MEDIUM    // Moyenne
  LOW       // Faible
}

enum RecommendationStatus {
  NOT_STARTED              // Non démarrée
  IN_PROGRESS              // En cours
  PARTIALLY_IMPLEMENTED    // Partiellement mise en œuvre
  COMPLETED_PENDING_VALIDATION // Réalisée - à valider
  OVERDUE                  // En retard
  SUSPENDED                // Suspendue
  VALIDATED                // Clôturée (validée)
  REOPENED                 // Réouverte
}

// ========================================
// TABLES
// ========================================

model Recommendation {
  id                String                    @id @default(cuid())
  code              String                    @unique  // Code auto-généré (ex: REC-2026-001)
  
  // Identification
  title             String                    // Intitulé synthétique
  description       String                    @db.Text // Détail du constat/problème
  
  // Source
  source            RecommendationSource
  sourceReference   String?                   // Référence de la source (ex: mission, rapport)
  sourceDocumentUrl String?                   // Lien vers document source
  
  // Rattachements
  actionPlanId      String?
  actionPlan        ActionPlan?               @relation(fields: [actionPlanId], references: [id])
  activityId        String?
  activity          Activity?                 @relation(fields: [activityId], references: [id])
  organizationId    String
  organization      Organization              @relation(fields: [organizationId], references: [id])
  
  // Dates
  issuedAt          DateTime                  // Date d'émission
  dueDate           DateTime                  // Échéance
  completedAt       DateTime?                 // Date de réalisation
  validatedAt       DateTime?                 // Date de validation/clôture
  
  // Acteurs
  issuerId          String?                   // Émetteur
  issuer            User?                     @relation("RecommendationIssuer", fields: [issuerId], references: [id])
  issuerExternal    String?                   // Émetteur externe (si hors plateforme)
  
  responsibleId     String                    // Responsable principal
  responsible       User                      @relation("RecommendationResponsible", fields: [responsibleId], references: [id])
  
  validatorId       String?                   // Valideur
  validator         User?                     @relation("RecommendationValidator", fields: [validatorId], references: [id])
  
  createdById       String                    // Créateur dans la plateforme
  createdBy         User                      @relation("RecommendationCreator", fields: [createdById], references: [id])
  
  // Contributeurs
  contributors      RecommendationContributor[]
  
  // Suivi
  priority          RecommendationPriority
  status            RecommendationStatus      @default(NOT_STARTED)
  progress          Int                       @default(0) // 0-100%
  
  // Actions et preuves
  actions           RecommendationAction[]
  evidences         RecommendationEvidence[]
  comments          RecommendationComment[]
  
  // Gestion des retards/suspensions
  suspendedReason   String?                   @db.Text
  suspendedAt       DateTime?
  suspendedBy       String?
  
  reopenedReason    String?                   @db.Text
  reopenedAt        DateTime?
  reopenedBy        String?
  
  // Historique
  history           RecommendationHistory[]
  
  // Métadonnées
  isRecurrent       Boolean                   @default(false) // Détectée comme récurrente
  recurrenceNote    String?                   @db.Text
  
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt
  
  @@index([organizationId])
  @@index([actionPlanId])
  @@index([activityId])
  @@index([responsibleId])
  @@index([status])
  @@index([priority])
  @@index([dueDate])
  @@index([source])
}

model RecommendationContributor {
  id                String         @id @default(cuid())
  recommendationId  String
  recommendation    Recommendation @relation(fields: [recommendationId], references: [id], onDelete: Cascade)
  userId            String
  user              User           @relation(fields: [userId], references: [id])
  role              String?        // Rôle du contributeur (optionnel)
  createdAt         DateTime       @default(now())
  
  @@unique([recommendationId, userId])
  @@index([recommendationId])
  @@index([userId])
}

model RecommendationAction {
  id                String         @id @default(cuid())
  recommendationId  String
  recommendation    Recommendation @relation(fields: [recommendationId], references: [id], onDelete: Cascade)
  
  title             String
  description       String?        @db.Text
  dueDate           DateTime?
  completedAt       DateTime?
  responsibleId     String?
  responsible       User?          @relation(fields: [responsibleId], references: [id])
  
  status            String         @default("NOT_STARTED") // NOT_STARTED, IN_PROGRESS, COMPLETED
  order             Int            @default(0)
  
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  @@index([recommendationId])
  @@index([responsibleId])
}

model RecommendationEvidence {
  id                String         @id @default(cuid())
  recommendationId  String
  recommendation    Recommendation @relation(fields: [recommendationId], references: [id], onDelete: Cascade)
  
  fileName          String
  fileUrl           String         // URL Backblaze B2
  fileSize          Int
  mimeType          String
  description       String?
  
  uploadedById      String
  uploadedBy        User           @relation(fields: [uploadedById], references: [id])
  uploadedAt        DateTime       @default(now())
  
  @@index([recommendationId])
  @@index([uploadedById])
}

model RecommendationComment {
  id                String         @id @default(cuid())
  recommendationId  String
  recommendation    Recommendation @relation(fields: [recommendationId], references: [id], onDelete: Cascade)
  
  content           String         @db.Text
  isImportant       Boolean        @default(false) // Commentaire important (déclenche notification)
  
  authorId          String
  author            User           @relation(fields: [authorId], references: [id])
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  @@index([recommendationId])
  @@index([authorId])
}

model RecommendationHistory {
  id                String         @id @default(cuid())
  recommendationId  String
  recommendation    Recommendation @relation(fields: [recommendationId], references: [id], onDelete: Cascade)
  
  action            String         // CREATE, UPDATE_STATUS, UPDATE_PROGRESS, ASSIGN, REASSIGN, SUSPEND, REOPEN, SUBMIT_VALIDATION, VALIDATE, REJECT, etc.
  field             String?        // Champ modifié (si applicable)
  oldValue          String?        @db.Text
  newValue          String?        @db.Text
  comment           String?        @db.Text // Justification (obligatoire pour certaines actions)
  
  userId            String
  user              User           @relation(fields: [userId], references: [id])
  createdAt         DateTime       @default(now())
  
  @@index([recommendationId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

// ========================================
// RELATIONS AVEC MODÈLES EXISTANTS
// ========================================

model User {
  // ... champs existants ...
  
  recommendationsIssued       Recommendation[] @relation("RecommendationIssuer")
  recommendationsResponsible  Recommendation[] @relation("RecommendationResponsible")
  recommendationsValidated    Recommendation[] @relation("RecommendationValidator")
  recommendationsCreated      Recommendation[] @relation("RecommendationCreator")
  
  recommendationContributions RecommendationContributor[]
  recommendationActions       RecommendationAction[]
  recommendationEvidences     RecommendationEvidence[]
  recommendationComments      RecommendationComment[]
  recommendationHistory       RecommendationHistory[]
}

model Organization {
  // ... champs existants ...
  
  recommendations             Recommendation[]
}

model ActionPlan {
  // ... champs existants ...
  
  recommendations             Recommendation[]
}

model Activity {
  // ... champs existants ...
  
  recommendations             Recommendation[]
}
```

---

## 4. Workflow et statuts

### 4.1 Diagramme de workflow

```
┌─────────────────┐
│  NON_DEMARREE   │ ─────┐
└─────────────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│    EN_COURS     │      │
└─────────────────┘      │
         │               │
         ▼               │
┌─────────────────────────────┐
│ PARTIELLEMENT_MISE_EN_ŒUVRE │
└─────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ REALISEE_A_VALIDER           │
└──────────────────────────────┘
         │
         ├──► VALIDEE (clôturée) ──┐
         │                         │
         └──► DEMANDE COMPLEMENTS  │
                     │              │
                     ▼              │
              ┌─────────────┐       │
              │  ROUVERTE   │ ◄─────┘
              └─────────────┘
                     │
                     └──► retour EN_COURS

┌─────────────────┐
│   EN_RETARD     │ (statut calculé automatiquement si dueDate < now() && status != VALIDEE)
└─────────────────┘

┌─────────────────┐
│   SUSPENDUE     │ (temporaire avec justification)
└─────────────────┘
```

### 4.2 Règles de transition

| Depuis | Vers | Condition | Acteur autorisé |
| --- | --- | --- | --- |
| `NOT_STARTED` | `IN_PROGRESS` | Aucune | Responsable, Contributeur |
| `IN_PROGRESS` | `PARTIALLY_IMPLEMENTED` | progress ≥ 50% | Responsable |
| `IN_PROGRESS` | `COMPLETED_PENDING_VALIDATION` | progress = 100% + preuves | Responsable |
| `PARTIALLY_IMPLEMENTED` | `COMPLETED_PENDING_VALIDATION` | progress = 100% + preuves | Responsable |
| `COMPLETED_PENDING_VALIDATION` | `VALIDATED` | Validation OK | Validateur |
| `COMPLETED_PENDING_VALIDATION` | `IN_PROGRESS` | Rejet / demande compléments | Validateur |
| `*` | `SUSPENDED` | Avec justification | Responsable, Manager |
| `SUSPENDED` | `IN_PROGRESS` | Reprise | Responsable, Manager |
| `VALIDATED` | `REOPENED` | Avec justification | Manager, Admin |
| `*` | `OVERDUE` | Automatique si dueDate passée | Système |

---

## 5. API Endpoints

### 5.1 CRUD Recommandations

```typescript
// ========================================
// CREATE
// ========================================
POST   /api/recommendations
Body: {
  title: string
  description: string
  source: RecommendationSource
  sourceReference?: string
  sourceDocumentUrl?: string
  actionPlanId?: string
  activityId?: string
  issuedAt: string (ISO date)
  dueDate: string (ISO date)
  issuerId?: string
  issuerExternal?: string
  responsibleId: string
  priority: RecommendationPriority
  contributorIds?: string[]
}
Response: Recommendation

// ========================================
// READ
// ========================================
GET    /api/recommendations
Query: {
  page?: number
  limit?: number
  search?: string
  source?: RecommendationSource
  status?: RecommendationStatus
  priority?: RecommendationPriority
  responsibleId?: string
  actionPlanId?: string
  activityId?: string
  dueDateFrom?: string
  dueDateTo?: string
  isOverdue?: boolean
  isCritical?: boolean
}
Response: { data: Recommendation[], total: number, page: number, limit: number }

GET    /api/recommendations/:id
Response: Recommendation (avec relations: actions, evidences, comments, history)

GET    /api/recommendations/my
Response: Recommendation[] (recommandations dont l'user est responsable ou contributeur)

GET    /api/recommendations/pending-validation
Response: Recommendation[] (statut = COMPLETED_PENDING_VALIDATION pour validateurs)

GET    /api/recommendations/overdue
Response: Recommendation[] (en retard)

GET    /api/recommendations/critical
Response: Recommendation[] (priority = CRITICAL && status != VALIDATED)

// ========================================
// UPDATE
// ========================================
PATCH  /api/recommendations/:id
Body: {
  title?: string
  description?: string
  dueDate?: string
  responsibleId?: string
  priority?: RecommendationPriority
  progress?: number (0-100)
  // ... autres champs modifiables
}
Response: Recommendation

PATCH  /api/recommendations/:id/status
Body: {
  status: RecommendationStatus
  comment?: string (obligatoire pour SUSPENDED, REOPENED)
}
Response: Recommendation

PATCH  /api/recommendations/:id/submit-validation
Response: Recommendation (statut -> COMPLETED_PENDING_VALIDATION)

PATCH  /api/recommendations/:id/validate
Body: {
  approved: boolean
  comment?: string
}
Response: Recommendation (si approved -> VALIDATED, sinon -> IN_PROGRESS)

PATCH  /api/recommendations/:id/suspend
Body: {
  reason: string (obligatoire)
}
Response: Recommendation

PATCH  /api/recommendations/:id/reopen
Body: {
  reason: string (obligatoire)
}
Response: Recommendation

// ========================================
// DELETE
// ========================================
DELETE /api/recommendations/:id
Response: 204 No Content
```

### 5.2 Actions

```typescript
POST   /api/recommendations/:id/actions
Body: {
  title: string
  description?: string
  dueDate?: string
  responsibleId?: string
}
Response: RecommendationAction

GET    /api/recommendations/:id/actions
Response: RecommendationAction[]

PATCH  /api/recommendations/:id/actions/:actionId
Body: { title?, description?, dueDate?, responsibleId?, status?, completedAt? }
Response: RecommendationAction

DELETE /api/recommendations/:id/actions/:actionId
Response: 204
```

### 5.3 Preuves (Evidences)

```typescript
POST   /api/recommendations/:id/evidences
Body: FormData (file + description)
Response: RecommendationEvidence

GET    /api/recommendations/:id/evidences
Response: RecommendationEvidence[]

DELETE /api/recommendations/:id/evidences/:evidenceId
Response: 204
```

### 5.4 Commentaires

```typescript
POST   /api/recommendations/:id/comments
Body: {
  content: string
  isImportant: boolean
}
Response: RecommendationComment

GET    /api/recommendations/:id/comments
Response: RecommendationComment[]

PATCH  /api/recommendations/:id/comments/:commentId
Body: { content: string }
Response: RecommendationComment

DELETE /api/recommendations/:id/comments/:commentId
Response: 204
```

### 5.5 Historique

```typescript
GET    /api/recommendations/:id/history
Response: RecommendationHistory[]
```

### 5.6 Statistiques & Dashboard

```typescript
GET    /api/recommendations/stats
Query: {
  actionPlanId?: string
  activityId?: string
  responsibleId?: string
  dateFrom?: string
  dateTo?: string
}
Response: {
  total: number
  byStatus: { status: string, count: number }[]
  byPriority: { priority: string, count: number }[]
  bySource: { source: string, count: number }[]
  realizationRate: number (%)
  overdueRate: number (%)
  avgImplementationDays: number
  criticalOpen: number
  closedOnTime: number
  closedLate: number
  recurrentCount: number
}

GET    /api/recommendations/stats/by-responsible
Response: {
  responsibleId: string
  responsible: { firstName, lastName, email }
  total: number
  completed: number
  overdue: number
  avgProgress: number
}[]

GET    /api/recommendations/stats/by-project
Response: {
  actionPlanId: string
  actionPlan: { title }
  total: number
  completed: number
  overdue: number
  realizationRate: number
}[]
```

---

## 6. Alertes et notifications

### 6.1 Types d'alertes

| Événement | Destinataire | Déclencheur |
| --- | --- | --- |
| **Nouvelle recommandation affectée** | Responsable + Contributeurs | CREATE |
| **Rappel avant échéance** | Responsable | J-15, J-7, J-3, J-1 (paramétrable) |
| **Recommandation en retard** | Responsable | dueDate < now() && status != VALIDEE |
| **Relance périodique** | Responsable | Tous les X jours si toujours en retard |
| **Escalade** | Manager / Superviseur | Retard > Y jours (paramétrable) |
| **Soumise pour validation** | Validateur | Status -> COMPLETED_PENDING_VALIDATION |
| **Validée / Rejetée** | Responsable | Décision du validateur |
| **Commentaire important** | Responsable + Contributeurs | isImportant = true |
| **Réouverture** | Responsable | Status -> REOPENED |
| **Changement de responsable** | Ancien + Nouveau responsable | responsibleId modifié |

### 6.2 Configuration des alertes

Table de configuration (à ajouter dans Prisma) :

```prisma
model RecommendationAlertConfig {
  id                      String   @id @default(cuid())
  organizationId          String   @unique
  organization            Organization @relation(fields: [organizationId], references: [id])
  
  // Rappels avant échéance
  reminderDaysBefore      Int[]    @default([15, 7, 3, 1]) // J-15, J-7, J-3, J-1
  
  // Relances en retard
  overdueRelanceDays      Int      @default(3) // Relance tous les 3 jours
  
  // Escalade
  escaladeAfterDays       Int      @default(7) // Escalade après 7 jours de retard
  escaladeToRoles         String[] @default(["Administrateur", "Coordinateur"])
  
  // Notifications critiques
  notifyCriticalImmediate Boolean  @default(true)
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

---

## 7. Tableau de bord et indicateurs

### 7.1 Indicateurs clés (KPIs)

| Indicateur | Formule | Objectif |
| --- | --- | --- |
| **Taux de réalisation** | `(Clôturées / Total) × 100` | > 80% |
| **Taux de retard** | `(En retard / Actives) × 100` | < 10% |
| **Délai moyen de mise en œuvre** | `Σ(validatedAt - issuedAt) / Clôturées` | < 30 jours |
| **Recommandations critiques ouvertes** | `COUNT(priority=CRITICAL && status!=VALIDATED)` | 0 |
| **Taux de clôture dans les délais** | `(Clôturées avant dueDate / Total clôturées) × 100` | > 70% |

### 7.2 Graphiques du dashboard

1. **Répartition par statut** (Donut chart)
2. **Évolution mensuelle** (Line chart : créées vs clôturées)
3. **Top 10 responsables** (Bar chart : par taux de réalisation)
4. **Recommandations par source** (Bar chart horizontal)
5. **Recommandations par priorité** (Stacked bar chart)
6. **Délai moyen par projet** (Bar chart)
7. **Alertes actives** (Liste avec badge)

---

## 8. Rôles et permissions

### 8.1 Matrice des droits

| Action | Admin | Direction/Manager | Chef de projet | Responsable | Contributeur | Lecteur |
| --- | --- | --- | --- | --- | --- | --- |
| **Créer une recommandation** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Voir toutes les recommandations** | ✅ | ✅ (périmètre) | ✅ (projets) | ❌ | ❌ | ✅ (autorisées) |
| **Voir mes recommandations** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Modifier (responsable)** | ✅ | ✅ | ✅ | ✅ (siennes) | ❌ | ❌ |
| **Mettre à jour l'avancement** | ✅ | ✅ | ✅ | ✅ | ✅ (actions assignées) | ❌ |
| **Joindre des preuves** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Soumettre pour validation** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Valider / Rejeter** | ✅ | ✅ | ✅ (selon habilitation) | ❌ | ❌ | ❌ |
| **Suspendre** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Réouvrir** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Supprimer** | ✅ | ✅ (périmètre) | ❌ | ❌ | ❌ | ❌ |
| **Configurer alertes** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Exporter** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 8.2 Nouveaux rôles (optionnel)

- **Validateur de recommandations** : rôle spécifique pour la validation
- **Auditeur** : accès en lecture étendu pour contrôle

---

## 9. Intégrations

### 9.1 Avec modules existants

| Module | Intégration |
| --- | --- |
| **Projets / Action Plans** | Lier une recommandation à un plan d'action |
| **Activités** | Lier une recommandation à une activité spécifique |
| **Checklist** | Générer une recommandation depuis un item non conforme |
| **Suivi-évaluation** | Recommandations issues d'évaluations |
| **Suivi financier** | Lier à une ligne budgétaire / écart |
| **Notifications** | Utiliser le système d'alertes existant |
| **Rapports** | Inclure l'état des recommandations dans les rapports |
| **Audit** | Tracer toutes les modifications dans AuditLog |

### 9.2 Exemples d'intégration

#### Depuis une Checklist

```typescript
// Bouton "Créer une recommandation" sur un ChecklistItem non conforme
POST /api/recommendations
Body: {
  title: "Non-conformité : " + checklistItem.label,
  description: checklistItem.observations,
  source: "QUALITY_CONTROL",
  activityId: checklistItem.activityId,
  // ...
}
```

#### Depuis un Rapport d'évaluation

```typescript
// Section "Recommandations" dans le rapport
// Bouton "Créer dans le suivi"
POST /api/recommendations
Body: {
  title: "...",
  source: "PROJECT_EVALUATION",
  sourceReference: "Rapport Éval. 2026-Q2",
  actionPlanId: evaluation.actionPlanId,
  // ...
}
```

---

## 10. Frontend - Écrans principaux

### 10.1 Liste des recommandations

**Route** : `/recommendations`

**Composants** :
- Filtres (Source, Statut, Priorité, Responsable, Projet, Dates)
- Recherche plein texte
- Bouton "Créer une recommandation"
- Table avec colonnes :
  - Code
  - Intitulé
  - Source
  - Projet
  - Responsable
  - Priorité (badge coloré)
  - Statut (badge coloré)
  - Avancement (barre de progression)
  - Échéance (avec alerte si proche/dépassée)
  - Actions
- Pagination
- Export Excel/PDF

**Vues rapides** :
- 📋 Toutes
- 👤 Mes recommandations
- ⚠️ Critiques
- 🔴 En retard
- ⏳ À valider

---

### 10.2 Détail d'une recommandation

**Route** : `/recommendations/:id`

**Sections** :
1. **En-tête**
   - Code + Statut + Priorité
   - Boutons d'action (selon rôle) : Modifier, Suspendre, Soumettre validation, Valider, Réouvrir

2. **Informations générales**
   - Intitulé
   - Description
   - Source + Référence
   - Projet/Activité liés
   - Dates (émission, échéance, clôture)
   - Émetteur / Responsable / Validateur
   - Contributeurs

3. **Suivi**
   - Barre de progression (0-100%)
   - Champs pour mettre à jour l'avancement
   - Section Actions associées (sous-tâches)
     - Liste des actions avec statut
     - Bouton "Ajouter une action"

4. **Preuves**
   - Liste des fichiers uploadés (nom, date, auteur)
   - Bouton "Téléverser une preuve"
   - Prévisualisation des documents

5. **Commentaires**
   - Fil de discussion
   - Possibilité de marquer un commentaire comme "Important" (déclenche notification)

6. **Historique**
   - Timeline des modifications (qui, quand, quoi)

---

### 10.3 Formulaire Création/Édition

**Champs** :
- **Intitulé*** (text)
- **Description*** (textarea)
- **Source*** (select)
- **Référence source** (text)
- **Document source** (file upload URL)
- **Projet / Programme** (select - optionnel)
- **Activité** (select - optionnel, filtré par projet)
- **Date d'émission*** (date)
- **Émetteur** (select user ou text si externe)
- **Responsable principal*** (select user)
- **Contributeurs** (multi-select users)
- **Priorité*** (radio : Critique / Élevée / Moyenne / Faible)
- **Échéance*** (date)

---

### 10.4 Tableau de bord

**Route** : `/recommendations/dashboard`

**Sections** :
1. **KPIs en haut** (cards)
   - Total recommandations
   - Taux de réalisation
   - Taux de retard
   - Délai moyen
   - Critiques ouvertes

2. **Graphiques**
   - Donut : Répartition par statut
   - Line : Évolution mensuelle
   - Bar : Top responsables
   - Bar horizontal : Par source

3. **Alertes actives** (liste)
   - Échéances proches (J-7)
   - En retard
   - À valider

4. **Filtres globaux**
   - Par projet
   - Par période
   - Par responsable

---

### 10.5 Validation

**Route** : `/recommendations/pending-validation`

**Liste des recommandations** avec statut `COMPLETED_PENDING_VALIDATION`

**Actions pour chaque ligne** :
- **Valider** : ouvre modal
  - Confirmer la clôture
  - Commentaire optionnel
  - Bouton "Valider et clôturer"
  
- **Demander compléments** : ouvre modal
  - Commentaire obligatoire
  - Bouton "Renvoyer au responsable"
  - Statut repasse à `IN_PROGRESS`

---

## 11. Règles métier

### 11.1 Validation des données

```typescript
// Création
- title: required, min 10 caractères, max 200
- description: required, min 20 caractères
- source: required (enum)
- responsibleId: required, must exist in User
- dueDate: required, must be >= issuedAt
- priority: required (enum)
- issuedAt: required, default now()

// Soumission pour validation
- status must be IN_PROGRESS or PARTIALLY_IMPLEMENTED
- progress must be 100%
- at least 1 evidence required

// Validation
- only validator or admin can validate
- comment required if rejected

// Suspension
- reason required (min 20 caractères)

// Réouverture
- reason required (min 20 caractères)
- only manager/admin can reopen
```

### 11.2 Calcul automatique du statut `OVERDUE`

```typescript
// Exécuté par un CRON job quotidien
UPDATE Recommendation
SET status = 'OVERDUE'
WHERE dueDate < NOW()
  AND status NOT IN ('VALIDATED', 'SUSPENDED')
  AND status != 'OVERDUE'
```

### 11.3 Détection des recommandations récurrentes

```typescript
// Analyse sémantique (optionnel - phase 2)
// Si plusieurs recommandations avec des mots-clés similaires sur différents projets
// -> Marquer isRecurrent = true
// -> Notifier la direction pour action transverse
```

### 11.4 Règles d'escalade

```typescript
// Si recommandation CRITICAL + OVERDUE > 7 jours
// -> Notifier les rôles définis dans RecommendationAlertConfig.escaladeToRoles
```

---

## 12. Plan d'implémentation

### Phase 1 : Backend (Semaine 1-2)

**Sprint 1 - Base de données et CRUD**
- [ ] Créer le schema Prisma
- [ ] Générer la migration
- [ ] Créer le module NestJS `recommendations`
- [ ] Implémenter le service CRUD
- [ ] Implémenter le controller CRUD
- [ ] Ajouter les Guards et permissions
- [ ] Tests unitaires

**Sprint 2 - Workflow et logique métier**
- [ ] Implémenter les transitions de statut
- [ ] Implémenter les actions (sous-tâches)
- [ ] Implémenter les preuves (upload B2)
- [ ] Implémenter les commentaires
- [ ] Implémenter l'historique
- [ ] CRON job pour calcul statut OVERDUE
- [ ] Tests d'intégration

---

### Phase 2 : Notifications et Alertes (Semaine 3)

**Sprint 3 - Système d'alertes**
- [ ] Créer `RecommendationAlertConfig`
- [ ] Service de notifications (réutiliser `notifications.service.ts`)
- [ ] Implémentation des triggers :
  - [ ] Nouvelle recommandation
  - [ ] Rappels avant échéance
  - [ ] Alertes retard
  - [ ] Soumission validation
  - [ ] Validation/Rejet
  - [ ] Commentaire important
  - [ ] Réouverture
- [ ] CRON jobs pour relances périodiques
- [ ] Tests des notifications

---

### Phase 3 : Statistiques et Dashboard (Semaine 4)

**Sprint 4 - Analytics**
- [ ] Endpoint `/api/recommendations/stats`
- [ ] Endpoint `/api/recommendations/stats/by-responsible`
- [ ] Endpoint `/api/recommendations/stats/by-project`
- [ ] Calcul des KPIs
- [ ] Agrégation des données
- [ ] Tests des stats

---

### Phase 4 : Frontend (Semaine 5-7)

**Sprint 5 - Pages principales**
- [ ] Liste des recommandations
  - [ ] Filtres et recherche
  - [ ] Vues rapides (Mes reco, Critiques, En retard)
  - [ ] Export Excel/PDF
- [ ] Détail d'une recommandation
  - [ ] Affichage complet
  - [ ] Actions contextuelles
- [ ] Formulaire Création/Édition
  - [ ] Validation frontend
  - [ ] Upload de fichiers

**Sprint 6 - Workflow interactif**
- [ ] Section Suivi (progress, actions)
- [ ] Section Preuves (upload/download)
- [ ] Section Commentaires (fil de discussion)
- [ ] Section Historique (timeline)
- [ ] Boutons d'actions selon statut/rôle

**Sprint 7 - Dashboard et Validation**
- [ ] Dashboard avec KPIs
- [ ] Graphiques (recharts)
- [ ] Page de validation
- [ ] Intégrations avec modules existants
  - [ ] Lien depuis Checklist
  - [ ] Lien depuis Action Plans
  - [ ] Lien depuis Activities

---

### Phase 5 : Intégrations et Finalisation (Semaine 8)

**Sprint 8 - Intégrations**
- [ ] Génération depuis Checklist non conforme
- [ ] Inclusion dans rapports existants
- [ ] Lien bidirectionnel avec Action Plans/Activities
- [ ] Tests end-to-end

**Sprint 9 - Documentation et recette**
- [ ] Documentation API (Swagger)
- [ ] Guide utilisateur
- [ ] Tests de recette fonctionnelle
- [ ] Corrections et ajustements

---

## 13. Critères de recette

### 13.1 Tests fonctionnels obligatoires

- [ ] **REC-01** : Créer une recommandation et la lier à un projet
- [ ] **REC-02** : Affecter un responsable, des contributeurs, une priorité et une échéance
- [ ] **REC-03** : Mettre à jour le taux d'avancement (0 → 50 → 100%)
- [ ] **REC-04** : Joindre au moins 2 preuves (PDF + image)
- [ ] **REC-05** : Ajouter 3 actions associées avec échéances
- [ ] **REC-06** : Déclencher automatiquement le statut OVERDUE (simuler date passée)
- [ ] **REC-07** : Soumettre une recommandation réalisée à validation
- [ ] **REC-08** : Valider une recommandation et vérifier le statut VALIDATED
- [ ] **REC-09** : Rejeter une recommandation et vérifier le retour à IN_PROGRESS
- [ ] **REC-10** : Réouvrir une recommandation avec justification
- [ ] **REC-11** : Afficher les indicateurs du tableau de bord avec filtres
- [ ] **REC-12** : Produire un rapport Excel des recommandations
- [ ] **REC-13** : Produire un rapport PDF des recommandations
- [ ] **REC-14** : Garantir la traçabilité dans l'historique (10 actions minimum)
- [ ] **REC-15** : Intégration avec Action Plans (créer reco liée à un plan)
- [ ] **REC-16** : Intégration avec Activities (créer reco liée à une activité)
- [ ] **REC-17** : Intégration avec Checklist (générer reco depuis item non conforme)
- [ ] **REC-18** : Recevoir notification lors de l'affectation
- [ ] **REC-19** : Recevoir alerte J-7 avant échéance
- [ ] **REC-20** : Recevoir alerte de retard

### 13.2 Tests de performance

- [ ] Afficher une liste de 1000 recommandations en < 2s
- [ ] Charger le dashboard complet en < 3s
- [ ] Exporter 500 recommandations en Excel en < 5s

### 13.3 Tests de sécurité

- [ ] Un user ne peut voir que les recommandations de son organisation
- [ ] Un user ne peut modifier que les recommandations dont il est responsable (sauf admin/manager)
- [ ] Un validateur ne peut valider que les recommandations de son périmètre
- [ ] Les uploads de fichiers respectent les limites et types autorisés

---

## 14. Annexes

### 14.1 Exemples de codes générés

```
REC-2026-001
REC-2026-002
...
REC-2026-999
```

**Format** : `REC-{YEAR}-{SEQUENCE}`

### 14.2 Couleurs des badges

| Priorité | Couleur | Hex |
| --- | --- | --- |
| CRITICAL | Rouge | #DC2626 |
| HIGH | Orange | #EA580C |
| MEDIUM | Jaune | #CA8A04 |
| LOW | Vert | #16A34A |

| Statut | Couleur | Hex |
| --- | --- | --- |
| NOT_STARTED | Gris | #6B7280 |
| IN_PROGRESS | Bleu | #2563EB |
| PARTIALLY_IMPLEMENTED | Cyan | #0891B2 |
| COMPLETED_PENDING_VALIDATION | Violet | #7C3AED |
| OVERDUE | Rouge | #DC2626 |
| SUSPENDED | Orange | #F59E0B |
| VALIDATED | Vert | #16A34A |
| REOPENED | Jaune | #CA8A04 |

---

## 15. Contact et validation

**Équipe technique** :
- Backend Lead : [Nom]
- Frontend Lead : [Nom]
- Product Owner : [Nom]

**Date de validation** : _À compléter après revue_

**Statut du document** : ✅ Validé / ⏳ En attente de validation / ❌ À réviser

---

**Fin des spécifications techniques - Module Suivi des Recommandations**
