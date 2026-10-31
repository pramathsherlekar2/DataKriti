import { DocumentItem, UserPreferences } from '../types';
import { getInitialSampleDocuments } from '../constants/sampleDocuments';

const DB_NAME = 'datakriti_db';
const DB_VERSION = 1;
const STORE_DOCS = 'documents';
const STORE_PREFS = 'preferences';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PREFS)) {
        db.createObjectStore(STORE_PREFS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const defaultPreferences: UserPreferences = {
  theme: 'light',
  accentColor: 'purple',
  kannadaVoiceSpeed: 1.0,
  autoAssessOnUpload: true,
  offlineSyncEnabled: true,
};

export async function getAllDocuments(): Promise<DocumentItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCS, 'readonly');
      const store = transaction.objectStore(STORE_DOCS);
      const req = store.getAll();
      req.onsuccess = () => {
        const docs = req.result as DocumentItem[];
        if (!docs || docs.length === 0) {
          // Seed with initial sample documents for rich immediate experience
          const samples = getInitialSampleDocuments();
          saveAllDocuments(samples).then(() => resolve(samples));
        } else {
          resolve(docs);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // LocalStorage fallback
    const local = localStorage.getItem('datakriti_documents');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    const samples = getInitialSampleDocuments();
    localStorage.setItem('datakriti_documents', JSON.stringify(samples));
    return samples;
  }
}

export async function saveDocument(doc: DocumentItem): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCS, 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const req = store.put(doc);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    const docs = await getAllDocuments();
    const index = docs.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      docs[index] = doc;
    } else {
      docs.unshift(doc);
    }
    localStorage.setItem('datakriti_documents', JSON.stringify(docs));
  }
}

export async function saveAllDocuments(docs: DocumentItem[]): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_DOCS, 'readwrite');
    const store = transaction.objectStore(STORE_DOCS);
    for (const doc of docs) {
      store.put(doc);
    }
  } catch {
    localStorage.setItem('datakriti_documents', JSON.stringify(docs));
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCS, 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    const docs = await getAllDocuments();
    const filtered = docs.filter((d) => d.id !== id);
    localStorage.setItem('datakriti_documents', JSON.stringify(filtered));
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_PREFS, 'readonly');
      const store = transaction.objectStore(STORE_PREFS);
      const req = store.get('user_prefs');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data);
        } else {
          const local = localStorage.getItem('datakriti_prefs');
          if (local) {
            resolve({ ...defaultPreferences, ...JSON.parse(local) });
          } else {
            resolve(defaultPreferences);
          }
        }
      };
      req.onerror = () => resolve(defaultPreferences);
    });
  } catch {
    const local = localStorage.getItem('datakriti_prefs');
    return local ? { ...defaultPreferences, ...JSON.parse(local) } : defaultPreferences;
  }
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  localStorage.setItem('datakriti_prefs', JSON.stringify(prefs));
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_PREFS, 'readwrite');
    const store = transaction.objectStore(STORE_PREFS);
    store.put({ key: 'user_prefs', data: prefs });
  } catch {
    // LocalStorage already updated
  }
}
