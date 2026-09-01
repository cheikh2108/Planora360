'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, plansApi } from '@/lib/api';
import type { ActionPlan } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { FormField, Select, Input } from '@/components/ui/form-field';
import { formatDate } from '@/lib/utils';
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const REPORT_TYPES = [
  { value: 'activites', label: 'Activités', icon: BarChart3, description: 'Toutes les activités avec statuts et responsables' },
  { value: 'budget', label: 'Budget', icon: FileSpreadsheet, description: 'Suivi budgétaire prévu / exécuté par activité' },
  { value: 'retards', label: 'Activités en retard', icon: FileText, description: 'Liste des activités dépassant leur échéance' },
  { value: 'indicateurs', label: 'Indicateurs', icon: BarChart3, description: 'Tableau de bord des indicateurs de performance' },
] as const;

const FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, ext: 'xlsx' },
  { value: 'pdf', label: 'PDF', icon: FileText, ext: 'pdf' },
] as const;

interface ReportHistory {
  id: string;
  type: string;
  format: string;
  generatedAt: string;
  fileName: string;
}

export default function ReportsPage() {
  const [type, setType] = useState<typeof REPORT_TYPES[number]['value']>('activites');
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [planId, setPlanId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [generated, setGenerated] = useState<string | null>(null);

  const { data: plans = [] } = useQuery<ActionPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => { const r = await plansApi.list({ limit: 1000 }); return (r.data as any).data ?? []; },
  });

  async function generate() {
    setLoading(true);
    setGenerated(null);
    try {
      const payload: Record<string, unknown> = { type, format };
      if (planId) payload.planId = planId;
      if (dateFrom) payload.dateFrom = dateFrom;
      if (dateTo) payload.dateTo = dateTo;

      const res = await reportsApi.generate(payload);
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `rapport-${type}-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      const entry: ReportHistory = { id: Date.now().toString(), type, format, generatedAt: new Date().toISOString(), fileName };
      setHistory(h => [entry, ...h.slice(0, 9)]);
      setGenerated(fileName);
    } finally {
      setLoading(false);
    }
  }

  const selectedType = REPORT_TYPES.find(r => r.value === type)!;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Rapports" subtitle="Génération et export de rapports PDF et Excel" />
      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="max-w-3xl space-y-6">

          {/* Type selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">Type de rapport</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {REPORT_TYPES.map(r => {
                const Icon = r.icon;
                const isSelected = type === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setType(r.value)}
                    className={cn(
                      'flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-[#2563eb] bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <Icon size={20} className={isSelected ? 'text-[#2563eb]' : 'text-slate-400'} />
                    <div>
                      <p className={cn('text-sm font-semibold', isSelected ? 'text-[#2563eb]' : 'text-slate-900')}>
                        {r.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className="text-[#2563eb] ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">Format d'export</p>
            <div className="grid grid-cols-2 gap-3">
              {FORMATS.map(f => {
                const Icon = f.icon;
                const isSelected = format === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      isSelected ? 'border-[#2563eb] bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <Icon size={20} className={isSelected ? 'text-[#2563eb]' : 'text-slate-400'} />
                    <span className={cn('text-sm font-semibold', isSelected ? 'text-[#2563eb]' : 'text-slate-900')}>
                      {f.label}
                    </span>
                    {isSelected && <CheckCircle2 size={16} className="text-[#2563eb] ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">Filtres (optionnels)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Plan d'action">
                <Select value={planId} onChange={e => setPlanId(e.target.value)}>
                  <option value="">Tous les plans</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </Select>
              </FormField>
              <FormField label="Date de début">
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </FormField>
              <FormField label="Date de fin">
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </FormField>
            </div>
          </div>

          {/* Generate button */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              isLoading={loading}
              icon={<Download size={18} />}
              onClick={generate}
              className="min-w-48"
            >
              Générer le rapport
            </Button>
            {generated && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>Téléchargement de <strong>{generated}</strong> lancé</span>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-700">Rapports générés cette session</p>
              </div>
              <div className="divide-y divide-slate-100">
                {history.map(h => {
                  const Icon = h.format === 'pdf' ? FileText : FileSpreadsheet;
                  return (
                    <div key={h.id} className="flex items-center gap-3 px-5 py-3.5">
                      <Icon size={18} className={h.format === 'pdf' ? 'text-red-400' : 'text-green-500'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{h.fileName}</p>
                        <p className="text-xs text-slate-400">{formatDate(h.generatedAt)}</p>
                      </div>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        h.format === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      )}>
                        {h.format.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
