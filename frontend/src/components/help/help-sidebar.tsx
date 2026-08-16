'use client';

import { X, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';
import { getHelpForPage } from '@/lib/help-content';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const easeOut = "easeOut"; // Framer Motion preset for drawer animations

/**
 * Sidebar d'aide DISTINCTIVE avec respect des couleurs custom
 * Design NON-CONVENTIONNEL : diagonal, asymétrique, mémorable
 */
export function HelpSidebar() {
  const { isOpen, currentPage, closeHelp } = useHelp();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(false);

      const timer = setTimeout(() => {
        try {
          const data = getHelpForPage(currentPage);
          setArticles(data);
          setLoading(false);
        } catch {
          setError(true);
          setLoading(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentPage]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40"
            onClick={closeHelp}
          />

          {/* Sidebar - DESIGN DISTINCTIF DIAGONAL */}
          <motion.aside
            initial={{ transform: 'translateX(100%)', opacity: 0 }}
            animate={{ transform: 'translateX(0)', opacity: 1 }}
            exit={{ transform: 'translateX(100%)', opacity: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="fixed top-0 right-0 h-full w-full md:w-[560px] z-50 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(168deg, #0d1117 0%, #0a0e14 100%)',
            }}
          >
            {/* DIAGONAL ACCENT STRIP - Utilise couleur brand */}
            <div
              className="absolute top-0 left-0 w-full h-[180px] origin-top-left"
              style={{
                transform: 'skewY(-3deg)',
                background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, transparent 100%)`,
                opacity: 0.08,
              }}
            />

            {/* Header - LAYOUT ASYMÉTRIQUE AUDACIEUX */}
            <div className="relative px-8 pt-8 pb-6">
              <button
                onClick={closeHelp}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-all group border border-white/[0.05]"
                aria-label="Fermer"
              >
                <X size={18} className="text-white/50 group-hover:text-white/90 transition-colors" />
              </button>

              <motion.div
                initial={{ opacity: 0, transform: 'translateY(-15px)' }}
                animate={{ opacity: 1, transform: 'translateY(0)' }}
                transition={{ delay: 0.1, duration: 0.3, ease: easeOut }}
              >
                {/* Live Indicator avec couleur brand */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-[0.25em] opacity-80"
                    style={{ color: 'var(--color-brand, #2563eb)' }}
                  >
                    AIDE EN DIRECT
                  </span>
                </div>

                {/* Typography ultra-expressive - DÉCALÉE */}
                <div className="relative">
                  <h2
                    className="font-outfit font-extrabold leading-[0.85] tracking-tighter mb-1"
                    style={{
                      fontSize: 'clamp(2.5rem, 5vw, 3rem)',
                      background: `linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Aide
                  </h2>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                    >
                      <Zap size={18} className="text-white" fill="white" />
                    </div>
                    <p className="text-white/40 text-sm font-semibold">
                      Réponses instantanées
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-4">
              <AnimatePresence mode="wait">
                {loading ? (
                  <LoadingState key="loading" />
                ) : error ? (
                  <ErrorState key="error" />
                ) : articles.length === 0 ? (
                  <EmptyState key="empty" />
                ) : (
                  <ArticlesList key="articles" articles={articles} />
                )}
              </AnimatePresence>
            </div>

            {/* Footer - Minimaliste avec accent brand */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-8 py-5 border-t bg-white/[0.01]"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                />
                <p className="text-white/50 text-xs font-medium">
                  Support disponible 24/7 —{' '}
                  <button
                    className="font-bold hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-brand, #2563eb)' }}
                  >
                    Contactez-nous
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={32} className="opacity-60" style={{ color: 'var(--color-brand, #2563eb)' }} strokeWidth={2} />
      </motion.div>
      <p className="text-white/60 text-sm font-medium mt-4">Chargement...</p>
    </motion.div>
  );
}

function ErrorState() {
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'scale(0.98)' }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
      exit={{ opacity: 0, transform: 'scale(0.98)' }}
      transition={{ duration: 0.2, ease: easeOut }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
        <AlertCircle size={32} className="text-red-400" />
      </div>
      <p className="text-white/80 font-semibold mb-2">Erreur de chargement</p>
      <p className="text-white/50 text-sm text-center max-w-xs">
        Impossible de charger l'aide. Réessayez.
      </p>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(10px)' }}
      animate={{ opacity: 1, transform: 'translateY(0)' }}
      exit={{ opacity: 0, transform: 'translateY(-10px)' }}
      transition={{ duration: 0.2, ease: easeOut }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.08]">
        <span className="text-3xl">💡</span>
      </div>
      <p className="text-white/60 text-sm font-medium max-w-xs">
        Aucune aide disponible pour cette page.
      </p>
    </motion.div>
  );
}

function ArticlesList({ articles }: { articles: any[] }) {
  return (
    <motion.div className="space-y-4">
      {articles.map((article, index) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, transform: 'translateX(20px)' }}
          animate={{ opacity: 1, transform: 'translateX(0)' }}
          transition={{
            delay: index * 0.05,
            duration: 0.25,
            ease: easeOut,
          }}
          whileHover={{ transform: 'translateX(-4px) scale(1.01)' }}
          className="group relative"
        >
          {/* Accent latéral avec couleur brand */}
          <motion.div
            className="absolute left-0 top-0 w-[3px] h-0 rounded-full"
            style={{ background: `var(--color-brand, #2563eb)` }}
            whileHover={{ height: '100%' }}
            transition={{ duration: 0.3 }}
          />

          <div
            className="relative pl-6 pr-5 py-5 rounded-2xl border transition-all"
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            {/* Number Badge - DÉCALÉ AUDACIEUSEMENT */}
            <motion.div
              initial={{ opacity: 0, transform: 'scale(0.8) rotate(-12deg)' }}
              animate={{ opacity: 1, transform: 'scale(1) rotate(-12deg)' }}
              transition={{
                delay: index * 0.05 + 0.1,
                duration: 0.2,
                ease: easeOut,
              }}
              className="absolute -left-3 top-4 w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-2xl"
              style={{
                background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, var(--color-brand-dark, #1e40af) 100%)`,
                boxShadow: `0 8px 24px -8px var(--color-brand, #2563eb)`,
              }}
            >
              {index + 1}
            </motion.div>

            <h3 className="text-white font-bold text-base leading-snug mb-3 pr-2">
              {article.title}
            </h3>

            <div
              className="prose-help-custom text-white/60 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </motion.article>
      ))}
    </motion.div>
  );
}
