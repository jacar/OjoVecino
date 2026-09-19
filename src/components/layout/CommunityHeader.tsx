import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import {
  MapPin,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Plus,
  BookOpen,
  Layers,
  Map,
  List,
  Activity,
  Building,
} from 'lucide-react';

interface CommunityHeaderProps {
  onOpenNewReport: () => void;
  onOpenClustering: () => void;
  onOpenRules: () => void;
  onOpenZoneManager: () => void;
  showMap: boolean;
  onToggleMap: () => void;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  onOpenNewReport,
  onOpenClustering,
  onOpenRules,
  onOpenZoneManager,
  showMap,
  onToggleMap,
}) => {
  const {
    activeCommunity,
    reports,
    activePortal,
  } = useCommunity();

  const criticalIssuesCount = reports.filter(
    (r) =>
      (r.urgency === 'critica' || r.calculatedPriority.level === 'critica') &&
      r.status !== 'resuelto' &&
      r.status !== 'rechazado'
  ).length;

  const inProgressCount = reports.filter(
    (r) => r.status === 'en_proceso' || r.status === 'asignado'
  ).length;

  return (
    <div className="bg-white border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Community Title & Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                {activeCommunity.name}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 capitalize border border-slate-200/80">
                {activeCommunity.type}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Operativo
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{activeCommunity.address}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-700">{activeCommunity.totalUnits} Unidades</span>
              <span className="text-slate-300">•</span>
              <button
                onClick={onOpenZoneManager}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer hover:underline"
              >
                {activeCommunity.zones.length} Zonas catalogadas
              </button>
            </p>
          </div>

          {/* Action Toolbar & Live Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Critical Alert Chip if any */}
            {criticalIssuesCount > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 text-xs shadow-2xs">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{criticalIssuesCount} Casos Críticos</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-600 font-medium border border-slate-200 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sin emergencias</span>
              </div>
            )}

            {/* Toggle Map View */}
            <button
              onClick={onToggleMap}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showMap
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs'
              }`}
              title="Alternar vista del mapa de zonas de la comunidad"
            >
              {showMap ? <List className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5 text-blue-600" />}
              <span>{showMap ? 'Ocultar Mapa' : 'Mapa de Zonas'}</span>
            </button>

            {/* Decálogo de Reglas Button */}
            <button
              onClick={onOpenRules}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Reglas</span>
            </button>

            {/* Primary Action Button: Nuevo Reporte (<45s) */}
            <button
              onClick={onOpenNewReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Reporte</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
