import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { MapPin, AlertOctagon, CheckCircle2, Layers } from 'lucide-react';

interface InteractiveZoneMapProps {
  onSelectReport: (id: string) => void;
}

export const InteractiveZoneMap: React.FC<InteractiveZoneMapProps> = () => {
  const { activeCommunity, allReports, setFilterZone, setActiveView } = useCommunity();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Mapa Interactivo de Zonas e Incidentes
          </h3>
          <p className="text-xs text-slate-500">
            Visualiza sectores con reportes activos en {activeCommunity.name}
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
          {activeCommunity.zones.length} Zonas Monitoreadas
        </span>
      </div>

      {/* Grid of Zone Cards as Map Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {activeCommunity.zones.map((zone) => {
          const zoneReports = allReports.filter((r) => r.zoneId === zone.id);
          const activeCount = zoneReports.filter((r) => r.status !== 'resuelto' && r.status !== 'rechazado').length;
          const criticalCount = zoneReports.filter(
            (r) => (r.urgency === 'critica' || r.calculatedPriority.level === 'critica') && r.status !== 'resuelto'
          ).length;

          let cardBg = 'bg-slate-50 border-slate-200';
          if (criticalCount > 0) {
            cardBg = 'bg-red-50/70 border-red-200 ring-1 ring-red-200';
          } else if (activeCount > 0) {
            cardBg = 'bg-amber-50/70 border-amber-200';
          }

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:shadow-md ${cardBg}`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold bg-white/80 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                    {zone.code}
                  </span>
                  {criticalCount > 0 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-red-700 text-[11px] animate-pulse">
                      <AlertOctagon className="w-3.5 h-3.5" /> {criticalCount} Críticos
                    </span>
                  ) : activeCount > 0 ? (
                    <span className="font-bold text-amber-700 text-[11px]">
                      {activeCount} en atención
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{zone.name}</h4>
                {zone.description && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{zone.description}</p>
                )}
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  setFilterZone(zone.id);
                  setActiveView('feed');
                }}
                className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Filtrar {zoneReports.length} Reportes en {zone.code}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
