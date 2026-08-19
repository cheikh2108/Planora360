'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import type { User, Role } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, cn } from '@/lib/utils';
import { Users, Plus, Mail, Shield, UserCheck, UserX, Search } from 'lucide-react';

export default function UsersPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const limit = 20;

  const { data: usersPage, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const r = await api.get('/users', { params: { page, limit } });
      return r.data as { data: User[]; total: number; page: number; limit: number };
    },
  });
  // Guard défensif absolu
  const users: User[] = Array.isArray(usersPage?.data) ? usersPage.data : [];
  const total = usersPage?.total ?? 0;

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => { const r = await api.get('/users/roles'); return r.data; },
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (user: User) => api.patch(`/users/${user.id}`, { isActive: !user.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'], exact: false }),
  });

  const filtered = search.trim()
    ? users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const activeCount = users.filter(u => u.isActive).length;
  const displayTotal = search.trim() ? filtered.length : total;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Gestion des utilisateurs" subtitle={`${displayTotal} utilisateur${displayTotal > 1 ? 's' : ''} · ${activeCount} actifs`} />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: total, color: 'text-slate-900' },
            { label: 'Actifs', value: activeCount, color: 'text-green-600' },
            { label: 'Inactifs', value: users.length - activeCount, color: 'text-red-500' },
            { label: 'Avec 2FA', value: users.filter(u => u.twoFactorEnabled).length, color: 'text-indigo-600' },
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
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="h-9 pl-8 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] w-56"
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
            <EmptyState icon={Users} title="Aucun utilisateur" description="Ajoutez des utilisateurs à votre organisation." />
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
      </main>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} roles={roles} />
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
          <Button type="submit" loading={isPending} icon={<Plus size={16} />}>Créer l'utilisateur</Button>
        </div>
      </form>
    </Modal>
  );
}
