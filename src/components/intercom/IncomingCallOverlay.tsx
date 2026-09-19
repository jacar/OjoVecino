import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import {
  PhoneCall,
  PhoneOff,
  Volume2,
  LockOpen,
  Sparkles,
} from 'lucide-react';

export const IncomingCallOverlay: React.FC = () => {
  const {
    incomingIntercomCall,
    answerIntercomCall,
    rejectIntercomCall,
    unlockDoor,
  } = useCommunity();

  if (!incomingIntercomCall) return null;

  const isFromGuard =
    incomingIntercomCall.callerRole === 'seguridad' ||
    incomingIntercomCall.callerUnit.toLowerCase().includes('caseta') ||
    incomingIntercomCall.callerUnit.toLowerCase().includes('garita');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/80 rounded-3xl shadow-2xl shadow-emerald-500/30 overflow-hidden text-white p-6 sm:p-8 text-center space-y-6">
        {/* Pulsing ring waves background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 rounded-full bg-emerald-500/10 animate-ping"></div>
        </div>

        {/* Top Header Badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/30">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            CITÓFONO VANTEL ENTRANTE
          </span>
        </div>

        {/* Big Ringing Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 flex items-center justify-center shadow-xl shadow-emerald-500/40">
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-emerald-400">
            <PhoneCall className="w-12 h-12 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500"></span>
          </span>
        </div>

        {/* Caller Details */}
        <div className="space-y-1 relative z-10">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            {isFromGuard ? 'Caseta Central de Seguridad' : 'Residente Timbrando'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {incomingIntercomCall.callerUnit}
          </h2>
          <p className="text-sm text-slate-300 font-medium">
            {incomingIntercomCall.callerName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 relative z-10">
          {/* Answer Call Button */}
          <button
            onClick={() => answerIntercomCall(incomingIntercomCall.id)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <PhoneCall className="w-6 h-6 stroke-[2.5]" />
            <span>CONTESTAR CITÓFONO</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {/* Quick Remote Door Unlock */}
            <button
              onClick={() => {
                unlockDoor(incomingIntercomCall.id);
                answerIntercomCall(incomingIntercomCall.id);
              }}
              className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
              title="Abrir chapa eléctrica de la puerta de inmediato"
            >
              <LockOpen className="w-4 h-4 text-emerald-400" />
              <span>ABRIR PUERTA</span>
            </button>

            {/* Reject Call */}
            <button
              onClick={() => rejectIntercomCall(incomingIntercomCall.id)}
              className="py-3 px-3 rounded-2xl bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <PhoneOff className="w-4 h-4 text-rose-400" />
              <span>RECHAZAR</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Tecnología Citofonía Virtual Vantel Real-Time</span>
        </div>
      </div>
    </div>
  );
};
