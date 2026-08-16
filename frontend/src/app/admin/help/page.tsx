'use client';

import { BookOpen, Lightbulb, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { HELP_CONTENT } from '@/lib/help-content';

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

  // Filtrer les articles par recherche
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
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#1e40af] text-white px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Centre d'aide PLANORA 360</h1>
              <p className="text-blue-100 mt-1">
                {totalArticles} articles disponibles pour vous guider
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans l'aide..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {searchTerm && filteredContent.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500">Aucun résultat pour "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-8">
              {(searchTerm ? filteredContent : HELP_CONTENT).map(pageHelp => (
                <div key={pageHelp.page} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-slate-900">
                      {PAGE_LABELS[pageHelp.page] || pageHelp.page}
                    </h2>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {pageHelp.articles.length} article{pageHelp.articles.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {pageHelp.articles.map(article => (
                      <div key={article.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-1">
                            <Lightbulb size={20} className="text-[#2563eb]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              {article.title}
                            </h3>
                            <div
                              className="prose prose-sm prose-slate max-w-none text-slate-600"
                              dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer CTA */}
          <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
              <ExternalLink size={24} className="text-[#2563eb]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Besoin d'aide supplémentaire ?
            </h3>
            <p className="text-slate-600 mb-4">
              Notre équipe est disponible pour vous accompagner
            </p>
            <button className="px-6 py-2.5 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
