'use client';

import { HelpCircle } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';

interface HelpButtonProps {
  page: string;
  className?: string;
}

export function HelpButton({ page, className = '' }: HelpButtonProps) {
  const { toggleHelp } = useHelp();

  return (
    <button
      onClick={() => toggleHelp(page)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-all font-medium text-sm ${className}`}
      title="Afficher l'aide contextuelle"
    >
      <HelpCircle size={18} />
      <span>Aide</span>
    </button>
  );
}
