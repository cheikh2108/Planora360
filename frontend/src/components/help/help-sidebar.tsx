'use client';

import { X, BookOpen } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';
import { getHelpForPage } from '@/lib/help-content';

export function HelpSidebar() {
  const { isOpen, currentPage, closeHelp } = useHelp();

  if (!isOpen) return null;

  const articles = getHelpForPage(currentPage);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={closeHelp}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#eef5ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2563eb] flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Centre d'aide</h2>
              <p className="text-xs text-slate-500">Aide contextuelle pour cette page</p>
            </div>
          </div>
          <button
            onClick={closeHelp}
            className="p-2 rounded-lg hover:bg-white/60 transition-colors"
            aria-label="Fermer l'aide"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={24} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                Aucun article d'aide disponible pour cette page.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <article key={article.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] mt-2 shrink-0" />
                    {article.title}
                  </h3>
                  <div
                    className="prose prose-sm prose-slate max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            Besoin d'aide supplémentaire ? Contactez l'équipe <strong>PLANORA 360</strong>
          </p>
        </div>
      </div>
    </>
  );
}
