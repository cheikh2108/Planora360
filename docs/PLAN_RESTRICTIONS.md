# Matrice des Restrictions par Plan d'Abonnement

## 📊 Distribution des Fonctionnalités

### 🟢 INDIVIDUEL (1 user, 3 plans)
**Accès de base**
- ✅ Dashboard
- ✅ Activités
- ✅ Documents
- ✅ Plans d'action (max 3)
- ✅ Planification
- ✅ Participants
- ✅ Checklists
- ✅ Rapports
- ✅ Messagerie
- ✅ Auth & Profil

### 🔵 PRO (3 users, 10 plans)
**Tout INDIVIDUEL +**
- 🔒 **Capitalisation** `capitalization.controller.ts`
- 🔒 **Budget** `budgets.controller.ts`

### 🟣 EQUIPE (10 users, 25 plans)
**Tout PRO +**
- 🔒 **Recommandations** `recommendations.controller.ts`
- 🔒 **Indicateurs** `indicators.controller.ts`
- 🔒 **Validations** `validations.controller.ts`

### 🟠 ORGANISATION (25 users, 50 plans)
**Tout EQUIPE +**
- 🔒 **Passation complète** (8 controllers):
  - `demandes.controller.ts`
  - `fournisseurs.controller.ts`
  - `procedures.controller.ts`
  - `soumissions.controller.ts`
  - `commissions.controller.ts`
  - `evaluations.controller.ts`
  - `contrats.controller.ts`
  - `ppm.controller.ts`
- 🔒 **Audit & Conformité** `audit.controller.ts`

### 🔴 ENTERPRISE (∞ users, ∞ plans)
**Tout ORGANISATION +**
- ✅ Pas de limites quantitatives
- ✅ Support prioritaire

---

## 🛡️ Implémentation Technique

### Controllers Protégés (14/31)

| Module | Plan Requis | Controller |
|--------|-------------|-----------|
| Capitalisation | PRO+ | `capitalization.controller.ts` |
| Budget | PRO+ | `budgets.controller.ts` |
| Recommandations | EQUIPE+ | `recommendations.controller.ts` |
| Indicateurs | EQUIPE+ | `indicators.controller.ts` |
| Validations | EQUIPE+ | `validations.controller.ts` |
| Audit | ORGANISATION+ | `audit.controller.ts` |
| Passation (8) | ORGANISATION+ | `demandes`, `fournisseurs`, `procedures`, `soumissions`, `commissions`, `evaluations`, `contrats`, `ppm` |

### Exemple d'Implémentation

```typescript
@Controller('passation/procedures')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class ProceduresController { }
```

### Message d'Erreur

Quand un utilisateur tente d'accéder à une fonctionnalité non autorisée :

```
Cette fonctionnalité nécessite la formule Organisation ou Enterprise.
Votre formule actuelle : Pro.
Passez à une formule supérieure dans Paramètres > Abonnement.
```

---

## ✅ Résumé

- ✅ **14 controllers protégés** sur 31 totaux
- ✅ **8 modules Passation** réservés à ORGANISATION+
- ✅ **Hiérarchie respectée** : plans supérieurs héritent de l'accès des plans inférieurs
- ✅ **Messages clairs** en cas d'accès refusé
- ✅ **Pas de rupture** : les fonctionnalités de base restent accessibles à tous
