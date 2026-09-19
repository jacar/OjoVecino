import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { executiveReportService } from '../../services/executiveReportService';
import { CATEGORY_META } from '../../utils/formatters';
import {
  X,
  BarChart3,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Building2,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { allReports, activeCommunity } = useCommunity();
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  if (!isOpen) return null;

  const data = executiveReportService.generateMonthlyReport(
    allReports,
    activeCommunity.zones,
    activeCommunity.id,
    selectedMonth
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Informe Ejecutivo Mensual
              </h3>
              <p className="text-xs text-slate-400">
                Resumen consolidado para Comité de Administración y Asamblea Vecinal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Imprimir o guardar en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800 text-xs" id="printable-executive-report">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600">
                VecinoAlerta • Sistema Operativo Comunitario
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Reporte Operativo Mensual: {data.periodLabel}
              </h2>
              <div className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                <span><strong>Comunidad:</strong> {activeCommunity.name}</span>
                <span>•</span>
                <span><strong>Dirección:</strong> {activeCommunity.address}</span>
              </div>
            </div>
            <div className="text-right sm:text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                Emitido: 17 Sep 2026
              </span>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <span className="text-[11px] font-bold text-blue-900 uppercase">Total Incidentes</span>
              <div className="text-2xl font-extrabold text-blue-950 mt-1">{data.totalIncidents}</div>
              <span className="text-[10px] text-blue-700">Registrados en el mes</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-900 uppercase">Tasa de Resolución</span>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1">{data.resolutionRate}%</div>
              <span className="text-[10px] text-emerald-700">{data.resolvedIncidents} casos cerrados</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-[11px] font-bold text-amber-900 uppercase">Tiempo Promedio (MTTR)</span>
              <div className="text-2xl font-extrabold text-amber-950 mt-1">{data.avgResolutionHours}h</div>
              <span className="text-[10px] text-amber-700">Atención y cierre</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
              <span className="text-[11px] font-bold text-purple-900 uppercase">Zonas Catalogadas</span>
              <div className="text-2xl font-extrabold text-purple-950 mt-1">{data.zoneBreakdown.length}</div>
              <span className="text-[10px] text-purple-700">Puntos de monitoreo</span>
            </div>
          </div>

          {/* AI Executive Summary Block */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Diagnóstico y Resumen de Gestión (IA VecinoAlerta)
            </div>
            <p className="text-slate-700 leading-relaxed font-medium text-xs">
              {data.aiExecutiveSummary}
            </p>
          </div>

          {/* Breakdown Section: Categories & Zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Distribution */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Distribución por Categorías
              </h4>
              <div className="space-y-2">
                {data.categoryBreakdown.map((cat) => {
                  const meta = CATEGORY_META[cat.category];
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{meta?.label || cat.category}</span>
                        <span className="font-bold text-slate-900">{cat.count} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${Math.max(5, cat.percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zone Hotspots */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                Zonas Críticas y Frecuencia
              </h4>
              <div className="space-y-2">
                {data.zoneBreakdown.slice(0, 5).map((zone) => (
                  <div
                    key={zone.zoneId}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{zone.zoneName}</div>
                      <div className="text-[10px] text-slate-500">
                        {zone.criticalCount > 0 ? (
                          <span className="text-red-600 font-bold">
                            ?? {zone.criticalCount} incidentes críticos
                          </span>
                        ) : (
                          'Sin incidencias críticas'
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                      {zone.count} reportes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations for HOA Board */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Recomendaciones Estratégicas para el Comité
            </h4>
            <ul className="space-y-2">
              {data.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-[11px] text-slate-500">
            Formato oficial listo para asambleas de copropietarios.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
