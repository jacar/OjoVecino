import { Report, ClusterSuggestion } from '../types';
import { CATEGORY_META } from '../utils/formatters';

export const clusteringService = {
  /**
   * Detecta automáticamente reportes activos que comparten zona, categoría o similitud de texto.
   */
  detectClusters(reports: Report[], communityId: string): ClusterSuggestion[] {
    const activeReports = reports.filter(
      (r) =>
        r.communityId === communityId &&
        r.status !== 'resuelto' &&
        r.status !== 'rechazado' &&
        r.status !== 'duplicado'
    );

    const suggestions: ClusterSuggestion[] = [];
    const processedIds = new Set<string>();

    for (let i = 0; i < activeReports.length; i++) {
      const primary = activeReports[i];
      if (processedIds.has(primary.id)) continue;

      const candidates: string[] = [];

      for (let j = i + 1; j < activeReports.length; j++) {
        const other = activeReports[j];
        if (processedIds.has(other.id)) continue;

        let similarityScore = 0;

        // Misma zona y misma categoría = alta probabilidad
        if (primary.zoneId === other.zoneId && primary.category === other.category) {
          similarityScore += 0.6;
        } else if (primary.zoneId === other.zoneId) {
          similarityScore += 0.3;
        }

        // Palabras clave compartidas en título o descripción
        const wordsPrimary = new Set(
          (primary.title + ' ' + primary.description)
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter((w) => w.length > 3)
        );

        const wordsOther = (other.title + ' ' + other.description)
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .split(/\s+/)
          .filter((w) => w.length > 3);

        let sharedWords = 0;
        wordsOther.forEach((w) => {
          if (wordsPrimary.has(w)) sharedWords++;
        });

        if (sharedWords >= 2) {
          similarityScore += Math.min(0.4, sharedWords * 0.1);
        }

        if (similarityScore >= 0.5) {
          candidates.push(other.id);
          processedIds.add(other.id);
        }
      }

      if (candidates.length > 0) {
        processedIds.add(primary.id);
        const categoryInfo = CATEGORY_META[primary.category]?.label || 'General';
        
        suggestions.push({
          id: `cluster-${primary.id}`,
          primaryReportId: primary.id,
          duplicateCandidateIds: candidates,
          zoneId: primary.zoneId,
          category: primary.category,
          similarityScore: 0.85,
          reason: `Se detectaron ${candidates.length + 1} reportes coincidentes en ${categoryInfo} para esta misma zona.`,
          suggestedTitle: `[Caso Consolidado] ${primary.title}`,
          suggestedBroadcast: `Estimada comunidad: se han recibido ${candidates.length + 1} avisos sobre este incidente. La administración ya tomó conocimiento y se encuentra gestionando la solución correspondiente.`,
        });
      }
    }

    return suggestions;
  },

  /**
   * Generador con IA de comunicados neutrales y objetivos para la comunidad.
   * Evita lenguaje confrontacional o culpabilizaciones y se enfoca en acciones concretas.
   */
  generateNeutralBroadcast(report: Report, zoneName: string): string {
    const categoryName = CATEGORY_META[report.category]?.label || 'general';
    const totalAffected = (report.duplicateCount || 0) + 1;

    switch (report.category) {
      case 'accesos':
        return `Aviso Comunitario: Se está atendiendo una contingencia operativa en los accesos de ${zoneName} (reportado por ${totalAffected} residentes). El equipo técnico correspondiente ya fue coordinado para normalizar el servicio a la brevedad. Agradecemos su comprensión.`;
      case 'iluminacion':
        return `Información a la Comunidad: Se encuentra en proceso la revisión y reemplazo de luminarias en el sector ${zoneName}. El servicio de mantenimiento regularizará el punto durante el turno de hoy.`;
      case 'mantenimiento':
        return `Seguimiento Operativo: Se ha registrado una solicitud de mantención en ${zoneName}. El área técnica interna ya programó la inspección y reparación con el material necesario.`;
      case 'ruido':
        return `Recordatorio de Convivencia: Recordamos a toda la comunidad mantener el respeto a los horarios de descanso estipulados en el reglamento de copropiedad para resguardar la tranquilidad de todos los residentes.`;
      case 'basura':
        return `Información de Aseo: El equipo de servicios generales fue notificado para el despeje y limpieza en ${zoneName}. Recordamos depositar los residuos exclusivamente en los contenedores habilitados.`;
      case 'seguridad':
        return `Protocolo de Seguridad: La administración y conserjería se encuentran reforzando el punto de control en ${zoneName} tras los reportes recibidos. Medida preventiva en curso.`;
      default:
        return `Aviso Operativo: La administración ha consolidado los reportes de ${categoryName} en ${zoneName} y se encuentra ejecutando las gestiones técnicas de resolución.`;
    }
  },
};
