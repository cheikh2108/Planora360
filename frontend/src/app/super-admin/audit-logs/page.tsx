'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  oldValues: any;
  newValues: any;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AuditResponse {
  entries: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    ipAddress: '',
    startDate: '',
    endDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { data, isLoading, refetch } = useQuery<AuditResponse>({
    queryKey: ['audit-logs', page, appliedFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(appliedFilters).filter(([_, v]) => v !== '')
        ),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/audit/search?${params}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    },
  });

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleExport = async () => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(appliedFilters).filter(([_, v]) => v !== '')
      )
    );

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/audit/export?${params}`,
      '_blank'
    );
  };

  const totalPages = data ? Math.ceil(data.total / 50) : 0;

  return (
    <main className="px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Système d'audit enrichi avec IP, User-Agent, et diff
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-[#0f1e38] hover:bg-[#0f1e38]/90 text-white shrink-0 w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Exporter CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-500" />
          <h2 className="text-xs md:text-sm font-semibold text-slate-800">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Action</label>
            <Input
              placeholder="Ex: CREATE_ACTIVITY"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Type d'entité</label>
            <Select
              value={filters.entityType}
              onValueChange={(value) => setFilters({ ...filters, entityType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="Activity">Activity</SelectItem>
                <SelectItem value="ActionPlan">ActionPlan</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Organization">Organization</SelectItem>
                <SelectItem value="Recommendation">Recommendation</SelectItem>
                <SelectItem value="Participant">Participant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Adresse IP</label>
            <Input
              placeholder="Ex: 192.168.1.1"
              value={filters.ipAddress}
              onChange={(e) => setFilters({ ...filters, ipAddress: e.target.value })}
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

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Date fin</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleApplyFilters} className="w-full bg-[#0f1e38] hover:bg-[#0f1e38]/90 text-white">
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
              {data?.total || 0} entrées
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : data && data.entries.length > 0 ? (
            <div className="space-y-2">
              {data.entries.map((log) => (
                <AuditLogRow key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">Aucune entrée trouvée</p>
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

function AuditLogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl p-3 md:p-4 hover:bg-slate-50 transition-colors">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] md:text-xs font-mono font-semibold bg-blue-100 text-blue-700 px-2 md:px-2.5 py-1 rounded-full truncate max-w-[180px]">
                {log.action}
              </span>
              <span className="text-[10px] md:text-xs text-slate-500 truncate">
                {log.entityType} · {log.entityId.slice(0, 6)}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] md:text-xs text-slate-600 hover:text-slate-900 shrink-0 h-8"
          >
            {expanded ? 'Masquer' : 'Détails'}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
          <div>
            <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-1">Utilisateur</p>
            <p className="text-[11px] md:text-xs font-medium text-slate-900 truncate">
              {log.user.firstName} {log.user.lastName}
            </p>
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-1">IP</p>
            <p className="text-[11px] md:text-xs font-mono text-slate-700 truncate">{log.ipAddress || '-'}</p>
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-1">Request ID</p>
            <p className="text-[11px] md:text-xs font-mono text-slate-700 truncate">{log.requestId?.slice(0, 8) || '-'}</p>
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-1">Date</p>
            <p className="text-[11px] md:text-xs text-slate-700">
              {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
          {log.userAgent && (
            <div>
              <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-2">
                User-Agent
              </p>
              <p className="text-[10px] md:text-xs font-mono bg-slate-100 text-slate-700 p-2 md:p-3 rounded-lg break-all">
                {log.userAgent}
              </p>
            </div>
          )}

          {log.oldValues && (
            <div>
              <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-2">
                Anciennes valeurs
              </p>
              <pre className="text-[10px] md:text-xs bg-slate-100 text-slate-700 p-2 md:p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(log.oldValues, null, 2)}
              </pre>
            </div>
          )}

          {log.newValues && (
            <div>
              <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-2">
                Nouvelles valeurs
              </p>
              <pre className="text-[10px] md:text-xs bg-slate-100 text-slate-700 p-2 md:p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(log.newValues, null, 2)}
              </pre>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-2">
                Metadata
              </p>
              <pre className="text-[10px] md:text-xs bg-slate-100 text-slate-700 p-2 md:p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
