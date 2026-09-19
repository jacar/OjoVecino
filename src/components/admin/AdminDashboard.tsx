import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { Report, Status, PriorityLevel, UnitOwner } from '../../types';
import {
  STATUS_META,
  PRIORITY_META,
  CATEGORY_META,
  formatTimeAgo,
} from '../../utils/formatters';
import {
  ClipboardList,
  Columns,
  List,
  UserCheck,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Users,
  Bell,
  BarChart3,
  Search,
  Plus,
  Send,
  Home,
  ShieldCheck,
  AlertOctagon,
  FileDown,
  Megaphone,
  Check,
  Radio,
  PhoneCall,
  Truck,
  Car,
  Package,
  Play,
  Activity,
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectReport: (id: string) => void;
  onOpenClustering: () => void;
  onOpenExecutiveReport: () => void;
}

const MOCK_OWNERS: UnitOwner[] = [
  { id: 'u-101', unitNumber: 'Torre A - Depto 101', ownerName: 'Gonzalo Silva', residentType: 'propietario', email: 'gonzalo.silva@email.com', phone: '+56 9 1122 3344', isFeeUpToDate: true, balanceDue: 0, activeReportsCount: 0 },
  { id: 'u-105', unitNumber: 'Torre A - Depto 105', ownerName: 'Mariana Soto', residentType: 'propietario', email: 'mariana.soto@vecino.cl', phone: '+56 9 7654 3210', isFeeUpToDate: true, balanceDue: 0, activeReportsCount: 2 },
  { id: 'u-204', unitNumber: 'Torre A - Depto 204', ownerName: 'Felipe Correa', residentType: 'arrendatario', email: 'felipe.c@email.com', phone: '+56 9 9988 7766', isFeeUpToDate: false, balanceDue: 45000, activeReportsCount: 1 },
  { id: 'u-402', unitNumber: 'Torre B - Depto 402', ownerName: 'Carlos Méndez', residentType: 'propietario', email: 'carlos.mendez@vecino.cl', phone: '+56 9 8765 4321', isFeeUpToDate: true, balanceDue: 0, activeReportsCount: 3 },
  { id: 'u-501', unitNumber: 'Torre B - Depto 501', ownerName: 'Beatriz Morales', residentType: 'propietario', email: 'beatriz.m@email.com', phone: '+56 9 4433 2211', isFeeUpToDate: true, balanceDue: 0, activeReportsCount: 0 },
  { id: 'u-603', unitNumber: 'Torre C - Depto 603', ownerName: 'Rodrigo Araya', residentType: 'arrendatario', email: 'rodrigo.a@email.com', phone: '+56 9 5566 7788', isFeeUpToDate: true, balanceDue: 0, activeReportsCount: 1 },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectReport,
  onOpenClustering,
  onOpenExecutiveReport,
}) => {
  const {
    allReports,
    activeCommunity,
    currentUser,
    updateReportStatus,
    clusterSuggestions,
    showToast,
    setIsRadioModalOpen,
    setIsChatModalOpen,
    radioTransmissions,
    quickAuthorizations,
    updateAuthorizationStatus,
    radioChannels,
    activeRadioChannel,
    setActiveRadioChannel,
    chatMessages,
  } = useCommunity();
  const [adminSection, setAdminSection] = useState<'operaciones' | 'propietarios' | 'comunicados' | 'garita_radio'>('operaciones');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all');
  const [ownerSearch, setOwnerSearch] = useState('');

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'urgente'>('normal');

  const activeReports = allReports.filter(
    (r) => r.parentClusterId === undefined || r.isMasterCluster === true
  );

  const filtered = priorityFilter === 'all'
    ? activeReports
    : activeReports.filter((r) => r.calculatedPriority.level === priorityFilter);

  const columns: { status: Status; title: string; color: string }[] = [
    { status: 'nuevo', title: 'Nuevos', color: 'bg-blue-500' },
    { status: 'en_revision', title: 'En Revisión', color: 'bg-purple-500' },
    { status: 'asignado', title: 'Asignados', color: 'bg-amber-500' },
    { status: 'en_proceso', title: 'En Proceso', color: 'bg-indigo-500' },
    { status: 'resuelto', title: 'Resueltos', color: 'bg-emerald-500' },
  ];

  const filteredOwners = MOCK_OWNERS.filter(
    (o) =>
      o.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      o.unitNumber.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    showToast('Comunicado Publicado', `"${announcementTitle}" transmitido a la comunidad.`, 'success');
    setAnnouncementTitle('');
    setAnnouncementContent('');
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 animate-in fade-in duration-200">
      {/* Admin Top Operations Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Panel de Administración y Comité
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {activeCommunity.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-indigo-400 shrink-0" />
            Centro de Control Operativo
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Triage de reportes con SLA, censo de propietarios y redacción neutral de avisos
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          {clusterSuggestions.length > 0 && (
            <button
              onClick={onOpenClustering}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Agrupar Duplicados ({clusterSuggestions.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsChatModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Citófono Garita</span>
          </button>

          <button
            onClick={() => setIsRadioModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radio PTT</span>
          </button>

          <button
            onClick={onOpenExecutiveReport}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Informe Ejecutivo (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Admin Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setAdminSection('operaciones')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            adminSection === 'operaciones'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-blue-400" />
          <span>Mesa de Incidentes ({activeReports.length})</span>
        </button>

        <button
          onClick={() => setAdminSection('garita_radio')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            adminSection === 'garita_radio'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Consola Garita & Radio ({quickAuthorizations.length})</span>
        </button>

        <button
          onClick={() => setAdminSection('propietarios')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            adminSection === 'propietarios'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Censo de Propietarios ({MOCK_OWNERS.length})</span>
        </button>

        <button
          onClick={() => setAdminSection('comunicados')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            adminSection === 'comunicados'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
          }`}
        >
          <Megaphone className="w-4 h-4 text-cyan-400" />
          <span>Redactar Comunicado</span>
        </button>
      </div>

      {/* SECTION 1: MESA DE INCIDENTES (KANBAN / TABLE) */}
      {adminSection === 'operaciones' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-slate-700">Criticidad:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityLevel | 'all')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las Prioridades</option>
                <option value="critica">🚨 Crítica</option>
                <option value="alta">⚠️ Alta</option>
                <option value="media">🔷 Media</option>
                <option value="baja">🟢 Baja</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto min-h-[500px]">
              {columns.map((col) => {
                const colReports = filtered.filter((r) => r.status === col.status);

                return (
                  <div
                    key={col.status}
                    className="bg-slate-100/80 rounded-2xl border border-slate-200/80 p-3 flex flex-col gap-2.5 min-w-[240px]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                      <div className="flex items-center gap-2 font-black text-slate-800">
                        <span className={`w-2 h-2 rounded-full ${col.color}`} />
                        {col.title}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200/90 text-slate-700 font-extrabold text-[10px]">
                        {colReports.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[650px] pr-0.5">
                      {colReports.length > 0 ? (
                        colReports.map((report) => {
                          const priorityMeta = PRIORITY_META[report.calculatedPriority.level];
                          const zoneObj = activeCommunity.zones.find((z) => z.id === report.zoneId);

                          return (
                            <div
                              key={report.id}
                              onClick={() => onSelectReport(report.id)}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer space-y-2 group"
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-mono text-slate-400 font-bold">{report.code}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded font-extrabold ${priorityMeta.bg} ${priorityMeta.color}`}
                                >
                                  {priorityMeta.label}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                                {report.title}
                              </h4>

                              {report.isMasterCluster && report.duplicateCount && (
                                <div className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 rounded-md px-1.5 py-0.5 font-bold flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-amber-700" />
                                  +{report.duplicateCount} duplicados agrupados
                                </div>
                              )}

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                <span className="truncate max-w-[120px]">{zoneObj?.name || 'Zona común'}</span>
                                <span>{formatTimeAgo(report.createdAt)}</span>
                              </div>

                              {report.assignee && (
                                <div className="bg-indigo-50 text-indigo-900 rounded-lg p-1.5 text-[10px] font-semibold flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span className="truncate">{report.assignee.name.split('(')[0]}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-xs text-slate-400 italic">
                          Sin casos en esta etapa
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-800 font-black uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Código / Caso</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Zona</th>
                      <th className="py-3 px-4">Prioridad</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Responsable</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((report) => {
                      const categoryMeta = CATEGORY_META[report.category];
                      const statusMeta = STATUS_META[report.status];
                      const priorityMeta = PRIORITY_META[report.calculatedPriority.level];
                      const zoneObj = activeCommunity.zones.find((z) => z.id === report.zoneId);

                      return (
                        <tr
                          key={report.id}
                          onClick={() => onSelectReport(report.id)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{report.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1">
                              {report.code}
                              {report.isMasterCluster && (
                                <span className="bg-amber-100 text-amber-800 px-1 rounded font-sans font-bold">
                                  Consolidado ({report.duplicateCount})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md font-bold border text-[11px] ${categoryMeta.bg} ${categoryMeta.color} ${categoryMeta.border}`}>
                              {categoryMeta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {zoneObj?.name || 'Zona general'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 font-black ${priorityMeta.color}`}>
                              <span className={`w-2 h-2 rounded-full ${priorityMeta.dotColor}`} />
                              {priorityMeta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {report.assignee ? (
                              <div className="font-semibold text-slate-800">{report.assignee.name}</div>
                            ) : (
                              <span className="text-slate-400 italic">Sin asignar</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-blue-600 font-bold hover:underline">
                              Revisar &rarr;
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CENSO DE PROPIETARIOS Y UNIDADES */}
      {adminSection === 'propietarios' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Censo de Propietarios y Unidades
                </h3>
                <p className="text-xs text-slate-500">
                  Directorio de {activeCommunity.totalUnits} departamentos/casas en {activeCommunity.name}
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por depto, nombre o email..."
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Owners Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-800 font-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5">Unidad</th>
                    <th className="py-3 px-3.5">Propietario / Titular</th>
                    <th className="py-3 px-3.5">Contacto</th>
                    <th className="py-3 px-3.5">Estado Gastos Comunes</th>
                    <th className="py-3 px-3.5 text-right">Reportes Activos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-black text-slate-900">
                        {owner.unitNumber}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-800">{owner.ownerName}</div>
                        <span className="text-[10px] text-slate-400 font-medium capitalize">{owner.residentType}</span>
                      </td>
                      <td className="py-3 px-3.5 text-[11px] font-medium">
                        <div>{owner.email}</div>
                        <div className="text-slate-400">{owner.phone}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        {owner.isFeeUpToDate ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Al Día
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-rose-200">
                            <AlertOctagon className="w-3 h-3" /> Saldo: ${owner.balanceDue.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right font-black text-slate-800">
                        {owner.activeReportsCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PUBLICAR COMUNICADOS */}
      {adminSection === 'comunicados' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 max-w-2xl">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Emisión de Comunicados Oficiales
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Este mensaje aparecerá en la cartelera digital de todos los propietarios en {activeCommunity.name}.
            </p>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Título del Aviso:</label>
              <input
                type="text"
                required
                placeholder="Ej: Mantención de Ascensores / Limpieza de Ductos..."
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Contenido Operativo:</label>
              <textarea
                required
                rows={4}
                placeholder="Escribe el aviso con hechos claros, fechas y recomendaciones..."
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-700">Nivel de Prioridad:</label>
              <button
                type="button"
                onClick={() => setAnnouncementPriority('normal')}
                className={`px-3.5 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                  announcementPriority === 'normal'
                    ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Informativo Normal
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementPriority('urgente')}
                className={`px-3.5 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                  announcementPriority === 'urgente'
                    ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Urgente / Contingencia
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Comunicado Oficial</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 4: CONSOLA DE GARITA, SEGURIDAD & RADIO FRECUENCIA */}
      {adminSection === 'garita_radio' && (
        <div className="space-y-5">
          {/* Top Frequency & Guard Status Card */}
          <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 text-white shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    CENTRAL DE VIGILANCIA & CITOFONÍA
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Caseta Principal • {activeCommunity.name}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                  Consola de Seguridad y Frecuencias
                </h3>
                <p className="text-xs text-slate-400">
                  Monitoreo de tráfico radial PTT, citofonía con unidades y control de accesos vehiculares/peatonales.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsRadioModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>Transmitir por Radio PTT</span>
                </button>
                <button
                  onClick={() => setIsChatModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Atender Citófono</span>
                </button>
              </div>
            </div>

            {/* Channels Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800">
              {radioChannels.map((ch) => {
                const isActive = ch.number === activeRadioChannel;
                return (
                  <div
                    key={ch.number}
                    onClick={() => setActiveRadioChannel(ch.number)}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      isActive
                        ? 'bg-amber-950/40 border-amber-500/50 text-white shadow-md'
                        : 'bg-slate-850/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>CH-0{ch.number}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <div className="font-bold text-xs truncate">{ch.name}</div>
                    <div className="text-[10px] font-mono text-amber-400 mt-0.5">{ch.frequency}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Column: Control de Accesos & Bitácora Radial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Control de Accesos / Autorizaciones */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Pases de Visitas & Deliveries</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Autorizaciones emitidas por propietarios</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {quickAuthorizations.length} Registros
                </span>
              </div>

              <div className="space-y-2.5">
                {quickAuthorizations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No hay autorizaciones de acceso pendientes en caseta.
                  </div>
                ) : (
                  quickAuthorizations.map((auth) => (
                    <div
                      key={auth.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            auth.type === 'delivery'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {auth.type === 'delivery' ? '🚚 Delivery' : '🚗 Visita'}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{auth.guestName}</span>
                          {auth.vehiclePlate && (
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 rounded text-slate-800">
                              {auth.vehiclePlate}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          <strong>Destino:</strong> {auth.unit} ({auth.residentName}) • {auth.estimatedArrival}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {auth.status === 'pendiente' ? (
                          <button
                            onClick={() => updateAuthorizationStatus(auth.id, 'ingresado')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                          >
                            Dar Ingreso
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Ingresado
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bitácora de Transmisiones de Radio */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Bitácora Radial en Vivo</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Últimos despachos en frecuencia comunitaria</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsRadioModalOpen(true)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Abrir Consola PTT
                </button>
              </div>

              <div className="space-y-2.5">
                {radioTransmissions.slice(0, 4).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[10px]">
                          CH-0{tx.channelNumber}
                        </span>
                        <span className="font-bold text-white">{tx.senderName}</span>
                        <span className="text-slate-400">({tx.codeCallsign})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-mono italic">
                      "{tx.transcript}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
