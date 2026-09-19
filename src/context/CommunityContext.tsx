import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Community,
  Report,
  User,
  Role,
  Category,
  Status,
  Urgency,
  ClusterSuggestion,
  AuditLog,
  InternalNote,
  ReportEvidence,
  ActivePortal,
  ChatMessage,
  RadioTransmission,
  RadioChannel,
  QuickAuthorization,
  ChatChannelId,
  IntercomCall,
} from '../types';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { calculateReportPriority } from '../utils/priority';
import { clusteringService } from '../services/clusteringService';
import { INITIAL_RADIO_CHANNELS } from '../data/mockData';
import { audioRadioService } from '../services/audioRadioService';

interface ToastInfo {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface CommunityContextType {
  communities: Community[];
  activeCommunity: Community;
  currentUser: User;
  users: User[];
  reports: Report[];
  allReports: Report[];
  activePortal: ActivePortal;
  activeView: 'feed' | 'map' | 'admin' | 'analytics' | 'rules' | 'zones';
  filterCategory: Category | 'all';
  filterStatus: Status | 'all';
  filterZone: string | 'all';
  filterUrgency: Urgency | 'all';
  searchQuery: string;
  clusterSuggestions: ClusterSuggestion[];
  toasts: ToastInfo[];
  isFirebaseActive: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  
  // Chat & Radio Intercom State
  chatMessages: ChatMessage[];
  radioTransmissions: RadioTransmission[];
  radioChannels: RadioChannel[];
  activeRadioChannel: number;
  quickAuthorizations: QuickAuthorization[];
  isChatModalOpen: boolean;
  isRadioModalOpen: boolean;
  selectedChatChannel: ChatChannelId;
  unreadChatCount: number;

  // Vantel Real-Time Intercom Calls
  intercomCalls: IntercomCall[];
  activeIntercomCall: IntercomCall | null;
  incomingIntercomCall: IntercomCall | null;
  isIntercomModalOpen: boolean;

  // Actions
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password?: string, userPreset?: User) => Promise<boolean>;
  logout: () => void;
  registerUser: (data: { name: string; email: string; unit: string; role: Role; phone?: string; password?: string }) => Promise<boolean>;
  setActivePortal: (portal: ActivePortal) => void;
  setActiveCommunityId: (id: string) => void;
  setCurrentUserId: (id: string) => void;
  setActiveView: (view: 'feed' | 'map' | 'admin' | 'analytics' | 'rules' | 'zones') => void;
  setFilterCategory: (cat: Category | 'all') => void;
  setFilterStatus: (st: Status | 'all') => void;
  setFilterZone: (z: string | 'all') => void;
  setFilterUrgency: (urg: Urgency | 'all') => void;
  setSearchQuery: (q: string) => void;
  
  createReport: (data: {
    title: string;
    description: string;
    category: Category;
    zoneId: string;
    subLocationDetail?: string;
    urgency: Urgency;
    visibility: 'publico' | 'anonimo' | 'confidencial';
    evidenceUrls?: { url: string; caption?: string }[];
  }) => Promise<Report>;

  updateReportStatus: (reportId: string, status: Status, note?: string) => void;
  
  assignReport: (
    reportId: string,
    assignee: { id: string; name: string; role: string; phone?: string; company?: string },
    estimatedDate?: string,
    internalNoteText?: string
  ) => void;

  addInternalNote: (reportId: string, text: string) => void;
  
  resolveReport: (
    reportId: string,
    resolutionNote: string,
    evidenceUrls?: { url: string; caption?: string }[]
  ) => void;

  rejectReport: (reportId: string, rejectionReason: string) => void;

  mergeReportsAsDuplicates: (
    masterReportId: string,
    duplicateReportIds: string[],
    broadcastText?: string
  ) => void;

  broadcastCommunityNotice: (reportId: string, text: string) => void;

  addZone: (name: string, code: string, icon?: string, description?: string) => void;
  addRule: (rule: { title: string; description: string; category: Category | 'general'; severity: 'informativa' | 'moderada' | 'estricta' }) => void;
  
  // Chat & Radio Actions
  setIsChatModalOpen: (open: boolean) => void;
  setIsRadioModalOpen: (open: boolean) => void;
  setSelectedChatChannel: (channel: ChatChannelId) => void;
  setActiveRadioChannel: (channelNumber: number) => void;
  
  sendChatMessage: (data: {
    channelId: ChatChannelId;
    text: string;
    audioUrl?: string;
    audioDuration?: number;
    attachmentUrl?: string;
    quickActionType?: 'delivery' | 'visita' | 'paqueteria' | 'alerta' | 'mantencion';
    quickActionData?: Record<string, string>;
  }) => void;

  broadcastRadioTransmission: (data: {
    channelNumber: number;
    transcript: string;
    audioUrl?: string;
    durationSeconds?: number;
    codeCallsign?: string;
  }) => void;

  createQuickAuthorization: (data: {
    type: 'visita' | 'delivery' | 'servicio_tecnico';
    guestName: string;
    vehiclePlate?: string;
    companyOrApp?: string;
    estimatedArrival?: string;
  }) => void;

  updateAuthorizationStatus: (id: string, status: 'pendiente' | 'ingresado' | 'finalizado' | 'rechazado') => void;

  // Vantel Intercom Actions
  setIsIntercomModalOpen: (open: boolean) => void;
  initiateIntercomCall: (targetUnit: string, targetName?: string) => Promise<IntercomCall>;
  answerIntercomCall: (callId: string) => Promise<void>;
  unlockDoor: (callId?: string) => Promise<void>;
  endIntercomCall: (callId?: string) => Promise<void>;
  rejectIntercomCall: (callId: string) => Promise<void>;
  sendIntercomVoiceSnippet: (callId: string, audioUrl: string) => Promise<void>;

  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [communities, setCommunities] = useState<Community[]>(() => storageService.getCommunities());
  const [activeCommunityId, setActiveCommunityIdState] = useState<string>(() => storageService.getActiveCommunityId());
  const [currentUserId, setCurrentUserIdState] = useState<string>(() => storageService.getCurrentUserId());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [reports, setReports] = useState<Report[]>(() => storageService.getReports());
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => storageService.getIsAuthenticated());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Chat & Radio Intercom State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => storageService.getChatMessages());
  const [radioTransmissions, setRadioTransmissions] = useState<RadioTransmission[]>(() => storageService.getRadioTransmissions());
  const [radioChannels] = useState<RadioChannel[]>(INITIAL_RADIO_CHANNELS);
  const [activeRadioChannel, setActiveRadioChannelState] = useState<number>(() => storageService.getActiveRadioChannel());
  const [quickAuthorizations, setQuickAuthorizations] = useState<QuickAuthorization[]>(() => storageService.getQuickAuthorizations());
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isRadioModalOpen, setIsRadioModalOpen] = useState<boolean>(false);
  const [selectedChatChannel, setSelectedChatChannel] = useState<ChatChannelId>('garita');
  const [unreadChatCount, setUnreadChatCount] = useState<number>(1);

  // Vantel Real-Time Intercom State
  const [intercomCalls, setIntercomCalls] = useState<IntercomCall[]>([]);
  const [activeIntercomCall, setActiveIntercomCall] = useState<IntercomCall | null>(null);
  const [incomingIntercomCall, setIncomingIntercomCall] = useState<IntercomCall | null>(null);
  const [isIntercomModalOpen, setIsIntercomModalOpen] = useState<boolean>(false);

  // Portal state
  const [activePortal, setActivePortalState] = useState<ActivePortal>('propietarios');

  // Navigation & Filtering State
  const [activeView, setActiveView] = useState<'feed' | 'map' | 'admin' | 'analytics' | 'rules' | 'zones'>('feed');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterZone, setFilterZone] = useState<string | 'all'>('all');
  const [filterUrgency, setFilterUrgency] = useState<Urgency | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const activeCommunity = useMemo(() => {
    return communities.find((c) => c.id === activeCommunityId) || communities[0];
  }, [communities, activeCommunityId]);

  // Real-time Firebase Firestore synchronization listeners
  useEffect(() => {
    const unsubReports = firebaseService.subscribeToReports(
      activeCommunity.id,
      (firestoreReports) => {
        if (firestoreReports && firestoreReports.length > 0) {
          setReports((prev) => {
            const map = new Map<string, Report>();
            prev.forEach((r) => map.set(r.id, r));
            firestoreReports.forEach((r) => map.set(r.id, r));
            return Array.from(map.values());
          });
          setIsFirebaseActive(true);
        }
      },
      () => {
        setIsFirebaseActive(false);
      }
    );

    const unsubChat = firebaseService.subscribeToChatMessages(
      activeCommunity.id,
      (firestoreMsgs) => {
        if (firestoreMsgs && firestoreMsgs.length > 0) {
          setChatMessages((prev) => {
            const map = new Map<string, ChatMessage>();
            prev.forEach((m) => map.set(m.id, m));
            firestoreMsgs.forEach((m) => map.set(m.id, m));
            return Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      }
    );

    const unsubRadio = firebaseService.subscribeToRadioTransmissions(
      activeCommunity.id,
      (firestoreTxs) => {
        if (firestoreTxs && firestoreTxs.length > 0) {
          setRadioTransmissions((prev) => {
            const map = new Map<string, RadioTransmission>();
            prev.forEach((t) => map.set(t.id, t));
            firestoreTxs.forEach((t) => map.set(t.id, t));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      }
    );

    const unsubAuths = firebaseService.subscribeToQuickAuthorizations(
      activeCommunity.id,
      (firestoreAuths) => {
        if (firestoreAuths && firestoreAuths.length > 0) {
          setQuickAuthorizations((prev) => {
            const map = new Map<string, QuickAuthorization>();
            prev.forEach((a) => map.set(a.id, a));
            firestoreAuths.forEach((a) => map.set(a.id, a));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      }
    );

    const unsubCalls = firebaseService.subscribeToIntercomCalls(
      activeCommunity.id,
      (firestoreCalls) => {
        setIntercomCalls(firestoreCalls);

        // Detect if there is an active incoming call for the current user
        const activeRinging = firestoreCalls.find((call) => {
          if (call.status !== 'ringing') return false;
          // If called target is current user unit
          const isTargetUnit = call.targetUnit.toLowerCase().trim() === currentUser.unit.toLowerCase().trim();
          // Or if called target is Caseta Garita and current user is in booth / guard role
          const isTargetGarita = (call.targetUnit.toLowerCase().includes('garita') || call.targetUnit.toLowerCase().includes('caseta')) &&
            (currentUser.role === 'seguridad' || currentUser.role === 'admin' || activePortal === 'vigilante');

          // Ignore call if it was created by current user
          const isCaller = call.callerId === currentUser.id;

          return (isTargetUnit || isTargetGarita) && !isCaller;
        });

        if (activeRinging) {
          setIncomingIntercomCall(activeRinging);
          audioRadioService.startIntercomRingtoneLoop();
        } else {
          setIncomingIntercomCall(null);
          audioRadioService.stopIntercomRingtoneLoop();
        }

        // Sync active ongoing call if user is participant
        setActiveIntercomCall((prevActive) => {
          if (!prevActive) return null;
          const updated = firestoreCalls.find((c) => c.id === prevActive.id);
          if (!updated || updated.status === 'ended' || updated.status === 'rejected') {
            audioRadioService.stopIntercomRingtoneLoop();
            return null;
          }
          if (updated.status === 'door_unlocked' && prevActive.status !== 'door_unlocked') {
            audioRadioService.playDoorBuzzer();
          }
          return updated;
        });
      }
    );

    return () => {
      if (unsubReports) unsubReports();
      if (unsubChat) unsubChat();
      if (unsubRadio) unsubRadio();
      if (unsubAuths) unsubAuths();
      if (unsubCalls) unsubCalls();
    };
  }, [activeCommunity.id, currentUser.id, currentUser.unit, currentUser.role, activePortal]);

  // Persist changes to LocalStorage
  useEffect(() => {
    storageService.saveReports(reports);
  }, [reports]);

  useEffect(() => {
    storageService.saveCommunities(communities);
  }, [communities]);

  useEffect(() => {
    storageService.saveChatMessages(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    storageService.saveRadioTransmissions(radioTransmissions);
  }, [radioTransmissions]);

  useEffect(() => {
    storageService.saveQuickAuthorizations(quickAuthorizations);
  }, [quickAuthorizations]);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setActivePortal = (portal: ActivePortal) => {
    setActivePortalState(portal);
    showToast('Área Seleccionada', portal === 'propietarios' ? 'Cambiando a Portal de Propietarios' : 'Cambiando a Panel de Administración', 'info');
  };

  const setActiveCommunityId = (id: string) => {
    setActiveCommunityIdState(id);
    storageService.setActiveCommunityId(id);
    showToast('Comunidad Actualizada', `Cambiando a ${communities.find(c => c.id === id)?.name || 'comunidad'}`, 'info');
  };

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    storageService.setCurrentUserId(id);
    const user = users.find((u) => u.id === id);
    if (user) {
      if (user.role === 'admin' || user.role === 'operador' || user.role === 'seguridad') {
        setActivePortalState('admin');
      } else {
        setActivePortalState('propietarios');
      }
      showToast('Perfil Cambiado', `Ahora actuando como ${user.name} (${user.role.toUpperCase()})`, 'info');
    }
  };

  const setActiveRadioChannel = (ch: number) => {
    setActiveRadioChannelState(ch);
    storageService.setActiveRadioChannel(ch);
    audioRadioService.playSquelchNoise(120, 0.1);
  };

  // Filtered reports for active community
  const communityReports = useMemo(() => {
    return reports.filter((r) => r.communityId === activeCommunity.id);
  }, [reports, activeCommunity.id]);

  // Visible reports based on user role & filters
  const filteredReports = useMemo(() => {
    return communityReports.filter((r) => {
      if (r.visibility === 'confidencial' && currentUser.role === 'vecino' && r.reportedBy.id !== currentUser.id) {
        return false;
      }
      if (r.status === 'duplicado') {
        return false;
      }
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterZone !== 'all' && r.zoneId !== filterZone) return false;
      if (filterUrgency !== 'all' && r.urgency !== filterUrgency) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchCode = r.code.toLowerCase().includes(q);
        const matchZone = activeCommunity.zones.find((z) => z.id === r.zoneId)?.name.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchCode || matchZone;
      }

      return true;
    });
  }, [communityReports, currentUser, filterCategory, filterStatus, filterZone, filterUrgency, searchQuery, activeCommunity.zones]);

  // AI Cluster Suggestions
  const clusterSuggestions = useMemo(() => {
    return clusteringService.detectClusters(communityReports, activeCommunity.id);
  }, [communityReports, activeCommunity.id]);

  // Auth Operations
  const login = async (email: string, password?: string, userPreset?: User): Promise<boolean> => {
    try {
      if (userPreset) {
        storageService.addUser(userPreset);
        setUsers(storageService.getUsers());
        setCurrentUserId(userPreset.id);
        setIsAuthenticatedState(true);
        storageService.setIsAuthenticated(true);
        showToast('Bienvenido', `Sesión iniciada como ${userPreset.name}`, 'success');
        return true;
      }

      const fbUser = await firebaseService.loginWithEmail(email, password || 'demo123');
      if (fbUser) {
        let matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!matchedUser) {
          matchedUser = {
            id: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0],
            email: fbUser.email || email,
            role: email.includes('admin') ? 'admin' : email.includes('seguridad') ? 'seguridad' : 'vecino',
            unit: 'Unidad Registrada',
          };
          storageService.addUser(matchedUser);
          setUsers(storageService.getUsers());
        }
        setCurrentUserId(matchedUser.id);
        setIsAuthenticatedState(true);
        storageService.setIsAuthenticated(true);
        showToast('Autenticación Exitosa', `Bienvenido(a) ${matchedUser.name}`, 'success');
        return true;
      }
      return false;
    } catch {
      const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUserId(matched.id);
        setIsAuthenticatedState(true);
        storageService.setIsAuthenticated(true);
        showToast('Modo Offline Activo', `Sesión local como ${matched.name}`, 'info');
        return true;
      }
      showToast('Error de Autenticación', 'Credenciales no válidas', 'error');
      return false;
    }
  };

  const logout = () => {
    firebaseService.logoutUser();
    setIsAuthenticatedState(false);
    storageService.setIsAuthenticated(false);
    showToast('Sesión Cerrada', 'Has salido del sistema de forma segura', 'info');
  };

  const registerUser = async (data: { name: string; email: string; unit: string; role: Role; phone?: string; password?: string }): Promise<boolean> => {
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        unit: data.unit,
        role: data.role,
        phone: data.phone,
      };

      try {
        await firebaseService.registerWithEmail(data.email, data.password || 'vecino123', data.name);
      } catch (fbErr) {
        console.warn('Firebase register fallback to local:', fbErr);
      }

      storageService.addUser(newUser);
      setUsers(storageService.getUsers());
      setCurrentUserId(newUser.id);
      setIsAuthenticatedState(true);
      storageService.setIsAuthenticated(true);
      showToast('Registro Completado', `Tu cuenta como residente de ${data.unit} ha sido creada.`, 'success');
      return true;
    } catch {
      showToast('Error de Registro', 'No se pudo crear la cuenta', 'error');
      return false;
    }
  };

  // Create Report
  const createReport = async (data: {
    title: string;
    description: string;
    category: Category;
    zoneId: string;
    subLocationDetail?: string;
    urgency: Urgency;
    visibility: 'publico' | 'anonimo' | 'confidencial';
    evidenceUrls?: { url: string; caption?: string }[];
  }): Promise<Report> => {
    const timestamp = new Date().toISOString();
    const calculatedPriority = calculateReportPriority(data.category, data.urgency, timestamp, 0);
    const countInYear = reports.length + 1;
    const code = `REP-2026-${String(countInYear).padStart(3, '0')}`;

    const evidenceList: ReportEvidence[] = (data.evidenceUrls || []).map((ev, idx) => ({
      id: `ev-${Date.now()}-${idx}`,
      url: ev.url,
      caption: ev.caption,
      uploadedAt: timestamp,
      uploadedByRole: currentUser.role,
    }));

    const newAuditLog: AuditLog = {
      id: `log-${Date.now()}`,
      reportId: `rep-${Date.now()}`,
      timestamp,
      actorName: data.visibility === 'anonimo' ? 'Vecino Anónimo' : currentUser.name,
      actorRole: currentUser.role,
      action: 'Creación de Reporte',
      newValue: 'Nuevo',
    };

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      code,
      communityId: activeCommunity.id,
      title: data.title,
      description: data.description,
      category: data.category,
      zoneId: data.zoneId,
      subLocationDetail: data.subLocationDetail,
      urgency: data.urgency,
      calculatedPriority,
      status: 'nuevo',
      visibility: data.visibility,
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        unit: currentUser.unit,
        isAnonymous: data.visibility === 'anonimo',
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      evidence: evidenceList,
      internalNotes: [],
      auditLogs: [newAuditLog],
    };

    setReports((prev) => [newReport, ...prev]);

    try {
      await firebaseService.saveReport(newReport);
    } catch (e) {
      console.warn('Firebase report save fallback:', e);
    }

    showToast('Reporte Registrado', `Caso ${code} ingresado y priorizado con éxito.`, 'success');
    return newReport;
  };

  // Update Status
  const updateReportStatus = (reportId: string, status: Status, note?: string) => {
    const timestamp = new Date().toISOString();
    let updatedReport: Report | null = null;

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          reportId,
          timestamp,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: `Cambio de Estado a "${status.toUpperCase()}"`,
          previousValue: r.status,
          newValue: status,
          note,
        };
        const updated = {
          ...r,
          status,
          updatedAt: timestamp,
          auditLogs: [newLog, ...r.auditLogs],
        };
        updatedReport = updated;
        return updated;
      })
    );

    if (updatedReport) {
      firebaseService.saveReport(updatedReport);
    }
    showToast('Estado Actualizado', `El caso ahora figura como ${status.toUpperCase()}`, 'info');
  };

  // Assign Report
  const assignReport = (
    reportId: string,
    assignee: { id: string; name: string; role: string; phone?: string; company?: string },
    estimatedDate?: string,
    internalNoteText?: string
  ) => {
    const timestamp = new Date().toISOString();
    let updatedReport: Report | null = null;

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          reportId,
          timestamp,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: `Asignado a ${assignee.name} (${assignee.role})`,
          previousValue: r.assignee ? r.assignee.name : 'Sin asignar',
          newValue: assignee.name,
          note: estimatedDate ? `Fecha estimada de solución: ${new Date(estimatedDate).toLocaleDateString()}` : undefined,
        };

        const notes = [...r.internalNotes];
        if (internalNoteText) {
          notes.unshift({
            id: `note-${Date.now()}`,
            authorName: currentUser.name,
            authorRole: currentUser.role,
            text: `[Asignación] ${internalNoteText}`,
            createdAt: timestamp,
          });
        }

        const updated: Report = {
          ...r,
          status: 'asignado' as Status,
          assignee,
          estimatedResolutionDate: estimatedDate,
          updatedAt: timestamp,
          internalNotes: notes,
          auditLogs: [newLog, ...r.auditLogs],
        };
        updatedReport = updated;
        return updated;
      })
    );

    if (updatedReport) {
      firebaseService.saveReport(updatedReport);
    }
    showToast('Responsable Asignado', `Caso asignado a ${assignee.name}`, 'success');
  };

  // Internal Note
  const addInternalNote = (reportId: string, text: string) => {
    const timestamp = new Date().toISOString();
    let updatedReport: Report | null = null;

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const newNote: InternalNote = {
          id: `note-${Date.now()}`,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          text,
          createdAt: timestamp,
        };
        const updated = {
          ...r,
          internalNotes: [newNote, ...r.internalNotes],
        };
        updatedReport = updated;
        return updated;
      })
    );

    if (updatedReport) {
      firebaseService.saveReport(updatedReport);
    }
    showToast('Nota Interna Guardada', 'Visible únicamente para el equipo administrativo', 'info');
  };

  // Resolve report
  const resolveReport = (
    reportId: string,
    resolutionNote: string,
    evidenceUrls?: { url: string; caption?: string }[]
  ) => {
    const timestamp = new Date().toISOString();
    const resolutionEvidence: ReportEvidence[] = (evidenceUrls || []).map((ev, idx) => ({
      id: `ev-res-${reportId}-${idx}`,
      url: ev.url,
      caption: ev.caption || 'Evidencia de resolución técnica',
      uploadedAt: timestamp,
      uploadedByRole: currentUser.role,
      isResolution: true,
    }));

    let updatedReport: Report | null = null;

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          reportId,
          timestamp,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: 'Caso Resuelto y Cerrado',
          previousValue: r.status,
          newValue: 'resuelto',
          note: resolutionNote,
        };

        const updated: Report = {
          ...r,
          status: 'resuelto' as Status,
          resolutionNote,
          resolutionEvidence: [...(r.resolutionEvidence || []), ...resolutionEvidence],
          updatedAt: timestamp,
          auditLogs: [newLog, ...r.auditLogs],
        };
        updatedReport = updated;
        return updated;
      })
    );

    if (updatedReport) {
      firebaseService.saveReport(updatedReport);
    }
    showToast('Caso Resuelto', 'Se ha registrado la solución y evidencia de cierre.', 'success');
  };

  // Reject report
  const rejectReport = (reportId: string, rejectionReason: string) => {
    const timestamp = new Date().toISOString();
    let updatedReport: Report | null = null;

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          reportId,
          timestamp,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: 'Reporte Rechazado',
          previousValue: r.status,
          newValue: 'rechazado',
          note: `Motivo: ${rejectionReason}`,
        };

        const updated: Report = {
          ...r,
          status: 'rechazado' as Status,
          rejectionReason,
          updatedAt: timestamp,
          auditLogs: [newLog, ...r.auditLogs],
        };
        updatedReport = updated;
        return updated;
      })
    );

    if (updatedReport) {
      firebaseService.saveReport(updatedReport);
    }
    showToast('Reporte Rechazado', 'Se registró el motivo visible para transparencia.', 'warning');
  };

  // Merge reports
  const mergeReportsAsDuplicates = (
    masterReportId: string,
    duplicateReportIds: string[],
    broadcastText?: string
  ) => {
    const timestamp = new Date().toISOString();
    const zoneName = activeCommunity.zones.find((z) => z.id === reports.find((r) => r.id === masterReportId)?.zoneId)?.name || 'Zona Común';

    setReports((prev) => {
      const master = prev.find((r) => r.id === masterReportId);
      if (!master) return prev;

      const totalDups = (master.duplicateCount || 0) + duplicateReportIds.length;
      const updatedPriority = calculateReportPriority(
        master.category,
        master.urgency,
        master.createdAt,
        totalDups
      );

      const generatedBroadcast = broadcastText || clusteringService.generateNeutralBroadcast(master, zoneName);

      return prev.map((r) => {
        if (r.id === masterReportId) {
          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            reportId: masterReportId,
            timestamp,
            actorName: currentUser.name,
            actorRole: currentUser.role,
            action: `Agrupación de ${duplicateReportIds.length} reportes duplicados`,
            note: `Nueva prioridad recalculada: ${updatedPriority.level.toUpperCase()} (${updatedPriority.score} pts)`,
          };

          const updated: Report = {
            ...r,
            isMasterCluster: true,
            duplicateCount: totalDups,
            linkedReportIds: Array.from(new Set([...(r.linkedReportIds || []), ...duplicateReportIds])),
            calculatedPriority: updatedPriority,
            updatedAt: timestamp,
            communityBroadcast: {
              generatedByAI: true,
              text: generatedBroadcast,
              broadcastedAt: timestamp,
            },
            auditLogs: [newLog, ...r.auditLogs],
          };
          firebaseService.saveReport(updated);
          return updated;
        }

        if (duplicateReportIds.includes(r.id)) {
          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            reportId: r.id,
            timestamp,
            actorName: currentUser.name,
            actorRole: currentUser.role,
            action: `Vinculado como Duplicado a ${master.code}`,
            previousValue: r.status,
            newValue: 'duplicado',
          };

          const updated: Report = {
            ...r,
            status: 'duplicado' as Status,
            parentClusterId: masterReportId,
            updatedAt: timestamp,
            auditLogs: [newLog, ...r.auditLogs],
          };
          firebaseService.saveReport(updated);
          return updated;
        }

        return r;
      });
    });

    showToast('Agrupación Exitosa', `Se han consolidado ${duplicateReportIds.length} reportes en el caso matriz.`, 'success');
  };

  // Broadcast community notice
  const broadcastCommunityNotice = (reportId: string, text: string) => {
    const timestamp = new Date().toISOString();
    let updatedReport: Report | null = null;

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const updated = {
          ...r,
          communityBroadcast: {
            generatedByAI: false,
            text,
            broadcastedAt: timestamp,
          },
          updatedAt: timestamp,
        };
        updatedReport = updated;
        return updated;
      })
    );

    if (updatedReport) {
      firebaseService.saveReport(updatedReport);
    }
    showToast('Aviso Comunitario Publicado', 'Visible para todos los vecinos en la tarjeta del caso.', 'info');
  };

  // Add Zone
  const addZone = (name: string, code: string, icon: string = 'Building2', description?: string) => {
    const newZone = {
      id: `z-${Date.now()}`,
      name,
      code,
      icon,
      description,
    };
    setCommunities((prev) =>
      prev.map((c) => (c.id === activeCommunity.id ? { ...c, zones: [...c.zones, newZone] } : c))
    );
    showToast('Zona Agregada', `Sector "${name}" añadido al catálogo.`, 'success');
  };

  // Add Rule
  const addRule = (rule: { title: string; description: string; category: Category | 'general'; severity: 'informativa' | 'moderada' | 'estricta' }) => {
    const newRule = {
      id: `r-${Date.now()}`,
      ...rule,
    };
    setCommunities((prev) =>
      prev.map((c) => (c.id === activeCommunity.id ? { ...c, rules: [...c.rules, newRule] } : c))
    );
    showToast('Regla de Convivencia Agregada', `"${rule.title}" incorporada al decálogo.`, 'success');
  };

  // ==========================================
  // CHAT & CITOFONÍA ACTIONS
  // ==========================================
  const sendChatMessage = (data: {
    channelId: ChatChannelId;
    text: string;
    audioUrl?: string;
    audioDuration?: number;
    attachmentUrl?: string;
    quickActionType?: 'delivery' | 'visita' | 'paqueteria' | 'alerta' | 'mantencion';
    quickActionData?: Record<string, string>;
  }) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      communityId: activeCommunity.id,
      channelId: data.channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderUnit: currentUser.unit,
      text: data.text,
      audioUrl: data.audioUrl,
      audioDuration: data.audioDuration,
      attachmentUrl: data.attachmentUrl,
      quickActionType: data.quickActionType,
      quickActionData: data.quickActionData,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    audioRadioService.playIntercomChime();

    // Sync to Firestore in real-time
    firebaseService.saveChatMessage(newMsg);

    // Auto-reply simulation from Juan Pérez (Conserje) if sent to Garita by resident
    if (data.channelId === 'garita' && currentUser.role === 'vecino') {
      setTimeout(() => {
        let replyText = 'Copiado estimado vecino, tomo nota de inmediato.';
        if (data.quickActionType === 'delivery') {
          replyText = `🚚 Entendido ${currentUser.name}. Anotado delivery de ${data.quickActionData?.app || 'reparto'}. Se le dará acceso controlado.`;
        } else if (data.quickActionType === 'visita') {
          replyText = `🚗 Perfecto. Autorización registrada para ${data.quickActionData?.visita || 'visita'}. Estacionamiento de visitas habilitado.`;
        } else if (data.quickActionType === 'alerta') {
          replyText = `🚨 ¡Alerta recibida en caseta central! Juan Pérez acudiendo a verificar de inmediato.`;
        }

        const autoReply: ChatMessage = {
          id: `msg-${Date.now()}-guard`,
          communityId: activeCommunity.id,
          channelId: 'garita',
          senderId: 'user-seguridad-1',
          senderName: 'Juan Pérez (Conserjería)',
          senderRole: 'seguridad',
          senderUnit: 'Caseta Central',
          text: replyText,
          createdAt: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, autoReply]);
        firebaseService.saveChatMessage(autoReply);
        audioRadioService.playIntercomChime();
        setUnreadChatCount((prev) => prev + 1);
      }, 2500);
    }
  };

  // ==========================================
  // RADIO TRANSMISSION ACTIONS
  // ==========================================
  const broadcastRadioTransmission = (data: {
    channelNumber: number;
    transcript: string;
    audioUrl?: string;
    durationSeconds?: number;
    codeCallsign?: string;
  }) => {
    const channel = radioChannels.find((c) => c.number === data.channelNumber) || radioChannels[0];
    const callsign = data.codeCallsign || (currentUser.role === 'seguridad' ? 'GARITA-01' : currentUser.role === 'admin' ? 'ADMIN-01' : `UNIDAD-${currentUser.unit.replace(/[^0-9]/g, '') || 'VECINO'}`);

    const newTx: RadioTransmission = {
      id: `tx-${Date.now()}`,
      communityId: activeCommunity.id,
      channelNumber: data.channelNumber,
      channelFrequency: channel.frequency,
      channelName: channel.name,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderUnit: currentUser.unit,
      audioUrl: data.audioUrl,
      durationSeconds: data.durationSeconds || 3,
      transcript: data.transcript,
      codeCallsign: callsign,
      signalStrength: 5,
      createdAt: new Date().toISOString(),
    };

    setRadioTransmissions((prev) => [newTx, ...prev]);

    // Sync to Firestore in real-time
    firebaseService.saveRadioTransmission(newTx);

    // Simulated radio guard back-and-forth response on Channel 1 (Garita)
    if (data.channelNumber === 1 && currentUser.role !== 'seguridad') {
      setTimeout(() => {
        const guardTx: RadioTransmission = {
          id: `tx-${Date.now()}-guard`,
          communityId: activeCommunity.id,
          channelNumber: 1,
          channelFrequency: channel.frequency,
          channelName: channel.name,
          senderId: 'user-seguridad-1',
          senderName: 'Juan Pérez (Guardia)',
          senderRole: 'seguridad',
          senderUnit: 'Caseta Central',
          durationSeconds: 3,
          transcript: `10-4 ${callsign}. Garita Central copiado y registrado en bitácora. QAP.`,
          codeCallsign: 'GARITA-01',
          signalStrength: 5,
          createdAt: new Date().toISOString(),
        };
        setRadioTransmissions((prev) => [guardTx, ...prev]);
        firebaseService.saveRadioTransmission(guardTx);
        audioRadioService.playRogerBeep();
      }, 3500);
    } else if (data.channelNumber === 3) {
      audioRadioService.playEmergencyAlertTone();
    }
  };

  // ==========================================
  // QUICK AUTHORIZATION ACTIONS
  // ==========================================
  const createQuickAuthorization = (data: {
    type: 'visita' | 'delivery' | 'servicio_tecnico';
    guestName: string;
    vehiclePlate?: string;
    companyOrApp?: string;
    estimatedArrival?: string;
  }) => {
    const newAuth: QuickAuthorization = {
      id: `auth-${Date.now()}`,
      communityId: activeCommunity.id,
      unit: currentUser.unit,
      residentName: currentUser.name,
      type: data.type,
      guestName: data.guestName,
      vehiclePlate: data.vehiclePlate,
      companyOrApp: data.companyOrApp,
      estimatedArrival: data.estimatedArrival || 'En camino',
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    setQuickAuthorizations((prev) => [newAuth, ...prev]);
    firebaseService.saveQuickAuthorization(newAuth);

    // Automatically send to Garita chat
    const typeLabel = data.type === 'delivery' ? '🚚 Delivery' : data.type === 'visita' ? '🚗 Visita' : '🛠️ Servicio Técnico';
    sendChatMessage({
      channelId: 'garita',
      text: `${typeLabel} Autorizado: ${data.guestName} ${data.vehiclePlate ? `(Patente: ${data.vehiclePlate})` : ''} ${data.companyOrApp ? `[${data.companyOrApp}]` : ''} - Llegada estimada: ${data.estimatedArrival || 'Inmediata'}.`,
      quickActionType: data.type === 'delivery' ? 'delivery' : 'visita',
      quickActionData: {
        tipo: data.type,
        nombre: data.guestName,
        patente: data.vehiclePlate || '',
        app: data.companyOrApp || '',
      },
    });

    showToast('Autorización Enviada a Garita', `Guardia notificado para el acceso de ${data.guestName}`, 'success');
  };

  const updateAuthorizationStatus = (id: string, status: 'pendiente' | 'ingresado' | 'finalizado' | 'rechazado') => {
    setQuickAuthorizations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, status };
          firebaseService.saveQuickAuthorization(updated);
          return updated;
        }
        return a;
      })
    );
    showToast('Estado de Acceso', `Pase de ingreso marcado como "${status.toUpperCase()}"`, 'info');
  };

  // ==========================================
  // REAL-TIME VANTEL CITOFONO / INTERCOM ACTIONS
  // ==========================================
  const initiateIntercomCall = async (targetUnit: string, targetName?: string): Promise<IntercomCall> => {
    audioRadioService.playDtmfTone('9');
    setTimeout(() => {
      audioRadioService.playTelephoneRing();
    }, 150);

    const newCall: IntercomCall = {
      id: `call-${Date.now()}`,
      communityId: activeCommunity.id,
      callerId: currentUser.id,
      callerName: currentUser.name,
      callerRole: currentUser.role,
      callerUnit: currentUser.unit,
      targetUnit: targetUnit.trim(),
      targetName: targetName || targetUnit,
      status: 'ringing',
      createdAt: new Date().toISOString(),
    };

    setActiveIntercomCall(newCall);
    setIsIntercomModalOpen(true);
    await firebaseService.saveIntercomCall(newCall);

    showToast('Llamando por Citófono', `Conectando con ${targetUnit}...`, 'info');
    return newCall;
  };

  const answerIntercomCall = async (callId: string): Promise<void> => {
    audioRadioService.stopIntercomRingtoneLoop();
    audioRadioService.playCallConnectedTone();

    await firebaseService.updateIntercomCallStatus(callId, 'connected', {
      answeredAt: new Date().toISOString(),
    });

    const current = intercomCalls.find((c) => c.id === callId);
    if (current) {
      setActiveIntercomCall({ ...current, status: 'connected', answeredAt: new Date().toISOString() });
    }
    setIncomingIntercomCall(null);
    setIsIntercomModalOpen(true);
    showToast('Citófono Conectado', 'Llamada de voz en vivo establecida.', 'success');
  };

  const unlockDoor = async (callId?: string): Promise<void> => {
    audioRadioService.playDoorBuzzer();

    const targetCallId = callId || activeIntercomCall?.id;
    if (targetCallId) {
      await firebaseService.updateIntercomCallStatus(targetCallId, 'door_unlocked', {
        doorUnlockedAt: new Date().toISOString(),
      });
    }

    sendChatMessage({
      channelId: 'garita',
      text: `🔓 [APERTURA REMOTA DE ACCESO]: ${currentUser.name} (${currentUser.unit}) ha abierto la puerta principal/portón desde su citófono.`,
      quickActionType: 'delivery',
    });

    showToast('🚪 ¡Acceso Concedido!', 'Puerta peatonal / portón abierto exitosamente.', 'success');
  };

  const endIntercomCall = async (callId?: string): Promise<void> => {
    audioRadioService.stopIntercomRingtoneLoop();
    audioRadioService.playCallEndedTone();

    const targetCallId = callId || activeIntercomCall?.id;
    if (targetCallId) {
      await firebaseService.updateIntercomCallStatus(targetCallId, 'ended', {
        endedAt: new Date().toISOString(),
      });
    }

    setActiveIntercomCall(null);
    setIncomingIntercomCall(null);
    setIsIntercomModalOpen(false);
  };

  const rejectIntercomCall = async (callId: string): Promise<void> => {
    audioRadioService.stopIntercomRingtoneLoop();
    audioRadioService.playCallEndedTone();

    await firebaseService.updateIntercomCallStatus(callId, 'rejected', {
      endedAt: new Date().toISOString(),
    });

    setIncomingIntercomCall(null);
    if (activeIntercomCall?.id === callId) {
      setActiveIntercomCall(null);
    }
  };

  const sendIntercomVoiceSnippet = async (callId: string, audioUrl: string): Promise<void> => {
    await firebaseService.updateIntercomCallStatus(callId, 'connected', {
      lastVoiceSnippet: audioUrl,
      lastVoiceSender: currentUser.name,
      lastVoiceTimestamp: new Date().toISOString(),
    });
  };

  // Reset to default
  const resetAllData = () => {
    storageService.resetToDefault();
    setCommunities(storageService.getCommunities());
    setReports(storageService.getReports());
    setChatMessages(storageService.getChatMessages());
    setRadioTransmissions(storageService.getRadioTransmissions());
    setQuickAuthorizations(storageService.getQuickAuthorizations());
    setActiveRadioChannelState(1);
    setActiveCommunityIdState('comm-1');
    setCurrentUserIdState('user-vecino-1');
    setActivePortalState('propietarios');
    showToast('Datos Restablecidos', 'Se han restaurado los datos de demostración originales.', 'info');
  };

  return (
    <CommunityContext.Provider
      value={{
        communities,
        activeCommunity,
        currentUser,
        users,
        reports: filteredReports,
        allReports: communityReports,
        activePortal,
        activeView,
        filterCategory,
        filterStatus,
        filterZone,
        filterUrgency,
        searchQuery,
        clusterSuggestions,
        toasts,
        isFirebaseActive,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        logout,
        registerUser,
        setActivePortal,
        setActiveCommunityId,
        setCurrentUserId,
        setActiveView,
        setFilterCategory,
        setFilterStatus,
        setFilterZone,
        setFilterUrgency,
        setSearchQuery,
        createReport,
        updateReportStatus,
        assignReport,
        addInternalNote,
        resolveReport,
        rejectReport,
        mergeReportsAsDuplicates,
        broadcastCommunityNotice,
        addZone,
        addRule,
        
        // Chat & Radio
        chatMessages,
        radioTransmissions,
        radioChannels,
        activeRadioChannel,
        quickAuthorizations,
        isChatModalOpen,
        isRadioModalOpen,
        selectedChatChannel,
        unreadChatCount,
        setIsChatModalOpen,
        setIsRadioModalOpen,
        setSelectedChatChannel,
        setActiveRadioChannel,
        sendChatMessage,
        broadcastRadioTransmission,
        createQuickAuthorization,
        updateAuthorizationStatus,

        // Vantel Intercom Calls
        intercomCalls,
        activeIntercomCall,
        incomingIntercomCall,
        isIntercomModalOpen,
        setIsIntercomModalOpen,
        initiateIntercomCall,
        answerIntercomCall,
        unlockDoor,
        endIntercomCall,
        rejectIntercomCall,
        sendIntercomVoiceSnippet,

        showToast,
        removeToast,
        resetAllData,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
