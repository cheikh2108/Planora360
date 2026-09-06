'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, Trash2, ChevronRight, ChevronDown, Loader2, Settings } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { zonesApi } from '@/lib/api';
import { ConfigureZonesModal } from '@/components/zones/ConfigureZonesModal';
import { cn } from '@/lib/utils';

interface Zone {
  id: string;
  name: string;
  code?: string;
  level: number;
  description?: string;
  parentId?: string;
  parent?: { id: string; name: string; level: number };
  children?: Zone[];
  _count: { children: number; activities: number };
}

export default function ZonesAdminPage() {
  const queryClient = useQueryClient();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());
  const [levelLabels, setLevelLabels] = useState<Record<number, string>>({
    0: 'Pays',
    1: 'Région',
    2: 'Département',
    3: 'Commune',
  });

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 0,
    parentId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les zones
      const zonesRes = await zonesApi.getTree();
      setZones(zonesRes.data);

      // Charger la config (avec gestion d'erreur si pas encore créée)
      try {
        const configRes = await zonesApi.getConfig();
        const config = configRes.data;

        if (config && config.levelLabels) {
          const labels: Record<number, string> = {};
          Object.entries(config.levelLabels as Record<string, string>).forEach(([level, label]) => {
            labels[parseInt(level)] = label;
          });
          setLevelLabels(labels);
        }
      } catch (configError) {
        console.log('Config non trouvée, utilisation des labels par défaut');
        // Utiliser les labels par défaut (STANDARD)
        setLevelLabels({
          0: 'Pays',
          1: 'Région',
          2: 'Département',
          3: 'Commune',
        });
      }
    } catch (error) {
      console.error('Erreur chargement zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadZones = loadData; // Alias pour compatibilité

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Nettoyer les champs vides (string vide → undefined)
      const cleanData = {
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        level: formData.level,
        parentId: formData.parentId || undefined,
      };

      if (editingZone) {
        await zonesApi.update(editingZone.id, cleanData);
      } else {
        await zonesApi.create(cleanData);
      }

      // Invalider le cache pour forcer le rechargement partout
      queryClient.invalidateQueries({ queryKey: ['zones'] });

      await loadZones();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (zone: Zone) => {
    if (!confirm(`Supprimer "${zone.name}" ?`)) return;

    try {
      await zonesApi.remove(zone.id);

      // Invalider le cache pour forcer le rechargement partout
      queryClient.invalidateQueries({ queryKey: ['zones'] });

      await loadZones();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const openModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        code: zone.code || '',
        description: zone.description || '',
        level: zone.level,
        parentId: zone.parentId || '',
      });
    } else {
      setEditingZone(null);
      setFormData({ name: '', code: '', description: '', level: 0, parentId: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingZone(null);
    setFormData({ name: '', code: '', description: '', level: 0, parentId: '' });
  };

  const toggleExpand = (zoneId: string) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  };

  const countTotalZones = (zones: Zone[]): number => {
    return zones.reduce((sum, zone) => {
      return sum + 1 + (zone.children ? countTotalZones(zone.children) : 0);
    }, 0);
  };

  const countActivities = (zones: Zone[]): number => {
    return zones.reduce((sum, zone) => {
      return sum + zone._count.activities + (zone.children ? countActivities(zone.children) : 0);
    }, 0);
  };

  const stats = {
    total: countTotalZones(zones),
    activities: countActivities(zones),
    topLevel: zones.length,
  };

  const renderZone = (zone: Zone, depth = 0) => {
    const hasChildren = zone.children && zone.children.length > 0;
    const isExpanded = expandedZones.has(zone.id);

    return (
      <div key={zone.id}>
        <div
          className={cn(
            'flex items-center gap-3 py-3 px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group',
          )}
          style={{ paddingLeft: `${depth * 2 + 1}rem` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(zone.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-[16px]" />
          )}

          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <MapPin size={14} className="text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-900">{zone.name}</span>
              {zone.code && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase font-medium tracking-wide">
                  {zone.code}
                </span>
              )}
              <span className="text-xs text-slate-500">
                • {zone._count.activities} activité{zone._count.activities > 1 ? 's' : ''}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded uppercase font-medium tracking-wide">
                {levelLabels[zone.level] || `Niveau ${zone.level}`}
              </span>
            </div>
            {zone.description && (
              <p className="text-xs text-slate-600 mt-1 truncate">{zone.description}</p>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal(zone);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(zone);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && zone.children!.map((child) => renderZone(child, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          title="Vue Territoriale"
          subtitle="Gestion et analyse des zones géographiques"
        />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Zones Géographiques"
        subtitle={`${stats.total} zone${stats.total > 1 ? 's' : ''} • ${stats.activities} activités`}
        actions={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<Settings size={16} />}
              onClick={() => setIsConfigModalOpen(true)}
            >
              Configurer
            </Button>
            <Button
              icon={<Plus size={16} />}
              onClick={() => openModal()}
            >
              Nouvelle zone
            </Button>
          </div>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* KPI Cards */}
        {zones.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Total Zones', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
              { label: 'Niveaux supérieurs', value: stats.topLevel, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Activités', value: stats.activities, color: 'text-green-600', bg: 'bg-green-50' },
            ].map((stat, idx) => (
              <div key={idx} className={cn('rounded-2xl border border-slate-200 p-4 flex flex-col gap-2', stat.bg)}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{stat.label}</p>
                <p className={cn('text-2xl md:text-3xl font-bold tabular-nums', stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Zones Tree */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-600" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                Hiérarchie des zones
              </p>
            </div>
            {zones.length > 0 && (
              <span className="text-xs tabular-nums text-slate-600">{stats.total}</span>
            )}
          </div>

          {zones.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <MapPin className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Aucune zone géographique</h3>
              <p className="mb-6 text-sm text-slate-600">
                Commencez par créer votre première zone géographique.
              </p>
              <Button
                icon={<Plus size={16} />}
                onClick={() => openModal()}
              >
                Créer la première zone
              </Button>
            </div>
          ) : (
            <div>{zones.map((zone) => renderZone(zone))}</div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" style={{ colorScheme: 'light' }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold" style={{ color: '#0f172a' }}>
                {editingZone ? 'Modifier la zone' : 'Nouvelle zone'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0f172a' }}>
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0f172a' }}>
                  Code (ex: DK, TH)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0f172a' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0f172a' }}>
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  required
                >
                  {Object.entries(levelLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] text-sm font-medium transition-colors"
                >
                  {editingZone ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de configuration des zones */}
      <ConfigureZonesModal
        open={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSuccess={() => {
          setIsConfigModalOpen(false);
          loadData(); // Recharger pour mettre à jour les labels
        }}
      />
    </div>
  );
}
