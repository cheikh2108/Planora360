'use client';

import { HelpCircle } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const customEasing = 'cubic-bezier(0.23, 1, 0.32, 1)'; // Strong ease-out

/**
 * Bouton d'aide flottant DISTINCTIF
 * Respect total des couleurs custom de l'organisation
 */
export function FloatingHelpButton() {
  const { toggleHelp, isOpen } = useHelp();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

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
    return 'dashboard';
  };

  if (pathname.startsWith('/auth')) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-30"
      initial={{ transform: 'scale(0)', opacity: 0 }}
      animate={{ transform: 'scale(1)', opacity: 1 }}
      transition={{
        delay: 0.5,
        duration: 0.3,
        ease: customEasing,
      }}
    >
      {/* Glow effect avec couleur brand - static */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20"
        style={{
          background: 'var(--color-brand, #2563eb)',
        }}
      />

      {/* Main button avec gradient brand */}
      <motion.button
        onClick={() => toggleHelp(getPageId())}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ transform: 'scale(1.08)' }}
        whileTap={{ transform: 'scale(0.95)' }}
        transition={{ duration: 0.16, ease: customEasing }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center group"
        style={{
          background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, var(--color-brand-dark, #1e40af) 100%)`,
          boxShadow: `0 8px 24px -4px var(--color-brand, #2563eb)`,
        }}
        aria-label="Ouvrir l'aide"
      >
        <motion.div
          animate={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          transition={{ duration: 0.3, ease: customEasing }}
        >
          <HelpCircle
            size={24}
            className="text-white drop-shadow-lg"
            strokeWidth={2.5}
          />
        </motion.div>

      </motion.button>

      {/* Tooltip asymétrique */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, transform: 'translate(10px, 5px)' }}
            animate={{ opacity: 1, transform: 'translate(0, 0)' }}
            exit={{ opacity: 0, transform: 'translate(10px, 5px)' }}
            transition={{ duration: 0.15, ease: customEasing }}
            className="absolute bottom-full right-2 mb-3 px-4 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-white/10"
          >
            Besoin d'aide ?
            <div className="absolute top-full right-5 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-900/95" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification indicator avec couleur brand - static */}
      <div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full shadow-lg"
        style={{
          backgroundColor: 'var(--color-brand, #2563eb)',
          boxShadow: `0 4px 12px -2px var(--color-brand, #2563eb)`,
        }}
      />
    </motion.div>
  );
}
