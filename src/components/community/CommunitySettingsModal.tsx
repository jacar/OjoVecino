import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { X, Settings } from 'lucide-react';

interface CommunitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({ isOpen, onClose }) => {
  const { activeCommunity, showToast } = useCommunity();
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [autoCluster, setAutoCluster] = useState(true);
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('administracion@condominio.cl');
  const [conciergePhone, setConciergePhone] = useState('+56 9 5432 1098');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Ajustes Guardados', 'Configuración operativa de la comunidad actualizada con éxito.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Ajustes Operativos de Comunidad</h3>
              <p className="text-xs text-slate-400">{activeCommunity.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Permitir Reportes en Modo Anónimo</span>
                <span className="text-[11px] text-slate-500">Oculta nombre de vecinos ante la comunidad para resguardo</span>
              </div>
              <input
                type="checkbox"
                checked={allowAnonymous}
                onChange={(e) => setAllowAnonymous(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Agrupación Automática con IA</span>
                <span className="text-[11px] text-slate-500">Detectar y sugerir fusión de quejas repetidas</span>
              </div>
              <input
                type="checkbox"
                checked={autoCluster}
                onChange={(e) => setAutoCluster(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Correo de Alertas Administrativas:
              </label>
              <input
                type="email"
                value={adminNotificationEmail}
                onChange={(e) => setAdminNotificationEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Teléfono / WhatsApp de Conserjería Turno:
              </label>
              <input
                type="text"
                value={conciergePhone}
                onChange={(e) => setConciergePhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
