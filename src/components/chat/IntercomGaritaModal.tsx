import React, { useState, useRef, useEffect } from 'react';
import {
  PhoneCall,
  Shield,
  Send,
  Truck,
  Car,
  Package,
  AlertTriangle,
  Mic,
  Square,
  Play,
  X,
  Radio,
  Clock,
  UserCheck,
  Building,
  Check,
  Sparkles,
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { ChatChannelId } from '../../types';
import { audioRadioService } from '../../services/audioRadioService';

interface IntercomGaritaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntercomGaritaModal: React.FC<IntercomGaritaModalProps> = ({ isOpen, onClose }) => {
  const {
    activeCommunity,
    currentUser,
    chatMessages,
    sendChatMessage,
    selectedChatChannel,
    setSelectedChatChannel,
    createQuickAuthorization,
    setIsRadioModalOpen,
  } = useCommunity();

  const [messageText, setMessageText] = useState<string>('');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showQuickActionModal, setShowQuickActionModal] = useState<'delivery' | 'visita' | 'paquete' | null>(null);

  // Form states for quick actions
  const [quickGuestName, setQuickGuestName] = useState<string>('');
  const [quickPlate, setQuickPlate] = useState<string>('');
  const [quickCompany, setQuickCompany] = useState<string>('Cornershop / Uber');
  const [quickEta, setQuickEta] = useState<string>('15-20 min');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recordTimerRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Filter messages by active channel and community
  const filteredMessages = chatMessages.filter(
    (m) => m.communityId === activeCommunity.id && m.channelId === selectedChatChannel
  );

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, isOpen]);

  // Send standard text message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendChatMessage({
      channelId: selectedChatChannel,
      text: messageText.trim(),
    });
    setMessageText('');
  };

  // Start voice note recording
  const handleStartVoiceRecording = async () => {
    setIsRecordingVoice(true);
    setRecordingDuration(0);
    recordTimerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    await audioRadioService.startRecording();
  };

  // Stop voice note and send
  const handleStopVoiceRecording = async () => {
    if (!isRecordingVoice) return;
    setIsRecordingVoice(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    const { audioUrl, durationSeconds } = await audioRadioService.stopRecording();
    if (audioUrl) {
      sendChatMessage({
        channelId: selectedChatChannel,
        text: `🎤 Nota de voz (${durationSeconds}s)`,
        audioUrl,
        audioDuration: durationSeconds,
      });
    }
  };

  // Play audio message
  const handlePlayVoiceNote = (msgId: string, url: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(msgId);
    const audio = audioRadioService.playAudio(url, () => {
      setPlayingAudioId(null);
    });
    activeAudioRef.current = audio;
  };

  // Submit quick action
  const handleConfirmQuickAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (showQuickActionModal === 'delivery') {
      createQuickAuthorization({
        type: 'delivery',
        guestName: quickGuestName || 'Repartidor de App',
        companyOrApp: quickCompany,
        estimatedArrival: quickEta,
      });
    } else if (showQuickActionModal === 'visita') {
      createQuickAuthorization({
        type: 'visita',
        guestName: quickGuestName,
        vehiclePlate: quickPlate,
        estimatedArrival: quickEta,
      });
    }
    setShowQuickActionModal(null);
    setQuickGuestName('');
    setQuickPlate('');
  };

  // Quick Panic / SOS button
  const handleSendPanicAlert = () => {
    audioRadioService.playEmergencyAlertTone();
    sendChatMessage({
      channelId: 'garita',
      text: `🚨 ¡ALERTA DE SEGURIDAD / ASISTENCIA URGENTE! El residente de ${currentUser.unit} (${currentUser.name}) solicita atención inmediata de la guardia en caseta.`,
      quickActionType: 'alerta',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Intercom Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
                <PhoneCall className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-wide">
                  CITOFONÍA DIGITAL & GARITA
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  EN LÍNEA
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Vigilante de turno: <strong className="text-white font-medium">Juan Pérez</strong> • Caseta Principal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                setIsRadioModalOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              title="Abrir Walkie-Talkie Radio PTT"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Modo Radio PTT</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel Selection Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 py-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedChatChannel('garita')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedChatChannel === 'garita'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Caseta de Guardias
          </button>
          <button
            onClick={() => setSelectedChatChannel('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedChatChannel === 'admin'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Mesa de Administración
          </button>
          <button
            onClick={() => setSelectedChatChannel('emergencia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedChatChannel === 'emergencia'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Canal de Emergencias
          </button>
        </div>

        {/* Quick Resident Action Toolbar */}
        <div className="p-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setShowQuickActionModal('delivery')}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1.5 whitespace-nowrap transition"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            Autorizar Delivery
          </button>

          <button
            onClick={() => setShowQuickActionModal('visita')}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-sky-300 flex items-center gap-1.5 whitespace-nowrap transition"
          >
            <Car className="w-3.5 h-3.5 text-sky-400" />
            Autorizar Visita / Auto
          </button>

          <button
            onClick={() => {
              sendChatMessage({
                channelId: 'garita',
                text: `📦 Consulta de paquetería: ¿Ha llegado alguna encomienda para ${currentUser.unit}?`,
              });
            }}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1.5 whitespace-nowrap transition"
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            Consultar Encomienda
          </button>

          <button
            onClick={handleSendPanicAlert}
            className="ml-auto px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 rounded-xl text-xs font-bold text-red-300 flex items-center gap-1.5 whitespace-nowrap transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            Pánico / SOS
          </button>
        </div>

        {/* Message Thread Box */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[260px] bg-slate-900/50">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Inicia la conversación con la garita o conserjería en este canal.
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isFromMe = msg.senderId === currentUser.id;
              const isGuard = msg.senderRole === 'seguridad';
              const isPlaying = playingAudioId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1 px-1">
                    <span className="font-bold text-slate-300">{msg.senderName}</span>
                    <span>• {msg.senderUnit}</span>
                    <span className="text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                      isFromMe
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : isGuard
                        ? 'bg-slate-800 text-slate-100 border border-emerald-500/40 rounded-bl-xs'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-xs'
                    }`}
                  >
                    {/* Quick Action Card Pill */}
                    {msg.quickActionType && (
                      <div className="mb-2 p-2 rounded-xl bg-slate-950/40 border border-white/10 flex items-center gap-2">
                        {msg.quickActionType === 'delivery' && <Truck className="w-4 h-4 text-emerald-300" />}
                        {msg.quickActionType === 'visita' && <Car className="w-4 h-4 text-sky-300" />}
                        {msg.quickActionType === 'paqueteria' && <Package className="w-4 h-4 text-amber-300" />}
                        {msg.quickActionType === 'alerta' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                        <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-300">
                          {msg.quickActionType}
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Voice Note Player Pill */}
                    {msg.audioUrl && (
                      <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between gap-3">
                        <button
                          onClick={() => handlePlayVoiceNote(msg.id, msg.audioUrl!)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                            isPlaying
                              ? 'bg-white text-slate-950 shadow-md'
                              : 'bg-black/30 hover:bg-black/40 text-white'
                          }`}
                        >
                          {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isPlaying ? 'Reproduciendo...' : `Escuchar (${msg.audioDuration || 3}s)`}
                        </button>
                        <span className="text-[10px] opacity-75 font-mono">Audio Radio</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Modal Overlay (Inside Intercom) */}
        {showQuickActionModal && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 animate-slideUp">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                {showQuickActionModal === 'delivery' ? <Truck className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                {showQuickActionModal === 'delivery' ? 'Autorizar Repartidor a Caseta' : 'Autorizar Visita Vehicular'}
              </h3>
              <button
                onClick={() => setShowQuickActionModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmQuickAction} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {showQuickActionModal === 'delivery' ? (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Aplicación / Empresa</label>
                    <select
                      value={quickCompany}
                      onChange={(e) => setQuickCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                    >
                      <option value="Cornershop / Uber">Cornershop / Uber</option>
                      <option value="Rappi">Rappi</option>
                      <option value="PedidosYa">PedidosYa</option>
                      <option value="MercadoLibre / Envíos">MercadoLibre / Envíos</option>
                      <option value="Chilexpress / Correos">Chilexpress / Correos</option>
                      <option value="Otro Delivery">Otro Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nombre repartidor (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: Marcos Rivas"
                      value={quickGuestName}
                      onChange={(e) => setQuickGuestName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nombre Visita</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Fernando Alarcón"
                      value={quickGuestName}
                      onChange={(e) => setQuickGuestName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Patente Vehículo (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: KJ-88-21"
                      value={quickPlate}
                      onChange={(e) => setQuickPlate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono uppercase"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowQuickActionModal(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Emitir Pase a Garita
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Voice record button */}
            <button
              type="button"
              onClick={isRecordingVoice ? handleStopVoiceRecording : handleStartVoiceRecording}
              className={`p-2.5 rounded-xl transition ${
                isRecordingVoice
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
              }`}
              title={isRecordingVoice ? 'Detener y enviar nota de voz' : 'Grabar nota de voz para la garita'}
            >
              {isRecordingVoice ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {isRecordingVoice ? (
              <div className="flex-1 bg-red-950/40 border border-red-500/40 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-red-300 font-mono">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  GRABANDO NOTA DE VOZ ({recordingDuration}s)...
                </span>
                <button
                  type="button"
                  onClick={handleStopVoiceRecording}
                  className="text-white font-bold underline"
                >
                  Enviar
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Mensaje directo para ${selectedChatChannel === 'garita' ? 'Caseta de Guardias' : 'Administración'}...`}
                className="flex-1 bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            )}

            <button
              type="submit"
              disabled={!messageText.trim() || isRecordingVoice}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition flex items-center justify-center shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
