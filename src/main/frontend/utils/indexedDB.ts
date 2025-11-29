// IndexedDB 工具类用于收藏音乐

const DB_NAME = 'MusicPlayerDB';
const DB_VERSION = 1;
const STORE_NAME = 'favorites';

export interface FavoriteSong {
  id: string;
  source: string;
  name: string;
  artist: string | string[];
  album: string;
  pic_id?: string;
  lyric_id?: string;
  addedAt: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: ['id', 'source'] });
          objectStore.createIndex('addedAt', 'addedAt', { unique: false });
          objectStore.createIndex('name', 'name', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async addFavorite(song: Omit<FavoriteSong, 'addedAt'>): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const favorite: FavoriteSong = {
        ...song,
        addedAt: Date.now(),
      };
      const request = store.add(favorite);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to add favorite'));
    });
  }

  async removeFavorite(id: string, source: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete([id, source]);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove favorite'));
    });
  }

  async isFavorite(id: string, source: string): Promise<boolean> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get([id, source]);

      request.onsuccess = () => {
        resolve(request.result !== undefined);
      };
      request.onerror = () => reject(new Error('Failed to check favorite'));
    });
  }

  async getAllFavorites(): Promise<FavoriteSong[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const favorites = request.result as FavoriteSong[];
        // 按添加时间倒序排列
        favorites.sort((a, b) => b.addedAt - a.addedAt);
        resolve(favorites);
      };
      request.onerror = () => reject(new Error('Failed to get favorites'));
    });
  }

  async clearAllFavorites(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear favorites'));
    });
  }
}

export const dbManager = new IndexedDBManager();

