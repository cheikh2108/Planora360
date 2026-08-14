# SPEC — Modules additionnels ActionPilot

> **Base** : ActionPilot (Action Pilot existant)  
> **Approche** : Extension modulaire — beaucoup existe déjà, on ajoute les nouveautés  
> **Sources** : 2 cahiers des charges (Gestion Activités/Paiements + Planification/S&E/Capitalisation)

---

## ✅ CE QUI EXISTE DÉJÀ (aucun dev)

| Besoin | Couvert par |
|--------|-------------|
| Gestion utilisateurs, rôles, permissions, traçabilité | RBAC + audit log |
| Gestion activités (statuts, responsable, budget, historique) | Module activities |
| Suivi indicateurs, tableaux/graphiques | Module indicateurs |
| Suivi budgétaire | Module budgets |
| Pièces justificatives, upload, validation | Module documents + validation |
| Rapports Excel/PDF/Word | En cours (PDF) |
| Alertes | Module notifications |
| Multi-projets / multi-organisations | Multi-tenant |

**→ ~50% du besoin déjà couvert**

---

## 🆕 À DÉVELOPPER (4 nouveaux modules)

### 1. MODULE PARTICIPANTS (Import Excel)

**Fonctionnalités :**
- Upload Excel : Prénom, Nom, Téléphone, Mode paiement, Montant
- Contrôles : champs obligatoires, format téléphone (+221), montant positif, doublons
- Aperçu + confirmation avant enregistrement

**Model Prisma :**
```prisma
model Participant {
  id            String   @id @default(cuid())
  activityId    String
  activity      Activity @relation(fields: [activityId], references: [id])
  
  firstName     String
  lastName      String
  phone         String
  paymentMode   String   // "WAVE" | "ORANGE_MONEY"
  amount        Float
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  payments      Payment[]
  
  @@unique([phone, activityId])
}
```

**Librairies :** `xlsx`

---

### 2. MODULE PAIEMENTS MOBILES (via agrégateur)

**Architecture :** Modèle B — Agrégateur de paiement (Paydunya, Wave Business API, etc.)

**Fonctionnement :**
- Client crée compte marchand chez agrégateur
- Client entre clés API dans ActionPilot (chiffrées, par tenant)
- ActionPilot appelle API : `initiatePayment(participant, montant, mode)`
- Journal transactions immutable

**Phase 1 (MVP) :** Paiement manuel assisté (export Excel/CSV)  
**Phase 2 :** Paiement automatique API + webhooks

**Models Prisma :**
```prisma
model Payment {
  id              String   @id @default(cuid())
  participantId   String
  participant     Participant @relation(fields: [participantId], references: [id])
  activityId      String
  activity        Activity @relation(fields: [activityId], references: [id])
  
  amount          Float
  paymentMode     String
  status          String   // "EN_ATTENTE" | "PAYE" | "ECHEC" | "ANNULE"
  
  externalRef     String?  // ID transaction agrégateur
  providerResponse Json?
  
  initiatedBy     String
  initiatedAt     DateTime @default(now())
  completedAt     DateTime?
  
  transactionLog  TransactionLog[]
}

model TransactionLog {
  id          String   @id @default(cuid())
  paymentId   String
  payment     Payment  @relation(fields: [paymentId], references: [id])
  
  status      String
  message     String?
  timestamp   DateTime @default(now())
  
  @@index([paymentId])
}

model OrganizationPaymentConfig {
  id                String @id @default(cuid())
  organizationId    String @unique
  
  aggregatorName    String
  apiKeyEncrypted   String
  apiSecretEncrypted String?
  merchantId        String?
  
  isActive          Boolean @default(false)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Sécurité :**
- Clés API chiffrées (AES-256)
- Jamais exposées au frontend
- Isolation par `organizationId`

---

### 3. MODULE CAPITALISATION

**Fonctionnalités :**
- Bibliothèque numérique (docs, PDFs, images)
- Fiches capitalisation : Titre, Contexte, Défis, Solutions, Résultats, Leçons
- Upload photos/vidéos
- Recherche + filtres (date, type, projet, tags)

**Models Prisma :**
```prisma
model CapitalizationRecord {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  
  type          String   // "BONNE_PRATIQUE" | "RECIT_CHANGEMENT" | "GUIDE"
  title         String
  context       String   @db.Text
  challenges    String   @db.Text
  solutions     String   @db.Text
  results       String   @db.Text
  lessons       String   @db.Text
  
  tags          String[]
  status        String   @default("BROUILLON")
  
  authorId      String
  author        User     @relation(fields: [authorId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  media         Media[]
}

model Media {
  id                    String @id @default(cuid())
  capitalizationId      String
  capitalization        CapitalizationRecord @relation(fields: [capitalizationId], references: [id])
  
  type                  String  // "PHOTO" | "VIDEO" | "DOCUMENT"
  filename              String
  url                   String  // Backblaze B2
  size                  Int
  
  uploadedAt            DateTime @default(now())
}
```

---

### 4. MODULE PLANIFICATION FORMALISÉE

**Fonctionnalités :**
- Plan de Travail Annuel (PTA) : Objectifs, Activités, Indicateurs, Budget, Timeline
- Matrice de résultats : Objectifs → Résultats → Indicateurs
- Validation hiérarchique

**Models Prisma :**
```prisma
model AnnualWorkPlan {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  
  year          Int
  title         String
  objectives    Json
  
  status        String   @default("BROUILLON")
  validatedBy   String?
  validatedAt   DateTime?
  
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  activities    Activity[]
}

model ResultsMatrix {
  id            String   @id @default(cuid())
  projectId     String   @unique
  project       Project  @relation(fields: [projectId], references: [id])
  
  data          Json     // Objectifs → Résultats → Indicateurs
  
  updatedAt     DateTime @updatedAt
}
```

---

## 🔧 ADAPTATIONS EXISTANT

### Nouveaux rôles

```typescript
enum Role {
  SUPER_ADMIN
  ADMIN
  USER
  
  // Nouveaux
  CHEF_PROJET
  GESTIONNAIRE_ACTIVITES
  SE                      // Suivi-Évaluation
  FINANCE_COMPTABLE
  SUPERVISEUR
  TERRAIN
  AUDITEUR               // Lecture seule
}
```

### Activity : nouveaux champs

```prisma
model Activity {
  // ... existants
  
  // Nouveaux
  type                  String?
  physicalExecutionRate Float?
  financialExecutionRate Float?
  
  participants          Participant[]
  payments              Payment[]
}
```

### Dashboard : nouveaux KPIs

```typescript
{
  nombreActivites: number
  montantTotalPaye: number
  paiementsEnAttente: number
  tauxCompletudePJ: number
  activitesEnRetard: number
}
```

---

## ⚠️ À CLARIFIER

1. Agrégateur de paiement : Lequel ?
2. Accès API : Compte marchand existant ou à créer ?
3. Cartographie : Simple points ou couches thématiques ?
4. Multilingue : Phase 1 ou 2 ?
