import { Check, X, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidationDemande } from '@/lib/types-passation';
import { formatDate } from '@/lib/utils';

interface WorkflowTimelineProps {
  validations: ValidationDemande[];
  className?: string;
}

const DECISION_CONFIG = {
  EN_ATTENTE: {
    icon: Clock,
    iconClassName: 'text-amber-600',
    bgClassName: 'bg-amber-50',
    borderClassName: 'border-amber-200',
    label: 'En attente',
  },
  APPROUVE: {
    icon: Check,
    iconClassName: 'text-green-600',
    bgClassName: 'bg-green-50',
    borderClassName: 'border-green-200',
    label: 'Approuvé',
  },
  REJETE: {
    icon: X,
    iconClassName: 'text-red-600',
    bgClassName: 'bg-red-50',
    borderClassName: 'border-red-200',
    label: 'Rejeté',
  },
};

export function WorkflowTimeline({ validations, className }: WorkflowTimelineProps) {
  const sortedValidations = [...validations].sort((a, b) => a.ordre - b.ordre);

  return (
    <div className={cn('space-y-4', className)}>
      {sortedValidations.map((validation, index) => {
        const config = DECISION_CONFIG[validation.decision];
        const Icon = config.icon;
        const isLast = index === sortedValidations.length - 1;

        return (
          <div key={validation.id} className="relative flex gap-4">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-5 top-10 h-full w-0.5',
                  validation.decision === 'APPROUVE' ? 'bg-green-200' : 'bg-slate-200',
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2',
                config.bgClassName,
                config.borderClassName,
              )}
            >
              <Icon className={cn('h-5 w-5', config.iconClassName)} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{validation.etape}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4" />
                    <span>
                      {validation.validateur
                        ? `${validation.validateur.firstName} ${validation.validateur.lastName}`
                        : 'En attente d\'assignation'}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    config.bgClassName,
                    config.iconClassName,
                  )}
                >
                  {config.label}
                </span>
              </div>

              {validation.validatedAt && (
                <p className="mt-2 text-sm text-slate-500">
                  Traité le {formatDate(validation.validatedAt)}
                </p>
              )}

              {validation.commentaire && (
                <div className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">Commentaire :</p>
                  <p className="mt-1">{validation.commentaire}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
