'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        className={cn('relative bg-white rounded-2xl shadow-xl w-full flex flex-col max-h-[90vh]', SIZES[size])}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
