'use client';

import { X, Sparkles } from 'lucide-react';
import { useHelp } from '@/contexts/help-context';
import { getHelpForPage } from '@/lib/help-content';
import { useEffect, useState } from 'react';

export function HelpSidebar() {
  const { isOpen, currentPage, closeHelp } = useHelp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  const articles = getHelpForPage(currentPage);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeHelp}
      />

      {/* Sidebar - Distinctive Design */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[520px] z-50 flex flex-col transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        {/* Accent Line - Asymmetric */}
        <div
          className="absolute top-0 left-0 w-1 h-64 opacity-80"
          style={{
            background: 'linear-gradient(180deg, #3b82f6 0%, transparent 100%)',
          }}
        />

        {/* Header - Bold, Expressive Typography */}
        <div className="relative px-8 pt-12 pb-8">
          <button
            onClick={closeHelp}
            className="absolute top-6 right-6 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
            aria-label="Fermer"
          >
            <X size={20} className="text-white/60 group-hover:text-white transition-colors" />
          </button>

          <div className="flex items-start gap-4 mb-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping opacity-75" />
            </div>
            <div className="flex-1">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                Guide contextuel
              </p>
              <h2
                className="text-white font-bold leading-[0.95] tracking-tight"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                  fontFamily: 'var(--font-jakarta)',
                  fontWeight: 800,
                }}
              >
                Comment puis-je
                <br />
                vous aider ?
              </h2>
            </div>
          </div>
        </div>

        {/* Content - Asymmetric Layout */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {articles.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-blue-400" />
              </div>
              <p className="text-white/60 text-sm">
                Aucune aide disponible pour cette page.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <article
                  key={article.id}
                  className="group relative"
                  style={{
                    animation: `slideInRight 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Accent bar - appears on hover */}
                  <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all">
                    {/* Number indicator - asymmetric placement */}
                    <div className="absolute -left-2 -top-2 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/50">
                      {index + 1}
                    </div>

                    <h3 className="text-white font-bold text-lg mb-3 pr-8 leading-snug">
                      {article.title}
                    </h3>

                    <div
                      className="prose prose-sm prose-invert max-w-none"
                      style={{
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                      }}
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Subtle CTA */}
        <div className="px-8 py-6 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-white/60 text-xs">
              Support disponible —{' '}
              <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Contactez l'équipe
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .prose-invert {
          color: rgba(255, 255, 255, 0.7);
        }

        .prose-invert strong {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 700;
        }

        .prose-invert ul,
        .prose-invert ol {
          margin-top: 0.75rem;
          margin-bottom: 0;
          padding-left: 1.5rem;
        }

        .prose-invert li {
          margin-top: 0.25rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .prose-invert p {
          margin-top: 0;
          margin-bottom: 0.75rem;
        }

        .prose-invert p:last-child {
          margin-bottom: 0;
        }

        .prose-invert code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          color: #60a5fa;
          font-size: 0.85em;
        }
      `}</style>
    </>
  );
}
