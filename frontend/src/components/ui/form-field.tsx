import { cloneElement, isValidElement, useId } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Champ de formulaire : le libellé est relié au contrôle (htmlFor/id) et le message d'erreur ou
 * d'aide lui est associé (aria-describedby), pour les lecteurs d'écran et les clics sur le libellé.
 */
export function FormField({ label, error, required, hint, children, className }: FieldProps) {
  const autoId = useId();
  const single = isValidElement<Record<string, unknown>>(children) ? children : null;
  const controlId = (single?.props.id as string | undefined) ?? autoId;
  const messageId = `${controlId}-message`;
  const message = error ?? hint;

  const control = single
    ? cloneElement(single, {
        id: controlId,
        ...(message && { 'aria-describedby': messageId }),
        ...(error && { 'aria-invalid': true }),
      })
    : children;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={single ? controlId : undefined} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {control}
      {hint && !error && <p id={messageId} className="text-xs text-slate-500">{hint}</p>}
      {error && <p id={messageId} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full h-10 px-3.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition',
        error
          ? 'border-red-400 focus:ring-red-300'
          : 'border-slate-300 focus:ring-[#2563eb] focus:border-transparent',
        className,
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full h-10 px-3.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition bg-white',
        error
          ? 'border-red-400 focus:ring-red-300'
          : 'border-slate-300 focus:ring-[#2563eb] focus:border-transparent',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition resize-none',
        error
          ? 'border-red-400 focus:ring-red-300'
          : 'border-slate-300 focus:ring-[#2563eb] focus:border-transparent',
        className,
      )}
      {...props}
    />
  );
}
