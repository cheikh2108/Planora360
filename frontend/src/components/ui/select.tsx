'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  registerOption: (value: string, label: string) => void;
  getLabel: (value: string) => string;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('Select components must be used within Select');
  return context;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const optionsRef = React.useRef<Map<string, string>>(new Map());

  const registerOption = React.useCallback((value: string, label: string) => {
    optionsRef.current.set(value, label);
  }, []);

  const getLabel = React.useCallback((value: string) => {
    return optionsRef.current.get(value) || value;
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, registerOption, getLabel }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = useSelectContext();

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
        open && 'border-[#2563eb] ring-2 ring-[#2563eb] ring-offset-1',
        className
      )}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200', open && 'rotate-180 text-[#2563eb]')} />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value, getLabel } = useSelectContext();
  const displayValue = value ? getLabel(value) : placeholder || 'Sélectionner...';

  return <span className={cn('text-left truncate', value ? 'text-slate-900' : 'text-slate-500')}>{displayValue}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSelectContext();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-60 overflow-auto">
        <div className="p-1.5">{children}</div>
      </div>
    </>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  const { onValueChange, setOpen, value: selectedValue, registerOption } = useSelectContext();

  // Register this option when component mounts
  React.useEffect(() => {
    const label = typeof children === 'string' ? children : value;
    registerOption(value, label);
  }, [value, children, registerOption]);

  return (
    <div
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-all',
        value === selectedValue
          ? 'bg-[#2563eb] text-white font-medium shadow-sm'
          : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
      )}
    >
      {children}
    </div>
  );
}
