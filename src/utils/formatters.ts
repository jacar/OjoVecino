import { Category, Status, Urgency, PriorityLevel, Role } from '../types';

export const CATEGORY_META: Record<Category, { label: string; icon: string; color: string; bg: string; border: string }> = {
  seguridad: {
    label: 'Seguridad',
    icon: 'ShieldAlert',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  accesos: {
    label: 'Accesos y Portones',
    icon: 'DoorClosed',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  iluminacion: {
    label: 'Iluminación',
    icon: 'Lightbulb',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  mantenimiento: {
    label: 'Mantenimiento',
    icon: 'Wrench',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  basura: {
    label: 'Basura y Aseo',
    icon: 'Trash2',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  ruido: {
    label: 'Ruido / Horarios',
    icon: 'Volume2',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  mascotas: {
    label: 'Mascotas',
    icon: 'Dog',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  convivencia: {
    label: 'Convivencia',
    icon: 'Users',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  areas_comunes: {
    label: 'Áreas Comunes',
    icon: 'Building2',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
};

export const STATUS_META: Record<Status, { label: string; color: string; bg: string; border: string; desc: string }> = {
  nuevo: {
    label: 'Nuevo',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Registrado, pendiente de revisión administrativa',
  },
  en_revision: {
    label: 'En Revisión',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: 'Evaluando impacto y validando duplicados',
  },
  asignado: {
    label: 'Asignado',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Responsable o contratista asignado',
  },
  en_proceso: {
    label: 'En Proceso',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    desc: 'Trabajos de solución en ejecución',
  },
  resuelto: {
    label: 'Resuelto',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Problema solucionado con evidencia verificada',
  },
  rechazado: {
    label: 'Rechazado',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    desc: 'No corresponde a administración o fuera de reglamento',
  },
  duplicado: {
    label: 'Duplicado',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    desc: 'Consolidado en un caso principal activo',
  },
};

export const PRIORITY_META: Record<PriorityLevel, { label: string; color: string; bg: string; border: string; dotColor: string }> = {
  critica: {
    label: 'Crítica',
    color: 'text-red-700 font-bold',
    bg: 'bg-red-50',
    border: 'border-red-300',
    dotColor: 'bg-red-500 animate-pulse',
  },
  alta: {
    label: 'Alta',
    color: 'text-orange-700 font-semibold',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    dotColor: 'bg-orange-500',
  },
  media: {
    label: 'Media',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  baja: {
    label: 'Baja',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    dotColor: 'bg-slate-400',
  },
};

export const URGENCY_META: Record<Urgency, { label: string; color: string; desc: string }> = {
  critica: { label: 'Inmediata / Emergencia', color: 'text-red-600', desc: 'Riesgo de seguridad o daño mayor' },
  alta: { label: 'Alta', color: 'text-orange-600', desc: 'Afecta operatividad o a varios vecinos' },
  media: { label: 'Normal / Media', color: 'text-amber-600', desc: 'Inconveniente regular a resolver pronto' },
  baja: { label: 'Baja', color: 'text-slate-600', desc: 'Mejora estética o solicitud no urgente' },
};

export const ROLE_LABELS: Record<Role, string> = {
  vecino: 'Vecino / Residente',
  admin: 'Administración / Comité',
  operador: 'Mantenimiento / Operador',
  seguridad: 'Guardia / Conserjería',
};

export function formatTimeAgo(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (seconds < 60) return 'Hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} d`;
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function formatDateShort(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateFull(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
