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
    
    // Simple hash for password storage (in production, use proper hashing)
    const hashedPassword = await this.hashPassword(password);
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      
      const request = store.put({ key: 'password', value: hashedPassword });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async hasPassword(): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      
      return new Promise((resolve) => {
        const request = store.get('password');
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      
      return new Promise(async (resolve) => {
        const request = store.get('password');
        request.onsuccess = async () => {
          if (!request.result) {
            resolve(false);
            return;
          }
          
          const hashedInput = await this.hashPassword(password);
          resolve(hashedInput === request.result.value);
        };
        request.onerror = () => resolve(false);
      });
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
    
    return new Promise((resolve, reject) => {
      // Clear existing tabs
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        // Save all tabs
        let completed = 0;
        const total = tabs.length;
        
        if (total === 0) {
          resolve();
          return;
        }
        
        for (const tab of tabs) {
          const putRequest = store.put(tab);
          putRequest.onsuccess = () => {
            completed++;
            if (completed === total) {
              resolve();
            }
          };
          putRequest.onerror = () => reject(putRequest.error);
        }
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  async getTabs(): Promise<any[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['tabs'], 'readonly');
      const store = transaction.objectStore('tabs');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
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
