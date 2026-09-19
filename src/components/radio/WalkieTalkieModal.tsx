import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  Mic,
  Square,
  Play,
  RotateCcw,
  ShieldAlert,
  Send,
  Sparkles,
  Signal,
  CheckCircle2,
  X,
  Activity,
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { audioRadioService } from '../../services/audioRadioService';

interface WalkieTalkieModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkieTalkieModal: React.FC<WalkieTalkieModalProps> = ({ isOpen, onClose }) => {
  const {
    activeCommunity,
    currentUser,
    radioChannels,
    activeRadioChannel,
    setActiveRadioChannel,
    radioTransmissions,
    broadcastRadioTransmission,
  } = useCommunity();

  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ptt' | 'history' | 'quick_dispatch'>('ptt');
  const [customTextDispatch, setCustomTextDispatch] = useState<string>('');
  const [playingTxId, setPlayingTxId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const recordingTimerRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentChannel = radioChannels.find((c) => c.number === activeRadioChannel) || radioChannels[0];

  // Transmissions for current community and channel
  const channelTransmissions = radioTransmissions.filter(
    (tx) => tx.communityId === activeCommunity.id && tx.channelNumber === activeRadioChannel
  );

  // Handle PTT Mouse/Touch Down
  const handlePttDown = useCallback(async () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    setRecordingSeconds(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    await audioRadioService.startRecording((level) => {
      setAudioLevel(level);
    });
  }, [isTransmitting]);

  // Handle PTT Mouse/Touch Up (Release)
  const handlePttUp = useCallback(async () => {
    if (!isTransmitting) return;
    setIsTransmitting(false);
    setAudioLevel(0);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const { audioUrl, durationSeconds } = await audioRadioService.stopRecording();

    // Default callsign
    const defaultTranscript = `[Transmisión de voz por Radio - ${durationSeconds}s]`;
    broadcastRadioTransmission({
      channelNumber: activeRadioChannel,
      transcript: defaultTranscript,
      audioUrl: audioUrl || undefined,
      durationSeconds: Math.max(1, durationSeconds),
    });
  }, [isTransmitting, activeRadioChannel, broadcastRadioTransmission]);

  // Keyboard Spacebar PTT support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeTab === 'ptt' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        if (!isTransmitting) {
          handlePttDown();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeTab === 'ptt' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        if (isTransmitting) {
          handlePttUp();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, isTransmitting, activeTab, handlePttDown, handlePttUp]);

  // Quick Dispatch messages
  const quickDispatches = [
    { code: '10-4', label: '10-4 Entendido / Copiado', text: '10-4 central, recibido y entendido.' },
    { code: 'QAP', label: 'QAP En Frecuencia', text: 'Atento en frecuencia y a la escucha. QAP.' },
    { code: 'GARITA', label: 'Autorización Acceso Garita', text: `Autorizo ingreso de visita a mi unidad (${currentUser.unit}). Favor dar paso.` },
    { code: 'RONDA', label: 'Ronda Perimetral OK', text: 'Ronda perimetral de vigilancia completada sin novedades en sector.' },
    { code: '10-33', label: '10-33 Alerta / Tráfico de Emergencia', text: '¡10-33 Emergencia en progreso! Solicitamos asistencia inmediata en zona común.' },
  ];

  const handleSendQuickDispatch = (text: string) => {
    audioRadioService.playPttStartBeep();
    setTimeout(() => {
      audioRadioService.playRogerBeep();
      broadcastRadioTransmission({
        channelNumber: activeRadioChannel,
        transcript: text,
        durationSeconds: 3,
      });
    }, 400);
  };

  const handleSendCustomTextDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTextDispatch.trim()) return;
    audioRadioService.playPttStartBeep();
    setTimeout(() => {
      audioRadioService.playRogerBeep();
      broadcastRadioTransmission({
        channelNumber: activeRadioChannel,
        transcript: customTextDispatch.trim(),
        durationSeconds: 2,
      });
      setCustomTextDispatch('');
    }, 300);
  };

  const handlePlayAudio = (txId: string, url?: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
    if (playingTxId === txId) {
      setPlayingTxId(null);
      return;
    }
    if (url) {
      setPlayingTxId(txId);
      const audio = audioRadioService.playAudio(url, () => {
        setPlayingTxId(null);
      });
      activeAudioRef.current = audio;
    } else {
      audioRadioService.playSquelchNoise(300, 0.15);
      setPlayingTxId(txId);
      setTimeout(() => setPlayingTxId(null), 1200);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Top Radio Antenna & Header */}
        <div className="relative bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold tracking-wide text-white text-base sm:text-lg flex items-center gap-1.5">
                  RADIO FRECUENCIA PTT
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  UHF / FM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Canal activo: <strong className="text-amber-400">{currentChannel.name}</strong> • {currentChannel.frequency}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-xl transition ${
                isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Silenciado' : 'Audio activo'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tactical LCD Screen Display */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-black border-2 border-emerald-500/40 rounded-2xl p-4 shadow-inner relative overflow-hidden font-mono">
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-2">
              <div className="flex items-center space-x-2">
                <Signal className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>SIG: [■■■■■] 99%</span>
                <span className="text-emerald-500/80">| SQUELCH: AUTO</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] text-emerald-300 uppercase tracking-widest border border-emerald-500/30">
                  {currentUser.role.toUpperCase()} • {currentUser.unit}
                </span>
              </div>
            </div>

            {/* Frequency Large Digits */}
            <div className="flex items-baseline justify-between my-1">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-wider drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">
                  {currentChannel.frequency}
                </span>
                <span className="text-xs text-emerald-400 ml-2 font-sans font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  CH-0{currentChannel.number}
                </span>
              </div>

              <div className="text-right">
                <div className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${
                  isTransmitting 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  {isTransmitting ? `TRANSMITIENDO (${recordingSeconds}s)` : 'EN ESPERA (QAP)'}
                </div>
              </div>
            </div>

            {/* Dynamic Audio Visualizer Bar */}
            <div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center justify-between gap-1">
              <span className="text-[10px] text-emerald-500 font-bold">MIC VU:</span>
              <div className="flex-1 flex items-center gap-1 h-3 px-2 bg-emerald-950/60 rounded">
                {[...Array(20)].map((_, i) => {
                  const threshold = (i + 1) * 5;
                  const isActive = isTransmitting ? audioLevel >= threshold : i < 4;
                  const isHigh = i > 14;
                  return (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-xs transition-all duration-75 ${
                        isActive
                          ? isHigh
                            ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]'
                            : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                          : 'bg-emerald-950/50'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">{isTransmitting ? `${audioLevel}%` : 'STANDBY'}</span>
            </div>
          </div>

          {/* Channel Selector Rotary Dial Grid */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {radioChannels.map((ch) => {
              const isSelected = ch.number === activeRadioChannel;
              return (
                <button
                  key={ch.number}
                  onClick={() => setActiveRadioChannel(ch.number)}
                  className={`p-2.5 rounded-xl text-left border transition relative overflow-hidden ${
                    isSelected
                      ? ch.isEmergency
                        ? 'bg-red-950/70 border-red-500 text-white shadow-lg shadow-red-950/50'
                        : 'bg-amber-950/50 border-amber-400 text-white shadow-lg shadow-amber-950/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">CH-0{ch.number}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
                    )}
                  </div>
                  <div className="font-bold text-xs truncate">{ch.name}</div>
                  <div className="text-[10px] opacity-70 font-mono">{ch.frequency}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-4">
          <button
            onClick={() => setActiveTab('ptt')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'ptt'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Micrófono PTT
          </button>
          <button
            onClick={() => setActiveTab('quick_dispatch')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'quick_dispatch'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Despachos Rápidos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Bitácora ({channelTransmissions.length})
          </button>
        </div>

        {/* Body Content according to Tab */}
        <div className="p-4 flex-1 overflow-y-auto min-h-[220px]">
          {activeTab === 'ptt' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-5">
              {/* Push To Talk Giant Round Button */}
              <div className="relative group">
                {/* Pulsing ring during transmission */}
                {isTransmitting && (
                  <>
                    <div className="absolute -inset-4 rounded-full bg-red-500/30 animate-ping"></div>
                    <div className="absolute -inset-2 rounded-full bg-red-500/40 animate-pulse"></div>
                  </>
                )}

                <button
                  type="button"
                  onMouseDown={handlePttDown}
                  onMouseUp={handlePttUp}
                  onTouchStart={handlePttDown}
                  onTouchEnd={handlePttUp}
                  className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-150 transform active:scale-95 shadow-2xl ${
                    isTransmitting
                      ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-red-500/60 ring-8 ring-red-500/30'
                      : 'bg-gradient-to-b from-slate-800 via-slate-850 to-slate-950 text-amber-400 border-4 border-amber-500/40 hover:border-amber-400 shadow-black/80 hover:shadow-amber-500/20'
                  }`}
                >
                  <div className="p-3 rounded-full bg-slate-900/40 mb-1">
                    <Mic className={`w-8 h-8 ${isTransmitting ? 'animate-bounce text-white' : 'text-amber-400'}`} />
                  </div>
                  <span className="font-black text-sm tracking-wider uppercase">
                    {isTransmitting ? 'SOLTAR' : 'MANTENER'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase opacity-90">
                    {isTransmitting ? `${recordingSeconds}s Transmitiendo` : 'PARA HABLAR'}
                  </span>
                </button>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs text-slate-300 font-medium">
                  Mantén presionado el botón o la <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono text-[10px]">Barra Espaciadora</kbd>
                </p>
                <p className="text-[11px] text-slate-500">
                  Emite sonido de apertura, captura tu voz y genera Roger Beep táctico al finalizar.
                </p>
              </div>

              {/* Text fallback dispatch form */}
              <form onSubmit={handleSendCustomTextDispatch} className="w-full pt-2 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={customTextDispatch}
                  onChange={(e) => setCustomTextDispatch(e.target.value)}
                  placeholder="O escribe un mensaje para radiar..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!customTextDispatch.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Radiar
                </button>
              </form>
            </div>
          )}

          {activeTab === 'quick_dispatch' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">
                Selecciona un código predeterminado para transmitir de inmediato a la frecuencia {currentChannel.frequency}:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickDispatches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuickDispatch(item.text)}
                    className="p-3 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-amber-400/60 rounded-xl text-left transition group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {item.code}
                      </span>
                      <Send className="w-3 h-3 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                    </div>
                    <div className="text-xs font-semibold text-white mb-0.5">{item.label}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 italic">"{item.text}"</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2.5">
              {channelTransmissions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No hay transmisiones grabadas en este canal todavía.
                </div>
              ) : (
                channelTransmissions.map((tx) => {
                  const isPlaying = playingTxId === tx.id;
                  const isFromMe = tx.senderId === currentUser.id;
                  return (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-xl border transition ${
                        isFromMe
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-slate-800/60 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                            {tx.codeCallsign}
                          </span>
                          <span className="text-xs font-bold text-white">{tx.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({tx.senderUnit})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mb-2">
                        "{tx.transcript}"
                      </p>

                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Activity className="w-3 h-3 text-emerald-400" />
                          <span>{tx.durationSeconds}s transmisión</span>
                        </div>

                        <button
                          onClick={() => handlePlayAudio(tx.id, tx.audioUrl)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                            isPlaying
                              ? 'bg-emerald-500 text-slate-950 animate-pulse'
                              : 'bg-slate-700 hover:bg-slate-600 text-white'
                          }`}
                        >
                          {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {isPlaying ? 'Reproduciendo...' : 'Escuchar Audio'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Comunidad: <strong className="text-white">{activeCommunity.name}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400/90 font-mono">OJO VECINO RADIO NET</span>
          </div>
        </div>
      </div>
    </div>
  );
};
