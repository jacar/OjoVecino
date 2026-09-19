import React from 'react';
import { X, FileText, AlertTriangle } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Términos de Uso Operativo</h3>
              <p className="text-xs text-slate-400">Ojo Vecino • Enfoque en soluciones, no en linchamiento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Regla Fundamental:</strong> Ojo Vecino no es una red social de desahogo ni un canal de discusión informal. Es un sistema operativo para registrar hechos objetivos y coordinar su reparación.
            </p>
          </div>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">1. Prohibición Estricta de Linchamiento o Denigración</h4>
            <p>
              Queda estrictamente prohibido utilizar la plataforma para acusaciones infundadas, difamaciones hacia vecinos específicos o agresiones verbales. Todo reporte que contenga lenguaje ofensivo será moderado o rechazado por la administración con causal registrada.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">2. Obligación de Motivo de Cierre</h4>
            <p>
              La administración se compromete a no cerrar ni descartar un reporte de forma arbitraria. Todo caso marcado como <em>Resuelto</em> o <em>Rechazado</em> debe contener una nota explicativa con hechos verificables y, cuando corresponda, fotografía de evidencia.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">3. Consolidación de Reportes Repetidos</h4>
            <p>
              Para mantener la claridad operativa, los reportes sobre un mismo evento serán vinculados en un <em>Caso Matriz</em>. La persona que reportó recibirá las actualizaciones correspondientes sin que el tablero se llene de tarjetas duplicadas.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">4. Veracidad de la Información</h4>
            <p>
              El usuario garantiza que la información suministrada corresponde a hechos reales observados dentro de la comunidad residencial.
            </p>
          </section>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800">
            Comprendido
          </button>
        </div>
      </div>
    </div>
  );
};
