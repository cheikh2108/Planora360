'use client';

import { Search, Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { HELP_CONTENT } from '@/lib/help-content';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/header';

const easeOut = "easeOut"; // Framer Motion preset for UI interactions

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
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Centre d'aide"
        subtitle={`${totalArticles} articles · Documentation complète`}
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
        {/* Search Bar DISTINCTIF */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: easeOut }}
          className="relative max-w-2xl"
        >
          {/* Diagonal accent */}
          <div
            className="absolute -top-2 -left-2 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: 'var(--color-brand, #2563eb)' }}
          />

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
              style={{ color: 'var(--color-brand, #2563eb)' }}
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans l'aide..."
              className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-white border-2 text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-medium shadow-sm"
              style={{
                borderColor: searchTerm ? 'var(--color-brand, #2563eb)' : 'rgb(226, 232, 240)',
                boxShadow: searchTerm ? `0 0 0 3px color-mix(in srgb, var(--color-brand, #2563eb) 10%, transparent)` : undefined,
              }}
            />
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {searchTerm && filteredContent.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-200"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-400" />
              </div>
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
              className="space-y-5"
            >
              {(searchTerm ? filteredContent : HELP_CONTENT).map((pageHelp, groupIndex) => (
                <motion.div
                  key={pageHelp.page}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: groupIndex * 0.04,
                    duration: 0.3,
                    ease: easeOut,
                  }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header de section avec accent brand */}
                  <div className="relative px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <motion.div
                      className="absolute left-0 top-0 w-1 h-full origin-top"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: groupIndex * 0.04 + 0.1, duration: 0.25, ease: easeOut }}
                      style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                    />
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg text-slate-900 flex items-center gap-3">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.16, ease: easeOut }}
                          className="text-sm font-black px-2.5 py-1 rounded-lg text-white shadow-sm"
                          style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
                        >
                          {pageHelp.articles.length}
                        </motion.span>
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
                        transition={{ delay: index * 0.02, duration: 0.2, ease: easeOut }}
                        whileHover={{ x: 4, backgroundColor: 'rgba(248, 250, 252, 1)' }}
                        className="p-5 transition-all group cursor-default"
                      >
                        <div className="flex items-start gap-4">
                          {/* Number badge avec couleur brand */}
                          <motion.div
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.16, ease: easeOut }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm"
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
          transition={{ delay: 0.3, duration: 0.3, ease: easeOut }}
          className="relative overflow-hidden rounded-2xl border border-slate-200 p-8 text-center bg-white shadow-sm"
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, transparent 70%)`,
            }}
          />
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
            >
              <Zap size={28} className="text-white" fill="white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Besoin d'aide supplémentaire ?
            </h3>
            <p className="text-slate-600 mb-5 max-w-md mx-auto">
              Notre équipe est disponible 24/7 pour vous accompagner
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: easeOut }}
              className="px-8 py-3 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
              style={{
                background: `linear-gradient(135deg, var(--color-brand, #2563eb) 0%, var(--color-brand-dark, #1e40af) 100%)`,
              }}
            >
              Contacter le support
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
