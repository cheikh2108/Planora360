'use client';

import { HelpCircle } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const springConfig = { stiffness: 100, damping: 20 };

/**
 * Bouton d'aide flottant - Premium avec Framer Motion
 * Design variance: 8/10, Motion intensity: 6/10
 */
export function FloatingHelpButton() {
  const { toggleHelp, isOpen } = useHelp();
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
    return 'dashboard';
  };

  // Ne pas afficher sur les pages d'auth
  if (pathname.startsWith('/auth')) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-30"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 0.5,
        type: 'spring',
        ...springConfig,
      }}
    >
      {/* Glow effect - perpetual micro-animation */}
      <motion.div
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-blue-400 to-blue-300 blur-2xl"
      />

      {/* Main button */}
      <motion.button
        onClick={() => toggleHelp(getPageId())}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-xl shadow-blue-500/40 flex items-center justify-center group"
        aria-label="Ouvrir l'aide"
      >
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        >
          <HelpCircle
            size={24}
            className="text-white drop-shadow-lg"
            strokeWidth={2.5}
          />
        </motion.div>

        {/* Pulse ring on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-blue-300"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip - asymmetric placement */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 5 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 10, y: 5 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute bottom-full right-2 mb-3 px-4 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-white/10"
          >
            Besoin d'aide ?
            <div className="absolute top-full right-5 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-900/95" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating indicator - perpetual animation */}
      <motion.div
        animate={{
          y: [0, -4, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
      />
    </motion.div>
  );
}
