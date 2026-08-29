/**
 * Types TypeScript pour le module Messagerie Professionnelle
 * Alignés avec le backend Prisma schema
 */

// ============================================================================
// ENUMS
// ============================================================================

export type ConversationType =
  | 'DIRECT'
  | 'GROUP'
  | 'CHANNEL_PROJECT'
  | 'CHANNEL_TEAM'
  | 'CONTEXTUAL';

export type ConversationRole = 'ADMIN' | 'MEMBER';

export type MessageContentType = 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';

export type MentionType = 'USER' | 'ROLE' | 'ALL';

// ============================================================================
// CONVERSATIONS
// ============================================================================

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  role: ConversationRole;
  lastReadAt?: string | null;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  organizationId: string;
  titre?: string | null;
  type: ConversationType;
  contextId?: string | null; // ID du projet/activité/demande/contrat lié
  createdBy: string;
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  isArchived: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  participants?: ConversationParticipant[];
  messages?: Message[];
  _count?: {
    participants: number;
    messages: number;
  };
  lastMessage?: Message | null;
  unreadCount?: number;
}

// ============================================================================
// MESSAGES
// ============================================================================

export interface MessageAttachment {
  id: string;
  messageId: string;
  nom: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  emoji: string;
  createdAt: string;
}

export interface MessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface MessageMention {
  id: string;
  messageId: string;
  mentionType: MentionType;
  userId?: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  roleId?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  conversation?: Conversation;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  contentType: MessageContentType;
  content: string;
  parentId?: string | null;
  parent?: Message | null;
  isEdited: boolean;
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  reads?: MessageRead[];
  mentions?: MessageMention[];
  replies?: Message[];
  _count?: {
    attachments: number;
    reactions: number;
    reads: number;
    mentions: number;
    replies: number;
  };
}

// ============================================================================
// WEBSOCKET EVENTS
// ============================================================================

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isTyping: boolean;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

export interface MessageNotification {
  conversationId: string;
  message: Message;
  unreadCount: number;
}

// ============================================================================
// CREATE/UPDATE DTOs
// ============================================================================

export interface CreateConversationDto {
  titre?: string;
  type: ConversationType;
  contextId?: string;
  participantIds: string[];
}

export interface SendMessageDto {
  content: string;
  contentType?: MessageContentType;
  parentId?: string;
  mentionedUserIds?: string[];
}

export interface EditMessageDto {
  content: string;
}

export interface AddParticipantDto {
  userId: string;
  role?: ConversationRole;
}
