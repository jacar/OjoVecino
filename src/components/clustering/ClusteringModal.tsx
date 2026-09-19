import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { CATEGORY_META } from '../../utils/formatters';
import {
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck,
} from 'lucide-react';

interface ClusteringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport?: (id: string) => void;
}

export const ClusteringModal: React.FC<ClusteringModalProps> = ({
  isOpen,
  onClose,
  onSelectReport,
}) => {
  const {
    clusterSuggestions,
    allReports,
    activeCommunity,
    mergeReportsAsDuplicates,
  } = useCommunity();

  const [selectedClusterIndex, setSelectedClusterIndex] = useState<number>(0);
  const [customBroadcast, setCustomBroadcast] = useState<string>('');

  if (!isOpen) return null;

  const currentSuggestion = clusterSuggestions[selectedClusterIndex] || clusterSuggestions[0];

  const primaryReport = currentSuggestion
    ? allReports.find((r) => r.id === currentSuggestion.primaryReportId)
    : null;

  const duplicateReports = currentSuggestion
    ? allReports.filter((r) => currentSuggestion.duplicateCandidateIds.includes(r.id))
    : [];

  const zoneObj = primaryReport
    ? activeCommunity.zones.find((z) => z.id === primaryReport.zoneId)
    : null;

  const handleMerge = () => {
    if (!currentSuggestion || !primaryReport) return;

    mergeReportsAsDuplicates(
      primaryReport.id,
      currentSuggestion.duplicateCandidateIds,
      customBroadcast || currentSuggestion.suggestedBroadcast
    );

    if (clusterSuggestions.length <= 1) {
      onClose();
    } else {
      setSelectedClusterIndex(0);
      setCustomBroadcast('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Detección Inteligente de Reportes Repetidos
              </h3>
              <p className="text-xs text-slate-400">
                Evita la saturación del tablero y consolida quejas en un solo caso operativo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-800">
          {clusterSuggestions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                ¡Tablero Limpio y Sin Duplicados!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No se detectaron reportes redundantes en las zonas activas de {activeCommunity.name}.
              </p>
            </div>
          ) : (
            <>
              {/* Cluster Selector Tabs if multiple */}
              {clusterSuggestions.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {clusterSuggestions.map((sugg, idx) => (
                    <button
                      key={sugg.id}
                      onClick={() => {
                        setSelectedClusterIndex(idx);
                        setCustomBroadcast('');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                        selectedClusterIndex === idx
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Grupo #{idx + 1} ({sugg.duplicateCandidateIds.length + 1} reportes)
                    </button>
                  ))}
                </div>
              )}

              {/* Match Reason Banner */}
              {currentSuggestion && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Coincidencia Detectada (85% Similitud):</strong>
                    <span>{currentSuggestion.reason}</span>
                  </div>
                </div>
              )}

              {/* Master Case vs Duplicates Comparison */}
              {primaryReport && (
                <div className="space-y-3">
                  {/* Master Report Box */}
                  <div className="p-3.5 rounded-xl border-2 border-blue-500 bg-blue-50/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Caso Matriz Principal (Conservará la gestión)
                      </span>
                      <span className="font-mono text-slate-500">{primaryReport.code}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{primaryReport.title}</div>
                    <p className="text-slate-600 leading-relaxed">{primaryReport.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <span className="font-medium text-slate-700">Por {primaryReport.reportedBy.name}</span>
                      <span>•</span>
                      <span>Zona: {zoneObj?.name}</span>
                    </div>
                  </div>

                  {/* Duplicate Candidates List */}
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-slate-500 block">
                      Reportes Duplicados a Vincular ({duplicateReports.length}):
                    </span>
                    {duplicateReports.map((dup) => (
                      <div
                        key={dup.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-400">{dup.code}</span>
                          <span className="text-slate-500 text-[11px]">
                            Por {dup.reportedBy.name} ({dup.reportedBy.unit})
                          </span>
                        </div>
                        <div className="font-semibold text-slate-800">{dup.title}</div>
                        <p className="text-slate-600 text-[11px]">{dup.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Neutral Broadcast Preview */}
                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Comunicado Neutral Sugerido para los Vecinos:
                    </div>
                    <textarea
                      rows={3}
                      value={customBroadcast || currentSuggestion?.suggestedBroadcast || ''}
                      onChange={(e) => setCustomBroadcast(e.target.value)}
                      className="w-full text-xs rounded-lg border border-indigo-300 bg-white p-2.5 text-slate-800"
                    />
                    <p className="text-[10px] text-indigo-700">
                      Este texto mantendrá informados a los vecinos sin generar debates tóxicos en chats.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold text-xs"
          >
            Cerrar
          </button>

          {clusterSuggestions.length > 0 && (
            <button
              onClick={handleMerge}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              <Layers className="w-4 h-4" />
              Fusionar en Caso Matriz y Publicar Aviso
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
