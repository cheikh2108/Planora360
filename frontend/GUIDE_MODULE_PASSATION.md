# 📋 Guide du Module Passation des Marchés

## 🎯 Objectif du Module

Ce module gère **tout le cycle de vie des achats publics** de ton organisation, de la planification à l'exécution du contrat. Il permet de respecter les règles des marchés publics avec traçabilité complète.

---

## 🔄 Le Workflow Complet (6 Étapes)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CYCLE COMPLET D'UN MARCHÉ                       │
└─────────────────────────────────────────────────────────────────────┘

1️⃣  PPM (Planification)
    │
    ↓
2️⃣  Demande d'Achat
    │
    ↓
3️⃣  Base Fournisseurs
    │
    ↓
4️⃣  Procédure (Appel d'offres)
    │
    ↓
5️⃣  Évaluation des Soumissions
    │
    ↓
6️⃣  Contrat & Paiements
```

---

## 📊 Étape 1 : PPM (Plan de Passation des Marchés)

### C'est quoi ?
Le **planning annuel** de tous les achats que tu vas faire dans l'année.

### Exemple concret :
```
PPM 2026 - Direction Informatique
├─ Ligne 1: Achat 50 ordinateurs → 25M XOF → T1 2026
├─ Ligne 2: Logiciels bureautique → 5M XOF → T2 2026
├─ Ligne 3: Serveurs datacenter → 80M XOF → T3 2026
└─ Ligne 4: Maintenance réseau → 12M XOF → T4 2026

Total: 122M XOF
```

### Utilisation :
1. **Créer un PPM** (bouton "Nouveau PPM")
2. **Ajouter des lignes** (chaque achat prévu)
3. **Valider le plan** (statut → VALIDÉ)
4. Le PPM devient le **référentiel** pour l'année

### Statuts :
- `BROUILLON` → En préparation
- `EN_REVISION` → En cours de validation
- `VALIDE` → Approuvé, sert de référence
- `PUBLIE` → Publié officiellement
- `ARCHIVE` → Archivé (année passée)

---

## 🛒 Étape 2 : Demandes d'Achat

### C'est quoi ?
La **demande formelle** pour lancer un achat. Déclenche un workflow de validation automatique.

### Workflow de validation automatique :

```
┌──────────────────────────────────────────────────────────────┐
│  MONTANT < 5 000 XOF                                         │
│  → Validation hiérarchique uniquement                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  MONTANT 5 000 - 50 000 XOF                                  │
│  → Validation hiérarchique + technique                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  MONTANT > 50 000 XOF                                        │
│  → Validation hiérarchique + technique + administrative      │
└──────────────────────────────────────────────────────────────┘
```

### Exemple :
```
Demande DA-2026-0042
├─ Objet: Achat 10 ordinateurs portables
├─ Montant estimé: 8 000 000 XOF
├─ Justification: Renouvellement parc informatique
├─ Lien PPM: Ligne 1 du PPM 2026
├─ Priorité: HAUTE
└─ Date nécessité: 15/09/2026

Workflow:
✓ Validation Chef Service (Approuvé le 05/08/2026)
⏳ Validation DAF (En attente)
⏹ Validation DG (Pas encore)
```

### Statuts :
- `BROUILLON` → En cours de rédaction
- `SOUMISE` → Envoyée en validation
- `EN_VALIDATION_HIERARCHIQUE` → Chez le chef
- `EN_VALIDATION_TECHNIQUE` → Service technique
- `EN_VALIDATION_ADMINISTRATIVE` → DAF/Finances
- `VALIDEE` → Approuvée → **Peut lancer procédure**
- `REJETEE` → Refusée (avec commentaire)
- `ANNULEE` → Annulée par le demandeur

---

## 🏢 Étape 3 : Base Fournisseurs

### C'est quoi ?
Le **répertoire centralisé** de tous les fournisseurs avec qui tu peux travailler.

### Informations stockées :
```
Fournisseur: SARL TechnoPlus
├─ Raison sociale: SARL TECHNOPLUS
├─ Identifiant fiscal: 2024-SN-12345
├─ Contact: Mamadou DIOP (77 123 45 67)
├─ Email: contact@technoplus.sn
├─ Domaines: Informatique, Télécoms
├─ Documents:
│   ├─ Certificat fiscal (expire 31/12/2026)
│   ├─ Registre commerce
│   └─ Attestation IPRES
├─ Historique:
│   ├─ 12 soumissions déposées
│   ├─ 5 contrats signés
│   └─ Note globale: 4.2/5
└─ Statut: ACTIF
```

### Statuts :
- `A_VALIDER` → Nouveau fournisseur à vérifier
- `ACTIF` → Peut soumissionner
- `SUSPENDU` → Temporairement bloqué
- `BLACKLISTE` → Interdit de soumissionner (fraude, etc.)
- `ARCHIVE` → Inactif

---

## 📢 Étape 4 : Procédures (Appels d'offres)

### C'est quoi ?
Le **lancement officiel** de l'appel d'offres pour sélectionner le fournisseur.

### 4 Types de procédures :

#### 1️⃣ Appel d'Offres Ouvert (AO)
```
Public: Tous les fournisseurs
Montant: > 50 000 000 XOF
Délai: 45 jours minimum
Publication: Obligatoire (presse, site web)
```

#### 2️⃣ Appel d'Offres Restreint
```
Public: Fournisseurs pré-qualifiés uniquement
Montant: 10 000 000 - 50 000 000 XOF
Délai: 30 jours
Publication: Lettre d'invitation
```

#### 3️⃣ Consultation (Demande de prix)
```
Public: Minimum 3 fournisseurs
Montant: 1 000 000 - 10 000 000 XOF
Délai: 15 jours
Publication: Non obligatoire
```

#### 4️⃣ Gré à Gré
```
Public: 1 fournisseur ciblé
Montant: < 1 000 000 XOF OU urgence
Délai: Immédiat
Autorisation: Accord DG obligatoire
```

### Timeline d'une procédure :

```
J0   Publication de l'avis
│
J+7  Visite du site (optionnel)
│
J+15 Séance de clarification
│
J+45 Date limite dépôt des offres (17h00)
│
J+46 Ouverture des plis (Commission)
│
J+60 Évaluation des offres
│
J+65 Attribution provisoire
│
J+75 Notification et signature
```

### Statuts :
- `BROUILLON` → En préparation
- `PUBLIEE` → Publiée, les fournisseurs peuvent voir
- `EN_COURS` → Période de soumission ouverte
- `CLOTUREE_OFFRES` → Date limite passée, plus de dépôt
- `EVALUATION` → Commission évalue les offres
- `ATTRIBUEE` → Gagnant désigné
- `INFRUCTUEUSE` → Aucune offre valable
- `ANNULEE` → Annulée (vice de procédure, etc.)

---

## 📝 Étape 5 : Soumissions & Évaluation

### Comment ça marche ?

#### A. Dépôt des soumissions
```
Fournisseur SARL TechnoPlus
└─ Soumission #SO-2026-0012
    ├─ Documents techniques
    │   ├─ Mémoire technique
    │   ├─ Planning d'exécution
    │   └─ Références similaires
    ├─ Documents administratifs
    │   ├─ Garantie bancaire
    │   ├─ Certificats conformité
    │   └─ Attestations fiscales
    ├─ Offre financière (pli séparé)
    │   └─ Montant: 7 850 000 XOF
    └─ Dépôt: 25/08/2026 à 16:32
```

#### B. Commission d'évaluation
```
Commission d'Ouverture des Plis
├─ Président: Directeur Général
├─ Membres:
│   ├─ Directeur Financier
│   ├─ Chef Service Informatique
│   └─ Responsable Achats
└─ Date séance: 26/08/2026 09h00
```

#### C. Grille d'évaluation
```
┌─────────────────────────────────────────────┐
│  Critère                 Poids    Note/100  │
├─────────────────────────────────────────────┤
│  Conformité admin         10%       ✓/✗     │
│  Expérience similaire     20%       85      │
│  Qualité technique        30%       92      │
│  Prix (moins-disant)      30%       78      │
│  Délais proposés          10%       90      │
├─────────────────────────────────────────────┤
│  SCORE GLOBAL                       86.5    │
└─────────────────────────────────────────────┘

Rang: 1er (sur 5 soumissionnaires)
Décision: RETENU ✓
```

---

## 📄 Étape 6 : Contrats & Exécution

### C'est quoi ?
Le **contrat signé** avec le fournisseur gagnant + suivi de l'exécution.

### Exemple de contrat :
```
Contrat #CT-2026-0031
├─ Fournisseur: SARL TechnoPlus
├─ Objet: Fourniture 10 ordinateurs portables
├─ Montant initial: 7 850 000 XOF
├─ Date signature: 30/08/2026
├─ Date démarrage: 05/09/2026
├─ Date échéance: 30/09/2026
├─ Garantie: 24 mois
└─ Clause révision: +/-10% autorisé

Avenants:
├─ Avenant #1 (+2 ordinateurs) → +1 570 000 XOF
└─ Montant révisé: 9 420 000 XOF

Exécution:
├─ Montant payé: 7 536 000 XOF (80%)
├─ Restant dû: 1 884 000 XOF
├─ Paiements:
│   ├─ Acompte 30% → 2 826 000 XOF (10/09/2026)
│   ├─ Avancement 50% → 4 710 000 XOF (20/09/2026)
│   └─ Solde 20% → 1 884 000 XOF (À payer après réception)
└─ Statut: EN_COURS (80% exécuté)
```

### Statuts :
- `SIGNE` → Signé, pas encore démarré
- `EN_COURS` → En cours d'exécution
- `SUSPENDU` → Suspendu temporairement
- `RESILIE` → Résilié (non-respect, litige)
- `TERMINE` → Terminé avec succès
- `ARCHIVE` → Archivé

---

## 🎬 Cas d'Usage Complet : De A à Z

### Scénario : Acheter 10 ordinateurs

#### **Mois de Janvier 2026**
```
1. Chef Service Informatique crée PPM 2026
   └─ Ligne #3: "Renouvellement parc informatique" → 8M XOF → T3
   
2. DG valide le PPM
   └─ Statut: VALIDÉ
```

#### **Mois d'Août 2026**
```
3. Chef Service crée Demande d'Achat
   ├─ Objet: Achat 10 ordinateurs HP EliteBook
   ├─ Montant: 8 000 000 XOF
   └─ Lien: Ligne #3 du PPM 2026

4. Workflow de validation automatique
   ├─ Chef Service ✓ (Approuvé)
   ├─ DAF ✓ (Approuvé)
   └─ DG ✓ (Approuvé)
   
5. Demande validée → Créer Procédure
   ├─ Type: Consultation (3 fournisseurs minimum)
   ├─ Date limite: 25/08/2026
   └─ Publier l'avis
```

#### **Mois d'Août - Dépôts**
```
6. 5 fournisseurs soumissionnent
   ├─ TechnoPlus: 7 850 000 XOF
   ├─ InfoDirect: 8 100 000 XOF
   ├─ CompuMarket: 7 650 000 XOF (non conforme admin)
   ├─ DigiShop: 8 500 000 XOF
   └─ TechWorld: 7 900 000 XOF
```

#### **26 Août - Évaluation**
```
7. Commission d'évaluation se réunit
   └─ Classement:
       1️⃣ TechnoPlus (score 86.5) ✓
       2️⃣ TechWorld (score 84.2)
       3️⃣ InfoDirect (score 81.0)
       4️⃣ DigiShop (score 78.5)
       ❌ CompuMarket (rejeté)

8. Attribution provisoire → TechnoPlus
   └─ Notification envoyée
```

#### **30 Août - Signature**
```
9. Signature du contrat CT-2026-0031
   ├─ Montant: 7 850 000 XOF
   ├─ Délai: 25 jours
   └─ Paiement: 30% / 50% / 20%
```

#### **Septembre - Exécution**
```
10. Livraison progressive
    ├─ 10/09: Acompte 30% → 2 355 000 XOF
    ├─ 20/09: Livraison 10 PC → Paiement 50%
    └─ 25/09: Réception définitive → Solde 20%

11. Contrat terminé
    └─ Statut: TERMINE
    └─ Note fournisseur: 4.5/5
```

---

## 📊 Dashboard & Statistiques

### Indicateurs clés :
```
Module Passation - Vue d'ensemble
├─ PPM validés: 3
├─ Demandes en cours: 12
├─ Procédures actives: 5
├─ Contrats en exécution: 18
└─ Montant total engagé: 450M XOF

Performance:
├─ Taux validation demandes: 87%
├─ Délai moyen validation: 5 jours
├─ Nombre fournisseurs actifs: 42
└─ Taux respect délais: 92%
```

---

## 🔐 Sécurité & Traçabilité

### Tout est tracé :
- **Qui** a fait **quoi** et **quand**
- Historique complet des modifications
- Piste d'audit pour contrôles externes
- Documents signés électroniquement

### Exemple de log :
```
05/08/2026 14:23 - Mamadou DIOP crée DA-2026-0042
05/08/2026 14:45 - Fatou SALL valide (hiérarchique)
06/08/2026 09:12 - Abdou BA valide (technique)
06/08/2026 15:30 - Aissatou NDIAYE valide (admin)
06/08/2026 15:31 - Statut changé: VALIDEE
07/08/2026 10:00 - Procédure PR-2026-0031 créée
25/08/2026 17:00 - 5 soumissions reçues
26/08/2026 09:00 - Commission ouvre les plis
26/08/2026 15:00 - TechnoPlus désigné gagnant
30/08/2026 11:00 - Contrat CT-2026-0031 signé
```

---

## ❓ FAQ

### Q: Je peux créer une demande sans PPM ?
**R:** Oui, le lien PPM est optionnel. Mais c'est recommandé pour la planification.

### Q: Combien de validations pour ma demande ?
**R:** Ça dépend du montant :
- < 5 000 XOF → 1 validation
- 5 000 - 50 000 → 2 validations
- \> 50 000 → 3 validations

### Q: Je peux ajouter un fournisseur qui n'est pas dans la base ?
**R:** Non, il faut d'abord l'enregistrer dans "Fournisseurs" avec tous ses documents.

### Q: Un fournisseur peut voir les autres offres ?
**R:** Non, c'est confidentiel jusqu'à l'ouverture des plis par la commission.

### Q: Je peux modifier un contrat signé ?
**R:** Oui, via un **Avenant** (modification formelle avec nouvelle signature).

---

## 🎓 Résumé en 3 points

1. **Planification** → PPM (ce qu'on va acheter dans l'année)
2. **Validation** → Demande → Procédure → Soumissions → Évaluation
3. **Exécution** → Contrat → Suivi paiements → Clôture

**Bénéfices :**
✅ Conformité totale avec les règles des marchés publics
✅ Traçabilité complète (audits, contrôles)
✅ Gain de temps (workflows automatiques)
✅ Transparence (tout le monde voit où ça en est)
✅ Historique complet (statistiques, reporting)

---

*Ce guide est une vue d'ensemble. Pour plus de détails sur chaque module, consulte les utilisateurs admin.*
