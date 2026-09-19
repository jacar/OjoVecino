export type Category = 
  | 'seguridad' 
  | 'mantenimiento' 
  | 'iluminacion' 
  | 'accesos' 
  | 'ruido' 
  | 'basura' 
  | 'mascotas' 
  | 'convivencia' 
  | 'areas_comunes';

export type Status = 
  | 'nuevo' 
  | 'en_revision' 
  | 'asignado' 
  | 'en_proceso' 
  | 'resuelto' 
  | 'rechazado' 
  | 'duplicado';

export type Urgency = 'baja' | 'media' | 'alta' | 'critica';
export type PriorityLevel = 'baja' | 'media' | 'alta' | 'critica';
export type Visibility = 'publico' | 'anonimo' | 'confidencial';
export type CommunityType = 'condominio' | 'edificio' | 'fraccionamiento' | 'barrio';
export type Role = 'vecino' | 'admin' | 'operador' | 'seguridad';
export type ActivePortal = 'propietarios' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unit: string;
  avatar?: string;
  phone?: string;
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  code: string;
  icon?: string;
}

export interface CommunityRule {
  id: string;
  title: string;
  description: string;
  category: Category | 'general';
  severity: 'informativa' | 'moderada' | 'estricta';
}

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  address: string;
  totalUnits: number;
  zones: Zone[];
  rules: CommunityRule[];
  admins: string[];
  bannerUrl?: string;
  code: string;
}

export interface ReportEvidence {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  uploadedByRole: Role;
  isResolution?: boolean;
}

export interface AuditLog {
  id: string;
  reportId: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  previousValue?: string;
  newValue?: string;
  note?: string;
}

export interface InternalNote {
  id: string;
  authorName: string;
  authorRole: Role;
  text: string;
  createdAt: string;
}

export interface CalculatedPriority {
  score: number;
  level: PriorityLevel;
  breakdown: {
    categoryScore: number;
    urgencyScore: number;
    clusterScore: number;
    ageScore: number;
  };
}

export interface Report {
  id: string;
  code: string;
  communityId: string;
  title: string;
  description: string;
  category: Category;
  zoneId: string;
  subLocationDetail?: string;
  urgency: Urgency;
  calculatedPriority: CalculatedPriority;
  status: Status;
  visibility: Visibility;
  reportedBy: {
    id: string;
    name: string;
    unit: string;
    isAnonymous: boolean;
  };
  createdAt: string;
  updatedAt: string;
  estimatedResolutionDate?: string;
  assignee?: {
    id: string;
    name: string;
    role: string;
    company?: string;
    phone?: string;
  };
  evidence: ReportEvidence[];
  resolutionEvidence?: ReportEvidence[];
  resolutionNote?: string;
  rejectionReason?: string;
  
  parentClusterId?: string;
  isMasterCluster?: boolean;
  duplicateCount?: number;
  linkedReportIds?: string[];
  
  internalNotes: InternalNote[];
  auditLogs: AuditLog[];
  communityBroadcast?: {
    generatedByAI: boolean;
    text: string;
    broadcastedAt: string;
  };
}

export interface ClusterSuggestion {
  id: string;
  primaryReportId: string;
  duplicateCandidateIds: string[];
  zoneId: string;
  category: Category;
  similarityScore: number;
  reason: string;
  suggestedTitle: string;
  suggestedBroadcast: string;
}

export interface UnitOwner {
  id: string;
  unitNumber: string;
  ownerName: string;
  residentType: 'propietario' | 'arrendatario';
  email: string;
  phone: string;
  isFeeUpToDate: boolean;
  balanceDue: number;
  activeReportsCount: number;
}

export interface Announcement {
  id: string;
  communityId: string;
  title: string;
  content: string;
  category: 'mantenimiento' | 'seguridad' | 'asamblea' | 'general';
  priority: 'normal' | 'urgente';
  authorName: string;
  publishedAt: string;
}

export interface ExecutiveReportData {
  communityId: string;
  month: string;
  periodLabel: string;
  totalIncidents: number;
  resolvedIncidents: number;
  resolutionRate: number;
  avgResolutionHours: number;
  categoryBreakdown: { category: Category; count: number; percentage: number }[];
  zoneBreakdown: { zoneId: string; zoneName: string; count: number; criticalCount: number }[];
  statusBreakdown: { status: Status; count: number }[];
  topRecurringIssues: { issue: string; count: number; zoneName: string; category: Category }[];
  aiExecutiveSummary: string;
  recommendations: string[];
}

export type ChatChannelId = 'garita' | 'admin' | 'emergencia' | 'general' | string;

export interface ChatMessage {
  id: string;
  communityId: string;
  channelId: ChatChannelId;
  senderId: string;
  senderName: string;
  senderRole: Role;
  senderUnit: string;
  text: string;
  audioUrl?: string;
  audioDuration?: number;
  attachmentUrl?: string;
  quickActionType?: 'delivery' | 'visita' | 'paqueteria' | 'alerta' | 'mantencion';
  quickActionData?: Record<string, string>;
  createdAt: string;
  readBy?: string[];
}

export interface RadioTransmission {
  id: string;
  communityId: string;
  channelNumber: number;
  channelFrequency: string;
  channelName: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  senderUnit: string;
  audioUrl?: string;
  durationSeconds: number;
  transcript: string;
  codeCallsign: string;
  signalStrength: number;
  createdAt: string;
}

export interface RadioChannel {
  number: number;
  name: string;
  frequency: string;
  code: string;
  description: string;
  isEmergency?: boolean;
  color: string;
}

export interface QuickAuthorization {
  id: string;
  communityId: string;
  unit: string;
  residentName: string;
  type: 'visita' | 'delivery' | 'servicio_tecnico';
  guestName: string;
  vehiclePlate?: string;
  companyOrApp?: string;
  estimatedArrival?: string;
  status: 'pendiente' | 'ingresado' | 'finalizado' | 'rechazado';
  createdAt: string;
}
