# Schéma de base de données (Prisma)

> Schéma de départ — à affiner en phase de conception détaillée. Sert de base de travail pour Claude Code.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum SubscriptionPlan {
  ESSENTIELLE
  PROFESSIONNELLE
  ORGANISATION
  SUR_MESURE
}

enum ActivityStatus {
  NON_DEMARREE
  EN_PREPARATION
  EN_COURS
  EN_ATTENTE
  SUSPENDUE
  TERMINEE
  VALIDEE
  EN_RETARD
  ANNULEE
}

enum ValidationStep {
  SOUMISSION
  VERIFICATION_HIERARCHIQUE
  VALIDATION_TECHNIQUE
  VALIDATION_ADMINISTRATIVE
  CLOTURE
}

enum ValidationDecision {
  APPROUVE
  REJETE
  EN_ATTENTE
}

model Organization {
  id               String            @id @default(cuid())
  name             String
  logoUrl          String?
  subscriptionPlan SubscriptionPlan  @default(ESSENTIELLE)
  createdAt        DateTime          @default(now())

  users            User[]
  actionPlans      ActionPlan[]
  auditLogs        AuditLog[]

  @@map("organizations")
}

model Role {
  id          String   @id @default(cuid())
  name        String   // super_admin, org_admin, coordinateur, resp_projet, chef_service, resp_activite, validateur, resp_financier, lecture_seule, auditeur
  permissions Json     // liste de permissions granulaires

  users       User[]

  @@map("roles")
}

model User {
  id              String        @id @default(cuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id])
  roleId          String
  role            Role          @relation(fields: [roleId], references: [id])
  email           String        @unique
  passwordHash    String
  twoFactorSecret String?
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())

  responsibleActivities Activity[]      @relation("ActivityResponsible")
  checklistItems         ChecklistItem[] @relation("ChecklistResponsible")

  @@index([organizationId])
  @@map("users")
}

model ActionPlan {
  id                String    @id @default(cuid())
  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id])
  title             String
  periodStart       DateTime
  periodEnd         DateTime
  strategicGoals    String?
  expectedResults    String?
  budgetPrevisional  Decimal?  @db.Decimal(14, 2)
  createdAt          DateTime  @default(now())

  axes              Axis[]

  @@index([organizationId])
  @@map("action_plans")
}

model Axis {
  id            String      @id @default(cuid())
  actionPlanId  String
  actionPlan    ActionPlan  @relation(fields: [actionPlanId], references: [id])
  title         String

  activities    Activity[]

  @@map("axes")
}

model Activity {
  id                String          @id @default(cuid())
  organizationId    String
  axisId            String
  axis              Axis            @relation(fields: [axisId], references: [id])
  parentActivityId  String?         // pour sous-activités
  title             String
  description       String?
  responsibleId     String
  responsible       User            @relation("ActivityResponsible", fields: [responsibleId], references: [id])
  startDate         DateTime
  dueDate           DateTime
  priority          String          // haute, moyenne, basse
  budgetPlanned     Decimal?        @db.Decimal(14, 2)
  budgetExecuted    Decimal?        @db.Decimal(14, 2)
  status            ActivityStatus  @default(NON_DEMARREE)
  completionRate    Float           @default(0) // calculé depuis checklist
  createdAt         DateTime        @default(now())

  checklistItems    ChecklistItem[]
  validations       Validation[]
  documents         Document[]

  @@index([organizationId])
  @@index([axisId])
  @@map("activities")
}

model ChecklistItem {
  id             String   @id @default(cuid())
  activityId     String
  activity       Activity @relation(fields: [activityId], references: [id])
  label          String
  responsibleId  String
  responsible    User     @relation("ChecklistResponsible", fields: [responsibleId], references: [id])
  dueDate        DateTime?
  isMandatory    Boolean  @default(true)
  progress       Float    @default(0)
  observations   String?
  isValidated    Boolean  @default(false)

  @@index([activityId])
  @@map("checklist_items")
}

model Validation {
  id           String              @id @default(cuid())
  activityId   String
  activity     Activity            @relation(fields: [activityId], references: [id])
  step         ValidationStep
  decision     ValidationDecision  @default(EN_ATTENTE)
  validatorId  String
  comment      String?
  createdAt    DateTime            @default(now())

  @@index([activityId])
  @@map("validations")
}

model Budget {
  id              String    @id @default(cuid())
  activityId      String
  planned         Decimal   @db.Decimal(14, 2)
  committed       Decimal   @db.Decimal(14, 2) @default(0)
  disbursed       Decimal   @db.Decimal(14, 2) @default(0)
  executed        Decimal   @db.Decimal(14, 2) @default(0)
  fundingSource   String?

  @@map("budgets")
}

model Document {
  id            String    @id @default(cuid())
  activityId    String
  activity      Activity  @relation(fields: [activityId], references: [id])
  type          String    // TDR, budget, contrat, facture, PV, photo, livrable...
  storageKey    String    // clé Backblaze B2
  fileName      String
  uploadedById  String
  createdAt     DateTime  @default(now())

  @@index([activityId])
  @@map("documents")
}

model AuditLog {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  userId         String
  action         String       // ex: "activity.status_changed", "validation.approved"
  entityType     String
  entityId       String
  metadata       Json?
  createdAt      DateTime     @default(now())

  @@index([organizationId])
  @@map("audit_logs")
}
```

## Notes de conception

- `completionRate` sur `Activity` est un champ dérivé, recalculé à chaque modification d'un `ChecklistItem` (job ou trigger applicatif, pas de trigger SQL pour rester portable).
- `AuditLog` est **append-only** — jamais de UPDATE ni DELETE côté applicatif.
- Les montants sont en `Decimal`, jamais en `Float`, pour éviter les erreurs d'arrondi budgétaire.
- Prévoir un index composite `(organizationId, status)` sur `Activity` pour accélérer les dashboards.
