'use client';

import { Search, Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { HELP_CONTENT } from '@/lib/help-content';
import { motion, AnimatePresence } from 'framer-motion';

const springConfig = { stiffness: 100, damping: 20 };

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord',
  plans: "Plans d'action",
  activities: 'Activités',
  validations: 'Validations',
  indicators: 'Indicateurs',
  participants: 'Participants',
  capitalisation: 'Capitalisation',
  planification: 'Planification',
  budgets: 'Budget',
  documents: 'Documents',
  reports: 'Rapports',
  settings: 'Paramètres',
};

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContent = HELP_CONTENT.map(pageHelp => ({
    ...pageHelp,
    articles: pageHelp.articles.filter(
      article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(pageHelp => pageHelp.articles.length > 0);

  const totalArticles = HELP_CONTENT.reduce((sum, p) => sum + p.articles.length, 0);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header DISTINCTIF - Diagonal + Custom Colors */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', ...springConfig }}
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(168deg, #0d1117 0%, #0a0e14 100%)',
        }}
      >
        {/* Diagonal Strip avec couleur brand */}
        <div
          className="absolute top-0 left-0 w-full h-full origin-top-left"
          style={{
            transform: 'skewY(-2deg) translateY(-10%)',
            background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, transparent 80%)`,
            opacity: 0.12,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-start justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: 'spring', ...springConfig }}
            >
              {/* Badge animé */}
              <div className="flex items-center gap-2.5 mb-4">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-[0.25em]"
                  style={{ color: 'var(--color-brand, #2563eb)' }}
                >
                  DOCUMENTATION
                </span>
              </div>

              <h1
                className="font-outfit font-extrabold leading-[0.9] tracking-tighter mb-3"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Centre d'aide
              </h1>

              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                >
                  <Zap size={18} className="text-white" fill="white" />
                </motion.div>
                <p className="text-white/60 text-sm font-semibold">
                  {totalArticles} articles · Recherche instantanée
                </p>
              </div>
            </motion.div>
          </div>

          {/* Search ASYMÉTRIQUE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', ...springConfig }}
            className="relative max-w-2xl"
          >
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans l'aide..."
              className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm text-white placeholder:text-white/40 focus:outline-none border border-white/10 focus:border-white/20 transition-all font-medium"
              style={{
                boxShadow: `0 8px 32px -8px var(--color-brand, #2563eb)`,
              }}
            />
          </motion.div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {searchTerm && filteredContent.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4"
                >
                  <Search size={32} className="text-slate-400" />
                </motion.div>
                <p className="text-slate-600 font-medium">
                  Aucun résultat pour "{searchTerm}"
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {(searchTerm ? filteredContent : HELP_CONTENT).map((pageHelp, groupIndex) => (
                  <motion.div
                    key={pageHelp.page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: groupIndex * 0.05,
                      type: 'spring',
                      ...springConfig,
                    }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header de section avec accent brand */}
                    <div className="relative px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                      <div
                        className="absolute left-0 top-0 w-1 h-full"
                        style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                      />
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-3">
                          <span
                            className="text-sm font-black px-2 py-0.5 rounded-lg text-white"
                            style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                          >
                            {pageHelp.articles.length}
                          </span>
                          {PAGE_LABELS[pageHelp.page] || pageHelp.page}
                        </h2>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {pageHelp.articles.map((article, index) => (
                        <motion.article
                          key={article.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ x: 4, backgroundColor: 'rgba(248, 250, 252, 1)' }}
                          className="p-6 transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            {/* Number badge */}
                            <motion.div
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold"
                              style={{
                                background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, var(--color-brand-dark, #1e40af) 100%)`,
                              }}
                            >
                              {index + 1}
                            </motion.div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 group-hover:text-slate-700 transition-colors">
                                {article.title}
                                <ArrowRight
                                  size={16}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ color: 'var(--color-brand, #2563eb)' }}
                                />
                              </h3>
                              <div
                                className="prose prose-sm prose-slate max-w-none text-slate-600"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                              />
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', ...springConfig }}
            className="mt-12 relative overflow-hidden rounded-2xl border border-slate-200 p-8 text-center bg-white"
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, transparent 70%)`,
              }}
            />
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
              >
                <Zap size={28} className="text-white" fill="white" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Besoin d'aide supplémentaire ?
              </h3>
              <p className="text-slate-600 mb-5 max-w-md mx-auto">
                Notre équipe est disponible 24/7 pour vous accompagner
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, var(--color-brand-dark, #1e40af) 100%)`,
                }}
              >
                Contacter le support
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
