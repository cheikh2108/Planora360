'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi, usersApi } from '@/lib/api';
import type { Conversation, ConversationType } from '@/lib/types-messagerie';
import type { User } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { formatDate, cn } from '@/lib/utils';
import { MessageSquare, Plus, Search, Users, Archive, Circle, X } from 'lucide-react';

export default function MessagingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);

  // Form state for new conversation
  const [formData, setFormData] = useState<{
    type: ConversationType;
    titre: string;
    contextId: string;
    selectedParticipants: string[];
  }>({
    type: 'DIRECT',
    titre: '',
    contextId: '',
    selectedParticipants: [],
  });

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await conversationsApi.getAll();
      return res.data as Conversation[];
    },
  });

  // Fetch users for participants selection
  const { data: users } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const res = await usersApi.listForAssignment();
      return res.data as User[];
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
      success('Conversation archivée');
    },
  });

  // Unarchive mutation
  const unarchiveMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsApi.unarchive(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      success('Conversation restaurée');
    },
  });

  // Create conversation mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      titre?: string;
      type: ConversationType;
      contextId?: string;
      participantIds: string[];
    }) => conversationsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      success('Conversation créée avec succès');
      setShowNewConversationModal(false);
      setFormData({
        type: 'DIRECT',
        titre: '',
        contextId: '',
        selectedParticipants: [],
      });
      // Redirect to the new conversation
      const newConvId = (response.data as any).id;
      if (newConvId) {
        router.push(`/messagerie/${newConvId}`);
      }
    },
  });

  // Handle form submit
  const handleCreateConversation = () => {
    if (formData.selectedParticipants.length === 0) {
      return;
    }

    // Validation pour DIRECT: exactement 1 participant
    if (formData.type === 'DIRECT' && formData.selectedParticipants.length !== 1) {
      return;
    }

    createMutation.mutate({
      titre: formData.titre || undefined,
      type: formData.type,
      contextId: formData.contextId || undefined,
      participantIds: formData.selectedParticipants,
    });
  };

  // Toggle participant selection
  const toggleParticipant = (userId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedParticipants.includes(userId);
      const newSelection = isSelected
        ? prev.selectedParticipants.filter((id) => id !== userId)
        : [...prev.selectedParticipants, userId];

      // Pour DIRECT, limiter à 1 participant
      if (prev.type === 'DIRECT' && newSelection.length > 1) {
        return prev; // Ne pas ajouter si déjà 1 participant
      }

      return {
        ...prev,
        selectedParticipants: newSelection,
      };
    });
  };

  const getConversationTitle = (conv: Conversation) => {
    if (conv.titre) return conv.titre;
    if (conv.type === 'DIRECT') {
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
        subtitle="Conversations professionnelles et communications d'équipe"
        actions={
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
              <div
                key={conversation.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/messagerie/${conversation.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/messagerie/${conversation.id}`);
                  }
                }}
                className="group w-full cursor-pointer rounded-lg bg-white p-4 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {conversation.type === 'DIRECT' ? (
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
              </div>
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

      {/* New conversation modal */}
      {showNewConversationModal && (
        <Modal
          open={showNewConversationModal}
          onClose={() => {
            setShowNewConversationModal(false);
            setFormData({
              type: 'DIRECT',
              titre: '',
              contextId: '',
              selectedParticipants: [],
            });
          }}
          title="Nouvelle conversation"
        >
          <div className="space-y-6">
            {/* Type de conversation */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type de conversation <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as ConversationType,
                    selectedParticipants: [], // Réinitialiser les participants lors du changement de type
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="DIRECT">Conversation directe (1-to-1)</option>
                <option value="GROUP">Groupe</option>
                <option value="CHANNEL_PROJECT">Canal Projet</option>
                <option value="CHANNEL_TEAM">Canal Équipe</option>
                <option value="CONTEXTUAL">Contextuelle</option>
              </select>
              {formData.type === 'DIRECT' && (
                <p className="mt-1 text-xs text-amber-600">
                  Une conversation directe est limitée à 2 personnes (vous + 1 autre)
                </p>
              )}
            </div>

            {/* Titre (conditionnel selon le type) */}
            {formData.type !== 'DIRECT' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Titre {formData.type === 'CONTEXTUAL' ? '(basé sur le contexte)' : '(recommandé)'}
                </label>
                <Input
                  type="text"
                  placeholder={
                    formData.type === 'GROUP'
                      ? 'Ex: Discussion équipe marketing'
                      : formData.type === 'CHANNEL_PROJECT'
                        ? 'Ex: Projet Q2 - Planning'
                        : formData.type === 'CHANNEL_TEAM'
                          ? 'Ex: Équipe Dev - Général'
                          : 'Ex: Titre de la conversation'
                  }
                  value={formData.titre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Recommandé pour une meilleure organisation
                </p>
              </div>
            )}

            {/* Context ID (uniquement pour CONTEXTUAL) */}
            {formData.type === 'CONTEXTUAL' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Contexte
                </label>
                <select
                  className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => {
                    // Logique pour sélectionner le type de contexte
                    const contextType = e.target.value;
                    // À implémenter: charger les entités du type sélectionné
                  }}
                >
                  <option value="">Sélectionnez un type de contexte</option>
                  <option value="projet">Projet</option>
                  <option value="activite">Activité</option>
                  <option value="procedure">Procédure</option>
                  <option value="contrat">Contrat</option>
                </select>
                <Input
                  type="text"
                  placeholder="ID de l'entité liée"
                  value={formData.contextId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contextId: e.target.value }))}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Lié à un projet, activité, procédure ou contrat spécifique
                </p>
              </div>
            )}

            {/* Participants */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Participants <span className="text-red-500">*</span>
              </label>
              {formData.type === 'DIRECT' && (
                <p className="mb-2 text-xs text-slate-600">
                  Sélectionnez 1 personne pour créer une conversation directe
                </p>
              )}
              {formData.type !== 'DIRECT' && (
                <p className="mb-2 text-xs text-slate-600">
                  Sélectionnez au moins 2 personnes pour créer un groupe
                </p>
              )}
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                {users && users.length > 0 ? (
                  users.map((user) => {
                    const isSelected = formData.selectedParticipants.includes(user.id);
                    const isDisabled =
                      formData.type === 'DIRECT' &&
                      !isSelected &&
                      formData.selectedParticipants.length >= 1;

                    return (
                      <label
                        key={user.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg p-2',
                          isDisabled
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:bg-slate-50',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleParticipant(user.id)}
                          disabled={isDisabled}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-center text-sm text-slate-500">Aucun utilisateur disponible</p>
                )}
              </div>
              {formData.selectedParticipants.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.selectedParticipants.map((userId) => {
                    const user = users?.find((u) => u.id === userId);
                    if (!user) return null;
                    return (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {user.firstName} {user.lastName}
                        <button
                          type="button"
                          onClick={() => toggleParticipant(userId)}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowNewConversationModal(false);
                  setFormData({
                    type: 'DIRECT',
                    titre: '',
                    contextId: '',
                    selectedParticipants: [],
                  });
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateConversation}
                disabled={
                  formData.selectedParticipants.length === 0 ||
                  (formData.type === 'DIRECT' && formData.selectedParticipants.length !== 1) ||
                  (formData.type !== 'DIRECT' && formData.selectedParticipants.length < 1) ||
                  createMutation.isPending
                }
              >
                {createMutation.isPending ? 'Création...' : 'Créer la conversation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
