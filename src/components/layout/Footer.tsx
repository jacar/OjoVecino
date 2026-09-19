import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import {
  Eye,
  FileText,
  Lock,
  PhoneCall,
  Info,
  Download,
  Settings,
  ShieldCheck,
  Cloud,
} from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenEmergency: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenEmergency,
  onOpenAbout,
  onOpenSettings,
}) => {
  const { activeCommunity, allReports, currentUser } = useCommunity();

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allReports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ojovecino_${activeCommunity.code}_reportes.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 text-xs mt-auto pt-10 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Eye className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                OJO VECINO
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              Sistema operativo para transformar quejas vecinales en evidencia técnica, prioridades objetivas y resolución transparente.
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Comunidad: {activeCommunity.name}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full w-fit">
                <Cloud className="w-3 h-3 text-cyan-400" />
                <span>Firebase Firestore Sincronizado</span>
              </div>
            </div>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Transparencia y Normativa
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Políticas de Privacidad y Anonimato</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Términos de Uso y Convivencia</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEmergency}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                  <span>Protocolo de Emergencias</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Tools & Info */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Herramientas y Datos
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filosofía Ojo Vecino</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleExportJSON}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Exportar Datos de Casos (JSON)</span>
                </button>
              </li>
              {currentUser.role === 'admin' && (
                <li>
                  <button
                    onClick={onOpenSettings}
                    className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ajustes de Comunidad</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* SLA & Security statement */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              SLA y Estándares
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              Garantía de registro auditado e inmutable. Las asignaciones de contratos y evidencias de cierre quedan certificadas en el historial de la comunidad.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Convivencia & Auditoría Certificada</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OJO VECINO — Sistema Operativo Comunitario.</p>
          <p className="text-[11px] text-slate-400">
            Desarrollado para comunidades y condominios modernos.
          </p>
        </div>
      </div>
    </footer>
  );
};
