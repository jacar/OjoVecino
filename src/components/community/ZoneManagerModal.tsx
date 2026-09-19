import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import {
  X,
  Layers,
  Plus,
  MapPin,
  Building2,
  Car,
  Trash2,
  TreePine,
  Waves,
  DoorClosed,
  CheckCircle2,
} from 'lucide-react';

interface ZoneManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZoneManagerModal: React.FC<ZoneManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeCommunity, addZone } = useCommunity();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    addZone(name.trim(), code.trim(), 'Building2', description.trim() || undefined);
    setName('');
    setCode('');
    setDescription('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Gestión de Zonas y Sectores
              </h3>
              <p className="text-xs text-slate-400">
                Catálogo de áreas comunes de {activeCommunity.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Zonas Registradas ({activeCommunity.zones.length})
            </span>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Zona
              </button>
            )}
          </div>

          {/* Add Zone Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2.5">
              <div className="font-bold text-blue-950 flex items-center justify-between">
                <span>Registrar Nueva Zona / Sector</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Código:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Z-10"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Nombre del Sector:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sala de Calderas / Gimnasio"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Descripción de Referencia:</label>
                <input
                  type="text"
                  placeholder="Detalle o piso de referencia..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
              >
                Guardar Zona
              </button>
            </form>
          )}

          {/* Zones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeCommunity.zones.map((zone) => (
              <div
                key={zone.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 hover:bg-white hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {zone.name}
                  </span>
                  <span className="font-mono text-[10px] font-bold bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">
                    {zone.code}
                  </span>
                </div>
                {zone.description && (
                  <p className="text-[11px] text-slate-500 pl-5">
                    {zone.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
