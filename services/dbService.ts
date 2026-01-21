
import { SavedInterviewSession, User } from '../types';

const DB_NAME = 'InterviewCoachDB';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_USER = 'user';

class DBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject('Failed to open DB');
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_USER)) {
          db.createObjectStore(STORE_USER, { keyPath: 'id' });
        }
      };
    });
  }

  async saveSession(session: SavedInterviewSession): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_SESSIONS);
      const request = store.put(session);
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Failed to save session');
    });
  }

  async getSessions(userId: string): Promise<SavedInterviewSession[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_SESSIONS);
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result as SavedInterviewSession[];
        resolve(all.filter(s => s.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      };
      request.onerror = () => reject('Failed to get sessions');
    });
  }

  async deleteSession(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_SESSIONS);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Failed to delete session');
    });
  }

  async saveUser(user: User): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_USER], 'readwrite');
      const store = transaction.objectStore(STORE_USER);
      const request = store.put(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Failed to save user');
    });
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_USER], 'readonly');
      const store = transaction.objectStore(STORE_USER);
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result.length > 0 ? request.result[0] : null);
      };
    });
  }

  async clearUser(): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_USER], 'readwrite');
      const store = transaction.objectStore(STORE_USER);
      store.clear();
      resolve();
    });
  }
}

export const dbService = new DBService();
