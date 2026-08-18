# Pattern d'implémentation de l'Audit Trail

## ✅ Module RECOMMENDATIONS - Exemple complet (FAIT)

Le module recommendations a été entièrement instrumenté. Voici le pattern à répliquer sur les autres modules.

### 1. Importer AuditService dans le service

```typescript
// Dans xxx.service.ts
import { AuditService } from '../audit/audit.service';

@Injectable()
export class XxxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService, // ← Ajouter ça
  ) {}
}
```

### 2. Logger après chaque opération CRUD

#### CREATE
```typescript
async create(dto: CreateXxxDto, organizationId: string, userId: string) {
  const entity = await this.prisma.xxx.create({ ... });
  
  // Audit trail
  await this.auditService.log({
    organizationId,
    userId,
    action: 'xxx.create',              // ← Format: module.action
    entityType: 'Xxx',                 // ← Nom du modèle Prisma
    entityId: entity.id,
    metadata: { title: entity.title }, // ← Données pour affichage
  });
  
  return entity;
}
```

#### UPDATE
```typescript
async update(id: string, dto: UpdateXxxDto, organizationId: string, userId: string) {
  const entity = await this.prisma.xxx.update({ ... });
  
  await this.auditService.log({
    organizationId,
    userId,
    action: 'xxx.update',
    entityType: 'Xxx',
    entityId: id,
    metadata: { title: entity.title },
  });
  
  return entity;
}
```

#### DELETE
```typescript
async delete(id: string, organizationId: string, userId: string) {
  const entity = await this.prisma.xxx.findFirst({ where: { id, organizationId } });
  
  await this.auditService.log({
    organizationId,
    userId,
    action: 'xxx.delete',
    entityType: 'Xxx',
    entityId: id,
    metadata: { title: entity.title },
  });
  
  return this.prisma.xxx.delete({ where: { id } });
}
```

#### STATUS CHANGE (pour entités avec statut)
```typescript
async changeStatus(id: string, newStatus: string, organizationId: string, userId: string) {
  const entity = await this.prisma.xxx.findFirst({ where: { id, organizationId } });
  const updated = await this.prisma.xxx.update({ where: { id }, data: { status: newStatus } });
  
  await this.auditService.log({
    organizationId,
    userId,
    action: 'xxx.status',
    entityType: 'Xxx',
    entityId: id,
    metadata: {
      title: entity.title,
      oldStatus: entity.status,
      newStatus,
    },
  });
  
  return updated;
}
```

### 3. Actions spécifiques au domaine

Pour des actions métier spécifiques (comme `submit`, `approve`, `validate`), utiliser un nom d'action explicite :

```typescript
// Soumission pour validation
action: 'activity.submit'

// Approbation
action: 'validation.approuve'

// Rejet
action: 'validation.rejete'

// Upload document
action: 'document.upload'

// Engagement budget
action: 'budget.committed'

// Exécution budget
action: 'budget.executed'
```

### 4. Metadata recommandées par type

#### Activités
```typescript
metadata: {
  title: activity.title,
  status: activity.status,
  completionRate: activity.completionRate,
}
```

#### Plans d'action
```typescript
metadata: {
  title: plan.title,
  startDate: plan.startDate,
  endDate: plan.endDate,
}
```

#### Budgets
```typescript
metadata: {
  activityTitle: activity.title,
  category: budget.category,
  amount: budget.plannedAmount,
}
```

#### Utilisateurs
```typescript
metadata: {
  name: `${user.firstName} ${user.lastName}`,
  email: user.email,
  role: user.role.name,
}
```

#### Documents
```typescript
metadata: {
  fileName: file.name,
  fileSize: file.size,
  entityType: 'Activity', // ou 'Recommendation', etc.
}
```

## 📋 Modules à instrumenter

### ✅ FAIT
- [x] **recommendations** - COMPLET (create, update, delete, start, suspend, reopen, validate, progress, action.add, action.delete, comment.add)

### ⚠️ À FAIRE (priorité haute)

#### 1. **activities** (activities.service.ts)
Actions à logger :
- `activity.create`
- `activity.update`
- `activity.delete`
- `activity.status` (changement de statut)
- `activity.submit` (soumission pour validation)

#### 2. **users** (users.service.ts)
Actions à logger :
- `user.create`
- `user.update`
- `user.delete`
- `user.activate` / `user.deactivate`

#### 3. **action-plans** (action-plans.service.ts)
Actions à logger :
- `plan.create`
- `plan.update`
- `plan.delete`
- `plan.publish` (si applicable)

#### 4. **budgets** (budgets.service.ts)
Actions à logger :
- `budget.create`
- `budget.update`
- `budget.committed` (engagement)
- `budget.executed` (exécution)

#### 5. **validations** (validations.service.ts)
Actions à logger :
- `validation.submitted`
- `validation.approuve`
- `validation.rejete`

#### 6. **checklist** (checklist.service.ts)
Actions à logger :
- `checklist.create`
- `checklist.update`
- `checklist.delete`

#### 7. **indicators** (indicators.service.ts)
Actions à logger :
- `indicator.create`
- `indicator.update`
- `indicator.delete`

#### 8. **documents/evidences**
Actions à logger :
- `document.upload`
- `document.delete`

#### 9. **participants** (participants.service.ts)
Actions à logger :
- `participant.create`
- `participant.update`
- `participant.delete`

#### 10. **capitalization** (capitalization.service.ts)
Actions à logger :
- `capitalization.create`
- `capitalization.update`
- `capitalization.delete`

#### 11. **planning** (planning.service.ts)
Actions à logger :
- `planning.create`
- `planning.update`
- `planning.delete`

## 🎯 Frontend - action-config.ts (DÉJÀ FAIT)

Le fichier `frontend/src/lib/action-config.ts` contient déjà **50+ configurations** pour tous ces événements avec :
- Icônes appropriées
- Couleurs cohérentes
- Labels en français

Dès que le backend logge un événement, il apparaîtra automatiquement dans :
- 🔔 Dropdown notifications (cloche)
- 📋 Page `/notifications` (journal complet)

## 🔥 Quick Start - Appliquer le pattern

1. **Ouvrir le service** (ex: `activities.service.ts`)
2. **Injecter AuditService** dans le constructor
3. **Après chaque CREATE/UPDATE/DELETE**, ajouter :
```typescript
await this.auditService.log({
  organizationId,
  userId,
  action: 'activity.create', // ← Adapter selon l'action
  entityType: 'Activity',
  entityId: activity.id,
  metadata: { title: activity.title },
});
```
4. **Build et tester** : `npm run build`
5. **Vérifier** : ouvrir la cloche de notifications → voir l'événement apparaître

## 💡 Tips

- **Metadata** : toujours inclure un `title` ou `name` pour l'affichage
- **Actions spécifiques** : préférer `activity.submit` à `activity.update` quand l'action a un sens métier clair
- **Frontend** : si une action n'est pas dans `action-config.ts`, elle s'affichera quand même avec un style par défaut
- **Performance** : les logs sont asynchrones (`await`), pas de risque de ralentissement

## ✅ Checklist par module

Avant de considérer un module "terminé" :

- [ ] AuditService injecté dans le constructor
- [ ] Tous les CREATE loggent
- [ ] Tous les UPDATE loggent
- [ ] Tous les DELETE loggent
- [ ] Actions métier spécifiques loggées (submit, approve, etc.)
- [ ] Metadata inclut au minimum `title` ou `name`
- [ ] Backend build sans erreur
- [ ] Test manuel : créer/modifier/supprimer → voir dans notifications

---

**Une fois tous les modules instrumentés, PLANORA 360 aura un journal d'activité complet et en temps réel de TOUT ce qui se passe dans l'organisation.**
