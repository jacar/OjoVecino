import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import {
  Eye,
  Building2,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Home,
  ShieldCheck,
  Briefcase,
  Users,
  LogIn,
  LogOut,
  UserCheck,
  KeyRound,
  Shield,
  Wrench,
  Flame,
  Check,
  Radio,
  PhoneCall,
} from 'lucide-react';
import { ROLE_LABELS } from '../../utils/formatters';

interface NavbarProps {
  onOpenNewReport: () => void;
  onOpenClustering: () => void;
  onOpenExecutiveReport: () => void;
  onOpenRules: () => void;
  onOpenZoneManager: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewReport,
  onOpenClustering,
  onOpenExecutiveReport,
  onOpenRules,
  onOpenZoneManager,
  onOpenLogin,
}) => {
  const {
    communities,
    activeCommunity,
    setActiveCommunityId,
    currentUser,
    users,
    setCurrentUserId,
    activePortal,
    setActivePortal,
    clusterSuggestions,
    resetAllData,
    isAuthenticated,
    logout,
    setIsRadioModalOpen,
    setIsChatModalOpen,
    activeRadioChannel,
    unreadChatCount,
  } = useCommunity();

  const [isCommDropdownOpen, setIsCommDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isAdminRole = currentUser.role === 'admin' || currentUser.role === 'operador' || currentUser.role === 'seguridad';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-sm shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950/20 rounded-[10px] flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  OJO VECINO
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-400/25">
                  OS Comunitario
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block font-medium">
                Gestión residencial transparente
              </p>
            </div>
          </div>

          {/* Center: Modern Segmented Portal Control for the 3 distinct roles */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs font-semibold shadow-inner">
            <button
              onClick={() => setActivePortal('propietarios')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortal === 'propietarios'
                  ? 'bg-slate-800 text-white font-bold shadow-xs border border-slate-750'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className={`w-3.5 h-3.5 ${activePortal === 'propietarios' ? 'text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Propietarios</span>
              <span className="sm:hidden">Vecinos</span>
            </button>

            <button
              onClick={() => setActivePortal('vigilante')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortal === 'vigilante'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs border border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${activePortal === 'vigilante' ? 'text-white' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">Caseta Vigilante</span>
              <span className="sm:hidden">Caseta</span>
            </button>

            <button
              onClick={() => setActivePortal('admin')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortal === 'admin'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs border border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Administración</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>

          {/* Right Actions Toolbar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Community Switcher Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setIsCommDropdownOpen(!isCommDropdownOpen);
                  setIsUserDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-all max-w-[170px] truncate cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{activeCommunity.name.split(' ')[0]} {activeCommunity.name.split(' ')[1] || ''}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isCommDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Comunidades Residenciales
                  </div>
                  {communities.map((comm) => {
                    const isSelected = comm.id === activeCommunity.id;
                    return (
                      <button
                        key={comm.id}
                        onClick={() => {
                          setActiveCommunityId(comm.id);
                          setIsCommDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-600/15 text-blue-300' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-white">{comm.name}</div>
                          <div className="text-[10px] text-slate-400">{comm.address}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Citófono / Garita Directa Button */}
            <button
              onClick={() => setIsChatModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer relative"
              title="Citófono Digital Directo con Garita y Conserjería"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline font-bold">Citófono Garita</span>
              {unreadChatCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Radio Frecuencia PTT Button */}
            <button
              onClick={() => setIsRadioModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Radio Frecuencia Walkie-Talkie PTT"
            >
              <div className="relative flex items-center justify-center">
                <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>
              <span className="hidden sm:inline font-bold">Radio PTT</span>
              <span className="hidden sm:inline px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono text-[9px] border border-amber-400/30">
                CH-0{activeRadioChannel}
              </span>
            </button>

            {/* Smart Duplicate Detector Pill */}
            {clusterSuggestions.length > 0 && (
              <button
                onClick={onOpenClustering}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Detección de reportes similares para agrupar"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden xl:inline font-bold">Duplicados</span>
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-400 text-slate-950 text-[10px] font-black">
                  {clusterSuggestions.length}
                </span>
              </button>
            )}

            {/* User Profile & Account Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                  setIsCommDropdownOpen(false);
                }}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isAdminRole
                    ? 'bg-slate-800/90 hover:bg-slate-800 border-indigo-500/40 text-slate-200'
                    : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0 ${
                    isAdminRole
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                  }`}
                >
                  {isAdminRole ? <ShieldCheck className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="leading-none text-xs font-bold text-white">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {ROLE_LABELS[currentUser.role].split('/')[0]}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  {/* Current Active Account */}
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Sesión Activa
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          isAdminRole
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {ROLE_LABELS[currentUser.role].split('/')[0]}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white">{currentUser.name}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {currentUser.unit} • {currentUser.email}
                    </div>
                  </div>

                  {/* Primary Iniciar Sesión Action */}
                  <div className="p-2.5 border-b border-slate-800">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Iniciar Sesión / Cambiar Cuenta</span>
                    </button>
                  </div>

                  {/* Quick User Role Switcher for testing */}
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Simulación Rápida (Demo)
                  </div>

                  <div className="max-h-52 overflow-y-auto px-1.5 space-y-0.5">
                    {users.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            setCurrentUserId(user.id);
                            if (user.role === 'admin' || user.role === 'operador' || user.role === 'seguridad') {
                              setActivePortal('admin');
                            } else {
                              setActivePortal('propietarios');
                            }
                            setIsUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 hover:bg-slate-800/80 transition-colors cursor-pointer ${
                            isSelected ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' : 'text-slate-300'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.role === 'admin' ? '👑' : user.role === 'operador' ? '🛠️' : user.role === 'seguridad' ? '🛡️' : '👤'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-200 truncate text-xs">{user.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {ROLE_LABELS[user.role]} • {user.unit}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Logout and Reset demo data */}
                  <div className="border-t border-slate-800 pt-1.5 mt-1 px-2 space-y-0.5">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 rounded-lg flex items-center gap-2 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>

                    <button
                      onClick={() => {
                        resetAllData();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restablecer datos demo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
