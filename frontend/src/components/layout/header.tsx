'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, onMenuClick, actions }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}

      <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-xl px-3 py-2 w-64">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none flex-1 min-w-0"
        />
      </div>

      <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
      </button>

      <div className="w-8 h-8 rounded-full bg-[#0f1e38] flex items-center justify-center text-white text-xs font-bold shrink-0">
        {user?.firstName?.[0]}{user?.lastName?.[0]}
      </div>
    </header>
  );
}
