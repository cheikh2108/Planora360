import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'SOUMISSION', label: 'Soumission', short: 'Soum.' },
  { key: 'VERIFICATION_HIERARCHIQUE', label: 'Vérification hiérarchique', short: 'Hiérar.' },
  { key: 'VALIDATION_TECHNIQUE', label: 'Validation technique', short: 'Tech.' },
  { key: 'VALIDATION_ADMINISTRATIVE', label: 'Validation administrative', short: 'Admin.' },
  { key: 'CLOTURE', label: 'Clôture', short: 'Clôture' },
];

interface PipelineProps {
  currentStep?: string;
  completedSteps?: string[];
  counts?: Partial<Record<string, number>>;
  compact?: boolean;
}

export function ValidationPipeline({ currentStep, completedSteps = [], counts = {}, compact = false }: PipelineProps) {
  return (
    <div className="flex items-center w-full gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.key);
        const isCurrent = currentStep === step.key;
        const count = counts[step.key] ?? 0;

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors',
                isCompleted ? 'bg-green-500 border-green-500 text-white' :
                isCurrent ? 'bg-[#2563eb] border-[#2563eb] text-white' :
                'bg-white border-slate-300 text-slate-600'
              )}>
                {isCompleted ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  <Clock size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              {!compact && (
                <p className={cn(
                  'text-center mt-1.5 leading-tight',
                  'hidden sm:block text-xs',
                  isCurrent ? 'text-[#2563eb] font-semibold' :
                  isCompleted ? 'text-green-600 font-medium' :
                  'text-slate-600'
                )}>
                  {step.short}
                </p>
              )}
              {count > 0 && (
                <span className="mt-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full px-1.5 py-0.5">
                  {count}
                </span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-0.5 flex-1 mx-1 shrink',
                isCompleted ? 'bg-green-400' : 'bg-slate-200'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
