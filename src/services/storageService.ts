import { Community, Report, User, ChatMessage, RadioTransmission, QuickAuthorization } from '../types';
import { INITIAL_COMMUNITIES, INITIAL_REPORTS, MOCK_USERS, INITIAL_CHAT_MESSAGES, INITIAL_RADIO_TRANSMISSIONS, INITIAL_QUICK_AUTHORIZATIONS } from '../data/mockData';

const KEYS = {
  COMMUNITIES: 'vecinoalerta_communities_v1',
  REPORTS: 'vecinoalerta_reports_v1',
  ACTIVE_COMMUNITY: 'vecinoalerta_active_community_id',
  CURRENT_USER: 'vecinoalerta_current_user_id',
  USERS: 'vecinoalerta_users_v1',
  IS_AUTH: 'vecinoalerta_is_authenticated',
  CHAT_MESSAGES: 'vecinoalerta_chat_messages_v1',
  RADIO_TRANSMISSIONS: 'vecinoalerta_radio_transmissions_v1',
  QUICK_AUTHORIZATIONS: 'vecinoalerta_quick_authorizations_v1',
  RADIO_CHANNEL: 'vecinoalerta_active_radio_channel_v1',
};

export const storageService = {
  getCommunities(): Community[] {
    try {
      const data = localStorage.getItem(KEYS.COMMUNITIES);
      return data ? JSON.parse(data) : INITIAL_COMMUNITIES;
    } catch {
      return INITIAL_COMMUNITIES;
    }
  },

  saveCommunities(communities: Community[]): void {
    try {
      localStorage.setItem(KEYS.COMMUNITIES, JSON.stringify(communities));
    } catch (e) {
      console.error('Error saving communities:', e);
    }
  },

  getReports(): Report[] {
    try {
      const data = localStorage.getItem(KEYS.REPORTS);
      return data ? JSON.parse(data) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  },

  saveReports(reports: Report[]): void {
    try {
      localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error('Error saving reports:', e);
    }
  },

  getActiveCommunityId(): string {
    return localStorage.getItem(KEYS.ACTIVE_COMMUNITY) || 'comm-1';
  },

  setActiveCommunityId(id: string): void {
    localStorage.setItem(KEYS.ACTIVE_COMMUNITY, id);
  },

  getCurrentUserId(): string {
    return localStorage.getItem(KEYS.CURRENT_USER) || 'user-vecino-1';
  },

  setCurrentUserId(id: string): void {
    localStorage.setItem(KEYS.CURRENT_USER, id);
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  },

  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  },

  addUser(user: User): void {
    const existing = this.getUsers();
    if (!existing.some(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase())) {
      const updated = [...existing, user];
      this.saveUsers(updated);
    }
  },

  getIsAuthenticated(): boolean {
    return localStorage.getItem(KEYS.IS_AUTH) === 'true';
  },

  setIsAuthenticated(val: boolean): void {
    localStorage.setItem(KEYS.IS_AUTH, val ? 'true' : 'false');
  },

  // Chat Messages
  getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(KEYS.CHAT_MESSAGES);
      return data ? JSON.parse(data) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  },

  saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving chat messages:', e);
    }
  },

  // Radio Transmissions
  getRadioTransmissions(): RadioTransmission[] {
    try {
      const data = localStorage.getItem(KEYS.RADIO_TRANSMISSIONS);
      return data ? JSON.parse(data) : INITIAL_RADIO_TRANSMISSIONS;
    } catch {
      return INITIAL_RADIO_TRANSMISSIONS;
    }
  },

  saveRadioTransmissions(transmissions: RadioTransmission[]): void {
    try {
      localStorage.setItem(KEYS.RADIO_TRANSMISSIONS, JSON.stringify(transmissions));
    } catch (e) {
      console.error('Error saving radio transmissions:', e);
    }
  },

  getActiveRadioChannel(): number {
    try {
      const ch = localStorage.getItem(KEYS.RADIO_CHANNEL);
      return ch ? parseInt(ch, 10) : 1;
    } catch {
      return 1;
    }
  },

  setActiveRadioChannel(ch: number): void {
    localStorage.setItem(KEYS.RADIO_CHANNEL, ch.toString());
  },

  // Quick Authorizations
  getQuickAuthorizations(): QuickAuthorization[] {
    try {
      const data = localStorage.getItem(KEYS.QUICK_AUTHORIZATIONS);
      return data ? JSON.parse(data) : INITIAL_QUICK_AUTHORIZATIONS;
    } catch {
      return INITIAL_QUICK_AUTHORIZATIONS;
    }
  },

  saveQuickAuthorizations(auths: QuickAuthorization[]): void {
    try {
      localStorage.setItem(KEYS.QUICK_AUTHORIZATIONS, JSON.stringify(auths));
    } catch (e) {
      console.error('Error saving quick authorizations:', e);
    }
  },

  resetToDefault(): void {
    localStorage.removeItem(KEYS.COMMUNITIES);
    localStorage.removeItem(KEYS.REPORTS);
    localStorage.removeItem(KEYS.ACTIVE_COMMUNITY);
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.IS_AUTH);
    localStorage.removeItem(KEYS.CHAT_MESSAGES);
    localStorage.removeItem(KEYS.RADIO_TRANSMISSIONS);
    localStorage.removeItem(KEYS.QUICK_AUTHORIZATIONS);
    localStorage.removeItem(KEYS.RADIO_CHANNEL);
  },
};
