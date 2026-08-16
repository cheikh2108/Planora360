'use client';

import { HelpCircle, Sparkles } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * Bouton d'aide flottant - Toujours visible sur toutes les pages
 */
export function FloatingHelpButton() {
  const { toggleHelp } = useHelp();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Extraire l'identifiant de page depuis le pathname
  const getPageId = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname.startsWith('/plans')) return 'plans';
    if (pathname.startsWith('/activities')) return 'activities';
    if (pathname.startsWith('/validations')) return 'validations';
    if (pathname.startsWith('/indicators')) return 'indicators';
    if (pathname.startsWith('/participants')) return 'participants';
    if (pathname.startsWith('/capitalisation')) return 'capitalisation';
    if (pathname.startsWith('/planification')) return 'planification';
    if (pathname.startsWith('/budgets')) return 'budgets';
    if (pathname.startsWith('/documents')) return 'documents';
    if (pathname.startsWith('/reports')) return 'reports';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'dashboard'; // fallback
  };

  // Ne pas afficher sur les pages d'auth
  if (pathname.startsWith('/auth')) return null;

  return (
    <button
      onClick={() => toggleHelp(getPageId())}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-30 group"
      aria-label="Ouvrir l'aide"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2563eb] via-[#3b82f6] to-[#60a5fa] opacity-20 blur-xl scale-150 group-hover:opacity-40 transition-opacity duration-500" />

      {/* Main button */}
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] shadow-lg shadow-[#2563eb]/30 flex items-center justify-center group-hover:shadow-xl group-hover:shadow-[#2563eb]/50 transition-all duration-300 group-hover:scale-110">
        <HelpCircle
          size={24}
          className="text-white transition-transform duration-300 group-hover:rotate-12"
          strokeWidth={2.5}
        />

        {/* Sparkle indicator */}
        {isHovered && (
          <Sparkles
            size={12}
            className="absolute -top-1 -right-1 text-yellow-300 animate-pulse"
          />
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Besoin d'aide ?
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
      </div>
    </button>
  );
}
