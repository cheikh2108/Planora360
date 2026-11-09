'use client';

import { Search, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { NotificationsDropdown } from './notifications-dropdown';
import { useMobileMenu } from './mobile-menu-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { user } = useAuth();
  const { toggle } = useMobileMenu();
  const router = useRouter();
  const [search, setSearch] = useState('');

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/activities?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 shrink-0">
      <button
        onClick={toggle}
        aria-label="Ouvrir le menu de navigation"
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base md:text-lg font-semibold text-slate-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}

      <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-xl px-3 py-2 w-56">
        <Search size={15} className="text-slate-600 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Rechercher..."
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-600 outline-none flex-1 min-w-0"
        />
      </div>

      <NotificationsDropdown />

      <Link
        href="/settings"
        title="Paramètres du compte"
        className="relative w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'var(--color-brand)', opacity: 0.9 }}
      >
        {user?.firstName?.[0]}{user?.lastName?.[0]}
      </Link>
    </header>
  );
}
