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
import { useAuth } from '@/lib/auth-context';
import { MessageSquare, Plus, Search, Users, Archive, Circle, X, Trash2 } from 'lucide-react';

export default function MessagingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success } = useToast();
  const { user } = useAuth();
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsApi.delete(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      success('Conversation supprimée');
    },
    onError: () => {
      // Ignore errors silently (conversation may not exist)
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
      // Pour une conversation directe, afficher le nom de l'AUTRE personne (pas soi-même)
      const otherParticipant = conv.participants?.find(
        (p) => p.userId !== user?.id
      );
      return otherParticipant?.user
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : 'Sans titre';
    }
    return 'Conversation de groupe';
  };

  const getConversationSubtitle = (conv: Conversation) => {
    // Backend renvoie messages: [...] avec take: 1, pas lastMessage
    const lastMessage = conv.messages?.[0] || conv.lastMessage;
    if (lastMessage) {
      return lastMessage.content.substring(0, 80);
    }
    return 'Aucun message';
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

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

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-[14px] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setShowArchivedOnly(!showArchivedOnly)}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-5 py-3 text-[14px] font-semibold transition-all duration-200 active:scale-95",
              showArchivedOnly
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
                : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
            )}
          >
            <Archive className="h-4 w-4" />
            {showArchivedOnly ? 'Toutes' : 'Archivées'}
          </button>
        </div>

        {/* Conversations list */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => {
              // Calculer initiales pour avatar
              const getInitials = () => {
                if (conversation.type === 'DIRECT') {
                  const otherParticipant = conversation.participants?.find(
                    (p) => p.userId !== user?.id
                  );
                  return `${otherParticipant?.user?.firstName?.[0] || ''}${otherParticipant?.user?.lastName?.[0] || ''}`.toUpperCase();
                }
                return getConversationTitle(conversation).substring(0, 2).toUpperCase();
              };

              const hasUnread = conversation.unreadCount && conversation.unreadCount > 0;

              return (
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
                  className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-4 text-left transition-all duration-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/50 to-emerald-50/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                  <div className="relative flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-[16px] font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md">
                        {getInitials()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              "truncate text-[15px] font-bold text-slate-900 transition-colors duration-200",
                              hasUnread && "text-emerald-900"
                            )}>
                              {getConversationTitle(conversation)}
                            </h3>
                            {hasUnread && (
                              <span className="flex h-5 min-w-[1.25rem] flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white shadow-sm animate-in fade-in-0 zoom-in-95 duration-200">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "mt-0.5 truncate text-[13px] leading-relaxed transition-colors duration-200",
                            getConversationSubtitle(conversation) === 'Aucun message'
                              ? 'italic text-slate-400'
                              : 'text-slate-600'
                          )}>
                            {getConversationSubtitle(conversation)}
                          </p>
                        </div>

                        {/* Timestamp */}
                        {(() => {
                          const lastMsg = conversation.messages?.[0] || conversation.lastMessage;
                          return lastMsg && (
                            <span className="flex-shrink-0 text-[11px] font-semibold text-slate-500">
                              {formatDate(lastMsg.createdAt)}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Metadata - Natural language */}
                      <div className="mt-3 flex items-center gap-3">
                        {conversation.type !== 'DIRECT' && (
                          <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                            <Users className="h-3.5 w-3.5" />
                            {conversation._count?.participants || 0} membres
                          </span>
                        )}
                        {conversation._count?.messages && conversation._count.messages > 0 && (
                          <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {conversation._count.messages}
                          </span>
                        )}
                        {conversation.isArchived && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors duration-200 group-hover:bg-slate-200">
                            Archivée
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions - Hidden until hover */}
                    <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {conversation.isArchived ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unarchiveMutation.mutate(conversation.id);
                          }}
                          className="rounded-lg p-2 text-emerald-600 transition-all duration-200 hover:bg-emerald-50 active:scale-95"
                          title="Restaurer"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveMutation.mutate(conversation.id);
                          }}
                          className="rounded-lg p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 active:scale-95"
                          title="Archiver"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Voulez-vous vraiment supprimer cette conversation ?')) {
                            deleteMutation.mutate(conversation.id);
                          }
                        }}
                        className="rounded-lg p-2 text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-95"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            illustration="inbox"
            title="Aucune conversation"
            description={
              searchTerm
                ? 'Aucune conversation ne correspond à votre recherche'
                : 'Créez votre première conversation pour commencer'
            }
            action={
              !searchTerm
                ? {
                    label: 'Nouvelle conversation',
                    onClick: () => setShowNewConversationModal(true),
                    leftIcon: <Plus className="h-4 w-4" />
                  }
                : undefined
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
