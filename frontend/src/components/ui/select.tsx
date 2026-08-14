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
        'flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      style={{
        boxShadow: open ? '0 0 0 2px color-mix(in srgb, var(--color-brand, #2563eb) 30%, transparent)' : undefined,
        borderColor: open ? 'var(--color-brand, #2563eb)' : undefined
      }}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 opacity-50 shrink-0 transition-transform', open && 'rotate-180')} />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value, getLabel } = useSelectContext();
  const displayValue = value ? getLabel(value) : placeholder || 'Sélectionner...';

  return <span className="text-left truncate">{displayValue}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSelectContext();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-60 overflow-auto">
        <div className="p-1">{children}</div>
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
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        value === selectedValue
          ? 'bg-slate-100 text-slate-900 font-medium'
          : 'hover:bg-slate-50 text-slate-700'
      )}
    >
      {children}
    </div>
  );
}
