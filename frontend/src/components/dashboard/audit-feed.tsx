import type { AuditEntry } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Shield, CheckCircle2, XCircle, Upload, UserPlus, Edit3 } from 'lucide-react';

const ACTION_ICONS: Record<string, React.ElementType> = {
  VALIDATE: CheckCircle2,
  REJECT: XCircle,
  UPLOAD: Upload,
  CREATE_USER: UserPlus,
  UPDATE: Edit3,
};

const ACTION_LABELS: Record<string, string> = {
  SUBMIT: 'Soumission',
  APPROVE: 'Approbation',
  REJECT: 'Rejet',
  VALIDATE: 'Validation',
  UPLOAD: 'Document ajouté',
  CREATE_USER: 'Utilisateur créé',
  UPDATE: 'Mise à jour',
};

const ACTION_COLORS: Record<string, string> = {
  APPROVE: 'bg-green-100 text-green-600',
  VALIDATE: 'bg-green-100 text-green-600',
  REJECT: 'bg-red-100 text-red-600',
  SUBMIT: 'bg-blue-100 text-blue-600',
  UPLOAD: 'bg-purple-100 text-purple-600',
  CREATE_USER: 'bg-indigo-100 text-indigo-600',
  UPDATE: 'bg-slate-100 text-slate-600',
};

interface Props {
  entries: AuditEntry[];
}

export function AuditFeed({ entries }: Props) {
  // Guard défensif absolu
  const safeEntries = Array.isArray(entries) ? entries : [];

  if (safeEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
        <Shield size={24} className="opacity-50" />
        <p className="text-sm">Aucune activité récente</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {safeEntries.map((entry, i) => {
        const Icon = ACTION_ICONS[entry.action] ?? Shield;
        const color = ACTION_COLORS[entry.action] ?? 'bg-slate-100 text-slate-500';
        const label = ACTION_LABELS[entry.action] ?? entry.action;
        const actor = entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'Système';
        const target = (entry.metadata as Record<string, string>)?.title ?? entry.entityType;
        const key = entry.id ?? `${entry.action}-${entry.entityId}-${i}`;

        return (
          <li key={key} className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800">
                <span className="font-medium">{actor}</span>
                {' — '}{label}
                {target && <span className="text-slate-500"> · {target}</span>}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(entry.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
