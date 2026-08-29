import { cn } from '@/lib/utils';
import type {
  StatusPPM,
  StatusDemandeAchat,
  StatusProcedure,
  StatusContrat,
  StatusFournisseur,
} from '@/lib/types-passation';

type PassationStatus =
  | StatusPPM
  | StatusDemandeAchat
  | StatusProcedure
  | StatusContrat
  | StatusFournisseur;

interface PassationStatusBadgeProps {
  status: PassationStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  // PPM
  BROUILLON: { label: 'Brouillon', className: 'bg-slate-100 text-slate-700' },
  EN_REVISION: { label: 'En révision', className: 'bg-amber-100 text-amber-700' },
  VALIDE: { label: 'Validé', className: 'bg-green-100 text-green-700' },
  PUBLIE: { label: 'Publié', className: 'bg-blue-100 text-blue-700' },
  ARCHIVE: { label: 'Archivé', className: 'bg-gray-100 text-gray-600' },

  // Demandes
  SOUMISE: { label: 'Soumise', className: 'bg-blue-100 text-blue-700' },
  EN_VALIDATION_HIERARCHIQUE: {
    label: 'Validation hiérarchique',
    className: 'bg-purple-100 text-purple-700',
  },
  EN_VALIDATION_TECHNIQUE: {
    label: 'Validation technique',
    className: 'bg-indigo-100 text-indigo-700',
  },
  EN_VALIDATION_ADMINISTRATIVE: {
    label: 'Validation administrative',
    className: 'bg-violet-100 text-violet-700',
  },
  VALIDEE: { label: 'Validée', className: 'bg-green-100 text-green-700' },
  REJETEE: { label: 'Rejetée', className: 'bg-red-100 text-red-700' },
  ANNULEE: { label: 'Annulée', className: 'bg-gray-100 text-gray-600' },

  // Procédures
  PUBLIEE: { label: 'Publiée', className: 'bg-blue-100 text-blue-700' },
  EN_COURS: { label: 'En cours', className: 'bg-cyan-100 text-cyan-700' },
  CLOTUREE_OFFRES: { label: 'Clôturée', className: 'bg-orange-100 text-orange-700' },
  EVALUATION: { label: 'Évaluation', className: 'bg-purple-100 text-purple-700' },
  ATTRIBUEE: { label: 'Attribuée', className: 'bg-green-100 text-green-700' },
  INFRUCTUEUSE: { label: 'Infructueuse', className: 'bg-gray-100 text-gray-600' },

  // Contrats
  SIGNE: { label: 'Signé', className: 'bg-blue-100 text-blue-700' },
  SUSPENDU: { label: 'Suspendu', className: 'bg-orange-100 text-orange-700' },
  RESILIE: { label: 'Résilié', className: 'bg-red-100 text-red-700' },
  TERMINE: { label: 'Terminé', className: 'bg-green-100 text-green-700' },

  // Fournisseurs
  A_VALIDER: { label: 'À valider', className: 'bg-amber-100 text-amber-700' },
  ACTIF: { label: 'Actif', className: 'bg-green-100 text-green-700' },
  BLACKLISTE: { label: 'Blacklisté', className: 'bg-red-100 text-red-700' },
};

export function PassationStatusBadge({ status, className }: PassationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
