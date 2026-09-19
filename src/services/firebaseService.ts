import { db, storage, auth } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  limit,
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
import { Report, ChatMessage, RadioTransmission, QuickAuthorization } from '../types';

const COLLECTIONS = {
  REPORTS: 'reports',
  COMMUNITIES: 'communities',
  CHAT_MESSAGES: 'chat_messages',
  RADIO_TRANSMISSIONS: 'radio_transmissions',
  AUTHORIZATIONS: 'quick_authorizations',
};

export const firebaseService = {
  /**
   * Suscribe en tiempo real a los reportes de una comunidad en Firestore.
   */
  subscribeToReports(
    communityId: string,
    onSuccess: (reports: Report[]) => void,
    onError?: (err: any) => void
  ) {
    try {
      const reportsRef = collection(db, COLLECTIONS.REPORTS);
      const q = query(reportsRef, where('communityId', '==', communityId));

      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const reports: Report[] = [];
            snapshot.forEach((docSnap) => {
              reports.push(docSnap.data() as Report);
            });
            reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            onSuccess(reports);
          }
        },
        (error) => {
          console.warn('Firestore subscription fallback to local:', error.message);
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
      await setDoc(reportRef, report, { merge: true });
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
      await updateDoc(reportRef, updates as any);
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
      const q = query(chatRef, where('communityId', '==', communityId));

      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
              msgs.push(docSnap.data() as ChatMessage);
            });
            msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            onSuccess(msgs);
          }
        },
        (error) => {
          console.warn('Firestore chat listener fallback:', error.message);
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
      await setDoc(msgRef, message, { merge: true });
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
      const q = query(radioRef, where('communityId', '==', communityId), limit(50));

      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const txs: RadioTransmission[] = [];
            snapshot.forEach((docSnap) => {
              txs.push(docSnap.data() as RadioTransmission);
            });
            txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            onSuccess(txs);
          }
        },
        (error) => {
          console.warn('Firestore radio listener fallback:', error.message);
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
      await setDoc(txRef, transmission, { merge: true });
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
      const q = query(authRef, where('communityId', '==', communityId));

      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const auths: QuickAuthorization[] = [];
            snapshot.forEach((docSnap) => {
              auths.push(docSnap.data() as QuickAuthorization);
            });
            auths.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            onSuccess(auths);
          }
        },
        (error) => {
          console.warn('Firestore authorizations listener fallback:', error.message);
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
      await setDoc(authRef, auth, { merge: true });
    } catch (err) {
      console.warn('Could not sync authorization to Firestore:', err);
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
