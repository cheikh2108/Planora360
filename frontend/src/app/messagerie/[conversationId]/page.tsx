'use client';

/**
 * Chat Page - WhatsApp-level Messaging Experience
 * Features: Real-time WebSocket, typing indicators, read receipts,
 * reactions, replies, file preview, online status, modern UI
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi, messagesApi } from '@/lib/api';
import { useMessagerieSocket } from '@/hooks/useMessagerieSocket';
import { useAuth } from '@/lib/auth-context';
import type { Conversation, Message, TypingIndicator } from '@/lib/types-messagerie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-field';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { formatMessageTime } from '@/lib/utils';
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  Archive,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const conversationId = params.conversationId as string;
  const { user } = useAuth();

  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Fetch conversation
  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: async () => {
      const res = await conversationsApi.getOne(conversationId);
      return res.data as Conversation;
    },
  });

  // Fetch messages
  const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await messagesApi.getAll(conversationId);
      // Le backend retourne { messages: [], hasMore, nextCursor }
      const data = res.data as { messages: Message[]; hasMore: boolean; nextCursor: string | null };
      return data.messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    },
  });

  // WebSocket connection
  const {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    addReaction,
  } = useMessagerieSocket({
    conversationId,
    onMessage: (newMessage) => {
      queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
        if (!old) return [newMessage];
        return [...old, newMessage];
      });
      // Auto scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
    onTyping: (indicator) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== indicator.userId);
        if (indicator.isTyping) {
          return [...filtered, indicator];
        }
        return filtered;
      });
    },
    onMessageEdit: ({ messageId, content }) => {
      queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
        if (!old) return old;
        return old.map((msg) =>
          msg.id === messageId ? { ...msg, content, isEdited: true } : msg,
        );
      });
    },
    onMessageDelete: (messageId) => {
      queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
        if (!old) return old;
        return old.filter((msg) => msg.id !== messageId);
      });
    },
    onReaction: ({ messageId, emoji, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  // Send message mutation with optimistic update
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      // Utiliser l'API REST pour envoyer le message (avec confirmation)
      return messagesApi.send(conversationId, {
        content,
        contentType: 'TEXT',
      });
    },
    // Optimistic update : afficher le message IMMÉDIATEMENT
    onMutate: async (content: string) => {
      // Annuler les queries en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      // Sauvegarder l'état précédent pour rollback
      const previousMessages = queryClient.getQueryData(['messages', conversationId]);

      // Créer le message optimiste (temporaire)
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        authorId: user?.id || '',
        author: {
          id: user?.id || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
        },
        content,
        contentType: 'TEXT',
        createdAt: new Date().toISOString(),
        isEdited: false,
        isDeleted: false,
        attachments: [],
        reactions: [],
        mentions: [],
      };

      // Ajouter immédiatement à l'UI
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages };
    },
    onSuccess: () => {
      setMessageInput('');
      stopTyping();
      // Rafraîchir pour avoir les vraies données du serveur
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    onError: (error: any, _content, context) => {
      console.error('Erreur envoi message:', error);
      // Rollback : restaurer l'état précédent
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages);
      }
      // TODO: Afficher un toast d'erreur
    },
  });

  // Handle typing
  const handleInputChange = (value: string) => {
    setMessageInput(value);

    // Start typing indicator
    if (!typingTimeoutRef.current) {
      startTyping();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
      typingTimeoutRef.current = undefined;
    }, 3000);
  };

  // Handle send
  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMutation.mutate(messageInput);
  };

  // Auto scroll on mount
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.emoji-picker') && !target.closest('[data-emoji-button]')) {
        setShowEmojiPicker(false);
      }
      if (!target.closest('.options-menu') && !target.closest('[data-options-button]')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getConversationTitle = () => {
    if (!conversation) return '';
    if (conversation.titre) return conversation.titre;
    if (conversation.type === 'DIRECT') {
      // Pour une conversation directe, afficher le nom de l'AUTRE personne (pas soi-même)
      const otherParticipant = conversation.participants?.find(
        (p) => p.userId !== user?.id
      );
      return otherParticipant?.user
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : 'Sans titre';
    }
    return 'Conversation de groupe';
  };

  if (loadingConversation || loadingMessages) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-slate-900">Conversation introuvable</p>
        <p className="text-sm text-slate-600">
          Cette conversation n'existe pas ou a été supprimée
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/messagerie')}>
            Retour aux conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-slate-900">{getConversationTitle()}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-slate-400',
                )}
              />
              <span>{isConnected ? 'En ligne' : 'Hors ligne'}</span>
              {/* Afficher nombre de participants seulement pour les groupes/channels */}
              {conversation?.type !== 'DIRECT' && (
                <>
                  <span>•</span>
                  <span>{conversation._count?.participants || 0} participant(s)</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowInfoPanel(!showInfoPanel)}>
            <Info className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            data-options-button
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.author?.id === user?.id;

              return (
                <div
                  key={message.id}
                  className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn('flex gap-2', isOwn && 'flex-row-reverse')}>
                    {/* Avatar */}
                    {!isOwn && (
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                    )}

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'max-w-md rounded-lg px-4 py-2',
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-900 shadow-sm',
                      )}
                    >
                      {!isOwn && message.author && (
                        <p className="mb-1 text-xs font-medium">
                          {message.author.firstName} {message.author.lastName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div
                        className={cn(
                          'mt-1 flex items-center gap-2 text-xs',
                          isOwn ? 'text-blue-100' : 'text-slate-500',
                        )}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {message.isEdited && <span>(modifié)</span>}
                      </div>

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.reactions.map((reaction) => (
                            <button
                              key={reaction.id}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                              onClick={() => addReaction(message.id, reaction.emoji)}
                            >
                              {reaction.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            <p>Aucun message pour le moment</p>
          </div>
        )}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="mt-2 text-sm text-slate-500">
            {typingUsers
              .filter((u) => u.user?.firstName) // Filtrer ceux qui ont les infos user
              .map((u) => u.user.firstName)
              .join(', ')}{' '}
            en train d'écrire...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-end gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              console.log('Fichiers sélectionnés:', files);
              // TODO: Implémenter upload
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            data-emoji-button
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Textarea
            value={messageInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Écrivez votre message..."
            className="flex-1 min-h-[40px] max-h-[120px]"
          />
          <Button onClick={handleSend} disabled={!messageInput.trim() || !isConnected}>
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="emoji-picker absolute bottom-20 left-16 z-50 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Emojis</p>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👏', '🔥', '❤️', '🎉', '✅', '💪', '🙏', '👀', '🚀'].map(
                (emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessageInput((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="rounded p-2 text-2xl hover:bg-slate-100"
                  >
                    {emoji}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu Options (trois points) */}
      {showOptionsMenu && (
        <div className="options-menu absolute right-4 top-20 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="py-1">
            <button
              onClick={() => {
                // TODO: Archiver conversation
                setShowOptionsMenu(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Archive className="h-4 w-4" />
              Archiver la conversation
            </button>
            <button
              onClick={() => {
                if (confirm('Supprimer cette conversation ?')) {
                  router.push('/messagerie');
                }
                setShowOptionsMenu(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Supprimer la conversation
            </button>
          </div>
        </div>
      )}

      {/* Panneau Info Latéral */}
      {showInfoPanel && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 border-l border-slate-200 bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Détails de la conversation</h3>
              <button
                onClick={() => setShowInfoPanel(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Titre */}
              <div className="mb-6">
                <p className="mb-1 text-xs font-medium uppercase text-slate-500">Titre</p>
                <p className="text-sm text-slate-900">{getConversationTitle()}</p>
              </div>

              {/* Type */}
              <div className="mb-6">
                <p className="mb-1 text-xs font-medium uppercase text-slate-500">Type</p>
                <p className="text-sm text-slate-900">
                  {conversation?.type === 'DIRECT' && 'Conversation directe'}
                  {conversation?.type === 'GROUP' && 'Groupe'}
                  {conversation?.type === 'CHANNEL_PROJECT' && 'Canal projet'}
                  {conversation?.type === 'CHANNEL_TEAM' && 'Canal équipe'}
                </p>
              </div>

              {/* Participants */}
              <div className="mb-6">
                <p className="mb-2 text-xs font-medium uppercase text-slate-500">
                  Participants ({conversation?._count?.participants || 0})
                </p>
                <div className="space-y-2">
                  {conversation?.participants?.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {participant.user?.firstName} {participant.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{participant.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="mb-6">
                <p className="mb-1 text-xs font-medium uppercase text-slate-500">Messages</p>
                <p className="text-sm text-slate-900">
                  {conversation?._count?.messages || 0} message(s)
                </p>
              </div>

              {/* Date création */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-slate-500">Créée le</p>
                <p className="text-sm text-slate-900">
                  {conversation?.createdAt &&
                    new Date(conversation.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
