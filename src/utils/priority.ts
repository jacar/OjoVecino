import { Category, Urgency, CalculatedPriority, PriorityLevel } from '../types';

export const CATEGORY_BASE_WEIGHTS: Record<Category, number> = {
  seguridad: 35,
  accesos: 30,
  iluminacion: 25,
  mantenimiento: 25,
  basura: 20,
  ruido: 15,
  mascotas: 15,
  convivencia: 15,
  areas_comunes: 15,
};

export const URGENCY_WEIGHTS: Record<Urgency, number> = {
  critica: 35,
  alta: 25,
  media: 15,
  baja: 5,
};

export function calculateReportPriority(
  category: Category,
  urgency: Urgency,
  createdAtDate: string | Date,
  duplicateOrClusterCount: number = 0
): CalculatedPriority {
  const categoryScore = CATEGORY_BASE_WEIGHTS[category] || 15;
  const urgencyScore = URGENCY_WEIGHTS[urgency] || 10;
  
  // Duplicados o reportes repetidos aumentan la prioridad hasta +20 puntos
  const clusterScore = Math.min(20, duplicateOrClusterCount * 6);
  
  // Antigüedad: +2.5 puntos por día que lleva sin resolverse (hasta +15)
  const now = new Date().getTime();
  const created = new Date(createdAtDate).getTime();
  const daysDiff = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
  const ageScore = Math.min(15, Math.floor(daysDiff * 2.5));
  
  const totalScore = Math.min(100, Math.round(categoryScore + urgencyScore + clusterScore + ageScore));
  
  let level: PriorityLevel = 'baja';
  if (totalScore >= 70) {
    level = 'critica';
  } else if (totalScore >= 50) {
    level = 'alta';
  } else if (totalScore >= 30) {
    level = 'media';
  } else {
    level = 'baja';
  }

  return {
    score: totalScore,
    level,
    breakdown: {
      categoryScore,
      urgencyScore,
      clusterScore,
      ageScore,
    },
  };
}
