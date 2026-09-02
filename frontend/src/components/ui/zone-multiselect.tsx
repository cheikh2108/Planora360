'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Zone {
  id: string;
  name: string;
  code?: string;
  level: number;
}

interface ZoneMultiselectProps {
  value: string[];
  onChange: (zoneIds: string[]) => void;
  zones: Zone[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'Pays',
  1: 'Région',
  2: 'Département',
  3: 'Arrondissement',
  4: 'Commune',
};

export function ZoneMultiselect({
  value = [],
  onChange,
  zones,
  placeholder = 'Sélectionner des zones...',
  error,
  disabled,
}: ZoneMultiselectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Protection: s'assurer que zones et value sont des tableaux
  const safeZones = Array.isArray(zones) ? zones : [];
  const safeValue = Array.isArray(value) ? value : [];

  const selectedZones = safeZones.filter((z) => safeValue.includes(z.id));
  const availableZones = safeZones.filter((z) => !safeValue.includes(z.id));

  const filteredZones = availableZones.filter((zone) => {
    const search = searchTerm.toLowerCase();
    return (
      zone.name.toLowerCase().includes(search) ||
      zone.code?.toLowerCase().includes(search)
    );
  });

  const handleSelect = (zoneId: string) => {
    onChange([...safeValue, zoneId]);
    setSearchTerm('');
  };

  const handleRemove = (zoneId: string) => {
    onChange(safeValue.filter((id) => id !== zoneId));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.zone-multiselect')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('zone-multiselect relative', disabled && 'opacity-50 pointer-events-none')}>
      {/* Selected zones chips */}
      {selectedZones.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedZones.map((zone) => (
            <div
              key={zone.id}
              className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full"
            >
              <MapPin size={11} />
              <span className="font-medium">{zone.name}</span>
              {zone.code && (
                <span className="text-[10px] text-blue-500">({zone.code})</span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(zone.id)}
                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-all',
          error
            ? 'border-red-300 focus:ring-2 focus:ring-red-200'
            : 'border-slate-300 focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]',
          isOpen && 'ring-2 ring-[#2563eb]/20 border-[#2563eb]'
        )}
      >
        <span className={cn('truncate', !selectedZones.length && 'text-slate-500')}>
          {selectedZones.length > 0
            ? `${selectedZones.length} zone${selectedZones.length > 1 ? 's' : ''} sélectionnée${selectedZones.length > 1 ? 's' : ''}`
            : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-slate-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une zone..."
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none"
              autoFocus
            />
          </div>

          {/* Zones list */}
          <div className="overflow-y-auto flex-1">
            {filteredZones.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                {searchTerm ? 'Aucune zone trouvée' : 'Toutes les zones sont sélectionnées'}
              </div>
            ) : (
              filteredZones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleSelect(zone.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin size={12} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {zone.name}
                      </span>
                      {zone.code && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase font-medium tracking-wide">
                          {zone.code}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {LEVEL_LABELS[zone.level]}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
