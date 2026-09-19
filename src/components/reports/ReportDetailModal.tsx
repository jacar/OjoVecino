import React, { useState } from 'react';
import { Report, Status } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import {
  CATEGORY_META,
  STATUS_META,
  PRIORITY_META,
  URGENCY_META,
  formatDateFull,
  formatTimeAgo,
} from '../../utils/formatters';
import { clusteringService } from '../../services/clusteringService';
import {
  X,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  Camera,
  Layers,
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  MessageSquare,
  Lock,
  EyeOff,
  Send,
  Calendar,
  Wrench,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ReportDetailModalProps {
  reportId: string | null;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  reportId,
  onClose,
}) => {
  const {
    reports,
    allReports,
    activeCommunity,
    currentUser,
    updateReportStatus,
    assignReport,
    addInternalNote,
    resolveReport,
    rejectReport,
    broadcastCommunityNotice,
    mergeReportsAsDuplicates,
  } = useCommunity();

  const report = allReports.find((r) => r.id === reportId);

  // Modal local state
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'admin' | 'evidence'>('info');
  const [internalNoteText, setInternalNoteText] = useState('');
  
  // Assign state
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeRole, setAssigneeRole] = useState('Técnico Especialista');
  const [assigneeCompany, setAssigneeCompany] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  
  // Resolve state
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  
  // Reject state
  const [rejectionReason, setRejectionReason] = useState('');

  // AI broadcast edit state
  const [broadcastDraft, setBroadcastDraft] = useState('');
  const [isEditingBroadcast, setIsEditingBroadcast] = useState(false);

  if (!report) return null;

  const categoryMeta = CATEGORY_META[report.category] || CATEGORY_META.mantenimiento;
  const statusMeta = STATUS_META[report.status] || STATUS_META.nuevo;
  const priorityMeta = PRIORITY_META[report.calculatedPriority.level] || PRIORITY_META.media;
  const zoneObj = activeCommunity.zones.find((z) => z.id === report.zoneId);

  const canManage = currentUser.role === 'admin' || currentUser.role === 'operador' || currentUser.role === 'seguridad';

  const handleGenerateAIBroadcast = () => {
    const text = clusteringService.generateNeutralBroadcast(report, zoneObj?.name || 'Área Común');
    setBroadcastDraft(text);
    setIsEditingBroadcast(true);
  };

  const handleSaveBroadcast = () => {
    if (broadcastDraft.trim()) {
      broadcastCommunityNotice(report.id, broadcastDraft.trim());
      setIsEditingBroadcast(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;
    addInternalNote(report.id, internalNoteText.trim());
    setInternalNoteText('');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeName.trim()) return;
    assignReport(
      report.id,
      {
        id: `assignee-${Date.now()}`,
        name: assigneeName.trim(),
        role: assigneeRole.trim(),
        company: assigneeCompany.trim() || undefined,
      },
      estimatedDate || undefined
    );
    setAssigneeName('');
    setActiveTab('info');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim()) return;
    const evidence = resolutionPhotoUrl
      ? [{ url: resolutionPhotoUrl, caption: 'Evidencia fotográfica de solución' }]
      : [];
    resolveReport(report.id, resolutionNote.trim(), evidence);
    setResolutionNote('');
    setResolutionPhotoUrl('');
    setActiveTab('info');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    rejectReport(report.id, rejectionReason.trim());
    setRejectionReason('');
    setActiveTab('info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {report.code}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${categoryMeta.bg} ${categoryMeta.color} ${categoryMeta.border}`}
              >
                {categoryMeta.label}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}
              >
                {statusMeta.label}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold leading-snug truncate">
              {report.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Información y Evidencia
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Bitácora de Seguimiento ({report.auditLogs.length})
          </button>
          {canManage && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Gestión y Asignación
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-slate-800 text-sm">
          {/* TAB 1: INFO & EVIDENCE */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Community Broadcast Banner */}
              {report.communityBroadcast ? (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold flex items-center gap-1.5 text-blue-900">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Comunicado Oficial a la Comunidad
                    </span>
                    <span className="text-[10px] text-blue-600">
                      {formatTimeAgo(report.communityBroadcast.broadcastedAt)}
                    </span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    {report.communityBroadcast.text}
                  </p>
                  {canManage && (
                    <button
                      onClick={() => {
                        setBroadcastDraft(report.communityBroadcast?.text || '');
                        setIsEditingBroadcast(true);
                      }}
                      className="mt-2 text-[11px] font-semibold text-blue-700 hover:underline"
                    >
                      Editar comunicado
                    </button>
                  )}
                </div>
              ) : (
                canManage && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      ¿Deseas informar a la comunidad con un texto neutral sin debates?
                    </span>
                    <button
                      onClick={handleGenerateAIBroadcast}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generar con IA
                    </button>
                  </div>
                )
              )}

              {/* Editing Broadcast Form */}
              {isEditingBroadcast && (
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Redactar / Editar Comunicado Neutral
                  </div>
                  <textarea
                    rows={3}
                    value={broadcastDraft}
                    onChange={(e) => setBroadcastDraft(e.target.value)}
                    className="w-full text-xs rounded-lg border border-indigo-300 bg-white p-2"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingBroadcast(false)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBroadcast}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded"
                    >
                      Publicar Aviso
                    </button>
                  </div>
                </div>
              )}

              {/* Priority & Location Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Ubicación y Sector:</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    {zoneObj?.name || 'Zona no especificada'}
                  </div>
                  {report.subLocationDetail && (
                    <span className="text-slate-600 text-[11px] block mt-0.5 pl-5.5">
                      Detalle: {report.subLocationDetail}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block">Prioridad Calculada:</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${priorityMeta.dotColor}`} />
                    <span className="capitalize">{priorityMeta.label} ({report.calculatedPriority.score} / 100 pts)</span>
                  </div>
                  <span className="text-slate-500 text-[10px] block mt-0.5">
                    Cat: {report.calculatedPriority.breakdown.categoryScore} | Urg: {report.calculatedPriority.breakdown.urgencyScore} | Dup: {report.calculatedPriority.breakdown.clusterScore} | Ant: {report.calculatedPriority.breakdown.ageScore}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Descripción del Incidente
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200">
                  {report.description}
                </p>
              </div>

              {/* Responsible / Assignee info if assigned */}
              {report.assignee && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      Responsable Asignado: {report.assignee.name}
                    </span>
                    <span className="text-amber-800 font-medium">{report.assignee.role}</span>
                  </div>
                  {report.estimatedResolutionDate && (
                    <div className="text-amber-900 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      Fecha Estimada de Solución: {formatDateFull(report.estimatedResolutionDate)}
                    </div>
                  )}
                </div>
              )}

              {/* Resolution Note if resolved */}
              {report.status === 'resuelto' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Cierre Operativo y Solución
                  </div>
                  <p className="text-emerald-900 font-medium leading-relaxed">
                    {report.resolutionNote || 'Incidente verificado y solucionado.'}
                  </p>
                </div>
              )}

              {/* Rejection reason if rejected */}
              {report.status === 'rechazado' && (
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800">Motivo de Rechazo:</span>
                  <p className="text-slate-600">{report.rejectionReason}</p>
                </div>
              )}

              {/* Photos Gallery (Initial Evidence + Resolution Evidence) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  Evidencias Registradas ({((report.evidence?.length || 0) + (report.resolutionEvidence?.length || 0))})
                </h4>

                {((report.evidence && report.evidence.length > 0) || (report.resolutionEvidence && report.resolutionEvidence.length > 0)) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {report.evidence?.map((ev) => (
                      <div key={ev.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <div className="relative aspect-video">
                          <img src={ev.url} alt="Evidencia" className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                            Evidencia Inicial
                          </span>
                        </div>
                        {ev.caption && (
                          <div className="p-2 text-xs text-slate-600">{ev.caption}</div>
                        )}
                      </div>
                    ))}

                    {report.resolutionEvidence?.map((ev) => (
                      <div key={ev.id} className="rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50/50">
                        <div className="relative aspect-video">
                          <img src={ev.url} alt="Evidencia Resolución" className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Solución Verificada
                          </span>
                        </div>
                        {ev.caption && (
                          <div className="p-2 text-xs text-emerald-900 font-medium">{ev.caption}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl text-center">
                    No se adjuntaron fotografías para este reporte.
                  </div>
                )}
              </div>

              {/* Master Cluster: Child reports list */}
              {report.isMasterCluster && report.linkedReportIds && report.linkedReportIds.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                    <Layers className="w-4 h-4 text-amber-700" />
                    Reportes Vecinales Agrupados en este Caso ({report.linkedReportIds.length})
                  </span>
                  <div className="space-y-1.5">
                    {report.linkedReportIds.map((childId) => {
                      const child = allReports.find((r) => r.id === childId);
                      if (!child) return null;
                      return (
                        <div key={childId} className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100">
                          <div>
                            <span className="font-semibold text-slate-800">{child.code}: </span>
                            <span className="text-slate-600">{child.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{formatTimeAgo(child.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMELINE / AUDIT LOG */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative pl-6 border-l-2 border-blue-200 space-y-4 ml-2">
                {report.auditLogs.map((log) => (
                  <div key={log.id} className="relative group">
                    {/* Circle marker */}
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">{log.action}</span>
                        <span className="text-[10px] text-slate-400">{formatDateFull(log.timestamp)}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Por <strong className="text-slate-800">{log.actorName}</strong> ({log.actorRole.toUpperCase()})
                      </div>
                      {log.note && (
                        <div className="mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                          {log.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN MANAGEMENT & ACTIONS */}
          {activeTab === 'admin' && canManage && (
            <div className="space-y-5">
              {/* Quick Status Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Actualizar Estado Operativo
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
                  {(['nuevo', 'en_revision', 'asignado', 'en_proceso', 'resuelto', 'rechazado'] as Status[]).map(
                    (st) => {
                      const meta = STATUS_META[st];
                      const isCurrent = report.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateReportStatus(report.id, st)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? `${meta.bg} ${meta.color} ${meta.border} font-bold border-2 shadow-xs`
                              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          {meta.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Assignee Box */}
              <form onSubmit={handleAssignSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Asignar a Técnico o Contratista
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Nombre Responsable:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Roberto Gómez, Cerrajero Express"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Especialidad / Empresa:</label>
                    <input
                      type="text"
                      placeholder="Ej: Servicio de Portones, Gasfitería"
                      value={assigneeCompany}
                      onChange={(e) => setAssigneeCompany(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1 text-xs">Fecha Estimada de Solución:</label>
                  <input
                    type="datetime-local"
                    value={estimatedDate}
                    onChange={(e) => setEstimatedDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Guardar Asignación
                </button>
              </form>

              {/* Formal Resolution Box */}
              <form onSubmit={handleResolveSubmit} className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cierre de Caso & Evidencia de Solución
                </h4>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe la solución aplicada con exactitud (ej: se cambió la fotocelda, calibración completa)..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full text-xs rounded-lg border border-emerald-300 bg-white p-2"
                />
                <input
                  type="text"
                  placeholder="URL Foto de Solución (opcional, ej: https://images.unsplash.com/...)"
                  value={resolutionPhotoUrl}
                  onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                  className="w-full text-xs rounded-lg border border-emerald-300 bg-white p-2"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Marcar como Resuelto y Cerrar Caso
                </button>
              </form>

              {/* Internal Notes Section */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Notas Internas de Administración (Privadas)
                </h4>
                
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una nota interna para el comité..."
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    className="flex-1 text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    Guardar
                  </button>
                </form>

                {report.internalNotes && report.internalNotes.length > 0 && (
                  <div className="space-y-2">
                    {report.internalNotes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <strong>{note.authorName}</strong>
                          <span>{formatTimeAgo(note.createdAt)}</span>
                        </div>
                        <p className="text-slate-800">{note.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Registrado por: <strong className="text-slate-800">{report.reportedBy.name}</strong> ({report.reportedBy.unit})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
