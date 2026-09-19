import React from 'react';
import { X, PhoneCall, AlertOctagon } from 'lucide-react';

interface EmergencyProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyProtocolModal: React.FC<EmergencyProtocolModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Protocolo de Emergencias Vecinales</h3>
              <p className="text-xs text-rose-200">Contactos clave y directrices ante situaciones críticas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              IMPORTANTE: ¿Cuándo NO usar Ojo Vecino?
            </div>
            <p>
              Ojo Vecino es un sistema de trazabilidad y gestión administrativa. <strong>No reemplaza la llamada inmediata a las autoridades en flagrancia.</strong>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Números de Emergencia Inmediata
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900">?? Carabineros / Policía</span>
                <div className="text-lg font-extrabold text-blue-700">133 / 911</div>
                <span className="text-[10px] text-slate-500">Delitos y seguridad</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900">?? Bomberos</span>
                <div className="text-lg font-extrabold text-rose-700">132</div>
                <span className="text-[10px] text-slate-500">Fuego y rescate</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900">?? SAMU / Ambulancia</span>
                <div className="text-lg font-extrabold text-emerald-700">131</div>
                <span className="text-[10px] text-slate-500">Urgencia médica</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900">??? Seguridad Ciudadana</span>
                <div className="text-lg font-extrabold text-indigo-700">1403 / 1414</div>
                <span className="text-[10px] text-slate-500">Paz ciudadana comunal</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl space-y-1 text-xs">
            <strong className="text-slate-900">Conserjería Central del Condominio:</strong>
            <p className="text-slate-600">
              Citófono: <strong>*01 (Caseta Principal)</strong> • Celular Turno 24/7: <strong>+56 9 5432 1098</strong>
            </p>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
