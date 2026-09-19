import React from 'react';
import { X, Eye, Sparkles, CheckCircle2, MessageSquareOff } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Sobre OJO VECINO</h3>
              <p className="text-xs text-slate-400">La filosofía detrás del sistema operativo vecinal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-1">
              ¿Por qué los grupos de WhatsApp fracasan en los condominios?
            </h4>
            <p className="text-slate-600">
              En los grupos de chat comunitarios, 20 vecinos quejan del mismo portón roto o la misma luz apagada. Se generan discusiones interminables, culpabilizaciones personales, el administrador pierde los pedidos entre cientos de stickers y nadie sabe cuándo realmente se arregló el problema.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
              <div className="font-bold text-blue-900 flex items-center gap-1 text-xs">
                <MessageSquareOff className="w-4 h-4 text-blue-600" />
                Cero Toxicidad
              </div>
              <p className="text-[11px] text-slate-600">Sin hilos de pelea. Solo hechos, fotos y seguimiento.</p>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 space-y-1">
              <div className="font-bold text-indigo-900 flex items-center gap-1 text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Anti-Duplicados
              </div>
              <p className="text-[11px] text-slate-600">Consolidación automática en un solo caso prioritario.</p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Evidencia de Cierre
              </div>
              <p className="text-[11px] text-slate-600">Foto antes y después para validar soluciones reales.</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800">
            Excelente
          </button>
        </div>
      </div>
    </div>
  );
};
