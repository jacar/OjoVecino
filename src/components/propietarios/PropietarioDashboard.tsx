import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { ReportCard } from '../reports/ReportCard';
import {
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Bell,
  BookOpen,
  Calendar,
  PhoneCall,
  ShieldCheck,
  FileText,
  User,
  Sparkles,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Megaphone,
  Radio,
  Truck,
  Car,
  Package,
  DoorOpen,
} from 'lucide-react';
import { STATUS_META } from '../../utils/formatters';

interface PropietarioDashboardProps {
  onSelectReport: (id: string) => void;
  onOpenNewReport: () => void;
  onOpenRules: () => void;
  onOpenEmergency: () => void;
}

export const PropietarioDashboard: React.FC<PropietarioDashboardProps> = ({
  onSelectReport,
  onOpenNewReport,
  onOpenRules,
  onOpenEmergency,
}) => {
  const {
    activeCommunity,
    currentUser,
    allReports,
    setIsRadioModalOpen,
    setIsChatModalOpen,
    quickAuthorizations,
    unreadChatCount,
    initiateIntercomCall,
    setIsIntercomModalOpen,
    unlockDoor,
  } = useCommunity();

  const [activeTab, setActiveTab] = useState<'mis_reportes' | 'cartelera' | 'areas_comunes'>('mis_reportes');

  // Reports created by this resident/unit
  const myReports = allReports.filter(
    (r) => r.reportedBy.id === currentUser.id || r.reportedBy.unit === currentUser.unit
  );

  const pendingCount = myReports.filter(
    (r) => r.status !== 'resuelto' && r.status !== 'rechazado'
  );

  const resolvedCount = myReports.filter((r) => r.status === 'resuelto');

  // Mock community announcements
  const announcements = [
    {
      id: 'ann-1',
      title: 'Mantención Preventiva de Bombas de Agua y Calderas',
      content: 'Estimados propietarios: el próximo martes 22 de Septiembre entre las 09:00 y las 13:00 hrs se realizará la mantención anual reglamentaria. No habrá corte de suministro general.',
      date: 'Hace 1 día',
      priority: 'normal',
      author: 'Administración General',
    },
    {
      id: 'ann-2',
      title: 'Actualización en Protocolo de Acceso a Estacionamientos',
      content: 'Se recuerda registrar oportunamente las patentes de vehículos de visitas con conserjería para evitar bloqueos automáticos en la barrera vehicular.',
      date: 'Hace 3 días',
      priority: 'urgente',
      author: 'Comité de Seguridad',
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200">
      {/* Property Owner Identity & Unit Status Card */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle background radial texture */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Unit info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Portal del Propietario / Residente
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeCommunity.name}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Home className="w-7 h-7 text-cyan-400 shrink-0" />
              {currentUser.unit}
            </h2>

            <div className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap font-medium">
              <span><strong>Titular:</strong> {currentUser.name}</span>
              <span className="text-slate-500">•</span>
              <span><strong>Email:</strong> {currentUser.email}</span>
            </div>
          </div>

          {/* Quick Account Health Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Fee status */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-xs mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Al Día
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white">Gastos Comunes</div>
              <span className="text-[10px] text-slate-400 font-medium">Septiembre 2026</span>
            </div>

            {/* Active tickets */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-center">
              <div className="text-cyan-400 font-bold text-xs mb-0.5">
                {pendingCount.length > 0 ? 'En Atención' : 'Al Día'}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white">{pendingCount.length} Activos</div>
              <span className="text-[10px] text-slate-400 font-medium">{resolvedCount.length} resueltos</span>
            </div>

            {/* Quick report button */}
            <div className="col-span-2 sm:col-span-1 flex items-center">
              <button
                onClick={onOpenNewReport}
                className="w-full h-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Reportar en 45s</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Citófono Digital & Radio Frecuencia Garita Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Citófono Directo con Garita */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl p-5 border border-slate-800 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <PhoneCall className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">Citófono Digital Garita</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-xs text-slate-400">Caseta de Seguridad • Guardia Juan Pérez</p>
              </div>
            </div>

            {unreadChatCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                {unreadChatCount} nuevo
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Citofonía virtual IP tipo Vantel con llamada en tiempo real hacia la caseta de guardia y apertura remota de portón.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => initiateIntercomCall('Caseta Principal Garita', 'Guardia de Turno')}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 stroke-[2.5]" />
              <span>Llamar a Caseta Guardia</span>
            </button>
            <button
              onClick={() => unlockDoor()}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-emerald-500/30 cursor-pointer"
              title="Apertura remota de portón / puerta peatonal"
            >
              <DoorOpen className="w-4 h-4 text-emerald-400" />
              <span>Abrir Portón</span>
            </button>
            <button
              onClick={() => setIsIntercomModalOpen(true)}
              className="py-2.5 px-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center transition border border-slate-700 cursor-pointer"
              title="Abrir teclado citófono Vantel"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Radio Frecuencia Walkie-Talkie PTT */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl p-5 border border-slate-800 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">Radio Frecuencia PTT</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    462.5625 MHz
                  </span>
                </div>
                <p className="text-xs text-slate-400">Canal 1 • Red de Vigilancia Inmediata</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
              UHF CH-01
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Transmite audio de voz directo con efecto Roger Beep y squelch como un radio walkie-talkie profesional.
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsRadioModalOpen(true)}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Conectar Radio PTT</span>
            </button>
            <button
              onClick={() => setIsRadioModalOpen(true)}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              title="Ver bitácora de frecuencia"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Smooth Mobile Scrollable) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('mis_reportes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'mis_reportes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mis Reportes ({myReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cartelera')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'cartelera'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Comunicados Oficiales ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('areas_comunes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'areas_comunes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Áreas Comunes & Zonas</span>
        </button>
      </div>

      {/* TAB 1: MIS REPORTES */}
      {activeTab === 'mis_reportes' && (
        <div className="space-y-4">
          {myReports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                No tienes reportes pendientes
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Tu unidad no tiene solicitudes abiertas. Si detectas un problema en portones, ruidos, iluminación o basura, repórtalo en menos de 45 segundos.
              </p>
              <button
                onClick={onOpenNewReport}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Primer Reporte
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => onSelectReport(report.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMUNICADOS OFICIALES */}
      {activeTab === 'cartelera' && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-950">Muro Informativo Neutral</h4>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                Los comunicados emitidos por la administración comunican soluciones técnicas y normativas institucionales sin exponer conflictos ni nombres de vecinos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      ann.priority === 'urgente'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {ann.priority === 'urgente' ? 'Urgente' : 'Informativo'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{ann.date}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{ann.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{ann.content}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Emitido por: <strong>{ann.author}</strong></span>
                  <span className="text-blue-600 font-bold">Oficial</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ÁREAS COMUNES */}
      {activeTab === 'areas_comunes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCommunity.zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                  {zone.code}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{zone.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {zone.description || 'Zona común registrada en el censo operativo.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Protocol Quick Strip */}
      <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>¿Ocurre una emergencia crítica (seguridad, fuego o salud)?</span>
        </div>
        <button
          onClick={onOpenEmergency}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
        >
          Protocolo de Emergencia
        </button>
      </div>
    </div>
  );
};
