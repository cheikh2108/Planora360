# Plan de développement — Ce soir

## 🎯 Modules à développer

1. ✅ **Module Participants** (import Excel) — 1-2h
2. ✅ **Module Capitalisation** — 2-3h
3. ✅ **Module Planification** (PTA) — 1-2h

**⏸️ Module Paiements** — reporté

---

## 📋 ÉTAPE 1 : PARTICIPANTS (commencer par ça)

### Backend

**1.1 Schema Prisma** (`backend/prisma/schema.prisma`)

```prisma
model Participant {
  id            String   @id @default(cuid())
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  activityId    String
  
  firstName     String
  lastName      String
  phone         String
  paymentMode   String   // "WAVE" | "ORANGE_MONEY"
  amount        Float
  
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([phone, activityId])
  @@index([organizationId])
  @@index([activityId])
}
```

**1.2 Module NestJS** (`backend/src/participants/`)

```bash
# Créer le module
cd backend
npm run nest g module participants
npm run nest g controller participants
npm run nest g service participants
```

**Fichiers à créer :**
- `participants.module.ts`
- `participants.controller.ts`
- `participants.service.ts`
- `dto/create-participant.dto.ts`
- `dto/import-participants.dto.ts`

**1.3 Installer dépendance**

```bash
cd backend
npm install xlsx
```

**1.4 Endpoints à créer**

```typescript
POST /participants/import      // Upload Excel + parsing
GET  /participants/activity/:activityId  // Liste par activité
DELETE /participants/:id       // Supprimer un participant
```

### Frontend

**1.5 Page import participants** (`frontend/src/app/participants/`)

```bash
# Structure
frontend/src/app/participants/
├── page.tsx                    # Liste + bouton import
├── import/
│   └── page.tsx               # Upload Excel + preview
└── components/
    ├── ParticipantsList.tsx
    ├── ImportForm.tsx
    └── PreviewTable.tsx
```

**Fonctionnalités :**
- Upload fichier Excel
- Preview données (tableau)
- Affichage erreurs (ligne par ligne)
- Bouton validation finale

---

## 📋 ÉTAPE 2 : CAPITALISATION

### Backend

**2.1 Schema Prisma**

```prisma
model CapitalizationRecord {
  id            String   @id @default(cuid())
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  type          String   // "BONNE_PRATIQUE" | "RECIT_CHANGEMENT" | "GUIDE"
  title         String
  context       String   @db.Text
  challenges    String   @db.Text
  solutions     String   @db.Text
  results       String   @db.Text
  lessons       String   @db.Text
  
  tags          String[]
  status        String   @default("BROUILLON") // "BROUILLON" | "PUBLIE"
  
  authorId      String
  author        Account  @relation(fields: [authorId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  media         Media[]
  
  @@index([organizationId])
  @@index([authorId])
}

model Media {
  id                    String @id @default(cuid())
  capitalizationId      String
  capitalization        CapitalizationRecord @relation(fields: [capitalizationId], references: [id], onDelete: Cascade)
  
  type                  String  // "PHOTO" | "VIDEO" | "DOCUMENT"
  filename              String
  url                   String  // Backblaze B2
  size                  Int
  
  uploadedAt            DateTime @default(now())
  
  @@index([capitalizationId])
}
```

**2.2 Module NestJS** (`backend/src/capitalization/`)

```bash
cd backend
npm run nest g module capitalization
npm run nest g controller capitalization
npm run nest g service capitalization
```

**Endpoints :**
```typescript
POST   /capitalization               // Créer fiche
GET    /capitalization               // Liste (filtres)
GET    /capitalization/:id           // Détail
PATCH  /capitalization/:id           // Modifier
DELETE /capitalization/:id           // Supprimer
POST   /capitalization/:id/media     // Upload média
```

### Frontend

**2.3 Pages capitalisation** (`frontend/src/app/capitalisation/`)

```bash
frontend/src/app/capitalisation/
├── page.tsx                    # Bibliothèque (liste + filtres)
├── new/
│   └── page.tsx               # Formulaire création
├── [id]/
│   ├── page.tsx               # Vue détail
│   └── edit/
│       └── page.tsx           # Édition
└── components/
    ├── CapitalizationCard.tsx
    ├── CapitalizationForm.tsx
    ├── MediaUpload.tsx
    └── FilterBar.tsx
```

---

## 📋 ÉTAPE 3 : PLANIFICATION (PTA)

### Backend

**3.1 Schema Prisma**

```prisma
model AnnualWorkPlan {
  id            String   @id @default(cuid())
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  year          Int
  title         String
  objectives    Json     // Structure flexible
  
  status        String   @default("BROUILLON") // "BROUILLON" | "VALIDE"
  validatedBy   String?
  validatedAt   DateTime?
  
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([organizationId])
  @@index([year])
}

model ResultsMatrix {
  id            String   @id @default(cuid())
  organizationId String   @unique
  organization  Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  data          Json     // Objectifs → Résultats → Indicateurs
  
  updatedAt     DateTime @updatedAt
}
```

**3.2 Module NestJS** (`backend/src/planning/`)

```bash
cd backend
npm run nest g module planning
npm run nest g controller planning
npm run nest g service planning
```

**Endpoints :**
```typescript
// PTA
POST   /planning/annual-work-plans
GET    /planning/annual-work-plans
GET    /planning/annual-work-plans/:id
PATCH  /planning/annual-work-plans/:id
PATCH  /planning/annual-work-plans/:id/validate

// Matrice résultats
GET    /planning/results-matrix
PATCH  /planning/results-matrix
```

### Frontend

**3.3 Pages planification** (`frontend/src/app/planning/`)

```bash
frontend/src/app/planning/
├── page.tsx                    # Liste PTA
├── new/
│   └── page.tsx               # Créer PTA
├── [id]/
│   └── page.tsx               # Voir/Éditer PTA
├── results-matrix/
│   └── page.tsx               # Matrice résultats
└── components/
    ├── PTAForm.tsx
    ├── ObjectivesList.tsx
    └── MatrixEditor.tsx
```

---

## ⚙️ ORDRE D'EXÉCUTION (pour ne rien casser)

### Phase 1 : Préparation (30 min)
1. ✅ Créer branche Git : `git checkout -b feature/modules-participants-capitalisation-planification`
2. ✅ Backup base de données actuelle
3. ✅ Commit état actuel

### Phase 2 : Backend (3-4h)
1. ✅ Ajouter models Prisma (Participant, CapitalizationRecord, Media, AnnualWorkPlan, ResultsMatrix)
2. ✅ `npx prisma generate`
3. ✅ `npx prisma migrate dev --name add_participants_capitalisation_planning`
4. ✅ Créer modules NestJS (participants, capitalisation, planning)
5. ✅ Implémenter services et controllers
6. ✅ Tester endpoints avec Postman/curl

### Phase 3 : Frontend (2-3h)
1. ✅ Créer pages participants
2. ✅ Créer pages capitalisation
3. ✅ Créer pages planification
4. ✅ Ajouter dans navigation (sidebar)

### Phase 4 : Test final (30 min)
1. ✅ Tester chaque module
2. ✅ Vérifier que l'existant fonctionne toujours
3. ✅ Commit + Push

---

## 🚨 RÈGLES POUR NE RIEN CASSER

1. **NE PAS toucher** :
   - ❌ Models existants (Organization, Account, Document)
   - ❌ Modules existants (auth, organizations, accounts, documents)
   - ❌ Pages frontend existantes

2. **TOUJOURS** :
   - ✅ Ajouter `organizationId` dans tous les nouveaux models
   - ✅ Ajouter `@@index([organizationId])` pour performance
   - ✅ Utiliser `onDelete: Cascade` dans les relations
   - ✅ Tester après chaque étape

3. **MIDDLEWARE Prisma** (déjà en place) :
   - ✅ Isolation automatique par `organizationId`
   - ✅ Pas besoin de changer le middleware existant

---

## 📝 CHECKLIST AVANT DE COMMENCER

- [ ] Git branch créée
- [ ] Backup base de données
- [ ] Backend en dev mode (`npm run start:dev`)
- [ ] Frontend en dev mode (`npm run dev`)
- [ ] Postman/curl prêt pour tester les APIs
- [ ] Café préparé ☕

---

## 🎯 OBJECTIF DE CE SOIR

**Minimum :**
- ✅ Participants : Backend + Frontend fonctionnels
- ✅ Capitalisation : Backend fonctionnel
- ✅ Planification : Schemas Prisma + migrations

**Optimal :**
- ✅ Les 3 modules : Backend + Frontend complets
- ✅ Tests basiques passent
- ✅ Commit + Push

**Stretch :**
- ✅ Navigation intégrée
- ✅ UI/UX polie
- ✅ Déployé sur staging

---

Prêt ? On commence par **Participants** (le plus simple) ! 🚀
