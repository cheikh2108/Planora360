'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield, AlertTriangle, CheckCircle2, X, Search, Filter,
  ChevronLeft, ChevronRight, TrendingUp, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityEvent {
  id: string;
  organizationId: string | null;
  type: string;
  severity: string;
  status: string;
  userId: string | null;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  description: string;
  metadata: any;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolution: string | null;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
  };
}

interface SecurityEventResponse {
  events: SecurityEvent[];
  total: number;
  page: number;
  limit: number;
}

interface SecurityStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  recentCritical: number;
}

const SEVERITY_META = {
  LOW: { label: 'Faible', color: 'text-blue-700', bg: 'bg-blue-100', icon: Activity },
  MEDIUM: { label: 'Moyen', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: AlertTriangle },
  HIGH: { label: 'Élevé', color: 'text-orange-700', bg: 'bg-orange-100', icon: TrendingUp },
  CRITICAL: { label: 'Critique', color: 'text-red-700', bg: 'bg-red-100', icon: Shield },
};

const STATUS_META = {
  DETECTED: { label: 'Détecté', color: 'text-red-700', bg: 'bg-red-100' },
  INVESTIGATING: { label: 'En cours', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  RESOLVED: { label: 'Résolu', color: 'text-green-700', bg: 'bg-green-100' },
  FALSE_POSITIVE: { label: 'Faux positif', color: 'text-slate-700', bg: 'bg-slate-100' },
};

const TYPE_LABELS = {
  BRUTE_FORCE_LOGIN: 'Brute Force',
  UNAUTHORIZED_ACCESS: 'Accès non autorisé',
  SUSPICIOUS_ACTIVITY: 'Activité suspecte',
  ROLE_ESCALATION: 'Escalade de privilèges',
  DATA_EXPORT: 'Export de données',
  FAILED_2FA: '2FA échoué',
};

export default function SecurityCenterPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: '',
    email: '',
    startDate: '',
    endDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Fetch events
  const { data, isLoading } = useQuery<SecurityEventResponse>({
    queryKey: ['security-events', page, appliedFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(appliedFilters).filter(([_, v]) => v !== '')
        ),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/security-events?${params}`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch security events');
      return response.json();
    },
  });

  // Fetch stats
  const { data: stats } = useQuery<SecurityStats>({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/security-events/stats`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const resolveEvent = useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/security-events/${id}/resolve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolution }),
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to resolve event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
    },
  });

  const markAsFalsePositive = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/security-events/${id}/false-positive`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to mark as false positive');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
    },
  });

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <main className="px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Security Center</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Événements de sécurité et détections
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Total événements</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
            <p className="text-xs text-red-600 font-semibold mb-1">Critiques (24h)</p>
            <p className="text-2xl md:text-3xl font-bold text-red-700">{stats.recentCritical}</p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
            <p className="text-xs text-green-600 font-semibold mb-1">Résolus</p>
            <p className="text-2xl md:text-3xl font-bold text-green-700">
              {stats.byStatus.RESOLVED || 0}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-4">
            <p className="text-xs text-yellow-600 font-semibold mb-1">En cours</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-700">
              {(stats.byStatus.DETECTED || 0) + (stats.byStatus.INVESTIGATING || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-500" />
          <h2 className="text-xs md:text-sm font-semibold text-slate-800">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Type</label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="BRUTE_FORCE_LOGIN">Brute Force</SelectItem>
                <SelectItem value="UNAUTHORIZED_ACCESS">Accès non autorisé</SelectItem>
                <SelectItem value="SUSPICIOUS_ACTIVITY">Activité suspecte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Sévérité</label>
            <Select
              value={filters.severity}
              onValueChange={(value) => setFilters({ ...filters, severity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes</SelectItem>
                <SelectItem value="CRITICAL">Critique</SelectItem>
                <SelectItem value="HIGH">Élevé</SelectItem>
                <SelectItem value="MEDIUM">Moyen</SelectItem>
                <SelectItem value="LOW">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Statut</label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="DETECTED">Détecté</SelectItem>
                <SelectItem value="INVESTIGATING">En cours</SelectItem>
                <SelectItem value="RESOLVED">Résolu</SelectItem>
                <SelectItem value="FALSE_POSITIVE">Faux positif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Email</label>
            <Input
              placeholder="Ex: user@example.com"
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Date début</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleApplyFilters}
              className="w-full bg-[#0f1e38] hover:bg-[#0f1e38]/90 text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] md:text-xs font-semibold text-slate-600">
              {data?.total || 0} événements
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : data && data.events.length > 0 ? (
            <div className="space-y-3">
              {data.events.map((event) => (
                <SecurityEventRow
                  key={event.id}
                  event={event}
                  onResolve={(resolution) => resolveEvent.mutate({ id: event.id, resolution })}
                  onMarkFalse={(reason) => markAsFalsePositive.mutate({ id: event.id, reason })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Aucun événement de sécurité</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Page {page} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SecurityEventRow({
  event,
  onResolve,
  onMarkFalse,
}: {
  event: SecurityEvent;
  onResolve: (resolution: string) => void;
  onMarkFalse: (reason: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState('');

  const severityMeta = SEVERITY_META[event.severity as keyof typeof SEVERITY_META];
  const statusMeta = STATUS_META[event.status as keyof typeof STATUS_META];
  const SeverityIcon = severityMeta.icon;

  const handleResolve = () => {
    if (!resolution.trim()) return;
    onResolve(resolution);
    setResolving(false);
    setResolution('');
  };

  return (
    <div className="border border-slate-200 rounded-xl p-3 md:p-4 hover:bg-slate-50 transition-colors">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={cn(
                'inline-flex items-center gap-1.5 text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full',
                severityMeta.bg,
                severityMeta.color
              )}>
                <SeverityIcon className="h-3 w-3" />
                {severityMeta.label}
              </span>
              <span className={cn(
                'text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full',
                statusMeta.bg,
                statusMeta.color
              )}>
                {statusMeta.label}
              </span>
              <span className="text-[10px] md:text-xs text-slate-500">
                {TYPE_LABELS[event.type as keyof typeof TYPE_LABELS] || event.type}
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-700 mb-2">{event.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {event.email && (
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    Email
                  </p>
                  <p className="text-[11px] md:text-xs font-mono text-slate-700 truncate">
                    {event.email}
                  </p>
                </div>
              )}
              {event.ipAddress && (
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    IP
                  </p>
                  <p className="text-[11px] md:text-xs font-mono text-slate-700">
                    {event.ipAddress}
                  </p>
                </div>
              )}
              {event.organization && (
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    Organisation
                  </p>
                  <p className="text-[11px] md:text-xs text-slate-700 truncate">
                    {event.organization.name}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Date
                </p>
                <p className="text-[11px] md:text-xs text-slate-700">
                  {new Date(event.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-600 hover:text-slate-900 shrink-0"
          >
            {expanded ? 'Masquer' : 'Actions'}
          </Button>
        </div>

        {expanded && event.status === 'DETECTED' && (
          <div className="pt-3 border-t border-slate-200 space-y-3">
            {!resolving ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  onClick={() => setResolving(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Résoudre
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onMarkFalse('Faux positif')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Faux positif
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Décrivez la résolution..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleResolve}>
                    Confirmer
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setResolving(false);
                      setResolution('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {expanded && event.resolution && (
          <div className="pt-3 border-t border-slate-200">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Résolution
            </p>
            <p className="text-xs text-slate-700">{event.resolution}</p>
          </div>
        )}
      </div>
    </div>
  );
}
