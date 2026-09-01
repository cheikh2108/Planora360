'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { usersApi } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import type { User, Role } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, cn } from '@/lib/utils';
import { calculateRetentionInfo, getProgressBarColor, SOFT_DELETE_RETENTION_DAYS } from '@/lib/retention';
import { Users, Plus, Mail, Shield, UserCheck, UserX, Search, Trash2, RotateCcw, AlertTriangle, Clock } from 'lucide-react';

type TabType = 'active' | 'deleted';

export default function UsersPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabType>('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const limit = 20;
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [hardDeleteId, setHardDeleteId] = useState<string | null>(null);

  const { data: usersPage, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const r = await api.get('/users', { params: { page, limit } });
      const response = r.data as any;

      // Double compatibilité : ancien format (tableau) ET nouveau format (objet)
      if (Array.isArray(response)) {
        return { data: response, total: response.length, page, limit };
      } else if (response && typeof response === 'object') {
        return response;
      }

      return { data: [], total: 0, page: 1, limit: 20 };
    },
  });
  // Guard défensif absolu
  const users: User[] = Array.isArray(usersPage?.data) ? usersPage.data : [];
  const total = usersPage?.total ?? 0;

  const { data: deletedUsers = [], isLoading: loadingDeleted } = useQuery<User[]>({
    queryKey: ['users-deleted'],
    queryFn: async () => {
      const response = await usersApi.getDeleted();
      return response.data;
    },
    enabled: tab === 'deleted',
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => { const r = await api.get('/users/roles'); return r.data; },
  });

  const { data: stats } = useQuery<{ total: number; active: number; inactive: number; with2FA: number }>({
    queryKey: ['users-stats'],
    queryFn: async () => { const r = await api.get('/users/stats'); return r.data; },
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (user: User) => api.patch(`/users/${user.id}`, { isActive: !user.isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'], exact: false });
      qc.invalidateQueries({ queryKey: ['users-stats'] });
    },
  });

  const { mutate: restore, isPending: restoring } = useMutation({
    mutationFn: (id: string) => usersApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-deleted'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['users-stats'] });
      setRestoreId(null);
    },
  });

  const { mutate: hardDelete, isPending: hardDeleting } = useMutation({
    mutationFn: (id: string) => usersApi.hardDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-deleted'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['users-stats'] });
      setHardDeleteId(null);
    },
  });

  const filtered = search.trim()
    ? users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const filteredDeleted = search.trim()
    ? deletedUsers.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email} ${u.role?.name || ''}`.toLowerCase().includes(search.toLowerCase())
      )
    : deletedUsers;

  const displayTotal = search.trim() ? filtered.length : (stats?.total ?? total);
  const selectedUser = deletedUsers.find(u => u.id === restoreId || u.id === hardDeleteId);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Gestion des utilisateurs" subtitle={`${displayTotal} utilisateur${displayTotal > 1 ? 's' : ''} · ${stats?.active ?? 0} actifs`} />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* Onglets */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setTab('active')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === 'active'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            Utilisateurs actifs
          </button>
          <button
            onClick={() => setTab('deleted')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2',
              tab === 'deleted'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <Trash2 size={14} />
            Utilisateurs supprimés
            {deletedUsers.length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                {deletedUsers.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'active' ? (
          <>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats?.total ?? 0, color: 'text-slate-900' },
            { label: 'Actifs', value: stats?.active ?? 0, color: 'text-green-600' },
            { label: 'Inactifs', value: stats?.inactive ?? 0, color: 'text-red-500' },
            { label: 'Avec 2FA', value: stats?.with2FA ?? 0, color: 'text-indigo-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 flex-wrap">
            <div className="relative max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="h-9 pl-8 pr-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] w-56"
              />
            </div>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
              Nouvel utilisateur
            </Button>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState illustration="users" title="Aucun utilisateur" description="Ajoutez des utilisateurs à votre organisation." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Utilisateur</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Rôle</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Inscription</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">2FA</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Statut</th>
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0f1e38]/10 flex items-center justify-center text-xs font-bold text-[#0f1e38] shrink-0">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                              <Mail size={10} /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Shield size={12} className="text-slate-400" />
                          <span className="text-xs text-slate-600">{user.role?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                        {formatDate(user.createdAt ?? '')}
                      </td>
                      <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                        {user.twoFactorEnabled ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Actif</span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        )}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-3">
                        <button
                          onClick={() => toggleStatus(user)}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            user.isActive
                              ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                              : 'text-slate-400 hover:text-green-500 hover:bg-green-50'
                          )}
                          title={user.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!search.trim() && total > 10 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <Pagination page={page} total={total} limit={limit} onChange={setPage} />
            </div>
          )}
        </div>
        </>
        ) : (
          <>
            {/* Bannière info rétention */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium text-amber-800 mb-1">Rétention de {SOFT_DELETE_RETENTION_DAYS} jours</p>
                <p className="text-slate-600">
                  Les utilisateurs supprimés sont conservés pendant {SOFT_DELETE_RETENTION_DAYS} jours avant suppression définitive.
                  Vous pouvez les restaurer ou les supprimer définitivement (libère l'email) pendant cette période.
                </p>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="flex items-center gap-3">
              <div className="relative max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un utilisateur supprimé..."
                  className="w-full h-9 pl-8 pr-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
              </div>
            </div>

            {/* Table utilisateurs supprimés */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {loadingDeleted ? (
                <div className="p-5 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : filteredDeleted.length === 0 ? (
                <EmptyState
                  illustration="inbox"
                  title="Aucun utilisateur supprimé"
                  description={search ? 'Aucun résultat.' : 'Les utilisateurs supprimés apparaîtront ici.'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Utilisateur</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Rôle</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Supprimé le</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden xl:table-cell">Expiration</th>
                        <th className="w-28" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeleted.map(user => {
                        if (!user.deletedAt) return null;
                        const retention = calculateRetentionInfo(user.deletedAt);
                        const progressColor = getProgressBarColor(retention.urgencyLevel);

                        return (
                          <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                                  {user.firstName[0]}{user.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-700 truncate">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <Mail size={11} />
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 hidden md:table-cell">
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Shield size={12} className="text-slate-400" />
                                {user.role?.name || 'Sans rôle'}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                              {formatDate(user.deletedAt!)}
                            </td>
                            <td className="px-4 py-3.5 hidden xl:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-16">
                                  <div
                                    className={cn('h-full transition-all', progressColor)}
                                    style={{ width: `${retention.percentageRemaining}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500 font-medium shrink-0 tabular-nums">
                                  {retention.daysRemaining}j
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3.5">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setRestoreId(user.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  title="Restaurer"
                                >
                                  <RotateCcw size={14} />
                                </button>
                                <button
                                  onClick={() => setHardDeleteId(user.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} roles={roles} />

      {/* Modal de restauration */}
      <Modal open={!!restoreId} onClose={() => setRestoreId(null)} title="Restaurer l'utilisateur" size="sm">
        {selectedUser && restoreId && (
          <div className="space-y-4">
            <div className="flex gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <RotateCcw size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email}) sera
                réactivé immédiatement et pourra se reconnecter.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" onClick={() => setRestoreId(null)}>Annuler</Button>
              <Button
                isLoading={restoring}
                onClick={() => restore(restoreId!)}
                icon={<RotateCcw size={13} />}
              >
                Restaurer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de suppression définitive */}
      <Modal open={!!hardDeleteId} onClose={() => setHardDeleteId(null)} title="Supprimer définitivement" size="sm">
        {selectedUser && hardDeleteId && (
          <div className="space-y-4">
            <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold text-red-900 mb-1">Action irréversible</p>
                <p>
                  <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email}) sera
                  supprimé définitivement de la base de données.
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  ✅ L'adresse email <strong>{selectedUser.email}</strong> sera libérée et pourra être réutilisée.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" onClick={() => setHardDeleteId(null)}>Annuler</Button>
              <Button
                variant="danger"
                isLoading={hardDeleting}
                onClick={() => hardDelete(hardDeleteId!)}
                icon={<Trash2 size={13} />}
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CreateUserModal({ open, onClose, roles }: { open: boolean; onClose: () => void; roles: Role[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', roleId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('/users', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      onClose();
      setForm({ firstName: '', lastName: '', email: '', password: '', roleId: '' });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrors({ submit: typeof msg === 'string' ? msg : 'Erreur lors de la création' });
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Prénom requis';
    if (!form.lastName.trim()) e.lastName = 'Nom requis';
    if (!form.email.trim()) e.email = 'Email requis';
    if (!form.password || form.password.length < 8) e.password = 'Mot de passe minimum 8 caractères';
    if (!form.roleId) e.roleId = 'Rôle requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Nouvel utilisateur" size="md">
      <form onSubmit={(e) => { e.preventDefault(); if (validate()) mutate(); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prénom" required error={errors.firstName}>
            <Input value={form.firstName} onChange={set('firstName')} placeholder="Jean" error={!!errors.firstName} />
          </FormField>
          <FormField label="Nom" required error={errors.lastName}>
            <Input value={form.lastName} onChange={set('lastName')} placeholder="Dupont" error={!!errors.lastName} />
          </FormField>
        </div>
        <FormField label="Adresse email" required error={errors.email}>
          <Input type="email" value={form.email} onChange={set('email')} placeholder="jean@organisation.com" error={!!errors.email} />
        </FormField>
        <FormField label="Mot de passe" required error={errors.password}>
          <Input type="password" value={form.password} onChange={set('password')} placeholder="Minimum 8 caractères" error={!!errors.password} />
        </FormField>
        <FormField label="Rôle" required error={errors.roleId}>
          <Select value={form.roleId} onChange={set('roleId')} error={!!errors.roleId}>
            <option value="">Sélectionner un rôle</option>
            {roles.filter(r => r.name !== 'super_admin').map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
        </FormField>
        {errors.submit && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-200">{errors.submit}</p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isPending} icon={<Plus size={16} />}>Créer l'utilisateur</Button>
        </div>
      </form>
    </Modal>
  );
}
