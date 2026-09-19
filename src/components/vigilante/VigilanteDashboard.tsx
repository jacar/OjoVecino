import React, { useState, useRef } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import {
  Shield,
  PhoneCall,
  Radio,
  Truck,
  Car,
  Check,
  AlertTriangle,
  Mic,
  Send,
  Play,
  Square,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  Volume2,
  DoorOpen,
  Eye,
  Activity,
  UserCheck,
} from 'lucide-react';
import { audioRadioService } from '../../services/audioRadioService';
import { ChatMessage, QuickAuthorization } from '../../types';

interface VigilanteDashboardProps {
  onSelectReport: (id: string) => void;
  onOpenRules: () => void;
  onOpenEmergency: () => void;
}

export const VigilanteDashboard: React.FC<VigilanteDashboardProps> = ({
  onSelectReport,
  onOpenRules,
  onOpenEmergency,
}) => {
  const {
    activeCommunity,
    currentUser,
    chatMessages,
    sendChatMessage,
    radioTransmissions,
    broadcastRadioTransmission,
    radioChannels,
    activeRadioChannel,
    setActiveRadioChannel,
    quickAuthorizations,
    updateAuthorizationStatus,
    setIsChatModalOpen,
    setIsRadioModalOpen,
    setSelectedChatChannel,
    initiateIntercomCall,
    setIsIntercomModalOpen,
    activeIntercomCall,
    unlockDoor,
    endIntercomCall,
  } = useCommunity();

  const [activeTab, setActiveTab] = useState<'accesos' | 'citofono' | 'radio' | 'directorio'>('accesos');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [quickRadioText, setQuickRadioText] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedUnitChat, setSelectedUnitChat] = useState<string>('Torre B - Depto 402');
  const [unitReplyText, setUnitReplyText] = useState<string>('');

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Filter messages for Garita
  const garitaMessages = chatMessages.filter(
    (m) => m.communityId === activeCommunity.id && (m.channelId === 'garita' || m.channelId === 'emergencia')
  );

  // List of Units in Community
  const unitsList = [
    { unit: 'Torre A - Depto 101', resident: 'Gonzalo Silva', status: 'En casa', phone: '+56 9 1122 3344' },
    { unit: 'Torre A - Depto 105', resident: 'Mariana Soto', status: 'En casa', phone: '+56 9 7654 3210' },
    { unit: 'Torre A - Depto 204', resident: 'Felipe Correa', status: 'Visita anunciada', phone: '+56 9 9988 7766' },
    { unit: 'Torre B - Depto 402', resident: 'Carlos Méndez', status: 'Delivery en camino', phone: '+56 9 8765 4321' },
    { unit: 'Torre B - Depto 501', resident: 'Beatriz Morales', status: 'En casa', phone: '+56 9 4433 2211' },
    { unit: 'Torre C - Depto 603', resident: 'Rodrigo Araya', status: 'Sin novedades', phone: '+56 9 5566 7788' },
  ];

  // Handle Guard PTT Press
  const handleGuardPttDown = async () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    await audioRadioService.startRecording();
  };

  const handleGuardPttUp = async () => {
    if (!isTransmitting) return;
    setIsTransmitting(false);
    const { audioUrl, durationSeconds } = await audioRadioService.stopRecording();
    broadcastRadioTransmission({
      channelNumber: activeRadioChannel,
      transcript: `[Transmisión desde Caseta Central - ${durationSeconds}s]`,
      audioUrl: audioUrl || undefined,
      durationSeconds,
      codeCallsign: 'GARITA-01',
    });
  };

  const handleSendGuardQuickRadio = (text: string) => {
    audioRadioService.playPttStartBeep();
    setTimeout(() => {
      audioRadioService.playRogerBeep();
      broadcastRadioTransmission({
        channelNumber: activeRadioChannel,
        transcript: text,
        durationSeconds: 3,
        codeCallsign: 'GARITA-01',
      });
    }, 300);
  };

  const handleSendUnitDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitReplyText.trim()) return;

    sendChatMessage({
      channelId: 'garita',
      text: `[Mensaje para ${selectedUnitChat}]: ${unitReplyText.trim()}`,
    });
    setUnitReplyText('');
  };

  const handlePlayAudio = (id: string, url?: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
    if (playingAudioId === id) {
      setPlayingAudioId(null);
      return;
    }
    if (url) {
      setPlayingAudioId(id);
      const audio = audioRadioService.playAudio(url, () => setPlayingAudioId(null));
      activeAudioRef.current = audio;
    } else {
      audioRadioService.playSquelchNoise(250, 0.15);
      setPlayingAudioId(id);
      setTimeout(() => setPlayingAudioId(null), 1000);
    }
  };

  const pendingAuths = quickAuthorizations.filter((a) => a.status === 'pendiente');

  return (
    <div className="space-y-5 pb-20 md:pb-8 animate-in fade-in duration-200">
      {/* Guard Station Master Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/30">
                <Shield className="w-3.5 h-3.5 fill-current" />
                CASETA PRINCIPAL DE VIGILANCIA
              </span>
              <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Turno Activo: Juan Pérez
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              Control de Garita, Citofonía y Radio
            </h2>
            <p className="text-xs text-slate-300 font-medium max-w-xl">
              Gestión centralizada de accesos vehiculares, timbres de citófono digital de residentes y canal de radio de frecuencia táctica.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl text-center">
              <div className="text-xs font-bold text-amber-400 mb-0.5">Visitas / Delivery</div>
              <div className="text-xl font-black text-white">{pendingAuths.length} Pendientes</div>
              <span className="text-[10px] text-slate-400">{quickAuthorizations.length} hoy</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl text-center">
              <div className="text-xs font-bold text-emerald-400 mb-0.5">Canal de Radio</div>
              <div className="text-xl font-black text-white font-mono">CH-0{activeRadioChannel}</div>
              <span className="text-[10px] text-slate-400">462.5625 MHz</span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center">
              <button
                onClick={() => {
                  audioRadioService.playEmergencyAlertTone();
                  sendChatMessage({
                    channelId: 'garita',
                    text: '🚨 ¡ALERTA GENERAL EMITIDA POR CASETA DE GUARDIA! Se detecta incidente perimetral.',
                    quickActionType: 'alerta',
                  });
                }}
                className="w-full h-full py-3 px-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <span>Alarma SOS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Guard */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('accesos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'accesos'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>Control de Accesos & Pases ({pendingAuths.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('citofono')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'citofono'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4 text-cyan-400" />
          <span>Citofonía en Vivo ({garitaMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('radio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'radio'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Consola de Radio PTT</span>
        </button>

        <button
          onClick={() => setActiveTab('directorio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'directorio'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Directorio de Unidades ({unitsList.length})</span>
        </button>
      </div>

      {/* TAB 1: CONTROL DE ACCESOS (DELIVERY / VISITAS) */}
      {activeTab === 'accesos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Pases de Ingreso Anunciados por Residentes
            </h3>
            <span className="text-xs text-slate-500 font-medium">Actualización en tiempo real con Firestore</span>
          </div>

          {quickAuthorizations.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
              No hay autorizaciones de visitas o delivery registradas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickAuthorizations.map((auth) => (
                <div
                  key={auth.id}
                  className={`bg-white rounded-3xl p-5 border shadow-sm transition-all ${
                    auth.status === 'pendiente'
                      ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1 ${
                        auth.type === 'delivery'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {auth.type === 'delivery' ? <Truck className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                        {auth.type}
                      </span>
                      {auth.vehiclePlate && (
                        <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-900 text-amber-300 rounded-lg">
                          {auth.vehiclePlate}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(auth.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 mb-1">{auth.guestName}</h4>
                  <p className="text-xs text-slate-600 mb-1">
                    <strong>Destino:</strong> <span className="text-slate-900 font-bold">{auth.unit}</span> ({auth.residentName})
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    <strong>Llegada estimada:</strong> {auth.estimatedArrival} {auth.companyOrApp ? `• ${auth.companyOrApp}` : ''}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    {auth.status === 'pendiente' ? (
                      <>
                        <button
                          onClick={() => {
                            updateAuthorizationStatus(auth.id, 'ingresado');
                            sendChatMessage({
                              channelId: 'garita',
                              text: `🚪 [Caseta Garita]: ${auth.guestName} ingresó al condominio hacia ${auth.unit}.`,
                            });
                          }}
                          className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>PERMITIR ACCESO (ABRIR)</span>
                        </button>
                        <button
                          onClick={() => {
                            initiateIntercomCall(auth.unit, auth.residentName);
                          }}
                          className="py-2.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Llamar en tiempo real por citófono Vantel"
                        >
                          <PhoneCall className="w-4 h-4 text-emerald-700 animate-pulse" />
                          <span className="hidden sm:inline">Llamar Depto</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> Ingreso Concedido
                        </span>
                        <button
                          onClick={() => updateAuthorizationStatus(auth.id, 'finalizado')}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
                        >
                          Marcar Salida
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CITOFONÍA EN VIVO Y CHAT */}
      {activeTab === 'citofono' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent messages */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                Mensajes y Timbres Recibidos en Garita
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsIntercomModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs rounded-xl hover:from-emerald-500 hover:to-teal-500 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Teclado Citófono Vantel</span>
                </button>
                <button
                  onClick={() => setIsChatModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  Chat Garita
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {garitaMessages.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No hay mensajes registrados en caseta.
                </div>
              ) : (
                garitaMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{msg.senderName}</span>
                        <span className="text-slate-500">({msg.senderUnit})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed font-medium">{msg.text}</p>

                    {msg.audioUrl && (
                      <button
                        onClick={() => handlePlayAudio(msg.id, msg.audioUrl)}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition"
                      >
                        {playingAudioId === msg.id ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {playingAudioId === msg.id ? 'Reproduciendo...' : `Escuchar Audio (${msg.audioDuration || 3}s)`}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Reply Form to Unit */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-white mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Responder / Timbrar a Unidad
              </h4>
              <p className="text-xs text-slate-400 mb-4">Envía una notificación oficial desde caseta a un residente.</p>

              <form onSubmit={handleSendUnitDirectMessage} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Seleccionar Unidad:</label>
                  <select
                    value={selectedUnitChat}
                    onChange={(e) => setSelectedUnitChat(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
                  >
                    {unitsList.map((u) => (
                      <option key={u.unit} value={u.unit}>
                        {u.unit} ({u.resident})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Mensaje de Guardia:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ej: Tiene una encomienda en recepción / Su visita se encuentra en el acceso principal..."
                    value={unitReplyText}
                    onChange={(e) => setUnitReplyText(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar al Citófono
                </button>
              </form>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Sincronizado vía Firebase</span>
              <span className="text-emerald-400 font-bold">Online 🟢</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONSOLA DE RADIO FRECUENCIA PTT */}
      {activeTab === 'radio' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  UHF 462.5625 MHz • CH-0{activeRadioChannel}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">Transmisor Radial Táctico de Caseta</h3>
            </div>

            <div className="flex items-center gap-2">
              {radioChannels.map((ch) => (
                <button
                  key={ch.number}
                  onClick={() => setActiveRadioChannel(ch.number)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    activeRadioChannel === ch.number
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  CH-0{ch.number}
                </button>
              ))}
            </div>
          </div>

          {/* Central PTT Controller for Guard */}
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <button
              onMouseDown={handleGuardPttDown}
              onMouseUp={handleGuardPttUp}
              onTouchStart={handleGuardPttDown}
              onTouchEnd={handleGuardPttUp}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-150 transform active:scale-95 shadow-2xl ${
                isTransmitting
                  ? 'bg-red-600 text-white shadow-red-600/60 ring-8 ring-red-500/30 animate-pulse'
                  : 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/30'
              }`}
            >
              <Mic className="w-8 h-8 mb-1" />
              <span className="font-black text-sm uppercase">{isTransmitting ? 'TRANSMITIENDO' : 'MANTENER PTT'}</span>
              <span className="text-[10px] font-bold uppercase opacity-90">{isTransmitting ? 'SOLTAR AL FINALIZAR' : 'HABLAR POR RADIO'}</span>
            </button>
            <p className="text-xs text-slate-400">Presiona el botón para modular en el canal de vigilancia comunitaria.</p>
          </div>

          {/* Quick Preset Dispatches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => handleSendGuardQuickRadio('10-4 central copiado y entendido. QAP.')}
              className="p-3 bg-slate-800 hover:bg-slate-750 rounded-xl text-left text-xs font-bold text-white transition"
            >
              <div className="text-amber-400 font-mono text-[10px]">10-4</div>
              <div>Entendido / QAP</div>
            </button>
            <button
              onClick={() => handleSendGuardQuickRadio('Ronda perimetral en curso. Todo sin novedad.')}
              className="p-3 bg-slate-800 hover:bg-slate-750 rounded-xl text-left text-xs font-bold text-white transition"
            >
              <div className="text-amber-400 font-mono text-[10px]">RONDA</div>
              <div>Ronda Sin Novedad</div>
            </button>
            <button
              onClick={() => handleSendGuardQuickRadio('Portón principal cerrado y asegurado.')}
              className="p-3 bg-slate-800 hover:bg-slate-750 rounded-xl text-left text-xs font-bold text-white transition"
            >
              <div className="text-amber-400 font-mono text-[10px]">PORTÓN</div>
              <div>Acceso Seguro</div>
            </button>
            <button
              onClick={() => handleSendGuardQuickRadio('10-33 Alerta en caseta. Solicitamos apoyo.')}
              className="p-3 bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 rounded-xl text-left text-xs font-bold text-red-300 transition"
            >
              <div className="text-red-400 font-mono text-[10px]">10-33</div>
              <div>Alerta SOS</div>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: DIRECTORIO DE UNIDADES */}
      {activeTab === 'directorio' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Directorio Telefónico y Citofonía de Residentes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unitsList.map((item) => (
              <div
                key={item.unit}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 text-xs">{item.unit}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">{item.resident}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.phone}</div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                  <button
                    onClick={() => {
                      initiateIntercomCall(item.unit, item.resident);
                    }}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Llamar Citófono</span>
                  </button>
                  <button
                    onClick={() => {
                      sendChatMessage({
                        channelId: 'garita',
                        text: `📦 Encomienda recibida en caseta para ${item.unit} (${item.resident}). Favor pasar a retirar.`,
                        quickActionType: 'paqueteria',
                      });
                      setActiveTab('citofono');
                    }}
                    className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                    title="Notificar paquete"
                  >
                    📦 Paquete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
