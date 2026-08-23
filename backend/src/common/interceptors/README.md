# Audit Interceptor - Guide d'utilisation

## Phase 3: Système d'Audit Enrichi

L'intercepteur d'audit capture automatiquement les opérations POST/PUT/PATCH/DELETE avec:
- **IP Address**: Détection automatique (CloudFlare, proxy, direct)
- **User-Agent**: Navigateur et système de l'utilisateur
- **Request ID**: UUID unique par requête
- **Old/New Values**: Diff automatique pour les updates

## Utilisation

### 1. Importer le décorateur

```typescript
import { Audit } from '@/common/interceptors/audit.interceptor';
```

### 2. Appliquer sur une méthode

```typescript
@Post()
@Audit({ action: 'CREATE_ACTIVITY', entityType: 'Activity' })
@Roles('Administrateur', 'Coordinateur')
async create(@Body() dto: CreateActivityDto, @CurrentUser() user: any) {
  return this.service.create(dto, user.organizationId);
}
```

### 3. Pour les updates (avec old/new values)

Pour capturer automatiquement le diff des valeurs:

```typescript
@Patch(':id')
@Audit({ action: 'UPDATE_ACTIVITY', entityType: 'Activity' })
@Roles('Administrateur', 'Coordinateur')
async update(
  @Param('id') id: string,
  @Body() dto: UpdateActivityDto,
  @CurrentUser() user: any
) {
  // 1. Récupérer l'ancienne version
  const oldActivity = await this.service.findOne(id, user.organizationId);

  // 2. Appliquer la mise à jour
  const updated = await this.service.update(id, dto, user.organizationId);

  // 3. L'intercepteur capturera automatiquement le diff si on passe __oldValues
  // Option A: Passer dans le body (avant validation)
  dto['__oldValues'] = oldActivity;

  // Option B: Modifier la requête (plus propre)
  // request.body.__oldValues = oldActivity;

  return updated;
}
```

### 4. Exemples d'actions standards

```typescript
// Créations
@Audit({ action: 'CREATE_ACTIVITY', entityType: 'Activity' })
@Audit({ action: 'CREATE_ACTION_PLAN', entityType: 'ActionPlan' })
@Audit({ action: 'CREATE_USER', entityType: 'User' })

// Modifications
@Audit({ action: 'UPDATE_ACTIVITY_STATUS', entityType: 'Activity' })
@Audit({ action: 'UPDATE_ACTION_PLAN', entityType: 'ActionPlan' })
@Audit({ action: 'UPDATE_USER_ROLE', entityType: 'User' })

// Suppressions
@Audit({ action: 'DELETE_ACTIVITY', entityType: 'Activity' })
@Audit({ action: 'SOFT_DELETE_ACTION_PLAN', entityType: 'ActionPlan' })
@Audit({ action: 'DEACTIVATE_USER', entityType: 'User' })

// Actions spécifiques
@Audit({ action: 'VALIDATE_ACTIVITY', entityType: 'Activity' })
@Audit({ action: 'REJECT_VALIDATION', entityType: 'Validation' })
@Audit({ action: 'UPLOAD_DOCUMENT', entityType: 'Document' })
@Audit({ action: 'EXPORT_REPORT', entityType: 'Report' })
```

## Activation globale (optionnelle)

Pour activer l'audit sur TOUS les contrôleurs automatiquement:

```typescript
// app.module.ts
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
```

⚠️ **Note**: Avec l'activation globale, vous devez quand même utiliser le décorateur `@Audit()` pour spécifier quelle action/entité logger.

## Visualisation

Les logs sont accessibles via:
- **Super Admin UI**: `/super-admin/audit-logs`
- **API**: `GET /audit/search?action=CREATE_ACTIVITY&startDate=2024-01-01`
- **Export CSV**: `GET /audit/export`

## Bonnes pratiques

1. ✅ **Nommer les actions clairement**: `CREATE_ACTIVITY` > `create`
2. ✅ **Utiliser le même entityType que le modèle Prisma**
3. ✅ **Capturer les old values pour les updates critiques**
4. ❌ **Ne pas auditer les GET** (lecture seule, trop de volume)
5. ❌ **Ne pas auditer les endpoints publics** (login, register)

## Sécurité

L'intercepteur filtre automatiquement:
- Headers sensibles (Authorization, Cookie, X-Api-Key)
- Query params (token, password, secret, apiKey)
- Ne stocke JAMAIS les mots de passe dans old/new values

## Exemples complets

### Exemple 1: Action Plan Controller

```typescript
import { Controller, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { Audit } from '@/common/interceptors/audit.interceptor';

@Controller('action-plans')
export class ActionPlansController {
  @Post()
  @Audit({ action: 'CREATE_ACTION_PLAN', entityType: 'ActionPlan' })
  create(@Body() dto: CreateActionPlanDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.organizationId);
  }

  @Patch(':id')
  @Audit({ action: 'UPDATE_ACTION_PLAN', entityType: 'ActionPlan' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActionPlanDto,
    @CurrentUser() user: any
  ) {
    const old = await this.service.findOne(id, user.organizationId);
    dto['__oldValues'] = old;
    return this.service.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @Audit({ action: 'DELETE_ACTION_PLAN', entityType: 'ActionPlan' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.organizationId);
  }
}
```

### Exemple 2: User Management

```typescript
@Patch(':id/role')
@Audit({ action: 'CHANGE_USER_ROLE', entityType: 'User' })
async changeRole(
  @Param('id') id: string,
  @Body() dto: { roleId: string },
  @CurrentUser() user: any
) {
  const oldUser = await this.usersService.findOne(id);
  dto['__oldValues'] = { roleId: oldUser.roleId, roleName: oldUser.role.name };
  
  return this.usersService.changeRole(id, dto.roleId);
}
```

## Troubleshooting

### Les logs ne s'enregistrent pas

1. Vérifiez que l'utilisateur est authentifié (JWT token)
2. Vérifiez que `request.organizationId` ou `user.organizationId` existe
3. Vérifiez les logs console: `[AuditInterceptor] Failed to log audit:`

### L'IP address est incorrecte

L'intercepteur vérifie dans cet ordre:
1. `x-forwarded-for` (proxy/load balancer)
2. `cf-connecting-ip` (CloudFlare)
3. `x-real-ip` (Nginx)
4. `request.ip` (socket direct)

Vérifiez la configuration de votre reverse proxy.

### Old/New values sont null

Pour les PATCH/PUT, vous devez manuellement récupérer l'ancienne version et la passer via `__oldValues`.

## Performance

- L'audit est **asynchrone** (`tap()` operator) et ne bloque pas la réponse
- En cas d'erreur d'audit, l'opération principale continue (fail-safe)
- Indexation automatique sur `organizationId`, `userId`, `requestId`, `createdAt`
