'use client';

import { AppShell } from '@/components/layout/app-shell';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, ShoppingCart, Users, Gavel, FileSignature, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: Home, label: 'Accueil', href: '/passation' },
  { icon: FileText, label: 'PPM', href: '/passation/ppm' },
  { icon: ShoppingCart, label: 'Demandes', href: '/passation/demandes' },
  { icon: Users, label: 'Fournisseurs', href: '/passation/fournisseurs' },
  { icon: Gavel, label: 'Procédures', href: '/passation/procedures' },
  { icon: FileSignature, label: 'Contrats', href: '/passation/contrats' },
];

export default function PassationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/passation') {
      return pathname === '/passation';
    }
    return pathname.startsWith(href);
  };

  // Masquer la navigation sur la page d'accueil
  const showNavigation = pathname !== '/passation';

  return (
    <AppShell>
      {/* Navigation horizontale sous le header */}
      {showNavigation && (
        <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                      active
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon size={16} className={active ? 'text-emerald-600' : 'text-slate-400'} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {children}
    </AppShell>
  );
}
