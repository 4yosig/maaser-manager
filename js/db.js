/**
 * Database Module - Handles IndexedDB storage for all app data
 */

const DB_NAME = 'MaaserManagerDB';
const DB_VERSION = 1;
const STORES = {
  donations: 'donations',
  monthlyData: 'monthlyData',
  categories: 'categories',
  settings: 'settings'
};

export class Database {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Database failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (e) => {
        this.db = e.target.result;

        // Create object stores
        if (!this.db.objectStoreNames.contains(STORES.donations)) {
          const donationStore = this.db.createObjectStore(STORES.donations, { keyPath: 'id', autoIncrement: true });
          donationStore.createIndex('date', 'date', { unique: false });
          donationStore.createIndex('category', 'category', { unique: false });
          donationStore.createIndex('beneficiary', 'beneficiary', { unique: false });
        }

        if (!this.db.objectStoreNames.contains(STORES.monthlyData)) {
          this.db.createObjectStore(STORES.monthlyData, { keyPath: 'id', autoIncrement: true });
        }

        if (!this.db.objectStoreNames.contains(STORES.categories)) {
          const categoryStore = this.db.createObjectStore(STORES.categories, { keyPath: 'id', autoIncrement: true });
          categoryStore.createIndex('name', 'name', { unique: true });
        }

        if (!this.db.objectStoreNames.contains(STORES.settings)) {
          this.db.createObjectStore(STORES.settings, { keyPath: 'key' });
        }

        // Initialize default data if needed
        this._initializeDefaultData();
      };
    });
  }

  /**
   * Initialize default data on first run
   */
  async _initializeDefaultData() {
    const defaultCategories = [
      { name: 'עניים' },
      { name: 'ישיבות' },
      { name: 'קרובי משפחה' },
      { name: 'עמותות' },
      { name: 'אחר' }
    ];

    const defaultSettings = [
      { key: 'baseMaaserAmount', value: 1000 },
      { key: 'maaserDay', value: 10 },
      { key: 'currency', value: 'ILS' }
    ];

    // Check if categories already exist
    const existingCategories = await this.getAll(STORES.categories);
    if (existingCategories.length === 0) {
      for (const category of defaultCategories) {
        await this.add(STORES.categories, category);
      }
    }

    // Check if settings already exist
    const existingSettings = await this.getAll(STORES.settings);
    if (existingSettings.length === 0) {
      for (const setting of defaultSettings) {
        await this.add(STORES.settings, setting);
      }
    }
  }

  /**
   * Add a record to a store
   */
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a single record by key
   */
  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all records from a store
   */
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update a record
   */
  async update(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a record
   */
  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Query by index
   */
  async queryByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Query by date range
   */
  async queryByDateRange(storeName, startDate, endDate) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export all data as JSON
   */
  async exportData() {
    const data = {
      donations: await this.getAll(STORES.donations),
      monthlyData: await this.getAll(STORES.monthlyData),
      categories: await this.getAll(STORES.categories),
      settings: await this.getAll(STORES.settings),
      exportDate: new Date().toISOString()
    };
    return data;
  }

  /**
   * Import data from JSON (with confirmation)
   */
  async importData(data) {
    try {
      // Clear existing data
      await this.clear(STORES.donations);
      await this.clear(STORES.monthlyData);
      await this.clear(STORES.categories);
      await this.clear(STORES.settings);

      // Import new data
      if (data.donations && Array.isArray(data.donations)) {
        for (const donation of data.donations) {
          await this.add(STORES.donations, donation);
        }
      }

      if (data.monthlyData && Array.isArray(data.monthlyData)) {
        for (const monthly of data.monthlyData) {
          await this.add(STORES.monthlyData, monthly);
        }
      }

      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          await this.add(STORES.categories, category);
        }
      }

      if (data.settings && Array.isArray(data.settings)) {
        for (const setting of data.settings) {
          await this.add(STORES.settings, setting);
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Clear ALL data from the database
   */
  async clearAllData() {
    try {
      await this.clear(STORES.donations);
      await this.clear(STORES.monthlyData);
      await this.clear(STORES.categories);
      await this.clear(STORES.settings);
      
      // Reinitialize default data
      await this._initializeDefaultData();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export const STORE_NAMES = STORES;
