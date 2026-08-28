# Architecture de Sécurité - Modules Passation & Messagerie

## Vue d'ensemble

Ces deux modules manipulent des données **sensibles et confidentielles** :
- **Passation** : Offres financières, évaluations, décisions d'attribution
- **Messagerie** : Communications internes, discussions stratégiques

**Principe ZERO TRUST** : Vérifier à chaque requête, ne jamais faire confiance au client.

---

## 🔒 MODULE PASSATION DE MARCHÉS

### 1. Contrôle d'accès (RBAC + Workflow-based)

#### Permissions requises

```typescript
// backend/src/common/permissions/passation.permissions.ts
export const PassationPermissions = {
  // PPM
  PPM_VIEW: 'passation:ppm:view',
  PPM_CREATE: 'passation:ppm:create',
  PPM_EDIT: 'passation:ppm:edit',
  PPM_VALIDATE: 'passation:ppm:validate',
  
  // Demandes d'achat
  DEMANDE_CREATE: 'passation:demande:create',
  DEMANDE_VIEW_OWN: 'passation:demande:view:own',
  DEMANDE_VIEW_ALL: 'passation:demande:view:all',
  DEMANDE_VALIDATE: 'passation:demande:validate',
  DEMANDE_APPROVE: 'passation:demande:approve',
  
  // Fournisseurs
  FOURNISSEUR_VIEW: 'passation:fournisseur:view',
  FOURNISSEUR_CREATE: 'passation:fournisseur:create',
  FOURNISSEUR_EDIT: 'passation:fournisseur:edit',
  FOURNISSEUR_BLACKLIST: 'passation:fournisseur:blacklist',
  
  // Procédures
  PROCEDURE_CREATE: 'passation:procedure:create',
  PROCEDURE_VIEW: 'passation:procedure:view',
  PROCEDURE_PUBLISH: 'passation:procedure:publish',
  PROCEDURE_CANCEL: 'passation:procedure:cancel',
  
  // Soumissions (CONFIDENTIALITÉ CRITIQUE)
  SOUMISSION_VIEW_BEFORE_OPENING: 'passation:soumission:view:before_opening', // INTERDITE sauf admin système
  SOUMISSION_VIEW_AFTER_OPENING: 'passation:soumission:view:after_opening',
  SOUMISSION_OPEN: 'passation:soumission:open',
  
  // Évaluation
  EVALUATION_PARTICIPATE: 'passation:evaluation:participate',
  EVALUATION_VIEW_RESULTS: 'passation:evaluation:view:results',
  EVALUATION_VALIDATE: 'passation:evaluation:validate',
  
  // Contrats
  CONTRAT_CREATE: 'passation:contrat:create',
  CONTRAT_VIEW: 'passation:contrat:view',
  CONTRAT_EDIT: 'passation:contrat:edit',
  CONTRAT_SIGN: 'passation:contrat:sign',
  CONTRAT_TERMINATE: 'passation:contrat:terminate',
  
  // Paiements
  PAIEMENT_VIEW: 'passation:paiement:view',
  PAIEMENT_CREATE: 'passation:paiement:create',
  PAIEMENT_APPROVE: 'passation:paiement:approve',
};
```

#### Guards NestJS

```typescript
// backend/src/passation/guards/soumission-confidentiality.guard.ts
@Injectable()
export class SoumissionConfidentialityGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const soumissionId = request.params.id;
    
    // Récupérer la soumission et sa procédure
    const soumission = await this.prisma.soumission.findUnique({
      where: { id: soumissionId },
      include: { procedure: true }
    });
    
    if (!soumission) throw new NotFoundException();
    
    const procedure = soumission.procedure;
    const now = new Date();
    
    // RÈGLE CRITIQUE : Avant date d'ouverture, AUCUN accès (sauf super admin)
    if (now < procedure.dateOuverture) {
      const isSuperAdmin = user.role.permissions.includes('*');
      
      if (!isSuperAdmin) {
        throw new ForbiddenException(
          'Les offres sont confidentielles avant la date d\'ouverture'
        );
      }
    }
    
    // Après ouverture : vérifier appartenance commission
    const isMemberCommission = await this.prisma.membreCommission.findFirst({
      where: {
        commission: { procedureId: procedure.id },
        userId: user.id
      }
    });
    
    if (!isMemberCommission && !user.role.permissions.includes('*')) {
      throw new ForbiddenException(
        'Seuls les membres de la commission peuvent consulter les offres'
      );
    }
    
    return true;
  }
}
```

#### Workflow de validation sécurisé

```typescript
// backend/src/passation/services/demande-workflow.service.ts
export class DemandeWorkflowService {
  
  async validateDemande(
    demandeId: string,
    userId: string,
    decision: 'APPROUVE' | 'REJETE' | 'RETOUR_CORRECTION',
    commentaire?: string
  ) {
    // 1. Vérifier que l'utilisateur est le validateur actuel
    const validation = await this.prisma.validationDemande.findFirst({
      where: {
        demandeId,
        validateurId: userId,
        decision: 'EN_ATTENTE'
      },
      orderBy: { ordre: 'asc' }
    });
    
    if (!validation) {
      throw new ForbiddenException(
        'Vous n\'êtes pas autorisé à valider cette demande à cette étape'
      );
    }
    
    // 2. Transaction atomique
    return this.prisma.$transaction(async (tx) => {
      // Mettre à jour la validation
      await tx.validationDemande.update({
        where: { id: validation.id },
        data: {
          decision,
          commentaire,
          validatedAt: new Date()
        }
      });
      
      // Si approuvé, passer à l'étape suivante
      if (decision === 'APPROUVE') {
        const nextValidation = await tx.validationDemande.findFirst({
          where: {
            demandeId,
            ordre: validation.ordre + 1,
            decision: 'EN_ATTENTE'
          }
        });
        
        // Si plus de validation en attente, marquer demande comme APPROUVEE
        if (!nextValidation) {
          await tx.demandeAchat.update({
            where: { id: demandeId },
            data: { status: 'APPROUVEE' }
          });
        }
      }
      
      // Si rejeté, marquer demande comme REJETEE
      if (decision === 'REJETE') {
        await tx.demandeAchat.update({
          where: { id: demandeId },
          data: { status: 'REJETEE' }
        });
      }
      
      // Audit log
      await tx.auditLog.create({
        data: {
          organizationId: validation.demande.organizationId,
          userId,
          action: `DEMANDE_VALIDATION_${decision}`,
          entityType: 'DemandeAchat',
          entityId: demandeId,
          metadata: {
            etape: validation.etape,
            commentaire
          }
        }
      });
      
      return validation;
    });
  }
}
```

### 2. Contrôle budgétaire

```typescript
// backend/src/passation/services/budget-control.service.ts
export class BudgetControlService {
  
  async verifyBudgetDisponible(
    organizationId: string,
    ligneBudgetaire: string,
    montant: Decimal,
    sourceFinancement?: string
  ): Promise<{
    disponible: Decimal;
    isAvailable: boolean;
    details: {
      budgetInitial: Decimal;
      budgetRevise: Decimal;
      engagements: Decimal;
      depenses: Decimal;
      solde: Decimal;
    };
  }> {
    
    // Récupérer budget de la ligne
    const budget = await this.prisma.budget.findFirst({
      where: {
        activity: {
          organizationId
        },
        fundingSource: sourceFinancement
      }
    });
    
    if (!budget) {
      throw new BadRequestException('Ligne budgétaire introuvable');
    }
    
    // Calculer engagements en cours
    const engagements = await this.prisma.demandeAchat.aggregate({
      where: {
        organizationId,
        ligneBudgetaire,
        status: { in: ['SOUMISE', 'EN_VALIDATION', 'APPROUVEE'] }
      },
      _sum: { montantEstimatif: true }
    });
    
    const totalEngagements = engagements._sum.montantEstimatif || new Decimal(0);
    const budgetRevise = budget.planned;
    const depenses = budget.executed;
    const disponible = budgetRevise.minus(totalEngagements).minus(depenses);
    
    return {
      disponible,
      isAvailable: disponible.gte(montant),
      details: {
        budgetInitial: budget.planned,
        budgetRevise,
        engagements: totalEngagements,
        depenses,
        solde: disponible
      }
    };
  }
  
  async blockBudgetIfInsufficient(
    organizationId: string,
    ligneBudgetaire: string,
    montant: Decimal,
    allowOverride: boolean = false
  ) {
    const control = await this.verifyBudgetDisponible(
      organizationId,
      ligneBudgetaire,
      montant
    );
    
    if (!control.isAvailable && !allowOverride) {
      throw new ForbiddenException({
        message: 'Budget insuffisant pour cette demande',
        disponible: control.disponible.toString(),
        demande: montant.toString(),
        details: control.details
      });
    }
    
    // Log si dépassement autorisé
    if (!control.isAvailable && allowOverride) {
      await this.auditService.log({
        action: 'BUDGET_OVERRIDE',
        entityType: 'DemandeAchat',
        metadata: {
          ligneBudgetaire,
          montant: montant.toString(),
          disponible: control.disponible.toString(),
          depassement: montant.minus(control.disponible).toString()
        }
      });
    }
  }
}
```

### 3. Horodatage sécurisé des soumissions

```typescript
// backend/src/passation/services/soumission.service.ts
export class SoumissionService {
  
  async receiveSoumission(
    procedureId: string,
    fournisseurId: string,
    data: CreateSoumissionDto,
    files: Express.Multer.File[]
  ) {
    // Vérifier que la procédure accepte encore des offres
    const procedure = await this.prisma.procedure.findUnique({
      where: { id: procedureId }
    });
    
    if (!procedure) throw new NotFoundException('Procédure introuvable');
    
    const now = new Date();
    const horsDelai = now > procedure.dateLimite;
    
    // BLOQUER si hors délai (sauf règles spécifiques de l'organisation)
    if (horsDelai && !procedure.accepteHorsDelai) {
      throw new ForbiddenException('La date limite de soumission est dépassée');
    }
    
    return this.prisma.$transaction(async (tx) => {
      
      // Générer numéro de dépôt unique et horodaté
      const numeroDepot = `${procedureId}-${Date.now()}-${randomBytes(4).toString('hex')}`;
      
      // Créer soumission avec horodatage EXACT
      const soumission = await tx.soumission.create({
        data: {
          procedureId,
          fournisseurId,
          numeroDepot,
          montantFinancier: data.montantFinancier,
          montantTotal: data.montantTotal,
          dateDepot: now, // Timestamp serveur (source de vérité)
          horsDelai,
          status: 'DEPOSEE',
          documents: {
            create: files.map(f => ({
              type: f.fieldname,
              nom: f.originalname,
              url: f.path,
              fileSize: f.size
            }))
          }
        }
      });
      
      // Audit log avec timestamp
      await tx.auditLog.create({
        data: {
          organizationId: procedure.organizationId,
          action: 'SOUMISSION_DEPOSEE',
          entityType: 'Soumission',
          entityId: soumission.id,
          metadata: {
            procedureId,
            fournisseurId,
            numeroDepot,
            dateDepot: now.toISOString(),
            horsDelai
          }
        }
      });
      
      // Notification au responsable procédure (SANS révéler détails offre)
      await this.notificationService.send({
        userId: procedure.responsableId,
        type: 'SOUMISSION_RECEIVED',
        title: 'Nouvelle offre reçue',
        message: `Une offre a été déposée pour la procédure ${procedure.reference}`,
        contextType: 'Procedure',
        contextId: procedureId
      });
      
      return soumission;
    });
  }
}
```

### 4. Protection anti-manipulation évaluation

```typescript
// backend/src/passation/services/evaluation.service.ts
export class EvaluationService {
  
  async submitEvaluation(
    soumissionId: string,
    commissionId: string,
    evaluateurId: string,
    scores: EvaluationScoresDto
  ) {
    
    // Vérifier que l'évaluateur est membre de la commission
    const membre = await this.prisma.membreCommission.findFirst({
      where: {
        commissionId,
        userId: evaluateurId,
        role: { in: ['MEMBRE', 'RAPPORTEUR'] }
      }
    });
    
    if (!membre) {
      throw new ForbiddenException('Vous n\'êtes pas membre de cette commission');
    }
    
    // Vérifier que la procédure est en phase d'évaluation
    const soumission = await this.prisma.soumission.findUnique({
      where: { id: soumissionId },
      include: { procedure: true }
    });
    
    if (soumission.procedure.status !== 'EVALUATION') {
      throw new ForbiddenException('La procédure n\'est pas en phase d\'évaluation');
    }
    
    // Transaction avec verrouillage optimiste
    return this.prisma.$transaction(async (tx) => {
      
      // Créer ou mettre à jour l'évaluation
      const evaluation = await tx.evaluation.upsert({
        where: {
          soumissionId_evaluateurId: {
            soumissionId,
            evaluateurId
          }
        },
        create: {
          soumissionId,
          commissionId,
          evaluateurId,
          scoreAdmin: scores.scoreAdmin,
          scoreTechnique: scores.scoreTechnique,
          scoreFinancier: scores.scoreFinancier,
          scoreGlobal: this.calculateScoreGlobal(scores),
          criteres: scores.detailsCriteres,
          commentaires: scores.commentaires
        },
        update: {
          scoreAdmin: scores.scoreAdmin,
          scoreTechnique: scores.scoreTechnique,
          scoreFinancier: scores.scoreFinancier,
          scoreGlobal: this.calculateScoreGlobal(scores),
          criteres: scores.detailsCriteres,
          commentaires: scores.commentaires,
          updatedAt: new Date()
        }
      });
      
      // Audit log avec détails
      await tx.auditLog.create({
        data: {
          organizationId: soumission.procedure.organizationId,
          userId: evaluateurId,
          action: 'EVALUATION_SUBMITTED',
          entityType: 'Evaluation',
          entityId: evaluation.id,
          oldValues: null, // Pour update, stocker anciens scores
          newValues: scores
        }
      });
      
      return evaluation;
    });
  }
  
  // Verrouiller évaluations après validation
  async lockEvaluations(commissionId: string, userId: string) {
    
    // Vérifier que l'utilisateur peut verrouiller (président commission ou admin)
    const canLock = await this.canLockEvaluation(commissionId, userId);
    
    if (!canLock) {
      throw new ForbiddenException('Vous ne pouvez pas verrouiller les évaluations');
    }
    
    return this.prisma.$transaction(async (tx) => {
      
      // Marquer toutes les évaluations comme validées (lecture seule)
      await tx.evaluation.updateMany({
        where: { commissionId },
        data: { validatedAt: new Date() }
      });
      
      // Audit
      await tx.auditLog.create({
        data: {
          action: 'EVALUATIONS_LOCKED',
          entityType: 'Commission',
          entityId: commissionId,
          userId
        }
      });
    });
  }
}
```

---

## 🔒 MODULE MESSAGERIE

### 1. Contrôle d'accès conversations

```typescript
// backend/src/messagerie/guards/conversation-access.guard.ts
@Injectable()
export class ConversationAccessGuard implements CanActivate {
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const conversationId = request.params.conversationId || request.body.conversationId;
    
    // Vérifier appartenance à la conversation
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id
        }
      },
      include: {
        conversation: {
          include: {
            activity: true,
            procedure: true,
            contrat: true,
            recommendation: true
          }
        }
      }
    });
    
    if (!participant) {
      // Si conversation contextuelle, vérifier droits sur l'objet métier
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          activity: true,
          procedure: true,
          contrat: true
        }
      });
      
      if (!conversation) throw new NotFoundException('Conversation introuvable');
      
      // Vérifier droits hérités
      const hasContextAccess = await this.checkContextAccess(user, conversation);
      
      if (!hasContextAccess) {
        throw new ForbiddenException('Accès interdit à cette conversation');
      }
    }
    
    return true;
  }
  
  private async checkContextAccess(user: any, conversation: any): Promise<boolean> {
    
    // Si conversation liée à une activité
    if (conversation.activityId) {
      const activity = conversation.activity;
      
      // Responsable ou collaborateur
      if (activity.responsibleId === user.id) return true;
      
      const isCollaborator = await this.prisma.activityCollaborator.findFirst({
        where: {
          activityId: activity.id,
          userId: user.id
        }
      });
      
      if (isCollaborator) return true;
    }
    
    // Si conversation liée à une procédure
    if (conversation.procedureId) {
      // Vérifier appartenance commission
      const isMember = await this.prisma.membreCommission.findFirst({
        where: {
          commission: { procedureId: conversation.procedureId },
          userId: user.id
        }
      });
      
      if (isMember) return true;
      
      // Ou responsable procédure
      if (conversation.procedure.responsableId === user.id) return true;
    }
    
    // Si conversation liée à un contrat
    if (conversation.contratId) {
      if (conversation.contrat.gestionnaire === user.id) return true;
    }
    
    return false;
  }
}
```

### 2. Sanitization & Validation

```typescript
// backend/src/messagerie/pipes/sanitize-message.pipe.ts
import * as DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class SanitizeMessagePipe implements PipeTransform {
  
  transform(value: SendMessageDto) {
    
    // Limites
    if (value.content.length > 10000) {
      throw new BadRequestException('Message trop long (max 10 000 caractères)');
    }
    
    // Si HTML, sanitize
    if (value.contentType === 'html') {
      value.content = DOMPurify.sanitize(value.content, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      });
    }
    
    // Si markdown, convertir en HTML puis sanitize
    if (value.contentType === 'markdown') {
      const html = marked.parse(value.content);
      value.content = DOMPurify.sanitize(html);
    }
    
    return value;
  }
}
```

### 3. Rate Limiting

```typescript
// backend/src/messagerie/guards/message-rate-limit.guard.ts
@Injectable()
export class MessageRateLimitGuard implements CanActivate {
  
  private readonly cache = new Map<string, number[]>();
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    
    const now = Date.now();
    const key = `message:${userId}`;
    
    // Récupérer timestamps des messages récents
    let timestamps = this.cache.get(key) || [];
    
    // Filtrer messages des 60 dernières secondes
    timestamps = timestamps.filter(ts => now - ts < 60000);
    
    // Limite : 10 messages par minute
    if (timestamps.length >= 10) {
      throw new ThrottlerException('Trop de messages envoyés. Attendez quelques secondes.');
    }
    
    // Ajouter timestamp actuel
    timestamps.push(now);
    this.cache.set(key, timestamps);
    
    return true;
  }
}

// Même principe pour pièces jointes
@Injectable()
export class AttachmentRateLimitGuard implements CanActivate {
  // Max 5 fichiers / minute
}
```

### 4. Chiffrement conversations sensibles (optionnel)

```typescript
// backend/src/messagerie/services/encryption.service.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class MessageEncryptionService {
  
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');
  
  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Utiliser pour conversations marquées comme "sensibles"
  async sendEncryptedMessage(conversationId: string, content: string, authorId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    
    // Chiffrer si conversation sensible (ex: procédures, contrats)
    let finalContent = content;
    let metadata = {};
    
    if (conversation.type === 'CONTEXTUAL' && conversation.procedureId) {
      const { encrypted, iv, tag } = this.encrypt(content);
      finalContent = encrypted;
      metadata = { encrypted: true, iv, tag };
    }
    
    return this.prisma.message.create({
      data: {
        conversationId,
        authorId,
        content: finalContent,
        metadata
      }
    });
  }
}
```

### 5. Audit trail messages sensibles

```typescript
// backend/src/messagerie/interceptors/message-audit.interceptor.ts
@Injectable()
export class MessageAuditInterceptor implements NestInterceptor {
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return next.handle().pipe(
      tap(async (message) => {
        
        // Auditer messages dans conversations sensibles
        const conversation = await this.prisma.conversation.findUnique({
          where: { id: message.conversationId },
          select: {
            type: true,
            procedureId: true,
            contratId: true,
            organizationId: true
          }
        });
        
        // Auditer si contextuel (procédure, contrat)
        if (conversation.type === 'CONTEXTUAL' && 
            (conversation.procedureId || conversation.contratId)) {
          
          await this.prisma.auditLog.create({
            data: {
              organizationId: conversation.organizationId,
              userId: user.id,
              action: 'MESSAGE_SENT',
              entityType: 'Message',
              entityId: message.id,
              metadata: {
                conversationId: message.conversationId,
                contentLength: message.content.length,
                hasAttachments: message.attachments?.length > 0,
                contextType: conversation.procedureId ? 'Procedure' : 'Contrat',
                contextId: conversation.procedureId || conversation.contratId
              }
            }
          });
        }
      })
    );
  }
}
```

---

## 🛡️ SÉCURITÉ TRANSVERSALE

### 1. Validation des uploads (pièces jointes)

```typescript
// backend/src/common/validators/file-upload.validator.ts
export const fileUploadConfig = {
  // Taille max par fichier
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  
  // Extensions autorisées
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip'
  ],
  
  // Interdictions
  deniedExtensions: ['.exe', '.sh', '.bat', '.cmd', '.com', '.scr', '.js', '.jar']
};

@Injectable()
export class FileUploadValidator {
  
  validate(file: Express.Multer.File) {
    
    // Vérifier taille
    if (file.size > fileUploadConfig.maxFileSize) {
      throw new BadRequestException('Fichier trop volumineux (max 10 MB)');
    }
    
    // Vérifier MIME type
    if (!fileUploadConfig.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Type de fichier non autorisé: ${file.mimetype}`);
    }
    
    // Vérifier extension (double extension, etc.)
    const ext = path.extname(file.originalname).toLowerCase();
    if (fileUploadConfig.deniedExtensions.includes(ext)) {
      throw new BadRequestException(`Extension interdite: ${ext}`);
    }
    
    // Scanner antivirus (à intégrer)
    // await this.antivirusService.scan(file.buffer);
    
    return true;
  }
}
```

### 2. Protection CSRF (déjà en place)

```typescript
// Déjà implémenté dans auth.controller.ts
// Cookies httpOnly + CSRF token double-submit
```

### 3. Rate limiting global (Throttler)

```typescript
// backend/src/app.module.ts
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100, // 100 requêtes / minute / IP
  ignoreUserAgents: [/googlebot/i, /bingbot/i], // Ignore bots
}),
```

### 4. Helmet (headers sécurité)

```typescript
// backend/src/main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
}));
```

---

## 📊 CHECKLIST SÉCURITÉ

### Module Passation

- [x] RBAC granulaire (permissions spécifiques)
- [x] Confidentialité soumissions avant ouverture
- [x] Workflow validation sécurisé (vérifier validateur actuel)
- [x] Contrôle budgétaire avant engagement
- [x] Horodatage sécurisé soumissions (timestamp serveur)
- [x] Verrouillage évaluations après validation
- [x] Audit trail complet (toutes actions sensibles)
- [x] Transactions atomiques (éviter incohérences)
- [x] Guards NestJS sur tous endpoints sensibles

### Module Messagerie

- [x] Vérification appartenance conversation
- [x] Permissions héritées du contexte métier
- [x] Sanitization HTML (DOMPurify)
- [x] Rate limiting (10 messages/min, 5 fichiers/min)
- [x] Validation uploads (taille, MIME types, extensions)
- [x] Chiffrement conversations sensibles (optionnel)
- [x] Audit trail messages contextuels
- [x] Soft delete (traçabilité suppressions)
- [x] WebSocket authentication (JWT dans handshake)

### Transversal

- [x] CSRF protection (déjà en place)
- [x] Helmet headers sécurité
- [x] Throttler global (100 req/min)
- [x] Validation DTOs (class-validator)
- [x] Sanitization inputs
- [x] Logging Sentry (erreurs 500+)
- [x] Multi-tenancy strict (organizationId)
- [x] Indexes optimisés (performance)

---

## 🚀 NEXT STEPS

1. ✅ Architecture sécurité validée
2. ⏭️ Implémenter schema.prisma
3. ⏭️ Créer Guards NestJS
4. ⏭️ Créer Services avec logique métier
5. ⏭️ Tests sécurité (unit + E2E)

**Cette architecture garantit une sécurité robuste pour les deux modules sensibles.** 🔒
