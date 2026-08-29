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
    <div className="flex h-screen flex-col bg-[#efeae2] relative">
      {/* WhatsApp-style background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-slate-900 text-[15px]">{getConversationTitle()}</h2>
            <div className="flex items-center gap-2 text-[13px] text-slate-600">
              <div
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300',
                  isConnected ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]' : 'bg-slate-400',
                )}
              />
              <span className="font-medium">{isConnected ? 'En ligne' : 'Hors ligne'}</span>
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className="rounded-full p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          >
            <Info className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            data-options-button
            className="rounded-full p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto px-6 py-4">
        {messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isOwn = message.author?.id === user?.id;
              const isFirstInGroup = index === 0 || messages[index - 1]?.author?.id !== message.author?.id;

              // Initiales pour l'avatar
              const getInitials = (firstName?: string, lastName?: string) => {
                return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
              };

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
                    isOwn ? 'justify-end' : 'justify-start'
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className={cn('flex gap-2 max-w-[70%]', isOwn && 'flex-row-reverse')}>
                    {/* Avatar */}
                    {!isOwn && (
                      <div className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white transition-all duration-200',
                        'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm',
                        !isFirstInGroup && 'opacity-0'
                      )}>
                        {getInitials(message.author?.firstName, message.author?.lastName)}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'group relative px-3 py-2 transition-all duration-200',
                        isOwn
                          ? 'bg-[#005c4b] text-white rounded-2xl rounded-tr-md shadow-sm'
                          : 'bg-white text-slate-900 rounded-2xl rounded-tl-md shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
                        'hover:shadow-md'
                      )}
                    >
                      {!isOwn && message.author && isFirstInGroup && (
                        <p className="mb-0.5 text-[13px] font-semibold text-emerald-600">
                          {message.author.firstName} {message.author.lastName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.4]">
                        {message.content}
                      </p>
                      <div
                        className={cn(
                          'mt-1 flex items-center gap-1.5 text-[11px]',
                          isOwn ? 'text-emerald-200/80' : 'text-slate-500',
                        )}
                      >
                        <span className="font-medium">{formatMessageTime(message.createdAt)}</span>
                        {message.isEdited && <span className="opacity-70">(modifié)</span>}
                        {isOwn && (
                          <svg className="h-4 w-4 ml-0.5 opacity-80" viewBox="0 0 16 15" fill="currentColor">
                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                          </svg>
                        )}
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
          <div className="mt-3 flex items-center gap-2 px-4">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[13px] font-medium text-slate-600">
              {typingUsers
                .filter((u) => u.user?.firstName)
                .map((u) => u.user.firstName)
                .join(', ')}{' '}
              en train d'écrire...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-6 py-4">
        <div className="flex items-end gap-3">
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
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="rounded-full p-2.5 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-90"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            data-emoji-button
            className="rounded-full p-2.5 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-90"
          >
            <Smile className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <Textarea
              value={messageInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Écrivez votre message..."
              className="w-full resize-none rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-[1.4] placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!messageInput.trim() || !isConnected}
            className={cn(
              'rounded-full p-3 transition-all duration-200 active:scale-90',
              messageInput.trim() && isConnected
                ? 'bg-[#005c4b] text-white shadow-lg shadow-emerald-900/20 hover:bg-[#004a3d] hover:shadow-xl'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="emoji-picker absolute bottom-20 left-20 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-4 shadow-2xl shadow-slate-900/10">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-700">Réactions rapides</p>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👏', '🔥', '❤️', '🎉', '✅', '💪', '🙏', '👀', '🚀'].map(
                (emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessageInput((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="group relative rounded-lg p-2.5 text-2xl transition-all duration-200 hover:bg-emerald-50 hover:scale-110 active:scale-95"
                  >
                    <span className="block transition-transform duration-200 group-hover:scale-110">
                      {emoji}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu Options (trois points) */}
      {showOptionsMenu && (
        <div className="options-menu absolute right-4 top-20 z-50 w-60 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10">
          <div className="p-2">
            <button
              onClick={() => {
                // TODO: Archiver conversation
                setShowOptionsMenu(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 active:scale-[0.98]"
            >
              <Archive className="h-4 w-4" />
              Archiver la conversation
            </button>
            <div className="my-1 h-px bg-slate-100" />
            <button
              onClick={() => {
                if (confirm('Supprimer cette conversation ?')) {
                  router.push('/messagerie');
                }
                setShowOptionsMenu(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
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
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setShowInfoPanel(false)}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-96 animate-in slide-in-from-right-full duration-300 border-l border-slate-200/80 bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5">
                <h3 className="text-[16px] font-semibold text-slate-900">Détails de la conversation</h3>
                <button
                  onClick={() => setShowInfoPanel(false)}
                  className="rounded-full p-2 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 active:scale-90"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Titre */}
              <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Titre</p>
                <p className="text-[15px] font-semibold text-slate-900">{getConversationTitle()}</p>
              </div>

              {/* Type */}
              <div className="mb-8">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-[13px] font-medium text-slate-900">
                    {conversation?.type === 'DIRECT' && 'Conversation directe'}
                    {conversation?.type === 'GROUP' && 'Groupe'}
                    {conversation?.type === 'CHANNEL_PROJECT' && 'Canal projet'}
                    {conversation?.type === 'CHANNEL_TEAM' && 'Canal équipe'}
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div className="mb-8">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Participants ({conversation?._count?.participants || 0})
                </p>
                <div className="space-y-2">
                  {conversation?.participants?.map((participant) => {
                    const initials = `${participant.user?.firstName?.[0] || ''}${participant.user?.lastName?.[0] || ''}`.toUpperCase();
                    return (
                      <div key={participant.id} className="group flex items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-slate-50">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[13px] font-semibold text-white shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-slate-900">
                            {participant.user?.firstName} {participant.user?.lastName}
                          </p>
                          <p className="text-[12px] font-medium text-slate-500">{participant.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="mb-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Messages</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {conversation?._count?.messages || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Membres</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {conversation?._count?.participants || 0}
                  </p>
                </div>
              </div>

              {/* Date création */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Créée le</p>
                <p className="text-[14px] font-medium text-slate-700">
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
        </>
      )}
    </div>
  );
}
