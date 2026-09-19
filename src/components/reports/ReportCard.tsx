import React from 'react';
import { Report } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import {
  CATEGORY_META,
  STATUS_META,
  PRIORITY_META,
  formatTimeAgo,
} from '../../utils/formatters';
import {
  MapPin,
  Camera,
  Layers,
  Sparkles,
  ChevronRight,
  Clock,
  UserCheck,
  Lock,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  const { activeCommunity } = useCommunity();

  const categoryMeta = CATEGORY_META[report.category] || CATEGORY_META.mantenimiento;
  const statusMeta = STATUS_META[report.status] || STATUS_META.nuevo;
  const priorityMeta = PRIORITY_META[report.calculatedPriority.level] || PRIORITY_META.media;
  const zoneObj = activeCommunity.zones.find((z) => z.id === report.zoneId);

  const isCritical = report.calculatedPriority.level === 'critica' && report.status !== 'resuelto';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg hover:border-slate-300/90 active:scale-[0.99] cursor-pointer overflow-hidden p-4 sm:p-5 flex flex-col justify-between gap-3.5 ${
        isCritical
          ? 'border-rose-200/90 shadow-[0_2px_12px_rgba(225,29,72,0.06)]'
          : 'border-slate-200/90 shadow-2xs'
      }`}
    >
      {/* Top Meta Bar: Category, Priority, Visibility & Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Pill */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${categoryMeta.bg} ${categoryMeta.color} ${categoryMeta.border}`}
          >
            {categoryMeta.label}
          </span>

          {/* Priority Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-extrabold text-[11px] border ${priorityMeta.bg} ${priorityMeta.color} ${priorityMeta.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dotColor}`} />
            {priorityMeta.label}
          </span>

          {/* Visibility indicator */}
          {report.visibility === 'anonimo' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 font-semibold">
              <EyeOff className="w-3 h-3 text-slate-400" /> Anónimo
            </span>
          )}
          {report.visibility === 'confidencial' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 font-semibold">
              <Lock className="w-3 h-3 text-amber-600" /> Confidencial
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.color.replace('text-', 'bg-')}`} />
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Main Title & Description */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
            {report.title}
          </h3>
          <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
            {report.code}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1.5 leading-relaxed font-normal">
          {report.description}
        </p>
      </div>

      {/* Grouped Master Cluster Banner if applicable */}
      {report.isMasterCluster && report.duplicateCount && report.duplicateCount > 0 && (
        <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-bold">
              Caso Matriz: {report.duplicateCount + 1} reportes consolidados
            </span>
          </div>
          <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-md font-black text-amber-950">
            Prioridad Alta
          </span>
        </div>
      )}

      {/* Resolution Note Preview if Resolved */}
      {report.status === 'resuelto' && report.resolutionNote && (
        <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="line-clamp-2 text-[11px] leading-relaxed">
            <strong className="font-bold text-emerald-900">Solución técnica:</strong> {report.resolutionNote}
          </div>
        </div>
      )}

      {/* Footer Info: Zone, Sub-location, Reported By, Date, Evidence count */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <span className="flex items-center gap-1 text-slate-700 font-semibold truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{zoneObj?.name || 'Zona General'}</span>
          </span>

          {report.evidence && report.evidence.length > 0 && (
            <span className="flex items-center gap-1 text-blue-600 font-semibold text-[11px] bg-blue-50 px-1.5 py-0.5 rounded">
              <Camera className="w-3 h-3" />
              {report.evidence.length} {report.evidence.length === 1 ? 'foto' : 'fotos'}
            </span>
          )}

          {report.assignee && (
            <span className="flex items-center gap-1 text-indigo-700 font-semibold text-[11px] bg-indigo-50 px-1.5 py-0.5 rounded">
              <UserCheck className="w-3 h-3" />
              {report.assignee.name.split(' ')[0]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-400 font-medium">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(report.createdAt)}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};
