# API REST Endpoints - Modules Passation & Messagerie

## Module Passation de Marchés

### 1. Plan de Passation des Marchés (PPM)

**Base URL**: `/api/passation/ppm`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des PPM de l'organisation | `passation:ppm:read` |
| GET | `/:id` | Détails d'un PPM | `passation:ppm:read` |
| POST | `/` | Créer un nouveau PPM | `passation:ppm:create` |
| PATCH | `/:id` | Modifier un PPM | `passation:ppm:update` |
| DELETE | `/:id` | Supprimer un PPM | `passation:ppm:delete` |
| POST | `/:id/validate` | Valider un PPM | `passation:ppm:validate` |
| GET | `/:id/export` | Exporter PPM (PDF/Excel) | `passation:ppm:read` |

**Query params (GET `/`):**
- `year` (number): Filtrer par année
- `status` (StatusPPM): Filtrer par statut
- `projectId` (string): Filtrer par projet

### 2. Lignes PPM

**Base URL**: `/api/passation/ppm/:ppmId/lignes`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des lignes d'un PPM | `passation:ppm:read` |
| GET | `/:id` | Détails d'une ligne | `passation:ppm:read` |
| POST | `/` | Ajouter une ligne au PPM | `passation:ppm:update` |
| PATCH | `/:id` | Modifier une ligne | `passation:ppm:update` |
| DELETE | `/:id` | Supprimer une ligne | `passation:ppm:update` |

### 3. Demandes d'Achat

**Base URL**: `/api/passation/demandes`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des demandes | `passation:demandes:read` |
| GET | `/:id` | Détails d'une demande | `passation:demandes:read` |
| POST | `/` | Créer une demande | `passation:demandes:create` |
| PATCH | `/:id` | Modifier une demande | `passation:demandes:update` |
| DELETE | `/:id` | Supprimer une demande | `passation:demandes:delete` |
| POST | `/:id/submit` | Soumettre pour validation | `passation:demandes:submit` |
| POST | `/:id/validate` | Valider/Rejeter une demande | `passation:demandes:validate` |
| GET | `/:id/workflow` | Historique du workflow | `passation:demandes:read` |

**Query params (GET `/`):**
- `status` (StatusDemandeAchat): Filtrer par statut
- `demandeurId` (string): Filtrer par demandeur
- `activityId` (string): Filtrer par activité
- `dateFrom`, `dateTo`: Filtrage par date

### 4. Fournisseurs

**Base URL**: `/api/passation/fournisseurs`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des fournisseurs | `passation:fournisseurs:read` |
| GET | `/:id` | Détails d'un fournisseur | `passation:fournisseurs:read` |
| POST | `/` | Créer un fournisseur | `passation:fournisseurs:create` |
| PATCH | `/:id` | Modifier un fournisseur | `passation:fournisseurs:update` |
| DELETE | `/:id` | Supprimer un fournisseur | `passation:fournisseurs:delete` |
| POST | `/:id/suspend` | Suspendre un fournisseur | `passation:fournisseurs:manage` |
| POST | `/:id/blacklist` | Blacklister un fournisseur | `passation:fournisseurs:manage` |
| POST | `/:id/activate` | Activer un fournisseur | `passation:fournisseurs:manage` |
| GET | `/:id/documents` | Documents du fournisseur | `passation:fournisseurs:read` |
| POST | `/:id/documents` | Ajouter un document | `passation:fournisseurs:update` |
| DELETE | `/:id/documents/:docId` | Supprimer un document | `passation:fournisseurs:update` |

**Query params (GET `/`):**
- `status` (StatusFournisseur): Filtrer par statut
- `search` (string): Recherche par nom/SIRET

### 5. Procédures de Passation

**Base URL**: `/api/passation/procedures`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des procédures | `passation:procedures:read` |
| GET | `/:id` | Détails d'une procédure | `passation:procedures:read` |
| POST | `/` | Créer une procédure | `passation:procedures:create` |
| PATCH | `/:id` | Modifier une procédure | `passation:procedures:update` |
| DELETE | `/:id` | Supprimer une procédure | `passation:procedures:delete` |
| POST | `/:id/publish` | Publier la procédure | `passation:procedures:publish` |
| POST | `/:id/close` | Clôturer les offres | `passation:procedures:manage` |
| POST | `/:id/cancel` | Annuler la procédure | `passation:procedures:manage` |
| GET | `/:id/dossier` | Télécharger DAO/TDR | `passation:procedures:read` |

**Query params (GET `/`):**
- `status` (StatusProcedure): Filtrer par statut
- `methode` (MethodeProcedure): Filtrer par méthode
- `responsableId` (string): Filtrer par responsable

### 6. Soumissions (Offres)

**Base URL**: `/api/passation/procedures/:procedureId/soumissions`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des soumissions | `passation:soumissions:read` |
| GET | `/:id` | Détails d'une soumission | `passation:soumissions:read` |
| POST | `/` | Déposer une soumission | `passation:soumissions:create` |
| GET | `/:id/documents` | Documents de la soumission | `passation:soumissions:read` |

**⚠️ Sécurité critique:**
- Accès aux soumissions **INTERDIT** avant `dateOuvertureOffres`
- Exception: Super Admin uniquement (audit)
- Guard: `SoumissionConfidentialityGuard`

### 7. Commissions d'Évaluation

**Base URL**: `/api/passation/commissions`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des commissions | `passation:commissions:read` |
| GET | `/:id` | Détails d'une commission | `passation:commissions:read` |
| POST | `/` | Créer une commission | `passation:commissions:create` |
| PATCH | `/:id` | Modifier une commission | `passation:commissions:update` |
| DELETE | `/:id` | Supprimer une commission | `passation:commissions:delete` |
| POST | `/:id/membres` | Ajouter un membre | `passation:commissions:manage` |
| DELETE | `/:id/membres/:membreId` | Retirer un membre | `passation:commissions:manage` |

### 8. Évaluations

**Base URL**: `/api/passation/procedures/:procedureId/evaluations`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des évaluations | `passation:evaluations:read` |
| GET | `/:id` | Détails d'une évaluation | `passation:evaluations:read` |
| POST | `/` | Créer une évaluation | `passation:evaluations:create` |
| PATCH | `/:id` | Modifier une évaluation | `passation:evaluations:update` |
| POST | `/:id/submit` | Soumettre l'évaluation | `passation:evaluations:submit` |
| GET | `/synthese` | Synthèse globale | `passation:evaluations:read` |

**⚠️ Sécurité:**
- Évaluateur ne peut modifier QUE ses propres évaluations
- Synthèse visible seulement après soumission de toutes les évaluations

### 9. Contrats

**Base URL**: `/api/passation/contrats`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des contrats | `passation:contrats:read` |
| GET | `/:id` | Détails d'un contrat | `passation:contrats:read` |
| POST | `/` | Créer un contrat | `passation:contrats:create` |
| PATCH | `/:id` | Modifier un contrat | `passation:contrats:update` |
| DELETE | `/:id` | Supprimer un contrat | `passation:contrats:delete` |
| POST | `/:id/suspend` | Suspendre le contrat | `passation:contrats:manage` |
| POST | `/:id/terminate` | Terminer le contrat | `passation:contrats:manage` |
| POST | `/:id/close` | Clôturer le contrat | `passation:contrats:manage` |
| GET | `/:id/dashboard` | Dashboard de suivi | `passation:contrats:read` |

### 10. Avenants

**Base URL**: `/api/passation/contrats/:contratId/avenants`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des avenants | `passation:contrats:read` |
| GET | `/:id` | Détails d'un avenant | `passation:contrats:read` |
| POST | `/` | Créer un avenant | `passation:contrats:update` |
| PATCH | `/:id` | Modifier un avenant | `passation:contrats:update` |
| DELETE | `/:id` | Supprimer un avenant | `passation:contrats:update` |

### 11. Livrables

**Base URL**: `/api/passation/contrats/:contratId/livrables`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des livrables | `passation:contrats:read` |
| GET | `/:id` | Détails d'un livrable | `passation:contrats:read` |
| POST | `/` | Créer un livrable | `passation:contrats:update` |
| PATCH | `/:id` | Modifier un livrable | `passation:contrats:update` |
| DELETE | `/:id` | Supprimer un livrable | `passation:contrats:update` |
| POST | `/:id/receptions` | Ajouter PV de réception | `passation:contrats:manage` |

### 12. Paiements

**Base URL**: `/api/passation/contrats/:contratId/paiements`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des paiements | `passation:paiements:read` |
| GET | `/:id` | Détails d'un paiement | `passation:paiements:read` |
| POST | `/` | Créer un paiement | `passation:paiements:create` |
| PATCH | `/:id` | Modifier un paiement | `passation:paiements:update` |
| DELETE | `/:id` | Supprimer un paiement | `passation:paiements:delete` |

### 13. Évaluations Fournisseurs

**Base URL**: `/api/passation/fournisseurs/:fournisseurId/evaluations`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des évaluations | `passation:fournisseurs:read` |
| POST | `/` | Créer une évaluation | `passation:evaluations:create` |
| GET | `/moyenne` | Moyenne des évaluations | `passation:fournisseurs:read` |

---

## Module Messagerie

### 1. Conversations

**Base URL**: `/api/messagerie/conversations`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des conversations | `messagerie:read` |
| GET | `/:id` | Détails d'une conversation | `messagerie:read` |
| POST | `/` | Créer une conversation | `messagerie:create` |
| PATCH | `/:id` | Modifier une conversation | `messagerie:update` |
| DELETE | `/:id` | Supprimer une conversation | `messagerie:delete` |
| POST | `/:id/archive` | Archiver/Désarchiver | `messagerie:update` |
| POST | `/:id/leave` | Quitter la conversation | `messagerie:participate` |

**Query params (GET `/`):**
- `type` (ConversationType): Filtrer par type
- `contextType`: Filtrer par contexte (project, activity, procedure, contrat)
- `contextId`: ID du contexte
- `isArchived` (boolean): Conversations archivées

**Response (GET `/`):**
```json
{
  "conversations": [
    {
      "id": "ckx...",
      "type": "CONTEXTUAL",
      "name": "Demande #DA-2024-001",
      "avatarUrl": null,
      "lastMessageAt": "2024-08-29T10:30:00Z",
      "unreadCount": 3,
      "participants": [
        { "userId": "...", "role": "ADMIN", "user": { "firstName": "...", "lastName": "..." } }
      ],
      "lastMessage": {
        "content": "Dernier message...",
        "authorId": "...",
        "createdAt": "2024-08-29T10:30:00Z"
      }
    }
  ],
  "total": 42
}
```

### 2. Participants

**Base URL**: `/api/messagerie/conversations/:conversationId/participants`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des participants | `messagerie:read` |
| POST | `/` | Ajouter un participant | `messagerie:manage` |
| PATCH | `/:userId` | Modifier rôle/préférences | `messagerie:manage` |
| DELETE | `/:userId` | Retirer un participant | `messagerie:manage` |
| POST | `/me/mute` | Mute/Unmute conversation | `messagerie:participate` |
| POST | `/me/pin` | Épingler/Désépingler | `messagerie:participate` |
| POST | `/me/mark-read` | Marquer tout comme lu | `messagerie:participate` |

### 3. Messages

**Base URL**: `/api/messagerie/conversations/:conversationId/messages`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/` | Liste des messages (paginée) | `messagerie:read` |
| GET | `/:id` | Détails d'un message | `messagerie:read` |
| POST | `/` | Envoyer un message | `messagerie:send` |
| PATCH | `/:id` | Modifier un message | `messagerie:send` |
| DELETE | `/:id` | Supprimer un message | `messagerie:send` |
| POST | `/:id/react` | Ajouter une réaction | `messagerie:participate` |
| DELETE | `/:id/reactions/:reactionId` | Retirer une réaction | `messagerie:participate` |
| POST | `/:id/read` | Marquer comme lu | `messagerie:participate` |

**Query params (GET `/`):**
- `limit` (number): Nombre de messages (défaut: 50, max: 100)
- `before` (string): Cursor pour pagination
- `after` (string): Cursor pour pagination
- `parentId` (string): Filtrer les réponses à un message

**Response (GET `/`):**
```json
{
  "messages": [
    {
      "id": "ckx...",
      "content": "Texte du message",
      "contentType": "TEXT",
      "authorId": "...",
      "author": { "firstName": "...", "lastName": "...", "avatarUrl": "..." },
      "parentId": null,
      "isEdited": false,
      "isDeleted": false,
      "createdAt": "2024-08-29T10:30:00Z",
      "attachments": [],
      "reactions": [
        { "emoji": "👍", "count": 3, "userIds": ["...", "...", "..."] }
      ],
      "mentions": [
        { "userId": "...", "type": "USER" }
      ]
    }
  ],
  "hasMore": true,
  "nextCursor": "ckx..."
}
```

**Body (POST `/`):**
```json
{
  "content": "Texte du message",
  "contentType": "TEXT",
  "parentId": null,
  "mentions": [
    { "userId": "ckx...", "type": "USER", "startPos": 0, "endPos": 10 }
  ]
}
```

**Rate Limiting:**
- **10 messages/minute** par utilisateur
- **5 attachments/minute** par utilisateur
- Guard: `MessageRateLimitGuard`

### 4. Attachments (Pièces jointes)

**Base URL**: `/api/messagerie/messages/:messageId/attachments`

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| POST | `/` | Uploader une pièce jointe | `messagerie:send` |

**Upload specs:**
- Max file size: **10 MB**
- Allowed types: images, PDF, Office docs
- Storage: Backblaze B2 / S3
- Validation: MIME type + extension check

**Response (POST `/`):**
```json
{
  "id": "ckx...",
  "fileName": "document.pdf",
  "fileUrl": "https://cdn.example.com/...",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "thumbnailUrl": null
}
```

### 5. WebSocket Events (Socket.io)

**Namespace**: `/messagerie`

**Authentication**: JWT token via handshake query `?token=...`

#### Events Client → Server

```typescript
// Envoyer un message
socket.emit('message:send', {
  conversationId: 'ckx...',
  content: 'Texte...',
  parentId?: 'ckx...'
})

// Modifier un message
socket.emit('message:edit', {
  messageId: 'ckx...',
  content: 'Nouveau texte...'
})

// Supprimer un message
socket.emit('message:delete', { messageId: 'ckx...' })

// Ajouter réaction
socket.emit('reaction:add', {
  messageId: 'ckx...',
  emoji: '👍'
})

// Retirer réaction
socket.emit('reaction:remove', { reactionId: 'ckx...' })

// Typing indicator
socket.emit('typing:start', { conversationId: 'ckx...' })
socket.emit('typing:stop', { conversationId: 'ckx...' })

// Marquer comme lu
socket.emit('message:markRead', { messageId: 'ckx...' })
```

#### Events Server → Client

```typescript
// Nouveau message
socket.on('message:new', (message) => {
  // { id, content, authorId, author, conversationId, createdAt, ... }
})

// Message modifié
socket.on('message:edited', (message) => {
  // { id, content, isEdited: true, editedAt, ... }
})

// Message supprimé
socket.on('message:deleted', ({ messageId }) => {})

// Réaction ajoutée
socket.on('reaction:added', (reaction) => {
  // { id, messageId, userId, emoji, createdAt }
})

// Réaction retirée
socket.on('reaction:removed', ({ reactionId, messageId }) => {})

// Typing indicator
socket.on('typing:start', ({ userId, conversationId }) => {})
socket.on('typing:stop', ({ userId, conversationId }) => {})

// Message lu
socket.on('message:read', ({ messageId, userId, readAt }) => {})

// Présence utilisateur
socket.on('user:online', ({ userId }) => {})
socket.on('user:offline', ({ userId }) => {})

// Conversation créée/modifiée
socket.on('conversation:created', (conversation) => {})
socket.on('conversation:updated', (conversation) => {})

// Participant ajouté/retiré
socket.on('participant:joined', ({ conversationId, userId }) => {})
socket.on('participant:left', ({ conversationId, userId }) => {})
```

---

## Permissions RBAC

### Module Passation

```typescript
const PASSATION_PERMISSIONS = {
  // PPM
  'passation:ppm:read': 'Voir les PPM',
  'passation:ppm:create': 'Créer des PPM',
  'passation:ppm:update': 'Modifier des PPM',
  'passation:ppm:delete': 'Supprimer des PPM',
  'passation:ppm:validate': 'Valider des PPM',

  // Demandes
  'passation:demandes:read': 'Voir les demandes',
  'passation:demandes:create': 'Créer des demandes',
  'passation:demandes:update': 'Modifier des demandes',
  'passation:demandes:delete': 'Supprimer des demandes',
  'passation:demandes:submit': 'Soumettre des demandes',
  'passation:demandes:validate': 'Valider des demandes',

  // Fournisseurs
  'passation:fournisseurs:read': 'Voir les fournisseurs',
  'passation:fournisseurs:create': 'Créer des fournisseurs',
  'passation:fournisseurs:update': 'Modifier des fournisseurs',
  'passation:fournisseurs:delete': 'Supprimer des fournisseurs',
  'passation:fournisseurs:manage': 'Gérer statut fournisseurs',

  // Procédures
  'passation:procedures:read': 'Voir les procédures',
  'passation:procedures:create': 'Créer des procédures',
  'passation:procedures:update': 'Modifier des procédures',
  'passation:procedures:delete': 'Supprimer des procédures',
  'passation:procedures:publish': 'Publier des procédures',
  'passation:procedures:manage': 'Gérer les procédures',

  // Soumissions
  'passation:soumissions:read': 'Voir les soumissions',
  'passation:soumissions:create': 'Créer des soumissions',

  // Commissions
  'passation:commissions:read': 'Voir les commissions',
  'passation:commissions:create': 'Créer des commissions',
  'passation:commissions:update': 'Modifier des commissions',
  'passation:commissions:delete': 'Supprimer des commissions',
  'passation:commissions:manage': 'Gérer les membres',

  // Évaluations
  'passation:evaluations:read': 'Voir les évaluations',
  'passation:evaluations:create': 'Créer des évaluations',
  'passation:evaluations:update': 'Modifier des évaluations',
  'passation:evaluations:submit': 'Soumettre des évaluations',

  // Contrats
  'passation:contrats:read': 'Voir les contrats',
  'passation:contrats:create': 'Créer des contrats',
  'passation:contrats:update': 'Modifier des contrats',
  'passation:contrats:delete': 'Supprimer des contrats',
  'passation:contrats:manage': 'Gérer les contrats',

  // Paiements
  'passation:paiements:read': 'Voir les paiements',
  'passation:paiements:create': 'Créer des paiements',
  'passation:paiements:update': 'Modifier des paiements',
  'passation:paiements:delete': 'Supprimer des paiements',
};
```

### Module Messagerie

```typescript
const MESSAGERIE_PERMISSIONS = {
  'messagerie:read': 'Lire les conversations',
  'messagerie:create': 'Créer des conversations',
  'messagerie:update': 'Modifier des conversations',
  'messagerie:delete': 'Supprimer des conversations',
  'messagerie:send': 'Envoyer des messages',
  'messagerie:manage': 'Gérer participants et rôles',
  'messagerie:participate': 'Participer aux conversations',
};
```

---

## Guards NestJS à implémenter

### 1. SoumissionConfidentialityGuard
Bloque l'accès aux soumissions avant `dateOuvertureOffres`, sauf pour Super Admin.

### 2. ConversationAccessGuard
Vérifie que l'utilisateur est participant de la conversation.

### 3. MessageOwnershipGuard
Vérifie que l'utilisateur est auteur du message (pour édition/suppression).

### 4. MessageRateLimitGuard
Limite 10 messages/min et 5 attachments/min.

### 5. WorkflowValidationGuard
Vérifie les règles métier du workflow (ordre des validations, montants, etc.).

---

## Statistiques

- **Total endpoints REST**: ~65
- **Contrôleurs NestJS**: 13 (Passation) + 3 (Messagerie) = **16 contrôleurs**
- **WebSocket events**: ~20
- **Guards custom**: 5
- **Permissions RBAC**: 33 (Passation) + 7 (Messagerie) = **40 permissions**
