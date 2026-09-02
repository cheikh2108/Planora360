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
    const perms = user?.role?.permissions;
    // Protection: s'assurer que permissions est bien un tableau
    if (!Array.isArray(perms)) return false;
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
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          active ? 'text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
        )}
        style={active ? { backgroundColor: 'var(--color-brand)' } : undefined}
      >
        <item.icon size={18} className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
      </Link>
    );
  };

  // Protection: filter peut échouer si NAV_ITEMS ou ORG_ADMIN_ITEMS sont corrompus
  const visibleNav = NAV_ITEMS.filter(canSee);
  const visibleAdmin = ORG_ADMIN_ITEMS.filter(canSee);

  return (
    <aside className="flex flex-col h-full text-white w-64 shrink-0" style={{ backgroundColor: 'var(--color-brand-dark, #0f1e38)' }}>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <img src="/logo-light.svg" alt="PLANORA 360" className="h-16 w-auto" />
        <p className="text-xs text-white/40 truncate max-w-35 ml-auto">{user?.organization?.name ?? '—'}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleNav.map(navLink)}

        {visibleAdmin.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setAdminOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 w-full text-xs font-semibold uppercase tracking-wider text-white/30 hover:text-white/60 transition-colors"
            >
              <span className="flex-1 text-left">Administration</span>
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', adminOpen && 'rotate-180')} />
            </button>
            {adminOpen && <div className="mt-1 space-y-0.5">{visibleAdmin.map(navLink)}</div>}
          </div>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white" style={{ backgroundColor: 'var(--color-brand)', opacity: 0.85 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-white/40 truncate">{user?.role?.name}</p>
          </div>
          <button onClick={logout} title="Se déconnecter" className="p-1.5 rounded-md text-white/30 hover:text-red-400 hover:bg-white/8 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
