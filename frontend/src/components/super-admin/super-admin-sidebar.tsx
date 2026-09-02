'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2, Shield, Settings, LogOut,
  LayoutDashboard, ScrollText, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/super-admin',               label: 'Vue d\'ensemble', icon: LayoutDashboard, exact: true },
  { href: '/super-admin/organizations', label: 'Organisations',   icon: Building2 },
  { href: '/super-admin/roles',         label: 'Rôles système',   icon: Shield },
  { href: '/super-admin/security',      label: 'Security Center', icon: AlertTriangle },
  { href: '/super-admin/audit-logs',    label: 'Audit Logs',      icon: ScrollText },
  { href: '/super-admin/settings',      label: 'Paramètres',      icon: Settings },
];

export function SuperAdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col h-full bg-[#0a1628] text-white w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <img src="/logo-dark.svg" alt="PLANORA 360" className="h-16 w-auto" />
        <p className="text-xs font-semibold text-amber-400/90 ml-auto">Super Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-white/25">
          Console SaaS
        </p>
        {NAV.map(item => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-amber-500 text-[#0a1628]'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              )}
            >
              <item.icon size={17} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-amber-400/70">Super administrateur</p>
          </div>
          <button
            onClick={logout}
            title="Se déconnecter"
            className="p-1.5 rounded-md text-white/30 hover:text-red-400 hover:bg-white/8 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
