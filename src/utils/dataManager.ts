
export class DataManager {
  private dbName = 'SListApp';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store for app settings and password
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Store for tabs data
        if (!db.objectStoreNames.contains('tabs')) {
          db.createObjectStore('tabs', { keyPath: 'id' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  async setPassword(password: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    
    // Simple hash for password storage (in production, use proper hashing)
    const hashedPassword = await this.hashPassword(password);
    await store.put({ key: 'password', value: hashedPassword });
  }

  async hasPassword(): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const result = await store.get('password');
      return !!result;
    } catch {
      return false;
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const result = await store.get('password');
      
      if (!result) return false;
      
      const hashedInput = await this.hashPassword(password);
      return hashedInput === result.value;
    } catch {
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async saveTabs(tabs: any[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['tabs'], 'readwrite');
    const store = transaction.objectStore('tabs');
    
    // Clear existing tabs
    await store.clear();
    
    // Save all tabs
    for (const tab of tabs) {
      await store.put(tab);
    }
  }

  async getTabs(): Promise<any[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['tabs'], 'readonly');
      const store = transaction.objectStore('tabs');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  async exportAllData(): Promise<string> {
    const tabs = await this.getTabs();
    return JSON.stringify({ tabs, timestamp: Date.now() });
  }

  async importAllData(data: string): Promise<void> {
    const parsed = JSON.parse(data);
    await this.saveTabs(parsed.tabs || []);
  }
}
