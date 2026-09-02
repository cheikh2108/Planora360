'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, CheckSquare, GitBranch,
  PiggyBank, FileText, Bell, BarChart3, Settings, LogOut,
  ChevronDown, Users, Shield, Archive, Target, UserPlus,
  BookOpen, Calendar, HelpCircle, ShieldAlert, Gavel, MessageSquare, MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',     label: 'Tableau de bord', icon: LayoutDashboard, permission: 'dashboard.view' },
  { href: '/dashboards/territorial', label: 'Vue Territoriale', icon: MapPin, permission: 'dashboard.view' },
  { href: '/plans',         label: "Plans d'action",  icon: FolderKanban,    permission: 'plan.read' },
  { href: '/plans/archives', label: 'Archives',        icon: Archive,         permission: 'plan.read' },
  { href: '/activities',    label: 'Activités',       icon: CheckSquare,     permission: 'activity.read' },
  { href: '/validations',   label: 'Validations',     icon: GitBranch,       permission: 'validation.approve' },
  { href: '/recommendations', label: 'Recommandations', icon: ShieldAlert },
  { href: '/indicators',    label: 'Indicateurs',     icon: Target,          permission: 'dashboard.view' },
  { href: '/participants',  label: 'Participants',    icon: UserPlus,        permission: 'activity.read' },
  { href: '/capitalisation', label: 'Capitalisation',  icon: BookOpen,        permission: 'document.download' },
  { href: '/planification', label: 'Planification',   icon: Calendar,        permission: 'plan.read' },
  { href: '/budgets',       label: 'Budget',          icon: PiggyBank,       permission: 'budget.read' },
  { href: '/documents',     label: 'Documents',       icon: FileText,        permission: 'document.download' },
  { href: '/passation',     label: 'Passation Marchés', icon: Gavel,        permission: 'plan.read' },
  { href: '/messagerie',    label: 'Messagerie',      icon: MessageSquare,   permission: 'activity.read' },
  { href: '/reports',       label: 'Rapports',        icon: BarChart3,       permission: 'report.generate' },
  { href: '/notifications', label: 'Notifications',   icon: Bell },
];

const ORG_ADMIN_ITEMS: NavItem[] = [
  { href: '/admin/users',  label: 'Utilisateurs',  icon: Users,       permission: 'user.read' },
  { href: '/admin/roles',  label: 'Rôles',         icon: Shield,      permission: 'user.create' },
  { href: '/admin/zones',  label: 'Zones',         icon: MapPin,      permission: 'plan.read' },
  { href: '/admin/help',   label: 'Centre d\'aide', icon: HelpCircle }, // Accessible à tous
  { href: '/settings',     label: 'Paramètres',    icon: Settings },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [adminOpen, setAdminOpen] = useState(false);

  const canSee = (item: NavItem) => {
    if (!item.permission) return true;
    const perms: string[] = user?.role?.permissions ?? [];
    return perms.includes('*') || perms.includes(item.permission);
  };

  const navLink = (item: NavItem) => {
    const active = item.href === '/plans'
      ? pathname === '/plans' || (pathname.startsWith('/plans/') && !pathname.startsWith('/plans/archives'))
      : pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          active
            ? 'text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        )}
        style={active ? {
          backgroundColor: 'color-mix(in srgb, var(--color-brand, #2563eb) 8%, white)',
          borderLeft: '3px solid var(--color-brand, #2563eb)'
        } : undefined}
      >
        <item.icon
          size={18}
          className={cn(
            "shrink-0 transition-transform duration-200",
            active ? "scale-110" : "group-hover:scale-105"
          )}
          style={active ? { color: 'var(--color-brand, #2563eb)' } : undefined}
        />
        <span className="flex-1 truncate">{item.label}</span>
      </Link>
    );
  };

  const visibleAdmin = ORG_ADMIN_ITEMS.filter(canSee);

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100 w-64 shrink-0">
      {/* Header avec brandColor subtile */}
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-sm"
            style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
          >
            P
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base text-slate-900 leading-tight tracking-tight">PLANORA</p>
            <p className="text-xs text-slate-500 truncate font-medium mt-0.5">{user?.organization?.name ?? '—'}</p>
          </div>
        </div>

        {/* Accent bar - brandColor */}
        <div
          className="h-1 rounded-full mt-4 transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, var(--color-brand, #2563eb) 0%, color-mix(in srgb, var(--color-brand, #2563eb) 20%, white) 100%)`
          }}
        />
      </div>

      {/* Navigation avec whitespace généreux */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {NAV_ITEMS.filter(canSee).map(navLink)}

        {visibleAdmin.length > 0 && (
          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              onClick={() => setAdminOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 w-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50"
            >
              <span className="flex-1 text-left">Administration</span>
              <ChevronDown
                className={cn('w-3.5 h-3.5 transition-transform duration-200', adminOpen && 'rotate-180')}
              />
            </button>
            {adminOpen && <div className="mt-2 space-y-1">{visibleAdmin.map(navLink)}</div>}
          </div>
        )}
      </nav>

      {/* User section moderne */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm"
            style={{ backgroundColor: 'var(--color-brand, #2563eb)' }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role?.name}</p>
          </div>
          <button
            onClick={logout}
            title="Se déconnecter"
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
