import React, { useState, useEffect, useRef } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  LockOpen,
  Volume2,
  X,
  Building2,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  Radio,
  Delete,
  PhoneForwarded,
  Shield,
  Square,
  Play,
} from 'lucide-react';
import { audioRadioService } from '../../services/audioRadioService';
import { IntercomCall } from '../../types';

interface VantelCitofonoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VantelCitofonoModal: React.FC<VantelCitofonoModalProps> = ({ isOpen, onClose }) => {
  const {
    activeCommunity,
    currentUser,
    activeIntercomCall,
    intercomCalls,
    initiateIntercomCall,
    unlockDoor,
    endIntercomCall,
    sendIntercomVoiceSnippet,
  } = useCommunity();

  const [activeTab, setActiveTab] = useState<'teclado' | 'directorio' | 'historial'>('teclado');
  const [dialedTower, setDialedTower] = useState<string>('Torre B');
  const [dialedNumber, setDialedNumber] = useState<string>('402');
  const [isHoldingMic, setIsHoldingMic] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [lastPlayedSnippet, setLastPlayedSnippet] = useState<string | null>(null);

  const durationTimerRef = useRef<any>(null);
  const lastSnippetTimestampRef = useRef<string | null>(null);

  // Call duration stopwatch
  useEffect(() => {
    if (activeIntercomCall && activeIntercomCall.status === 'connected') {
      setCallDuration(0);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [activeIntercomCall?.status]);

  // Auto-play incoming voice snippets from the other participant
  useEffect(() => {
    if (
      activeIntercomCall &&
      activeIntercomCall.lastVoiceSnippet &&
      activeIntercomCall.lastVoiceSender !== currentUser.name &&
      activeIntercomCall.lastVoiceTimestamp !== lastSnippetTimestampRef.current
    ) {
      lastSnippetTimestampRef.current = activeIntercomCall.lastVoiceTimestamp || null;
      setLastPlayedSnippet(activeIntercomCall.lastVoiceSnippet);
      audioRadioService.playAudio(activeIntercomCall.lastVoiceSnippet);
    }
  }, [activeIntercomCall?.lastVoiceSnippet, activeIntercomCall?.lastVoiceTimestamp, currentUser.name]);

  if (!isOpen) return null;

  // Directory Units
  const unitsDirectory = [
    { unit: 'Torre A - Depto 101', resident: 'Gonzalo Silva', floor: 1, phone: '+56 9 1122 3344' },
    { unit: 'Torre A - Depto 105', resident: 'Mariana Soto', floor: 1, phone: '+56 9 7654 3210' },
    { unit: 'Torre A - Depto 204', resident: 'Felipe Correa', floor: 2, phone: '+56 9 9988 7766' },
    { unit: 'Torre B - Depto 402', resident: 'Carlos Méndez', floor: 4, phone: '+56 9 8765 4321' },
    { unit: 'Torre B - Depto 501', resident: 'Beatriz Morales', floor: 5, phone: '+56 9 4433 2211' },
    { unit: 'Torre C - Depto 603', resident: 'Rodrigo Araya', floor: 6, phone: '+56 9 5566 7788' },
  ];

  // Keypad press handler
  const handleDigitPress = (digit: string) => {
    audioRadioService.playDtmfTone(digit);
    if (dialedNumber.length < 4) {
      setDialedNumber((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    audioRadioService.playDtmfTone('*');
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleTowerSelect = (tower: string) => {
    audioRadioService.playDtmfTone('#');
    setDialedTower(tower);
  };

  const handleStartCall = () => {
    if (!dialedNumber) return;
    const fullTarget = `${dialedTower} - Depto ${dialedNumber}`;
    initiateIntercomCall(fullTarget);
  };

  // Push-to-Talk in active call
  const handleMicDown = async () => {
    if (isHoldingMic) return;
    setIsHoldingMic(true);
    await audioRadioService.startRecording((level) => {
      setAudioLevel(level);
    });
  };

  const handleMicUp = async () => {
    if (!isHoldingMic) return;
    setIsHoldingMic(false);
    setAudioLevel(0);
    const { audioUrl } = await audioRadioService.stopRecording();
    if (audioUrl && activeIntercomCall) {
      sendIntercomVoiceSnippet(activeIntercomCall.id, audioUrl);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header Vantel OS */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base text-white tracking-wide">
                  CITOFONÍA VANTEL IP
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Llamadas bidireccionales en tiempo real y apertura remota
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (activeIntercomCall) endIntercomCall();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE CALL SCREEN */}
        {activeIntercomCall ? (
          <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-between text-center space-y-6 bg-gradient-to-b from-slate-900 to-slate-950">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                activeIntercomCall.status === 'ringing'
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : activeIntercomCall.status === 'door_unlocked'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {activeIntercomCall.status === 'ringing'
                  ? 'TIMBRANDO AL CITÓFONO...'
                  : activeIntercomCall.status === 'door_unlocked'
                  ? '¡PUERTA PRINCIPAL ABIERTA!'
                  : 'EN LLAMADA EN VIVO'}
              </span>
            </div>

            {/* Target Avatar / Pulsing circle */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-1 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center text-white">
                  <Building2 className="w-10 h-10 text-cyan-400 mb-1" />
                  <span className="text-[10px] font-mono text-slate-400">VANTEL</span>
                </div>
              </div>
              {isHoldingMic && (
                <div className="absolute -bottom-2 inset-x-0 mx-auto px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase animate-pulse">
                  VOZ EN VIVO
                </div>
              )}
            </div>

            {/* Target Information */}
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {activeIntercomCall.targetUnit}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {activeIntercomCall.targetName || 'Citófono Residencial'}
              </p>
              <div className="text-lg font-mono font-bold text-emerald-400 pt-1">
                {formatSeconds(callDuration)}
              </div>
            </div>

            {/* Voice Stream PTT Button */}
            <div className="w-full max-w-sm space-y-2">
              <button
                onMouseDown={handleMicDown}
                onMouseUp={handleMicUp}
                onTouchStart={handleMicDown}
                onTouchEnd={handleMicUp}
                className={`w-full py-4 px-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 select-none cursor-pointer transition-all duration-150 shadow-xl ${
                  isHoldingMic
                    ? 'bg-red-600 text-white shadow-red-600/50 ring-4 ring-red-500/30'
                    : 'bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 shadow-emerald-500/10'
                }`}
              >
                {isHoldingMic ? <Mic className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                <span>{isHoldingMic ? 'TRANSMITIENDO VOZ...' : 'MANTENER PARA HABLAR (VOZ EN VIVO)'}</span>
              </button>
              <p className="text-[11px] text-slate-400">Audio full-duplex sincronizado con Firebase</p>
            </div>

            {/* Master Controls: Remote Door Open & Hang Up */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => unlockDoor(activeIntercomCall.id)}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <LockOpen className="w-4 h-4 stroke-[2.5]" />
                <span>ABRIR PUERTA</span>
              </button>

              <button
                onClick={() => endIntercomCall(activeIntercomCall.id)}
                className="py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                <PhoneOff className="w-4 h-4 stroke-[2.5]" />
                <span>COLGAR</span>
              </button>
            </div>
          </div>
        ) : (
          /* DIALPAD AND DIRECTORY MODE */
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5">
              <button
                onClick={() => setActiveTab('teclado')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'teclado'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Teclado Numérico</span>
              </button>

              <button
                onClick={() => setActiveTab('directorio')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'directorio'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Directorio Unidades</span>
              </button>

              <button
                onClick={() => setActiveTab('historial')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'historial'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Historial</span>
              </button>
            </div>

            {/* TAB 1: VANTEL DIALPAD */}
            {activeTab === 'teclado' && (
              <div className="p-5 flex flex-col items-center space-y-4 max-w-sm mx-auto w-full">
                {/* Tower Selector Pills */}
                <div className="grid grid-cols-3 gap-2 w-full">
                  {['Torre A', 'Torre B', 'Torre C'].map((tower) => (
                    <button
                      key={tower}
                      onClick={() => handleTowerSelect(tower)}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        dialedTower === tower
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {tower}
                    </button>
                  ))}
                </div>

                {/* Dial Display */}
                <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-left">
                  <div>
                    <div className="text-[10px] text-cyan-400 font-bold uppercase">{dialedTower}</div>
                    <div className="text-2xl font-black font-mono text-white tracking-wider">
                      {dialedNumber ? `Depto ${dialedNumber}` : 'Digitar número...'}
                    </div>
                  </div>
                  {dialedNumber && (
                    <button
                      onClick={handleBackspace}
                      className="p-2 text-slate-400 hover:text-rose-400 transition"
                      title="Borrar dígito"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Keypad Grid (3x4) */}
                <div className="grid grid-cols-3 gap-2.5 w-full">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleDigitPress(key)}
                      className="h-13 rounded-2xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-white text-lg font-bold flex items-center justify-center transition shadow-sm cursor-pointer"
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Big Green Dial Call Button */}
                <button
                  onClick={handleStartCall}
                  disabled={!dialedNumber}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <PhoneCall className="w-5 h-5 stroke-[2.5]" />
                  <span>TIMBRAR AL DEPARTAMENTO</span>
                </button>
              </div>
            )}

            {/* TAB 2: RESIDENT DIRECTORY */}
            {activeTab === 'directorio' && (
              <div className="p-4 space-y-2 max-h-[420px] overflow-y-auto">
                {unitsDirectory.map((u) => (
                  <div
                    key={u.unit}
                    className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="font-extrabold text-white text-xs">{u.unit}</div>
                      <div className="text-[11px] text-slate-400">{u.resident} • Piso {u.floor}</div>
                    </div>

                    <button
                      onClick={() => initiateIntercomCall(u.unit, u.resident)}
                      className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-600/20"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Timbrar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: CALL HISTORY */}
            {activeTab === 'historial' && (
              <div className="p-4 space-y-2 max-h-[420px] overflow-y-auto">
                {intercomCalls.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No hay registro de llamadas recientes.
                  </div>
                ) : (
                  intercomCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {call.callerUnit} ➔ {call.targetUnit}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        call.status === 'door_unlocked'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : call.status === 'connected'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {call.status === 'door_unlocked' ? 'Puerta Abierta' : call.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
