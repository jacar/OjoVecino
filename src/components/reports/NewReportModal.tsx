import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { Category, Urgency, Visibility } from '../../types';
import { CATEGORY_META, URGENCY_META } from '../../utils/formatters';
import { calculateReportPriority } from '../../utils/priority';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldAlert,
  DoorClosed,
  Lightbulb,
  Wrench,
  Trash2,
  Volume2,
  Dog,
  Users,
  Building2,
  Camera,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: (reportId: string) => void;
}

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  seguridad: ShieldAlert,
  accesos: DoorClosed,
  iluminacion: Lightbulb,
  mantenimiento: Wrench,
  basura: Trash2,
  ruido: Volume2,
  mascotas: Dog,
  convivencia: Users,
  areas_comunes: Building2,
};

const SAMPLE_EVIDENCE = [
  { url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80', label: 'Portón / Acceso Dañado' },
  { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80', label: 'Luminaria / Foco Quemado' },
  { url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80', label: 'Fuga de Agua / Tubería' },
  { url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80', label: 'Basura / Escombros' },
  { url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80', label: 'Cerradura / Puerta Peatonal' },
];

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
}) => {
  const { activeCommunity, createReport, currentUser } = useCommunity();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<Category>('mantenimiento');
  const [zoneId, setZoneId] = useState<string>(activeCommunity.zones[0]?.id || '');
  const [subLocationDetail, setSubLocationDetail] = useState<string>('');
  const [urgency, setUrgency] = useState<Urgency>('media');
  const [visibility, setVisibility] = useState<Visibility>('publico');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Realtime calculated priority preview
  const priorityPreview = calculateReportPriority(category, urgency, new Date(), 0);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!title.trim()) {
        const catLabel = CATEGORY_META[category].label;
        const zoneObj = activeCommunity.zones.find((z) => z.id === zoneId);
        setTitle(`${catLabel} en ${zoneObj?.name || 'Área común'}`);
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const evidence = selectedPhoto
        ? [{ url: selectedPhoto, caption: photoCaption || 'Foto de evidencia del incidente' }]
        : [];

      const report = await createReport({
        title: title.trim() || `${CATEGORY_META[category].label} en zona seleccionada`,
        description: description.trim(),
        category,
        zoneId: zoneId || activeCommunity.zones[0]?.id || 'general',
        subLocationDetail: subLocationDetail.trim(),
        urgency,
        visibility,
        evidenceUrls: evidence,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      if (onReportCreated) onReportCreated(report.id);
      onClose();

      // Reset form
      setStep(1);
      setTitle('');
      setDescription('');
      setSelectedPhoto('');
      setPhotoCaption('');
      setSubLocationDetail('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-slate-200/90">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 uppercase tracking-wider border border-blue-400/20">
                Paso {step} de 3
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> &lt; 45 seg
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black mt-1 text-white tracking-tight">
              {step === 1 && '¿Qué tipo de problema es?'}
              {step === 2 && 'Ubicación y Urgencia'}
              {step === 3 && 'Detalles y Evidencia Fotográfica'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="h-1 bg-slate-100 flex">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-800">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 font-bold">
                Selecciona la categoría del incidente:
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const Icon = CATEGORY_ICONS[cat] || Building2;
                  const isSelected = category === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? `${meta.bg} ${meta.border} border-2 shadow-xs ring-2 ring-blue-500/20 scale-[1.02]`
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                          isSelected ? meta.bg : 'bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${meta.color}`} />
                      </div>
                      <span className="text-xs font-bold leading-tight line-clamp-2">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Informative helper */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 mt-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  El sistema calculará automáticamente la prioridad técnica según criticidad y afectación a vecinos.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: ZONE, URGENCY & PRIVACY */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Zone Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Zona o Sector Afectado
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full text-sm rounded-xl border-slate-300 bg-slate-50 p-2.5 border focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  {activeCommunity.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.code} — {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific detail */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Punto exacto o referencia (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Frente al depto 304, Rampa subterráneo -1"
                  value={subLocationDetail}
                  onChange={(e) => setSubLocationDetail(e.target.value)}
                  className="w-full text-sm rounded-xl border-slate-300 bg-slate-50 p-2.5 border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Perceived Urgency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nivel de Urgencia
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['baja', 'media', 'alta', 'critica'] as Urgency[]).map((urg) => {
                    const meta = URGENCY_META[urg];
                    const isSelected = urgency === urg;
                    return (
                      <button
                        key={urg}
                        type="button"
                        onClick={() => setUrgency(urg)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 border-2 font-bold shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${meta.color}`}>{meta.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <span className="text-[11px] text-slate-500 block leading-tight mt-0.5 font-medium">
                          {meta.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visibility / Privacy */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Privacidad del Reporte
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setVisibility('publico')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      visibility === 'publico'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold border-2 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Eye className="w-4 h-4 mb-1 text-blue-600" />
                    <span>Público</span>
                    <span className="text-[10px] text-slate-400 font-normal">Visible a vecinos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('anonimo')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      visibility === 'anonimo'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold border-2 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <EyeOff className="w-4 h-4 mb-1 text-indigo-600" />
                    <span>Anónimo</span>
                    <span className="text-[10px] text-slate-400 font-normal">Oculta tu nombre</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('confidencial')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      visibility === 'confidencial'
                        ? 'border-slate-800 bg-slate-100 text-slate-900 font-bold border-2 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Lock className="w-4 h-4 mb-1 text-slate-700" />
                    <span>Confidencial</span>
                    <span className="text-[10px] text-slate-400 font-normal">Solo Admin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TITLE, DESCRIPTION & EVIDENCE */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título Resumido
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Portón de acceso no cierra, Luminaria apagada..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm font-bold rounded-xl border-slate-300 bg-slate-50 p-2.5 border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descripción Operativa del Problema
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explica qué sucede con hechos objetivos (evitar quejas personales o comentarios a terceros)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm rounded-xl border-slate-300 bg-slate-50 p-2.5 border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Evidence Photo Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    Evidencia Fotográfica (Opcional)
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Selecciona foto demo</span>
                </label>

                {/* Sample Photo selector */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                  {SAMPLE_EVIDENCE.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(sample.url);
                        setPhotoCaption(sample.label);
                      }}
                      className={`relative rounded-xl overflow-hidden border aspect-video transition-all cursor-pointer ${
                        selectedPhoto === sample.url
                          ? 'ring-2 ring-blue-600 border-blue-600 scale-[1.03]'
                          : 'border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                      {selectedPhoto === sample.url && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedPhoto && (
                  <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl text-xs">
                    <img src={selectedPhoto} alt="Preview" className="w-10 h-8 rounded-lg object-cover" />
                    <input
                      type="text"
                      placeholder="Nota de foto (ej: foto tomada a las 18:00)"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto('')}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Priority Live Badge */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Prioridad Calculada:</span>
                  <div className="font-black text-slate-800 capitalize flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Nivel {priorityPreview.level.toUpperCase()} ({priorityPreview.score} pts)
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-medium">
                  {currentUser.name} • {visibility === 'anonimo' ? 'Modo Anónimo' : currentUser.unit}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Atrás
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-xs transition-all cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || !description.trim()}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Enviando...' : 'Publicar Reporte'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
