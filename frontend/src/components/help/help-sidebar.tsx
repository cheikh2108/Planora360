'use client';

import { X, Loader2, AlertCircle } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';
import { getHelpForPage } from '@/lib/help-content';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const springConfig = { stiffness: 100, damping: 20 };

export function HelpSidebar() {
  const { isOpen, currentPage, closeHelp } = useHelp();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(false);

      // Simulate async load (même si c'est synchrone, pour avoir un vrai loading state)
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
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40"
            onClick={closeHelp}
          />

          {/* Sidebar - Ultra Premium Design */}
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', ...springConfig }}
            className="fixed top-0 right-0 h-full w-full md:w-[540px] z-50 flex flex-col"
            style={{
              background: 'linear-gradient(165deg, #0a0e1a 0%, #151b2e 50%, #0f1419 100%)',
            }}
          >
            {/* Accent Elements - Asymmetric */}
            <div className="absolute top-0 left-0 w-[2px] h-72 bg-gradient-to-b from-blue-500/60 via-blue-400/30 to-transparent" />
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-32 -right-24 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"
            />

            {/* Header - Expressive Typography */}
            <div className="relative px-8 pt-10 pb-6 border-b border-white/5">
              <button
                onClick={closeHelp}
                className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                aria-label="Fermer"
              >
                <X size={18} className="text-white/40 group-hover:text-white/80 transition-colors" />
              </button>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', ...springConfig }}
              >
                {/* Pulsing Indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                  <span className="text-blue-400/80 text-[10px] font-semibold uppercase tracking-widest">
                    Guide en direct
                  </span>
                </div>

                <h2 className="text-white font-outfit text-[2.2rem] font-bold leading-[0.9] tracking-tight mb-2">
                  Comment
                  <br />
                  vous aider ?
                </h2>
                <p className="text-white/40 text-sm font-medium">
                  Aide contextuelle pour cette page
                </p>
              </motion.div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
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

            {/* Footer - Minimal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-8 py-5 border-t border-white/5 bg-white/[0.02]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-white/40 text-xs font-medium">
                  Support disponible —{' '}
                  <button className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
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
        <Loader2 size={32} className="text-blue-400" strokeWidth={2} />
      </motion.div>
      <p className="text-white/60 text-sm font-medium mt-4">Chargement de l'aide...</p>
    </motion.div>
  );
}

function ErrorState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', ...springConfig }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle size={32} className="text-red-400" />
      </div>
      <p className="text-white/80 font-semibold mb-2">Erreur de chargement</p>
      <p className="text-white/50 text-sm text-center max-w-xs">
        Impossible de charger l'aide pour le moment. Réessayez plus tard.
      </p>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', ...springConfig }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/10"
      >
        <span className="text-2xl">📚</span>
      </motion.div>
      <p className="text-white/60 text-sm font-medium max-w-xs">
        Aucune aide disponible pour cette page pour le moment.
      </p>
    </motion.div>
  );
}

function ArticlesList({ articles }: { articles: any[] }) {
  return (
    <motion.div className="space-y-3">
      {articles.map((article, index) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.08,
            type: 'spring',
            ...springConfig,
          }}
          whileHover={{ scale: 1.01 }}
          className="group relative"
        >
          {/* Hover accent */}
          <motion.div
            className="absolute left-0 top-0 w-[2px] h-0 bg-gradient-to-b from-blue-400 to-transparent"
            whileHover={{ height: '100%' }}
            transition={{ duration: 0.2 }}
          />

          <div className="relative bg-white/[0.04] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all">
            {/* Number Badge - Asymmetric */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.08 + 0.15, type: 'spring', stiffness: 200, damping: 15 }}
              className="absolute -left-2.5 -top-2.5 w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30"
            >
              {index + 1}
            </motion.div>

            <h3 className="text-white font-semibold text-base leading-snug mb-3 pr-4">
              {article.title}
            </h3>

            <div
              className="prose-help text-white/60 text-[0.875rem] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </motion.article>
      ))}
    </motion.div>
  );
}
