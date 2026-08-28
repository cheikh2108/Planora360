# Architecture Module Passation de Marchés

## Vue d'ensemble

Le module Passation de Marchés gère le cycle complet d'acquisition : PPM → Demande → Procédure → Évaluation → Attribution → Contrat → Exécution → Paiement → Clôture.

## Modèle de données (Prisma Schema)

### 1. Plan de Passation des Marchés (PPM)

```prisma
model PlanPassationMarche {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  year           Int          // Exercice budgétaire
  title          String
  projectId      String?
  project        ActionPlan?  @relation(fields: [projectId], references: [id])
  
  status         String       @default("BROUILLON") // BROUILLON | VALIDE | EN_COURS | CLOTURE
  validatedBy    String?
  validatedAt    DateTime?
  
  createdBy      String
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  lignes         LignePPM[]
  
  @@index([organizationId])
  @@index([year])
  @@index([projectId])
  @@map("plan_passation_marches")
}

model LignePPM {
  id                String               @id @default(cuid())
  ppmId             String
  ppm               PlanPassationMarche  @relation(fields: [ppmId], references: [id], onDelete: Cascade)
  
  reference         String               // Référence unique
  objet             String               // Description acquisition
  
  // Rattachements
  activityId        String?
  activity          Activity?            @relation(fields: [activityId], references: [id])
  
  // Budget
  montantEstimatif  Decimal              @db.Decimal(14, 2)
  sourceFinancement String?
  ligneBudgetaire   String?
  
  // Méthode et calendrier
  methodeProcedure  String               // ACHAT_DIRECT | CONSULTATION | APPEL_OFFRES_OUVERT | etc.
  
  dateLancement     DateTime?
  dateAttribution   DateTime?
  dateSignature     DateTime?
  dateExecution     DateTime?
  
  responsableId     String
  responsable       User                 @relation(fields: [responsableId], references: [id])
  
  status            String               @default("PREVISIONNEL") 
  // PREVISIONNEL | A_VALIDER | VALIDE | LANCE | EVALUATION | ATTRIBUE | CONTRACTUALISE | EXECUTE | CLOTURE | SUSPENDU | ANNULE
  
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
  
  demandeAchat      DemandeAchat?
  procedure         Procedure?
  
  @@index([ppmId])
  @@index([activityId])
  @@index([responsableId])
  @@index([status])
  @@map("lignes_ppm")
}
```

### 2. Demandes d'achat

```prisma
model DemandeAchat {
  id                String     @id @default(cuid())
  organizationId    String
  reference         String     @unique
  
  // Rattachements
  lignePPMId        String?    @unique
  lignePPM          LignePPM?  @relation(fields: [lignePPMId], references: [id])
  activityId        String?
  activity          Activity?  @relation(fields: [activityId], references: [id])
  
  // Contenu
  objet             String
  description       String     @db.Text
  justification     String     @db.Text
  quantite          Float?
  specifications    String?    @db.Text
  
  // Budget
  montantEstimatif  Decimal    @db.Decimal(14, 2)
  ligneBudgetaire   String?
  sourceFinancement String?
  
  // Planning
  echeanceSouhaitee DateTime?
  
  // Workflow
  status            String     @default("BROUILLON")
  // BROUILLON | SOUMISE | EN_VALIDATION | APPROUVEE | REJETEE | ANNULEE
  
  demandeurId       String
  demandeur         User       @relation("DemandeurAchat", fields: [demandeurId], references: [id])
  
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  
  validations       ValidationDemande[]
  documents         Document[]
  procedure         Procedure?
  
  @@index([organizationId])
  @@index([activityId])
  @@index([demandeurId])
  @@index([status])
  @@map("demandes_achat")
}

model ValidationDemande {
  id              String        @id @default(cuid())
  demandeId       String
  demande         DemandeAchat  @relation(fields: [demandeId], references: [id], onDelete: Cascade)
  
  etape           String        // CHEF_PROJET | FINANCE | RESPONSABLE_PASSATION | DIRECTION
  ordre           Int           // Ordre dans le workflow
  
  validateurId    String
  validateur      User          @relation(fields: [validateurId], references: [id])
  
  decision        String        @default("EN_ATTENTE") // EN_ATTENTE | APPROUVE | REJETE | RETOUR_CORRECTION
  commentaire     String?       @db.Text
  
  validatedAt     DateTime?
  createdAt       DateTime      @default(now())
  
  @@index([demandeId])
  @@index([validateurId])
  @@map("validations_demande")
}
```

### 3. Fournisseurs

```prisma
model Fournisseur {
  id                String     @id @default(cuid())
  organizationId    String
  
  // Identification
  raisonSociale     String
  identifiantFiscal String?
  registreCommerce  String?
  
  // Contact
  adresse           String?
  ville             String?
  pays              String     @default("Sénégal")
  telephone         String?
  email             String?
  siteWeb           String?
  
  // Contacts internes
  nomContact        String?
  prenomContact     String?
  fonctionContact   String?
  telephoneContact  String?
  emailContact      String?
  
  // Domaines et catégories
  domainesActivite  String[]   // Tags pour filtres rapides
  categoriesBiens   String[]
  zonesIntervention String[]
  
  // Statut
  status            String     @default("A_VALIDER") // A_VALIDER | ACTIF | SUSPENDU | BLACKLISTE | ARCHIVE
  
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  
  documents         FournisseurDocument[]
  soumissions       Soumission[]
  contrats          Contrat[]
  evaluations       EvaluationFournisseur[]
  
  @@index([organizationId])
  @@index([status])
  @@map("fournisseurs")
}

model FournisseurDocument {
  id            String      @id @default(cuid())
  fournisseurId String
  fournisseur   Fournisseur @relation(fields: [fournisseurId], references: [id], onDelete: Cascade)
  
  type          String      // PIECE_ADMIN | ATTESTATION | REFERENCE | DOCUMENT_BANCAIRE
  nom           String
  url           String
  fileSize      Int?
  mimeType      String?
  
  dateExpiration DateTime?
  
  uploadedAt    DateTime    @default(now())
  
  @@index([fournisseurId])
  @@map("fournisseur_documents")
}
```

### 4. Procédures de passation

```prisma
model Procedure {
  id                String        @id @default(cuid())
  organizationId    String
  reference         String        @unique
  
  // Rattachements
  demandeAchatId    String?       @unique
  demandeAchat      DemandeAchat? @relation(fields: [demandeAchatId], references: [id])
  lignePPMId        String?       @unique
  lignePPM          LignePPM?     @relation(fields: [lignePPMId], references: [id])
  
  // Type de procédure
  methode           String        // ACHAT_DIRECT | DEMANDE_COTATION | CONSULTATION_RESTREINTE | APPEL_OFFRES_OUVERT | etc.
  objet             String
  description       String        @db.Text
  
  // Budget
  montantEstimatif  Decimal       @db.Decimal(14, 2)
  
  // Calendrier
  datePublication   DateTime?
  dateLimite        DateTime?
  dateOuverture     DateTime?
  dateClarification DateTime?
  dateAttribution   DateTime?
  
  // Responsable
  responsableId     String
  responsable       User          @relation(fields: [responsableId], references: [id])
  
  // Statut
  status            String        @default("BROUILLON")
  // BROUILLON | PUBLIEE | EN_COURS | CLOTUREE_OFFRES | EVALUATION | ATTRIBUEE | INFRUCTUEUSE | ANNULEE
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  documents         DossierConsultation[]
  soumissions       Soumission[]
  commissions       Commission[]
  contrat           Contrat?
  
  @@index([organizationId])
  @@index([responsableId])
  @@index([status])
  @@map("procedures")
}

model DossierConsultation {
  id           String     @id @default(cuid())
  procedureId  String
  procedure    Procedure  @relation(fields: [procedureId], references: [id], onDelete: Cascade)
  
  type         String     // DAO | TDR | SPECIFICATIONS | MODELE_FINANCIER | PROJET_CONTRAT
  titre        String
  version      String     @default("1.0")
  
  documentUrl  String
  fileName     String
  fileSize     Int?
  
  uploadedBy   String
  uploadedAt   DateTime   @default(now())
  
  @@index([procedureId])
  @@map("dossier_consultation")
}
```

### 5. Soumissions et évaluation

```prisma
model Soumission {
  id                String      @id @default(cuid())
  procedureId       String
  procedure         Procedure   @relation(fields: [procedureId], references: [id], onDelete: Cascade)
  
  numeroDepot       String      @unique // Généré automatiquement
  
  fournisseurId     String
  fournisseur       Fournisseur @relation(fields: [fournisseurId], references: [id])
  
  // Montants
  montantTechnique  Decimal?    @db.Decimal(14, 2)
  montantFinancier  Decimal     @db.Decimal(14, 2)
  montantTotal      Decimal     @db.Decimal(14, 2)
  devise            String      @default("XOF")
  
  // Conformité
  conformeAdmin     Boolean?
  conformeTechnique Boolean?
  conformeFinancier Boolean?
  
  // Horodatage
  dateDepot         DateTime    @default(now())
  horsDelai         Boolean     @default(false)
  
  status            String      @default("DEPOSEE") // DEPOSEE | OUVERTE | EVALUEE | RETENUE | NON_RETENUE | REJETEE
  
  documents         SoumissionDocument[]
  evaluations       Evaluation[]
  contrat           Contrat?
  
  @@index([procedureId])
  @@index([fournisseurId])
  @@index([status])
  @@map("soumissions")
}

model SoumissionDocument {
  id            String      @id @default(cuid())
  soumissionId  String
  soumission    Soumission  @relation(fields: [soumissionId], references: [id], onDelete: Cascade)
  
  type          String      // ADMINISTRATIF | TECHNIQUE | FINANCIER
  nom           String
  url           String
  fileSize      Int?
  
  uploadedAt    DateTime    @default(now())
  
  @@index([soumissionId])
  @@map("soumission_documents")
}

model Commission {
  id          String    @id @default(cuid())
  procedureId String
  procedure   Procedure @relation(fields: [procedureId], references: [id], onDelete: Cascade)
  
  nom         String
  type        String    // OUVERTURE | EVALUATION | ATTRIBUTION
  dateSeance  DateTime
  
  presidenId  String
  president   User      @relation("CommissionPresident", fields: [presidenId], references: [id])
  
  createdAt   DateTime  @default(now())
  
  membres     MembreCommission[]
  evaluations Evaluation[]
  
  @@index([procedureId])
  @@map("commissions")
}

model MembreCommission {
  id           String     @id @default(cuid())
  commissionId String
  commission   Commission @relation(fields: [commissionId], references: [id], onDelete: Cascade)
  
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  
  role         String     // MEMBRE | RAPPORTEUR | OBSERVATEUR
  
  @@unique([commissionId, userId])
  @@index([commissionId])
  @@map("membres_commission")
}

model Evaluation {
  id            String     @id @default(cuid())
  soumissionId  String
  soumission    Soumission @relation(fields: [soumissionId], references: [id], onDelete: Cascade)
  
  commissionId  String
  commission    Commission @relation(fields: [commissionId], references: [id])
  
  evaluateurId  String
  evaluateur    User       @relation(fields: [evaluateurId], references: [id])
  
  // Scores
  scoreAdmin    Float?
  scoreTechnique Float?
  scoreFinancier Float?
  scoreGlobal   Float?
  
  // Détails notation
  criteres      Json       // Structure flexible pour grille évaluation
  commentaires  String?    @db.Text
  
  validatedAt   DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  @@unique([soumissionId, evaluateurId])
  @@index([soumissionId])
  @@index([commissionId])
  @@map("evaluations")
}
```

### 6. Contrats et exécution

```prisma
model Contrat {
  id                String      @id @default(cuid())
  organizationId    String
  reference         String      @unique
  
  // Rattachements
  procedureId       String      @unique
  procedure         Procedure   @relation(fields: [procedureId], references: [id])
  
  soumissionId      String      @unique
  soumission        Soumission  @relation(fields: [soumissionId], references: [id])
  
  fournisseurId     String
  fournisseur       Fournisseur @relation(fields: [fournisseurId], references: [id])
  
  // Financier
  montantInitial    Decimal     @db.Decimal(14, 2)
  montantRevise     Decimal?    @db.Decimal(14, 2)
  montantPaye       Decimal     @default(0) @db.Decimal(14, 2)
  devise            String      @default("XOF")
  
  // Dates
  dateSignature     DateTime
  dateDemarrage     DateTime?
  dateEcheance      DateTime
  dateReceptionProv DateTime?
  dateReceptionDef  DateTime?
  
  // Modalités
  modalitesAvance   String?     @db.Text
  modalitesAcompte  String?     @db.Text
  modalitesRetenue  String?     @db.Text
  garanties         String?     @db.Text
  
  // Responsable
  gestionnaire      String
  gestionnaireUser  User        @relation(fields: [gestionnaire], references: [id])
  
  // Statut
  status            String      @default("SIGNE") // SIGNE | EN_COURS | SUSPENDU | TERMINE | CLOTURE | RESILIE
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  avenants          Avenant[]
  livrables         Livrable[]
  paiements         PaiementContrat[]
  
  @@index([organizationId])
  @@index([fournisseurId])
  @@index([gestionnaire])
  @@index([status])
  @@map("contrats")
}

model Avenant {
  id            String   @id @default(cuid())
  contratId     String
  contrat       Contrat  @relation(fields: [contratId], references: [id], onDelete: Cascade)
  
  numero        Int      // Avenant N°1, 2, 3...
  motif         String   @db.Text
  
  // Impacts
  impactMontant Decimal? @db.Decimal(14, 2)
  impactDelai   Int?     // En jours
  impactObjet   String?  @db.Text
  
  dateSignature DateTime
  
  validatedBy   String?
  validatedAt   DateTime?
  
  status        String   @default("BROUILLON") // BROUILLON | VALIDE | SIGNE
  
  createdAt     DateTime @default(now())
  
  @@index([contratId])
  @@map("avenants")
}

model Livrable {
  id                String              @id @default(cuid())
  contratId         String
  contrat           Contrat             @relation(fields: [contratId], references: [id], onDelete: Cascade)
  
  titre             String
  description       String?             @db.Text
  
  dateEcheance      DateTime
  
  responsableId     String?
  responsable       User?               @relation(fields: [responsableId], references: [id])
  
  status            String              @default("EN_ATTENTE") // EN_ATTENTE | EN_COURS | LIVRE | ACCEPTE | REJETE
  
  ordre             Int                 @default(0)
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  receptions        ReceptionLivrable[]
  
  @@index([contratId])
  @@map("livrables")
}

model ReceptionLivrable {
  id               String    @id @default(cuid())
  livrableId       String
  livrable         Livrable  @relation(fields: [livrableId], references: [id], onDelete: Cascade)
  
  type             String    // PARTIELLE | PROVISOIRE | DEFINITIVE
  
  quantitePrevue   Float?
  quantiteRecue    Float?
  
  conforme         Boolean   @default(true)
  reserves         String?   @db.Text
  
  dateReception    DateTime
  
  receptionneurId  String
  receptionneur    User      @relation(fields: [receptionneurId], references: [id])
  
  pvUrl            String?   // URL du PV de réception
  
  createdAt        DateTime  @default(now())
  
  @@index([livrableId])
  @@map("receptions_livrable")
}

model PaiementContrat {
  id                String   @id @default(cuid())
  contratId         String
  contrat           Contrat  @relation(fields: [contratId], references: [id], onDelete: Cascade)
  
  type              String   // AVANCE | ACOMPTE | INTERMEDIAIRE | FINAL | RETENUE_GARANTIE
  
  montantBrut       Decimal  @db.Decimal(14, 2)
  taxes             Decimal  @default(0) @db.Decimal(14, 2)
  penalites         Decimal  @default(0) @db.Decimal(14, 2)
  montantNet        Decimal  @db.Decimal(14, 2)
  
  dateEcheance      DateTime?
  datePaiement      DateTime?
  
  status            String   @default("EN_ATTENTE") // EN_ATTENTE | VALIDE | PAYE | REJETE
  
  referenceComptable String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([contratId])
  @@index([status])
  @@map("paiements_contrat")
}
```

### 7. Évaluation fournisseurs

```prisma
model EvaluationFournisseur {
  id            String      @id @default(cuid())
  fournisseurId String
  fournisseur   Fournisseur @relation(fields: [fournisseurId], references: [id], onDelete: Cascade)
  
  contratId     String?
  
  // Critères (sur 5)
  qualite       Float?
  delais        Float?
  conformite    Float?
  disponibilite Float?
  serviceAV     Float?
  respectContractuel Float?
  rapportQualitePrix Float?
  
  noteGlobale   Float
  commentaires  String?     @db.Text
  
  evaluateurId  String
  evaluateur    User        @relation(fields: [evaluateurId], references: [id])
  
  createdAt     DateTime    @default(now())
  
  @@index([fournisseurId])
  @@map("evaluations_fournisseur")
}
```

## Relations avec les tables existantes

### Modifications nécessaires

```prisma
// Dans User - Ajouter relations
model User {
  // ... champs existants
  
  // Passation de marchés
  demandesAchat            DemandeAchat[]           @relation("DemandeurAchat")
  validationsDemandes      ValidationDemande[]
  lignesPPMResponsable     LignePPM[]
  proceduresResponsable    Procedure[]
  commissionsPresident     Commission[]             @relation("CommissionPresident")
  membresCommission        MembreCommission[]
  evaluations              Evaluation[]
  contratsGestionnaire     Contrat[]
  livrablesResponsable     Livrable[]
  receptions               ReceptionLivrable[]
  evaluationsFournisseurs  EvaluationFournisseur[]
}

// Dans Organization - Ajouter relations
model Organization {
  // ... champs existants
  
  // Passation de marchés
  planPassationMarches    PlanPassationMarche[]
}

// Dans Activity - Ajouter relations
model Activity {
  // ... champs existants
  
  // Passation de marchés
  lignesPPM               LignePPM[]
  demandesAchat           DemandeAchat[]
}

// Dans Document - Optionnel (ou garder système séparé)
model Document {
  // ... champs existants
  
  // Passation de marchés
  demandeAchatId          String?
  demandeAchat            DemandeAchat?  @relation(fields: [demandeAchatId], references: [id])
}
```

## Enums à ajouter

```prisma
enum MethodeProcedure {
  ACHAT_DIRECT
  DEMANDE_COTATION
  CONSULTATION_RESTREINTE
  APPEL_OFFRES_OUVERT
  APPEL_OFFRES_RESTREINT
  DEMANDE_PROPOSITIONS
  MANIFESTATION_INTERET
  SELECTION_CONSULTANT
  PROCEDURE_URGENCE
  AUTRE
}

enum StatusPPM {
  BROUILLON
  VALIDE
  EN_COURS
  CLOTURE
}

enum StatusDemandeAchat {
  BROUILLON
  SOUMISE
  EN_VALIDATION
  APPROUVEE
  REJETEE
  ANNULEE
}

enum StatusProcedure {
  BROUILLON
  PUBLIEE
  EN_COURS
  CLOTUREE_OFFRES
  EVALUATION
  ATTRIBUEE
  INFRUCTUEUSE
  ANNULEE
}

enum StatusContrat {
  SIGNE
  EN_COURS
  SUSPENDU
  TERMINE
  CLOTURE
  RESILIE
}

enum StatusFournisseur {
  A_VALIDER
  ACTIF
  SUSPENDU
  BLACKLISTE
  ARCHIVE
}
```

## Index de performance

- `organizationId` partout (multi-tenancy)
- `status` sur toutes les entités principales
- `responsableId` / `userId` pour filtrage rapide
- Dates critiques : `dateLimite`, `dateEcheance`
- Relations FK pour jointures

## Bonnes pratiques appliquées

✅ Multi-tenancy strict (`organizationId`)  
✅ Références uniques (`reference` pour PPM, procédures, contrats)  
✅ Soft delete possible (ajouter `deletedAt` si nécessaire)  
✅ Audit trail via `createdAt`/`updatedAt` + `AuditLog` existant  
✅ Decimal pour montants financiers (14,2)  
✅ Index optimisés pour requêtes fréquentes  
✅ Relations CASCADE/RESTRICT appropriées  
✅ Json flexible pour grilles d'évaluation  

## Statistiques

- **Nouvelles tables** : 18
- **Enums** : 6
- **Relations ajoutées** : ~15
- **Index** : ~50

---

**Next step** : Valider cette architecture, puis implémenter dans `schema.prisma`.
