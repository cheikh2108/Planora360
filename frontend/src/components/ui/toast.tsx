'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Types ─────────────────────────────────────────────────── */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

/* ─── Context ───────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 4000;
    setToasts(prev => [...prev, { ...opts, id }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const success = useCallback((title: string, description?: string) => toast({ type: 'success', title, description }), [toast]);
  const error   = useCallback((title: string, description?: string) => toast({ type: 'error',   title, description, duration: 6000 }), [toast]);
  const warning = useCallback((title: string, description?: string) => toast({ type: 'warning', title, description }), [toast]);
  const info    = useCallback((title: string, description?: string) => toast({ type: 'info',    title, description }), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

/* ─── Config visuelle ───────────────────────────────────────── */

const CONFIG: Record<ToastType, {
  icon: React.ElementType;
  badge: string;
  bar: string;
  glow: string;
}> = {
  success: {
    icon: CheckCircle2,
    badge: 'bg-emerald-500/15 text-emerald-400',
    bar:   'bg-emerald-500',
    glow:  'shadow-emerald-900/30',
  },
  error: {
    icon: XCircle,
    badge: 'bg-red-500/15 text-red-400',
    bar:   'bg-red-500',
    glow:  'shadow-red-900/30',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-amber-500/15 text-amber-400',
    bar:   'bg-amber-400',
    glow:  'shadow-amber-900/30',
  },
  info: {
    icon: Info,
    badge: 'bg-blue-500/15 text-blue-400',
    bar:   'bg-blue-500',
    glow:  'shadow-blue-900/30',
  },
};

/* ─── ToastItem ─────────────────────────────────────────────── */

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const [visible,   setVisible]   = useState(false);
  const [shrinking, setShrinking] = useState(false);

  const cfg      = CONFIG[toast.type];
  const Icon     = cfg.icon;
  const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000);

  useEffect(() => {
    /* mount: trigger entrance then start progress bar */
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      /* tiny delay so CSS transition registers the initial scaleX(1) state */
      setTimeout(() => setShrinking(true), 30);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  function close() {
    setVisible(false);
    setTimeout(() => dismiss(toast.id), 280);
  }

  return (
    <div
      className={cn(
        /* base */
        'relative flex items-start gap-0 w-full max-w-[320px] rounded-2xl overflow-hidden select-none',
        /* navy surface + depth */
        'bg-[#0f1e38]',
        'shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
        cfg.glow,
        /* entrance / exit */
        'transition-all duration-300 ease-out',
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'
      )}
    >
      {/* Icon badge */}
      <div className={cn(
        'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center m-3 mr-0',
        cfg.badge
      )}>
        <Icon size={16} strokeWidth={2.2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-3 px-3">
        <p className="text-[13px] font-bold text-white leading-snug tracking-[-0.01em]">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
            {toast.description}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={close}
        aria-label="Fermer"
        className="shrink-0 p-2 mt-1.5 mr-1 text-slate-600 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className={cn('h-full origin-left rounded-full', cfg.bar)}
            style={{
              transform: shrinking ? 'scaleX(0)' : 'scaleX(1)',
              transition: `transform ${duration}ms linear`,
              opacity: 0.7,
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Container ─────────────────────────────────────────────── */

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full max-w-[320px]">
          <ToastItem toast={t} dismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
