import { db, storage, auth } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { Report, ChatMessage, RadioTransmission, QuickAuthorization, IntercomCall } from '../types';

const COLLECTIONS = {
  REPORTS: 'ojovecino_reports',
  COMMUNITIES: 'ojovecino_communities',
  CHAT_MESSAGES: 'ojovecino_chat_messages',
  RADIO_TRANSMISSIONS: 'ojovecino_radio_transmissions',
  AUTHORIZATIONS: 'ojovecino_quick_authorizations',
  INTERCOM_CALLS: 'ojovecino_intercom_calls',
};

// Remove undefined fields before writing to Firestore to avoid errors
function cleanForFirestore<T>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  if (!data || typeof data !== 'object') return clean;
  
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) {
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = cleanForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

export const firebaseService = {
  /**
   * Suscribe en tiempo real a los reportes en Firestore.
   */
  subscribeToReports(
    communityId: string,
    onSuccess: (reports: Report[]) => void,
    onError?: (err: any) => void
  ) {
    try {
      const reportsRef = collection(db, COLLECTIONS.REPORTS);

      return onSnapshot(
        reportsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const reports: Report[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Report;
              if (!communityId || data.communityId === communityId) {
                reports.push(data);
              }
            });
            reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            onSuccess(reports);
          }
        },
        (error) => {
          console.warn('Firestore subscription fallback:', error.message);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Firestore not ready, running offline mode:', err);
      return () => {};
    }
  },

  /**
   * Guarda un reporte en Firestore.
   */
  async saveReport(report: Report): Promise<void> {
    try {
      const reportRef = doc(db, COLLECTIONS.REPORTS, report.id);
      const cleanData = cleanForFirestore(report);
      await setDoc(reportRef, cleanData, { merge: true });
      console.log('Report saved to Firestore:', report.id);
    } catch (err) {
      console.warn('Could not save to Firestore (offline/rules):', err);
    }
  },

  /**
   * Actualiza campos de un reporte en Firestore.
   */
  async updateReport(reportId: string, updates: Partial<Report>): Promise<void> {
    try {
      const reportRef = doc(db, COLLECTIONS.REPORTS, reportId);
      const cleanData = cleanForFirestore(updates);
      await updateDoc(reportRef, cleanData);
      console.log('Report updated in Firestore:', reportId);
    } catch (err) {
      console.warn('Could not update in Firestore:', err);
    }
  },

  // ==========================================
  // REAL-TIME CHAT & CITOFONÍA FIRESTORE
  // ==========================================
  subscribeToChatMessages(
    communityId: string,
    onSuccess: (messages: ChatMessage[]) => void,
    onError?: (err: any) => void
  ) {
    try {
      const chatRef = collection(db, COLLECTIONS.CHAT_MESSAGES);

      return onSnapshot(
        chatRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as ChatMessage;
              if (!communityId || data.communityId === communityId) {
                msgs.push(data);
              }
            });
            msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            onSuccess(msgs);
          }
        },
        (error) => {
          console.warn('Firestore chat listener error:', error.message);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Firestore chat not initialized:', err);
      return () => {};
    }
  },

  async saveChatMessage(message: ChatMessage): Promise<void> {
    try {
      const msgRef = doc(db, COLLECTIONS.CHAT_MESSAGES, message.id);
      const cleanData = cleanForFirestore(message);
      await setDoc(msgRef, cleanData, { merge: true });
      console.log('Chat message synced to Firestore:', message.id);
    } catch (err) {
      console.warn('Could not sync chat message to Firestore:', err);
    }
  },

  // ==========================================
  // REAL-TIME RADIO TRANSMISSIONS FIRESTORE
  // ==========================================
  subscribeToRadioTransmissions(
    communityId: string,
    onSuccess: (transmissions: RadioTransmission[]) => void,
    onError?: (err: any) => void
  ) {
    try {
      const radioRef = collection(db, COLLECTIONS.RADIO_TRANSMISSIONS);

      return onSnapshot(
        radioRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const txs: RadioTransmission[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as RadioTransmission;
              if (!communityId || data.communityId === communityId) {
                txs.push(data);
              }
            });
            txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            onSuccess(txs);
          }
        },
        (error) => {
          console.warn('Firestore radio listener error:', error.message);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Firestore radio not initialized:', err);
      return () => {};
    }
  },

  async saveRadioTransmission(transmission: RadioTransmission): Promise<void> {
    try {
      const txRef = doc(db, COLLECTIONS.RADIO_TRANSMISSIONS, transmission.id);
      const cleanData = cleanForFirestore(transmission);
      await setDoc(txRef, cleanData, { merge: true });
      console.log('Radio transmission synced to Firestore:', transmission.id);
    } catch (err) {
      console.warn('Could not sync radio transmission to Firestore:', err);
    }
  },

  // ==========================================
  // QUICK AUTHORIZATIONS FIRESTORE
  // ==========================================
  subscribeToQuickAuthorizations(
    communityId: string,
    onSuccess: (auths: QuickAuthorization[]) => void,
    onError?: (err: any) => void
  ) {
    try {
      const authRef = collection(db, COLLECTIONS.AUTHORIZATIONS);

      return onSnapshot(
        authRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const auths: QuickAuthorization[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as QuickAuthorization;
              if (!communityId || data.communityId === communityId) {
                auths.push(data);
              }
            });
            auths.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            onSuccess(auths);
          }
        },
        (error) => {
          console.warn('Firestore authorizations listener error:', error.message);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Firestore authorizations not initialized:', err);
      return () => {};
    }
  },

  async saveQuickAuthorization(auth: QuickAuthorization): Promise<void> {
    try {
      const authRef = doc(db, COLLECTIONS.AUTHORIZATIONS, auth.id);
      const cleanData = cleanForFirestore(auth);
      await setDoc(authRef, cleanData, { merge: true });
      console.log('Authorization synced to Firestore:', auth.id);
    } catch (err) {
      console.warn('Could not sync authorization to Firestore:', err);
    }
  },

  // ==========================================
  // REAL-TIME VANTEL INTERCOM CALLS FIRESTORE
  // ==========================================
  subscribeToIntercomCalls(
    communityId: string,
    onSuccess: (calls: IntercomCall[]) => void,
    onError?: (err: any) => void
  ) {
    try {
      const callsRef = collection(db, COLLECTIONS.INTERCOM_CALLS);

      return onSnapshot(
        callsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const calls: IntercomCall[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as IntercomCall;
              if (!communityId || data.communityId === communityId) {
                calls.push(data);
              }
            });
            calls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            onSuccess(calls);
          } else {
            onSuccess([]);
          }
        },
        (error) => {
          console.warn('Firestore intercom calls listener error:', error.message);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Firestore intercom calls not initialized:', err);
      return () => {};
    }
  },

  async saveIntercomCall(call: IntercomCall): Promise<void> {
    try {
      const callRef = doc(db, COLLECTIONS.INTERCOM_CALLS, call.id);
      const cleanData = cleanForFirestore(call);
      await setDoc(callRef, cleanData, { merge: true });
      console.log('Intercom call synced to Firestore:', call.id);
    } catch (err) {
      console.warn('Could not sync intercom call to Firestore:', err);
    }
  },

  async updateIntercomCallStatus(
    callId: string,
    status: IntercomCall['status'],
    extraData?: Partial<IntercomCall>
  ): Promise<void> {
    try {
      const callRef = doc(db, COLLECTIONS.INTERCOM_CALLS, callId);
      const payload: Record<string, any> = {
        status,
        ...extraData,
      };
      if (status === 'connected' && !extraData?.answeredAt) {
        payload.answeredAt = new Date().toISOString();
      }
      if ((status === 'ended' || status === 'rejected') && !extraData?.endedAt) {
        payload.endedAt = new Date().toISOString();
      }
      if (status === 'door_unlocked' && !extraData?.doorUnlockedAt) {
        payload.doorUnlockedAt = new Date().toISOString();
      }
      const cleanData = cleanForFirestore(payload);
      await setDoc(callRef, cleanData, { merge: true });
      console.log('Intercom call status updated:', callId, status);
    } catch (err) {
      console.warn('Could not update intercom call status:', err);
    }
  },

  /**
   * Sube una foto a Firebase Storage y retorna su URL pública.
   */
  async uploadPhoto(file: Blob, fileName: string): Promise<string> {
    try {
      const storageRef = ref(storage, `evidence/${Date.now()}_${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload error:', err);
      throw err;
    }
  },

  /**
   * Iniciar sesión con Correo y Contraseña en Firebase Auth
   */
  async loginWithEmail(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.warn('Firebase Auth Login note:', error.message);
      throw error;
    }
  },

  /**
   * Registrar nuevo usuario en Firebase Auth
   */
  async registerWithEmail(email: string, password: string, displayName: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return userCredential.user;
    } catch (error: any) {
      console.warn('Firebase Auth Register note:', error.message);
      throw error;
    }
  },

  /**
   * Cerrar sesión en Firebase Auth
   */
  async logoutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.warn('Firebase Auth SignOut error:', error.message);
    }
  },

  /**
   * Listener de cambio de estado en Firebase Auth
   */
  onAuthChange(callback: (user: FirebaseUser | null) => void) {
    try {
      return onAuthStateChanged(auth, callback);
    } catch (e) {
      console.warn('Firebase Auth listener fallback:', e);
      return () => {};
    }
  }
};
