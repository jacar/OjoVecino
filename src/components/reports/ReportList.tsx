import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { ReportCard } from './ReportCard';
import { Category, Status, Urgency } from '../../types';
import { CATEGORY_META, STATUS_META } from '../../utils/formatters';
import {
  Search,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  Inbox,
  AlertCircle,
} from 'lucide-react';

interface ReportListProps {
  onSelectReport: (reportId: string) => void;
  onOpenNewReport: () => void;
  onOpenClustering: () => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  onSelectReport,
  onOpenNewReport,
  onOpenClustering,
}) => {
  const {
    reports,
    allReports,
    activeCommunity,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    filterZone,
    setFilterZone,
    filterUrgency,
    setFilterUrgency,
    searchQuery,
    setSearchQuery,
    clusterSuggestions,
  } = useCommunity();

  const resetFilters = () => {
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterZone('all');
    setFilterUrgency('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    filterCategory !== 'all' ||
    filterStatus !== 'all' ||
    filterZone !== 'all' ||
    filterUrgency !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Search & Filter Controls */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, zona, problema o palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Categories Horizontal Scrolling Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todas ({allReports.length})
          </button>
          {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const isSelected = filterCategory === cat;
            const count = allReports.filter((r) => r.category === cat).length;
            if (count === 0 && !isSelected) return null;

            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(isSelected ? 'all' : cat)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? `${meta.bg} ${meta.color} ${meta.border} border-2 font-bold shadow-xs`
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{meta.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Selectors: Status & Zone */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">Estado: Todos</option>
            {(Object.keys(STATUS_META) as Status[]).map((st) => (
              <option key={st} value={st}>
                {STATUS_META[st].label}
              </option>
            ))}
          </select>

          {/* Zone filter */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium truncate"
          >
            <option value="all">Zona: Todas</option>
            {activeCommunity.zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.code} - {zone.name}
              </option>
            ))}
          </select>

          {/* Urgency filter */}
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value as Urgency | 'all')}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">Urgencia: Todas</option>
            <option value="critica">Crítica / Inmediata</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          {/* Reset button */}
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar Filtros
            </button>
          ) : (
            <div className="hidden sm:flex items-center justify-center text-slate-400 text-[11px]">
              Mostrando {reports.length} reportes
            </div>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => onSelectReport(report.id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            No se encontraron reportes con estos filtros
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            {hasActiveFilters
              ? 'Prueba ajustando los criterios de búsqueda o limpiando los filtros para ver todos los casos de la comunidad.'
              : 'La comunidad está al día. Puedes registrar un nuevo incidente si detectas algún problema.'}
          </p>
          <div className="flex gap-2 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Limpiar Filtros
              </button>
            )}
            <button
              onClick={onOpenNewReport}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nuevo Reporte (&lt;45s)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
