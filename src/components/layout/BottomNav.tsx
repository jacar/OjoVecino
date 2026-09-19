import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { Home, Shield, Plus, Briefcase, PhoneCall } from 'lucide-react';

interface BottomNavProps {
  onOpenNewReport: () => void;
  onOpenExecutiveReport: () => void;
  onOpenRules: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenNewReport,
}) => {
  const {
    activePortal,
    setActivePortal,
    setIsIntercomModalOpen,
    unreadChatCount,
    incomingIntercomCall,
  } = useCommunity();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-3 py-1.5 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* Tab 1: Propietarios */}
        <button
          onClick={() => setActivePortal('propietarios')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activePortal === 'propietarios' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Vecinos</span>
        </button>

        {/* Tab 2: Caseta Vigilante */}
        <button
          onClick={() => setActivePortal('vigilante')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activePortal === 'vigilante' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Caseta</span>
        </button>

        {/* Floating Center Action Button: Nuevo Reporte (<45s) */}
        <div className="relative -top-3.5 flex items-center justify-center">
          <button
            onClick={onOpenNewReport}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-105 active:scale-95 transition-transform border-2 border-slate-900 cursor-pointer"
            title="Crear reporte en 45 segundos"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 4: Administración */}
        <button
          onClick={() => setActivePortal('admin')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activePortal === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Admin</span>
        </button>

        {/* Tab 5: Citófono Vantel */}
        <button
          onClick={() => setIsIntercomModalOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <div className="relative">
            <PhoneCall className={`w-5 h-5 mb-0.5 ${incomingIntercomCall ? 'animate-bounce text-emerald-300' : ''}`} />
            {incomingIntercomCall && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <span className="text-[10px]">Citófono</span>
        </button>
      </div>
    </div>
  );
};
