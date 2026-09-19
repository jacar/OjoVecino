import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Políticas de Privacidad y Anonimato Vecinal</h3>
              <p className="text-xs text-slate-400">Ojo Vecino • Protección de datos y resguardo de la convivencia</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <EyeOff className="w-4 h-4 text-blue-600" />
              1. Principio de Anonimato Opcional y Protección de Identidad
            </h4>
            <p>
              En <strong>Ojo Vecino</strong>, entendemos que reportar problemas de convivencia o seguridad vecinal puede generar temor a represalias o roces personales. Por ello, el usuario puede marcar cualquier reporte como <strong>Modo Anónimo</strong>. En este caso:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li>El nombre, unidad y correo del vecino <strong>jamás se muestran a otros residentes</strong> en los tableros públicos.</li>
              <li>La administración registra la validez del reporte para evitar quejas falsas, pero la identidad permanece bajo secreto operativo.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              2. Ubicación Aproximada por Zonas Comunes
            </h4>
            <p>
              Para resguardar la privacidad domiciliaria, los reportes se catalogan preferentemente por <strong>Zonas Comunes</strong> (ej: Pasillo Torre B Piso 3, Estacionamiento Subterráneo -1, Parque Central) en lugar de exponer números de departamento exactos salvo autorización explícita del usuario.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              3. Fotografías y Evidencias
            </h4>
            <p>
              Las fotos aportadas deben circunscribirse al problema físico o de infraestructura. Está estrictamente prohibido subir fotos que expongan rostros de menores de edad, patentes completas sin anonimizar o aspectos íntimos de viviendas privadas.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <UserCheck className="w-4 h-4 text-amber-600" />
              4. Trazabilidad y Bitácora Inmutable de Auditoría
            </h4>
            <p>
              Cada acción administrativa (cambio de estado, asignación, cierre o rechazo) queda registrada con marca de tiempo y responsable para garantizar que los fondos y recursos de la comunidad se destinen a resolver problemas reales de forma transparente.
            </p>
          </section>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800">
            Aceptar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
