'use client';

import { HelpCircle } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const easeOut = "easeOut"; // Framer Motion preset for button interactions

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
    if (pathname.startsWith('/recommendations')) return 'recommendations';
    if (pathname.startsWith('/indicators')) return 'indicators';
    if (pathname.startsWith('/participants')) return 'participants';
    if (pathname.startsWith('/capitalisation')) return 'capitalisation';
    if (pathname.startsWith('/planification')) return 'planification';
    if (pathname.startsWith('/budgets')) return 'budgets';
    if (pathname.startsWith('/documents')) return 'documents';
    if (pathname.startsWith('/reports')) return 'reports';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/passation/ppm')) return 'passation-ppm';
    if (pathname.startsWith('/passation/demandes')) return 'passation-demandes';
    if (pathname.startsWith('/passation/fournisseurs')) return 'passation-fournisseurs';
    if (pathname.startsWith('/passation/procedures')) return 'passation-procedures';
    if (pathname.startsWith('/passation/contrats')) return 'passation-contrats';
    if (pathname.startsWith('/passation')) return 'passation';
    return 'dashboard';
  };

  // Ne pas afficher sur les pages auth et super-admin
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/super-admin')) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 0.2,
        duration: 0.3,
        ease: easeOut,
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
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.16, ease: easeOut }}
        className="relative w-12 h-12 rounded-full flex items-center justify-center group"
        style={{
          background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, var(--color-brand-dark, #1e40af) 100%)`,
          boxShadow: `0 8px 24px -4px var(--color-brand, #2563eb)`,
        }}
        aria-label="Ouvrir l'aide"
      >
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{ duration: 0.3, ease: easeOut }}
        >
          <HelpCircle
            size={20}
            className="text-white drop-shadow-lg"
            strokeWidth={2.5}
          />
        </motion.div>

      </motion.button>

      {/* Tooltip asymétrique */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 5 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 10, y: 5 }}
            transition={{ duration: 0.15, ease: easeOut }}
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
    </div>
  );
}
