import { api } from './api';

// cacheManager.js - Intelligent cache management with IndexedDB
class CacheManager {
  constructor() {
    this.dbName = 'AdarshaCache';
    this.version = 1;
    this.maxSize = 100 * 1024 * 1024; // 100 MB
    this.db = null;
  }

  async initDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('data')) {
          const store = db.createObjectStore('data', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async get(key) {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result;
        if (item && this.isExpired(item)) {
          this.delete(key);
          resolve(null);
        } else {
          resolve(item ? item.value : null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  async set(key, value, type = 'general', expiryMs = null) {
    const db = await this.initDB();
    const item = {
      key,
      value,
      type,
      timestamp: Date.now(),
      expiry: expiryMs ? Date.now() + expiryMs : null,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.put(item);

      request.onsuccess = () => {
        this.enforceSizeLimit();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key) {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearCache() {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  isExpired(item) {
    return item.expiry && Date.now() > item.expiry;
  }

  async enforceSizeLimit() {
    const db = await this.initDB();
    const transaction = db.transaction(['data'], 'readwrite');
    const store = transaction.objectStore('data');
    const index = store.index('timestamp');

    const request = index.openCursor(null, 'next'); // Oldest first
    let size = 0;
    const items = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const item = cursor.value;
        size += this.estimateSize(item);
        items.push(item);
        cursor.continue();
      } else {
        // Remove oldest items if over limit
        while (size > this.maxSize && items.length > 0) {
          const oldest = items.shift();
          store.delete(oldest.key);
          size -= this.estimateSize(oldest);
        }
      }
    };
  }

  estimateSize(item) {
    return JSON.stringify(item).length * 2; // Rough estimate
  }

  async syncData(role) {
    // Sync based on role
    const now = Date.now();
    const lastSync = await this.get('lastSync') || 0;

    if (now - lastSync < 5 * 60 * 1000) return; // Sync every 5 min

    try {
      const config = await api.get('/config');
      const serverTimestamp = new Date(config.timestamp).getTime();

      if (serverTimestamp > lastSync) {
        // Fetch updated data
        if (role === 'parent' || role === 'student') {
          const notifications = await api.get('/notifications');
          const notes = await api.get('/notes');
          await this.set('notifications', notifications, 'notifications');
          await this.set('notes', notes, 'notes', 24 * 60 * 60 * 1000); // 24h
        } else if (role === 'teacher') {
          const students = await api.get('/students');
          await this.set('students', students, 'students');
        } else if (role === 'admin') {
          const students = await api.get('/students');
          const teachers = await api.get('/users/teachers');
          await this.set('students', students, 'students');
          await this.set('teachers', teachers, 'teachers');
        }
        await this.set('lastSync', now);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

export const cacheManager = new CacheManager();
