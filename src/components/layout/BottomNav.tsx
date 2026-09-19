import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { Home, ClipboardList, Plus, BarChart3, BookOpen } from 'lucide-react';

interface BottomNavProps {
  onOpenNewReport: () => void;
  onOpenExecutiveReport: () => void;
  onOpenRules: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenNewReport,
  onOpenExecutiveReport,
  onOpenRules,
}) => {
  const { activeView, setActiveView, reports, currentUser } = useCommunity();

  const pendingCount = reports.filter(
    (r) => r.status === 'nuevo' || r.status === 'en_revision' || r.status === 'asignado' || r.status === 'en_proceso'
  ).length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around relative">
        {/* Feed */}
        <button
          onClick={() => setActiveView('feed')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            activeView === 'feed' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Reportes</span>
        </button>

        {/* Panel Operativo / Admin */}
        <button
          onClick={() => setActiveView('admin')}
          className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            activeView === 'admin' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5 mb-0.5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Gestión</span>
        </button>

        {/* Floating Center Action Button: Nuevo Reporte */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={onOpenNewReport}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-105 active:scale-95 transition-transform border-2 border-slate-900"
            title="Crear reporte en menos de 45 segundos"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        {/* Resumen Ejecutivo */}
        <button
          onClick={onOpenExecutiveReport}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            activeView === 'analytics' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Métricas</span>
        </button>

        {/* Decálogo de Reglas */}
        <button
          onClick={onOpenRules}
          className="flex flex-col items-center justify-center w-14 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Reglas</span>
        </button>
      </div>
    </div>
  );
};
