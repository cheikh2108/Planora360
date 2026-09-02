'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { zonesApi } from '@/lib/api';

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
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 0,
    parentId: '',
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const response = await zonesApi.getTree();
      setZones(response.data);
    } catch (error) {
      console.error('Erreur chargement zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await zonesApi.update(editingZone.id, formData);
      } else {
        await zonesApi.create(formData);
      }
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

  const renderZone = (zone: Zone, depth = 0) => {
    const hasChildren = zone.children && zone.children.length > 0;
    const isExpanded = expandedZones.has(zone.id);

    return (
      <div key={zone.id}>
        <div
          className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 border-b border-gray-100"
          style={{ paddingLeft: `${depth * 2 + 1}rem` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(zone.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className="w-[18px]" />
          )}

          <MapPin size={18} className="text-blue-500" />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{zone.name}</span>
              {zone.code && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  {zone.code}
                </span>
              )}
              <span className="text-xs text-gray-500">
                ({zone._count.activities} activité{zone._count.activities > 1 ? 's' : ''})
              </span>
            </div>
            {zone.description && (
              <p className="text-sm text-gray-500 mt-1">{zone.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => openModal(zone)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(zone)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && zone.children!.map((child) => renderZone(child, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zones géographiques</h1>
          <p className="text-gray-600 mt-1">
            Gérez le découpage territorial de vos activités
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouvelle zone
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {zones.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucune zone géographique définie</p>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer la première zone
            </button>
          </div>
        ) : (
          <div>{zones.map((zone) => renderZone(zone))}</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingZone ? 'Modifier la zone' : 'Nouvelle zone'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code (ex: DK, TH)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Pays</option>
                  <option value={1}>Région</option>
                  <option value={2}>Département</option>
                  <option value={3}>Arrondissement</option>
                  <option value={4}>Commune</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingZone ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
