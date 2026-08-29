'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api';
import type { Conversation } from '@/lib/types-messagerie';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Plus, Search, Users, Archive, Circle } from 'lucide-react';

export default function MessagingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await conversationsApi.getAll();
      return res.data as Conversation[];
    },
  });

  // Filter conversations
  const filteredConversations = conversations?.filter((conv) => {
    const matchesSearch =
      !searchTerm ||
      conv.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants?.some(
        (p) =>
          p.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesArchived = showArchivedOnly ? conv.isArchived : !conv.isArchived;

    return matchesSearch && matchesArchived;
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsApi.archive(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      showToast('Conversation archivée', 'success');
    },
  });

  // Unarchive mutation
  const unarchiveMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsApi.unarchive(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      showToast('Conversation restaurée', 'success');
    },
  });

  const getConversationTitle = (conv: Conversation) => {
    if (conv.titre) return conv.titre;
    if (conv.type === 'DIRECTE') {
      const otherParticipant = conv.participants?.[0];
      return otherParticipant?.user
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : 'Sans titre';
    }
    return 'Conversation de groupe';
  };

  const getConversationSubtitle = (conv: Conversation) => {
    if (conv.lastMessage) {
      return conv.lastMessage.content.substring(0, 80);
    }
    return 'Aucun message';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Messagerie"
        description="Conversations professionnelles et communications d'équipe"
        action={
          <Button onClick={() => setShowNewConversationModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle conversation
          </Button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showArchivedOnly ? 'primary' : 'secondary'}
              onClick={() => setShowArchivedOnly(!showArchivedOnly)}
            >
              <Archive className="mr-2 h-4 w-4" />
              {showArchivedOnly ? 'Toutes' : 'Archivées'}
            </Button>
          </div>
        </div>

        {/* Conversations list */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => router.push(`/messagerie/${conversation.id}`)}
                className="group w-full rounded-lg bg-white p-4 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {conversation.type === 'DIRECTE' ? (
                        <MessageSquare className="h-6 w-6" />
                      ) : (
                        <Users className="h-6 w-6" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-slate-900 group-hover:text-blue-600">
                          {getConversationTitle(conversation)}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-600">
                          {getConversationSubtitle(conversation)}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        {conversation.lastMessage && (
                          <span className="text-xs text-slate-500">
                            {formatDate(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-medium text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {conversation._count?.participants || 0} participant(s)
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {conversation._count?.messages || 0} message(s)
                      </span>
                      {conversation.isArchived && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          Archivée
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {conversation.isArchived ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          unarchiveMutation.mutate(conversation.id);
                        }}
                      >
                        Restaurer
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveMutation.mutate(conversation.id);
                        }}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Aucune conversation"
            description={
              searchTerm
                ? 'Aucune conversation ne correspond à votre recherche'
                : 'Créez votre première conversation pour commencer'
            }
            action={
              !searchTerm && (
                <Button onClick={() => setShowNewConversationModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle conversation
                </Button>
              )
            }
          />
        )}
      </div>

      {/* New conversation modal (placeholder) */}
      {showNewConversationModal && (
        <Modal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          title="Nouvelle conversation"
        >
          <p className="text-sm text-slate-600">
            Fonctionnalité en cours de développement
          </p>
        </Modal>
      )}
    </div>
  );
}
