import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { CATEGORY_META } from '../../utils/formatters';
import { Category } from '../../types';
import {
  X,
  BookOpen,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Info,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface CommunityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityRulesModal: React.FC<CommunityRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeCommunity, currentUser, addRule } = useCommunity();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | 'general'>('general');
  const [severity, setSeverity] = useState<'informativa' | 'moderada' | 'estricta'>('moderada');

  if (!isOpen) return null;

  const filteredRules = activeCommunity.rules.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    addRule({
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
    });
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Decálogo y Reglas de Convivencia
              </h3>
              <p className="text-xs text-slate-400">
                Normativa oficial y acuerdos de copropiedad en {activeCommunity.name}
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
          {/* Search Bar & Add Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar reglas por palabra clave (ruido, mascotas, estacionamiento)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            {currentUser.role === 'admin' && !isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva Regla
              </button>
            )}
          </div>

          {/* Add Rule Form (Admin only) */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2.5">
              <div className="font-bold text-blue-950 flex items-center justify-between">
                <span>Incorporar Nueva Regla de Comunidad</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="Título de la norma (ej: Uso de parrillas y quinchos)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
              />
              <textarea
                required
                rows={2}
                placeholder="Descripción detallada, horarios o restricciones..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category | 'general')}
                  className="p-1.5 bg-white border border-blue-200 rounded-lg text-xs"
                >
                  <option value="general">Categoría: General</option>
                  {(Object.keys(CATEGORY_META) as Category[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_META[cat].label}
                    </option>
                  ))}
                </select>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as 'informativa' | 'moderada' | 'estricta')}
                  className="p-1.5 bg-white border border-blue-200 rounded-lg text-xs"
                >
                  <option value="informativa">Severidad: Informativa</option>
                  <option value="moderada">Severidad: Moderada</option>
                  <option value="estricta">Severidad: Estricta</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
              >
                Guardar Regla Oficial
              </button>
            </form>
          )}

          {/* Rules List */}
          <div className="space-y-3">
            {filteredRules.map((rule) => {
              let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
              if (rule.severity === 'estricta') badgeColor = 'bg-red-50 text-red-800 border-red-200';
              if (rule.severity === 'moderada') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';

              return (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {rule.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
