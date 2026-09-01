'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/lib/api';
import type { Role } from '@/lib/types';
import { ALL_PERMISSIONS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input } from '@/components/ui/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, Shield, Lock, Users, Check, ChevronDown } from 'lucide-react';

const GROUPS = Array.from(new Set(ALL_PERMISSIONS.map(p => p.group)));
const GROUP_COLORS: Record<string, string> = {
  "Plans d'action": 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Activités':      'bg-blue-50 text-blue-700 border-blue-100',
  'Check-list':     'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Validation':     'bg-green-50 text-green-700 border-green-100',
  'Budget':         'bg-amber-50 text-amber-700 border-amber-100',
  'Documents':      'bg-purple-50 text-purple-700 border-purple-100',
  'Rapports':       'bg-teal-50 text-teal-700 border-teal-100',
  'Administration': 'bg-rose-50 text-rose-700 border-rose-100',
};

function PermissionMatrix({ selected, onChange }: { selected: string[]; onChange: (p: string[]) => void }) {
  const toggle = (key: string) =>
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  const toggleGroup = (group: string) => {
    const keys = ALL_PERMISSIONS.filter(p => p.group === group).map(p => p.key);
    const allOn = keys.every(k => selected.includes(k));
    onChange(allOn ? selected.filter(k => !keys.includes(k)) : Array.from(new Set([...selected, ...keys])));
  };
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {GROUPS.map(group => {
        const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group);
        const allChecked = groupPerms.every(p => selected.includes(p.key));
        const someChecked = groupPerms.some(p => selected.includes(p.key));
        return (
          <div key={group} className="border border-slate-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleGroup(group)} className={cn(
              'w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors',
              allChecked ? 'bg-[#0a1628] text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            )}>
              <span>{group}</span>
              <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center',
                allChecked ? 'bg-white border-white' : someChecked ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-white'
              )}>
                {allChecked && <Check size={11} className="text-[#0a1628]" />}
                {someChecked && !allChecked && <div className="w-2 h-2 bg-amber-500 rounded-sm" />}
              </div>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-slate-100">
              {groupPerms.map(perm => (
                <label key={perm.key} className={cn(
                  'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm',
                  selected.includes(perm.key) ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-slate-50'
                )}>
                  <input type="checkbox" checked={selected.includes(perm.key)} onChange={() => toggle(perm.key)} className="w-4 h-4 rounded accent-amber-500" />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleModal({ open, onClose, role }: { open: boolean; onClose: () => void; role?: Role | null }) {
  const qc = useQueryClient();
  const isEdit = Boolean(role?.organizationId !== null && role);
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (open) { setName(role?.name ?? ''); setPermissions((role?.permissions as string[]) ?? []); }
  }, [open, role]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => isEdit && role
      ? rolesApi.update(role.id, { name, permissions })
      : rolesApi.create({ name, permissions }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['super-roles'] }); onClose(); },
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Modifier « ${role?.name} »` : 'Nouveau rôle système'} size="lg">
      <div className="space-y-5">
        <FormField label="Nom du rôle" required>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Chargé de suivi…" />
        </FormField>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">
            Permissions
            <span className="ml-2 text-xs text-slate-400 font-normal">({permissions.length} sélectionnée{permissions.length > 1 ? 's' : ''})</span>
          </p>
          <PermissionMatrix selected={permissions} onChange={setPermissions} />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={() => save()} isLoading={isPending} disabled={!name.trim() || permissions.length === 0}>
            {isEdit ? 'Enregistrer' : 'Créer le rôle'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function RoleRow({ role, onEdit, onDelete }: { role: Role; onEdit: (r: Role) => void; onDelete: (r: Role) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isSystem = role.organizationId === null;
  const perms = (role.permissions as string[]) ?? [];
  const hasStar = perms.includes('*');
  const allGranted = hasStar ? ALL_PERMISSIONS : ALL_PERMISSIONS.filter(p => perms.includes(p.key));
  const visible = allGranted.slice(0, 4);
  const hiddenCount = allGranted.length - 4;
  const grantedByGroup = GROUPS.map(group => ({
    group,
    granted: hasStar ? ALL_PERMISSIONS.filter(p => p.group === group) : ALL_PERMISSIONS.filter(p => p.group === group && perms.includes(p.key)),
  })).filter(g => g.granted.length > 0);

  return (
    <div className={cn('border-b border-slate-100 last:border-0 transition-colors', expanded ? 'bg-slate-50/60' : 'hover:bg-slate-50/40')}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex items-center gap-3 w-52 shrink-0">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', isSystem ? 'bg-slate-100' : 'bg-amber-50')}>
            {isSystem ? <Lock size={14} className="text-slate-400" /> : <Shield size={14} className="text-amber-600" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{role.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSystem && <span className="text-xs text-slate-400 font-medium">Système</span>}
              <span className="text-xs text-slate-400 flex items-center gap-1"><Users size={10} />{role._count?.users ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {hasStar ? (
            <span className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">Accès complet</span>
          ) : allGranted.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Aucune permission</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {visible.map(p => (
                <span key={p.key} className={cn('text-xs px-2 py-0.5 rounded-full font-medium border', GROUP_COLORS[p.group] ?? 'bg-slate-50 text-slate-600 border-slate-100')}>
                  {p.label}
                </span>
              ))}
              {hiddenCount > 0 && (
                <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors">
                  {expanded ? 'Réduire' : `+${hiddenCount} autre${hiddenCount > 1 ? 's' : ''}`}
                  <ChevronDown size={11} className={cn('transition-transform', expanded && 'rotate-180')} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(role)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Modifier">
            <Pencil size={14} />
          </button>
          {!isSystem && (
            <button onClick={() => onDelete(role)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 pt-1">
          <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {grantedByGroup.map(({ group, granted }) => (
              <div key={group}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{group}</p>
                <div className="flex flex-col gap-1">
                  {granted.map(p => (
                    <span key={p.key} className={cn('text-xs px-2 py-1 rounded-lg font-medium border w-fit', GROUP_COLORS[group] ?? 'bg-slate-50 text-slate-600 border-slate-100')}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminRolesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['super-roles'],
    queryFn: async () => { const r = await rolesApi.list(); return r.data; },
  });

  const { mutate: doDelete, isPending: deleting } = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['super-roles'] }); setDeleteRole(null); },
  });

  const systemRoles = roles.filter(r => r.organizationId === null);
  const openCreate = () => { setEditRole(null); setModalOpen(true); };
  const openEdit = (r: Role) => { setEditRole(r); setModalOpen(true); };

  return (
    <main className="px-4 md:px-8 py-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rôles système</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rôles globaux disponibles pour toutes les organisations de la plateforme
          </p>
        </div>
        <Button icon={<Plus size={14} />} onClick={openCreate}>Nouveau rôle</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
          <p className="w-52 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rôle</p>
          <p className="flex-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Permissions accordées</p>
          <p className="w-16 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</p>
        </div>

        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <Skeleton className="h-4 w-32" />
                <div className="flex-1 flex gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : systemRoles.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Shield size={28} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Aucun rôle système trouvé</p>
          </div>
        ) : (
          systemRoles.map(r => <RoleRow key={r.id} role={r} onEdit={openEdit} onDelete={setDeleteRole} />)
        )}
      </div>

      <RoleModal open={modalOpen} onClose={() => { setModalOpen(false); setEditRole(null); }} role={editRole} />

      <Modal open={Boolean(deleteRole)} onClose={() => setDeleteRole(null)} title="Supprimer le rôle" size="sm">
        <p className="text-sm text-slate-600 mb-4">
          Supprimer <strong>« {deleteRole?.name} »</strong> ? Les utilisateurs assignés doivent être réassignés d'abord.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteRole(null)}>Annuler</Button>
          <Button variant="danger" isLoading={deleting} onClick={() => deleteRole && doDelete(deleteRole.id)}>Supprimer</Button>
        </div>
      </Modal>
    </main>
  );
}
