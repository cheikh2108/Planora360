'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Laptop, Smartphone, Tablet, Globe, Clock, MapPin,
  Monitor, ChevronLeft, ChevronRight, Search, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Session {
  id: string;
  userId: string;
  ipAddress: string;
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  lastActivityAt: string;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    organizationId: string;
    organization: {
      id: string;
      name: string;
    };
  };
}

interface SessionsResponse {
  sessions: Session[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Stats {
  totalActive: number;
  activeLast24h: number;
  totalUsers: number;
  byOrganization: Array<{
    organizationId: string;
    name: string;
    count: number;
  }>;
}

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    userId: '',
    organizationId: '',
    ipAddress: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Fetch sessions
  const { data, isLoading } = useQuery<SessionsResponse>({
    queryKey: ['sessions', page, appliedFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(appliedFilters).filter(([_, v]) => v !== '')
        ),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sessions?${params}`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    },
  });

  // Fetch stats
  const { data: stats } = useQuery<Stats>({
    queryKey: ['sessions-stats'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sessions/stats`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to revoke session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions-stats'] });
    },
  });

  const revokeUserSessions = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sessions/user/${userId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to revoke user sessions');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions-stats'] });
    },
  });

  const getDeviceIcon = (deviceName: string | null, os: string | null) => {
    if (deviceName) {
      if (deviceName.toLowerCase().includes('phone')) return Smartphone;
      if (deviceName.toLowerCase().includes('tablet')) return Tablet;
    }
    if (os) {
      if (os.toLowerCase().includes('android') || os.toLowerCase().includes('ios')) {
        return Smartphone;
      }
    }
    return Laptop;
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ userId: '', organizationId: '', ipAddress: '' });
    setAppliedFilters({ userId: '', organizationId: '', ipAddress: '' });
    setPage(1);
  };

  const hasFilters = Object.values(appliedFilters).some(v => v !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Sessions Actives</h1>
            <p className="text-sm text-slate-600 mt-1">
              Gestion et monitoring des sessions utilisateurs
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Actives</p>
                {stats ? (
                  <p className="text-2xl font-bold text-slate-900">{stats.totalActive}</p>
                ) : (
                  <Skeleton className="h-8 w-16" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Actives 24h</p>
                {stats ? (
                  <p className="text-2xl font-bold text-slate-900">{stats.activeLast24h}</p>
                ) : (
                  <Skeleton className="h-8 w-16" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <Laptop className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Utilisateurs</p>
                {stats ? (
                  <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                ) : (
                  <Skeleton className="h-8 w-16" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Organisations</p>
                {stats ? (
                  <p className="text-2xl font-bold text-slate-900">{stats.byOrganization.length}</p>
                ) : (
                  <Skeleton className="h-8 w-16" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Filtres</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-2 block">
                Adresse IP
              </label>
              <Input
                placeholder="192.168..."
                value={filters.ipAddress}
                onChange={(e) => setFilters({ ...filters, ipAddress: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 mb-2 block">
                User ID
              </label>
              <Input
                placeholder="clxxx..."
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 mb-2 block">
                Organization ID
              </label>
              <Input
                placeholder="clxxx..."
                value={filters.organizationId}
                onChange={(e) => setFilters({ ...filters, organizationId: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} size="sm">
              <Search className="w-4 h-4 mr-2" />
              Appliquer
            </Button>
            {hasFilters && (
              <Button onClick={resetFilters} variant="ghost" size="sm">
                <X className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Appareil
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Activité
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-4 px-6">
                        <Skeleton className="h-10 w-full" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-10 w-full" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-10 w-full" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-10 w-full" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : !data?.sessions.length ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Monitor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-900">Aucune session active</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Les sessions apparaîtront ici lors des connexions
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.sessions.map((session) => {
                    const DeviceIcon = getDeviceIcon(session.deviceName, session.os);
                    return (
                      <tr key={session.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {session.user.firstName} {session.user.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{session.user.email}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {session.user.organization.name}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <DeviceIcon className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <p className="text-sm text-slate-900">
                                {session.browser || 'Navigateur inconnu'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {session.os || 'OS inconnu'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <p className="text-sm text-slate-900">{session.ipAddress}</p>
                              {(session.city || session.country) && (
                                <p className="text-xs text-slate-500">
                                  {[session.city, session.country].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-slate-900">
                            {formatDistanceToNow(new Date(session.lastActivityAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                          <p className="text-xs text-slate-500">
                            Expire{' '}
                            {formatDistanceToNow(new Date(session.expiresAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revokeSession.mutate(session.id)}
                              disabled={revokeSession.isPending}
                            >
                              Révoquer
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => revokeUserSessions.mutate(session.userId)}
                              disabled={revokeUserSessions.isPending}
                            >
                              Toutes
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Page {data.page} sur {data.totalPages} • {data.total} sessions au total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.totalPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
