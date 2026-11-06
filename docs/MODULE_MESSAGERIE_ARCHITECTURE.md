# Architecture Module Messagerie Professionnelle

## Vue d'ensemble

Le module Messagerie permet la communication temps réel entre utilisateurs avec rattachement contextuel aux objets métier (projets, activités, marchés, contrats, recommandations).

**Stack technique :**
- Backend : NestJS + WebSocket (Socket.io)
- Frontend : Next.js + Socket.io-client
- Notifications : In-app + Email (V1), Push/SMS/WhatsApp (évolution)

## Modèle de données (Prisma Schema)

### 1. Conversations

```prisma
model Conversation {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Type de conversation
  type           String       // DIRECT | GROUP | CHANNEL_PROJECT | CHANNEL_TEAM | CONTEXTUAL
  
  // Informations
  name           String?      // Nom du groupe/canal (null pour direct)
  description    String?      @db.Text
  avatarUrl      String?
  
  // Contexte métier (messagerie contextuelle)
  projectId      String?
  project        ActionPlan?  @relation(fields: [projectId], references: [id])
  
  activityId     String?
  activity       Activity?    @relation(fields: [activityId], references: [id])
  
  recommendationId String?
  recommendation   Recommendation? @relation(fields: [recommendationId], references: [id])
  
  procedureId    String?
  procedure      Procedure?   @relation(fields: [procedureId], references: [id])
  
  contratId      String?
  contrat        Contrat?     @relation(fields: [contratId], references: [id])
  
  // Métadonnées
  isArchived     Boolean      @default(false)
  lastMessageAt  DateTime?
  
  createdById    String
  createdBy      User         @relation("ConversationCreator", fields: [createdById], references: [id])
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  participants   ConversationParticipant[]
  messages       Message[]
  
  @@index([organizationId])
  @@index([type])
  @@index([projectId])
  @@index([activityId])
  @@index([recommendationId])
  @@index([procedureId])
  @@index([contratId])
  @@index([lastMessageAt])
  @@map("conversations")
}

model ConversationParticipant {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Rôle dans la conversation
  role           String       @default("MEMBER") // ADMIN | MEMBER | OBSERVER
  
  // Préférences
  isMuted        Boolean      @default(false)
  isPinned       Boolean      @default(false)
  
  // Lecture
  lastReadAt     DateTime?
  unreadCount    Int          @default(0)
  
  // Dates
  joinedAt       DateTime     @default(now())
  leftAt         DateTime?
  
  @@unique([conversationId, userId])
  @@index([conversationId])
  @@index([userId])
  @@index([isPinned])
  @@map("conversation_participants")
}
```

### 2. Messages

```prisma
model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  // Auteur
  authorId       String
  author         User         @relation("MessageAuthor", fields: [authorId], references: [id])
  
  // Contenu
  content        String       @db.Text
  contentType    String       @default("text") // text | html | markdown
  
  // Threading (réponses)
  parentId       String?
  parent         Message?     @relation("MessageThread", fields: [parentId], references: [id], onDelete: Cascade)
  replies        Message[]    @relation("MessageThread")
  
  // Édition/suppression
  isEdited       Boolean      @default(false)
  editedAt       DateTime?
  isDeleted      Boolean      @default(false)
  deletedAt      DateTime?
  
  // Message système
  isSystem       Boolean      @default(false) // Ex: "X a rejoint la conversation"
  
  // Métadonnées
  metadata       Json?        // Flexible pour extensions (citations, liens, etc.)
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  attachments    MessageAttachment[]
  reactions      MessageReaction[]
  reads          MessageRead[]
  mentions       MessageMention[]
  
  @@index([conversationId])
  @@index([authorId])
  @@index([parentId])
  @@index([createdAt])
  @@index([isDeleted])
  @@map("messages")
}
```

### 3. Pièces jointes

```prisma
model MessageAttachment {
  id         String   @id @default(cuid())
  messageId  String
  message    Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  // Fichier
  fileName   String
  fileUrl    String   // URL Backblaze B2 ou S3
  fileSize   Int
  mimeType   String
  
  // Métadonnées
  thumbnailUrl String?
  width      Int?
  height     Int?
  duration   Int?     // Pour vidéos/audio (en secondes)
  
  uploadedAt DateTime @default(now())
  
  @@index([messageId])
  @@map("message_attachments")
}
```

### 4. Réactions

```prisma
model MessageReaction {
  id        String   @id @default(cuid())
  messageId String
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  emoji     String   // Unicode emoji ou code :thumbsup:
  
  createdAt DateTime @default(now())
  
  @@unique([messageId, userId, emoji])
  @@index([messageId])
  @@index([userId])
  @@map("message_reactions")
}
```

### 5. Accusés de lecture

```prisma
model MessageRead {
  id        String   @id @default(cuid())
  messageId String
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  readAt    DateTime @default(now())
  
  @@unique([messageId, userId])
  @@index([messageId])
  @@index([userId])
  @@map("message_reads")
}
```

### 6. Mentions

```prisma
model MessageMention {
  id        String   @id @default(cuid())
  messageId String
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Type de mention
  type      String   @default("USER") // USER | TEAM | EVERYONE
  
  // Position dans le message (optionnel)
  startPos  Int?
  endPos    Int?
  
  // Notification
  notified  Boolean  @default(false)
  
  createdAt DateTime @default(now())
  
  @@index([messageId])
  @@index([userId])
  @@index([notified])
  @@map("message_mentions")
}
```

### 7. Messages épinglés (optionnel - peut être un champ dans Message)

```prisma
model PinnedMessage {
  id             String       @id @default(cuid())
  conversationId String
  messageId      String
  
  pinnedById     String
  pinnedBy       User         @relation(fields: [pinnedById], references: [id])
  
  pinnedAt       DateTime     @default(now())
  
  @@unique([conversationId, messageId])
  @@index([conversationId])
  @@map("pinned_messages")
}
```

## Relations avec les tables existantes

### Modifications nécessaires

```prisma
// Dans User - Ajouter relations
model User {
  // ... champs existants
  
  // Messagerie
  conversationsCreated     Conversation[]            @relation("ConversationCreator")
  conversationParticipants ConversationParticipant[]
  messagesAuthored         Message[]                 @relation("MessageAuthor")
  messageReactions         MessageReaction[]
  messageReads             MessageRead[]
  messageMentions          MessageMention[]
  pinnedMessages           PinnedMessage[]
}

// Dans Organization - Ajouter relations
model Organization {
  // ... champs existants
  
  // Messagerie
  conversations            Conversation[]
}

// Dans Activity - Ajouter relations
model Activity {
  // ... champs existants
  
  // Messagerie contextuelle
  conversations            Conversation[]
}

// Dans Recommendation - Ajouter relations
model Recommendation {
  // ... champs existants
  
  // Messagerie contextuelle
  conversations            Conversation[]
}

// Dans Procedure - Ajouter relations (nouveau module)
model Procedure {
  // ... champs existants
  
  // Messagerie contextuelle
  conversations            Conversation[]
}

// Dans Contrat - Ajouter relations (nouveau module)
model Contrat {
  // ... champs existants
  
  // Messagerie contextuelle
  conversations            Conversation[]
}

// Dans ActionPlan (projets) - Ajouter relations
model ActionPlan {
  // ... champs existants
  
  // Messagerie contextuelle (canaux projet)
  conversations            Conversation[]
}
```

## Enums à ajouter

```prisma
enum ConversationType {
  DIRECT               // Conversation 1-1
  GROUP                // Groupe N personnes
  CHANNEL_PROJECT      // Canal projet (persistant)
  CHANNEL_TEAM         // Canal équipe (Finance, MEAL, etc.)
  CONTEXTUAL           // Fil lié à objet métier
}

enum ConversationRole {
  ADMIN                // Peut gérer membres, paramètres
  MEMBER               // Participation standard
  OBSERVER             // Lecture seule
}

enum MessageContentType {
  TEXT
  HTML
  MARKDOWN
}

enum MentionType {
  USER                 // @utilisateur
  TEAM                 // @équipe (ex: @finance)
  EVERYONE             // @tous
}
```

## Architecture WebSocket

### Events serveur → client

```typescript
// Connection
socket.on('connect', () => {})
socket.on('disconnect', () => {})

// Messages
socket.on('message:new', (message) => {})
socket.on('message:edited', (message) => {})
socket.on('message:deleted', (messageId) => {})

// Réactions
socket.on('reaction:added', (reaction) => {})
socket.on('reaction:removed', (reactionId) => {})

// Typing indicators
socket.on('typing:start', ({ userId, conversationId }) => {})
socket.on('typing:stop', ({ userId, conversationId }) => {})

// Présence
socket.on('user:online', (userId) => {})
socket.on('user:offline', (userId) => {})

// Lecture
socket.on('message:read', ({ messageId, userId }) => {})

// Conversations
socket.on('conversation:created', (conversation) => {})
socket.on('conversation:updated', (conversation) => {})
socket.on('participant:joined', ({ conversationId, userId }) => {})
socket.on('participant:left', ({ conversationId, userId }) => {})
```

### Events client → serveur

```typescript
// Messages
socket.emit('message:send', { conversationId, content, parentId? })
socket.emit('message:edit', { messageId, content })
socket.emit('message:delete', { messageId })

// Réactions
socket.emit('reaction:add', { messageId, emoji })
socket.emit('reaction:remove', { reactionId })

// Typing
socket.emit('typing:start', { conversationId })
socket.emit('typing:stop', { conversationId })

// Lecture
socket.emit('message:markRead', { messageId })
socket.emit('conversation:markAllRead', { conversationId })

// Conversations
socket.emit('conversation:create', { type, name, participantIds })
socket.emit('conversation:join', { conversationId })
socket.emit('conversation:leave', { conversationId })
```

## Stratégie de notification

### V1 (Obligatoire)

**In-app (temps réel)**
- Badge de notifications non lues
- Toast pour nouveaux messages
- Son de notification (configurable)

**Email**
- Mentions (@user)
- Messages dans conversations importantes
- Résumé quotidien (configurable)

### Évolution

**Push mobile** (avec application mobile)
**SMS** (via API Twilio/Africa's Talking)
**WhatsApp** (via API Business)

## Performance & Scalabilité

### Optimisations

**Pagination**
- Messages chargés par batch (20-50 à la fois)
- Infinite scroll / Load more

**Cache**
- Redis pour conversations actives
- Cache liste participants
- Cache unread counts

**Indexes**
- `conversationId` + `createdAt` pour pagination
- `userId` pour requêtes utilisateur
- `isDeleted = false` pour filtrage

**Nettoyage**
- Soft delete des messages
- Hard delete après X jours (configurable)
- Archivage conversations anciennes

## Sécurité

✅ **Contrôle d'accès**
- Vérifier appartenance conversation avant envoi
- Vérifier droits modification (ses propres messages)
- Permissions héritées du contexte (activité, marché)

✅ **Validation**
- Sanitize HTML si contentType = html
- Limite taille messages (10KB)
- Limite pièces jointes (10MB par fichier)
- Vérification MIME types

✅ **Rate limiting**
- Max 10 messages / minute / utilisateur
- Max 5 pièces jointes / minute

✅ **Audit**
- Log toutes les modifications/suppressions
- Traçabilité dans AuditLog existant

## Messagerie contextuelle - Cas d'usage

### Exemple 1 : Demande d'achat

```typescript
// Création automatique d'une conversation lors de la demande
const conversation = await prisma.conversation.create({
  data: {
    organizationId,
    type: 'CONTEXTUAL',
    name: `Demande #${demande.reference}`,
    demandeAchatId: demande.id, // Lien contextuel
    createdById: demandeur.id,
    participants: {
      create: [
        { userId: demandeur.id, role: 'ADMIN' },
        { userId: chefProjet.id, role: 'MEMBER' },
        { userId: responsableFinance.id, role: 'MEMBER' },
      ]
    }
  }
})

// Les échanges restent attachés au dossier
// Visible dans l'UI : onglet "Discussion" dans la fiche demande
```

### Exemple 2 : Marché en évaluation

```typescript
// Conversation pour la commission d'évaluation
const conversation = await prisma.conversation.create({
  data: {
    organizationId,
    type: 'CONTEXTUAL',
    name: `Évaluation - Procédure #${procedure.reference}`,
    procedureId: procedure.id,
    createdById: responsablePassation.id,
    participants: {
      create: commission.membres.map(m => ({
        userId: m.userId,
        role: m.role === 'RAPPORTEUR' ? 'ADMIN' : 'MEMBER'
      }))
    }
  }
})

// Échanges confidentiels entre membres de la commission
// Archivés avec le dossier marché pour audit
```

### Exemple 3 : Canal projet

```typescript
// Canal persistant pour toute l'équipe projet
const conversation = await prisma.conversation.create({
  data: {
    organizationId,
    type: 'CHANNEL_PROJECT',
    name: `Projet ${projet.title}`,
    projectId: projet.id,
    createdById: chefProjet.id,
    participants: {
      create: equipe.map(user => ({
        userId: user.id,
        role: user.id === chefProjet.id ? 'ADMIN' : 'MEMBER'
      }))
    }
  }
})

// Tous les membres du projet peuvent échanger
// Historique conservé pendant toute la durée du projet
```

## Index de performance

```prisma
// Conversations
@@index([organizationId])
@@index([type])
@@index([lastMessageAt])        // Tri par activité récente
@@index([projectId])             // Filtrage par projet
@@index([activityId])            // Messagerie contextuelle
@@index([procedureId])           // Messagerie marchés
@@index([contratId])             // Messagerie contrats

// Messages
@@index([conversationId, createdAt]) // Pagination dans conversation
@@index([authorId])                   // Messages de l'utilisateur
@@index([isDeleted])                  // Filtrage messages supprimés

// Participants
@@index([userId])                     // Conversations de l'utilisateur
@@index([isPinned])                   // Conversations épinglées
@@index([conversationId, userId])     // Recherche rapide

// Mentions
@@index([userId, notified])           // Mentions non lues
```

## Statistiques

- **Nouvelles tables** : 7
- **Enums** : 4
- **Relations ajoutées** : ~12
- **Index** : ~30
- **WebSocket Events** : ~20

## Bonnes pratiques appliquées

✅ Multi-tenancy strict (`organizationId`)  
✅ Soft delete (messages)  
✅ Audit trail via `createdAt`/`updatedAt`  
✅ Index optimisés (pagination, recherche)  
✅ Relations CASCADE appropriées  
✅ Messagerie contextuelle (rattachement objets)  
✅ Permissions héritées du contexte  
✅ WebSocket temps réel  
✅ Notifications multi-canal (in-app, email, push)  

---

**Next step** : Implémenter les deux modules (Passation + Messagerie) dans `backend/prisma/schema.prisma`.
