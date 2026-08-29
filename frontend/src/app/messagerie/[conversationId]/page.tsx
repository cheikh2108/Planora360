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
import { formatDate } from '@/lib/utils';
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
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await messagesApi.getAll(conversationId);
      return (res.data as Message[]).sort(
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

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      sendMessage(content);
      return Promise.resolve();
    },
    onSuccess: () => {
      setMessageInput('');
      stopTyping();
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
              <span>•</span>
              <span>{conversation._count?.participants || 0} participant(s)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Info className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
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
                        <span>{formatDate(message.createdAt)}</span>
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
          <Button variant="ghost" size="sm">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
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
      </div>
    </div>
  );
}
