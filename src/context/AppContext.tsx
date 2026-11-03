import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentColorKey, DocumentItem, UserPreferences } from '../types';
import {
  defaultPreferences,
  deleteDocument as dbDeleteDocument,
  getAllDocuments,
  getUserPreferences,
  saveDocument as dbSaveDocument,
  saveUserPreferences,
} from '../services/storage';
import { ACCENT_COLORS } from '../constants/accentColors';
import { THEME_PALETTES } from '../constants/themePalettes';
import { getInitialSampleDocuments } from '../constants/sampleDocuments';

export type NavigationTab =
  | 'dashboard'
  | 'upload'
  | 'restoration'
  | 'verification'
  | 'translation'
  | 'intelligence'
  | 'ask'
  | 'comparison'
  | 'authenticity'
  | 'library'
  | 'export'
  | 'settings';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  documents: DocumentItem[];
  activeDocument: DocumentItem | null;
  activeView: NavigationTab;
  preferences: UserPreferences;
  isOnline: boolean;
  isLoading: boolean;
  toasts: Toast[];
  setActiveView: (view: NavigationTab) => void;
  selectDocument: (id: string) => void;
  addDocument: (doc: DocumentItem) => Promise<void>;
  updateDocument: (doc: DocumentItem) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  toggleFavourite: (id: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: AccentColorKey) => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  loadSampleDocument: (sampleIndex: number) => void;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<NavigationTab>('dashboard');
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize data and listeners
  useEffect(() => {
    async function init() {
      try {
        const [docs, prefs] = await Promise.all([
          getAllDocuments(),
          getUserPreferences(),
        ]);
        setDocuments(docs);
        setPreferencesState(prefs);
        if (docs.length > 0 && !activeDocumentId) {
          setActiveDocumentId(docs[0].id);
        }
      } catch (err) {
        console.error('Failed to initialize DataKriti storage:', err);
      } finally {
        setIsLoading(false);
      }
    }

    init();

    const handleOnline = () => {
      setIsOnline(true);
      showToast('Internet connection restored. AI features are available.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('You are offline. Cached documents and local editor are available.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync full interface theme and coordinated CSS variables to DOM
  useEffect(() => {
    const root = document.documentElement;
    const isDark = preferences.theme === 'dark';
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set data attributes for targeted theme styling
    root.setAttribute('data-theme-color', preferences.accentColor);
    root.setAttribute('data-theme-mode', preferences.theme);

    const palette = THEME_PALETTES[preferences.accentColor] || THEME_PALETTES.purple;
    const mode = isDark ? palette.dark : palette.light;

    // 1. Centralized Theme Tokens
    root.style.setProperty('--app-background', mode.appBackground);
    root.style.setProperty('--sidebar-background', mode.sidebarBackground);
    root.style.setProperty('--sidebar-border', mode.sidebarBorder);
    root.style.setProperty('--sidebar-text', mode.sidebarText);
    root.style.setProperty('--sidebar-text-muted', mode.sidebarTextMuted);
    root.style.setProperty('--sidebar-active-bg', mode.sidebarActiveBg);
    root.style.setProperty('--sidebar-active-text', mode.sidebarActiveText);
    root.style.setProperty('--header-background', mode.headerBackground);
    root.style.setProperty('--header-border', mode.headerBorder);
    root.style.setProperty('--surface-primary', mode.surfacePrimary);
    root.style.setProperty('--surface-secondary', mode.surfaceSecondary);
    root.style.setProperty('--surface-elevated', mode.surfaceElevated);
    root.style.setProperty('--card-background', mode.cardBackground);
    root.style.setProperty('--input-background', mode.inputBackground);
    root.style.setProperty('--input-border', mode.inputBorder);
    root.style.setProperty('--border-color', mode.borderColor);
    root.style.setProperty('--border-subtle', mode.borderSubtle);
    root.style.setProperty('--text-primary', mode.textPrimary);
    root.style.setProperty('--text-secondary', mode.textSecondary);
    root.style.setProperty('--text-muted', mode.textMuted);
    root.style.setProperty('--accent-primary', mode.accentPrimary);
    root.style.setProperty('--accent-hover', mode.accentHover);
    root.style.setProperty('--accent-subtle', mode.accentSubtle);
    root.style.setProperty('--accent-ring', mode.accentRing);
    root.style.setProperty('--active-navigation', mode.activeNavigation);
    root.style.setProperty('--button-background', mode.buttonBackground);
    root.style.setProperty('--button-text', mode.buttonText);
    root.style.setProperty('--button-hover', mode.buttonHover);
    root.style.setProperty('--selection-background', mode.selectionBackground);
    root.style.setProperty('--badge-bg', mode.badgeBg);
    root.style.setProperty('--badge-text', mode.badgeText);

    // 2. Compatibility bindings
    root.style.setProperty('--accent-color', mode.accentPrimary);
    root.style.setProperty('--bg-main', mode.appBackground);
    root.style.setProperty('--bg-surface', mode.surfacePrimary);
    root.style.setProperty('--bg-elevated', mode.surfaceElevated);
  }, [preferences.theme, preferences.accentColor]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activeDocument = documents.find((d) => d.id === activeDocumentId) || null;

  const selectDocument = (id: string) => {
    setActiveDocumentId(id);
  };

  const addDocument = async (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
    setActiveDocumentId(doc.id);
    await dbSaveDocument(doc);
    showToast(`"${doc.filename}" added to your library`, 'success');
  };

  const updateDocument = async (doc: DocumentItem) => {
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
    await dbSaveDocument(doc);
  };

  const deleteDocument = async (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocumentId === id) {
      const remaining = documents.filter((d) => d.id !== id);
      setActiveDocumentId(remaining.length > 0 ? remaining[0].id : null);
    }
    await dbDeleteDocument(id);
    showToast(`Document "${docToDelete?.filename || id}" deleted`, 'info');
  };

  const toggleFavourite = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    const updated = { ...doc, isFavourite: !doc.isFavourite };
    await updateDocument(updated);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    const updated = { ...preferences, theme };
    setPreferencesState(updated);
    saveUserPreferences(updated);
  };

  const setAccentColor = (accentColor: AccentColorKey) => {
    const updated = { ...preferences, accentColor };
    setPreferencesState(updated);
    saveUserPreferences(updated);
  };

  const updatePreferences = (partial: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...partial };
    setPreferencesState(updated);
    saveUserPreferences(updated);
  };

  const loadSampleDocument = (sampleIndex: number) => {
    const samples = getInitialSampleDocuments();
    const target = samples[sampleIndex % samples.length];
    if (target) {
      // Add or select if already present
      const exists = documents.find((d) => d.id === target.id);
      if (!exists) {
        addDocument(target);
      } else {
        selectDocument(target.id);
      }
      setActiveView('verification');
      showToast(`Loaded sample: ${target.filename}`, 'success');
    }
  };

  const resetAllData = async () => {
    const samples = getInitialSampleDocuments();
    setDocuments(samples);
    setActiveDocumentId(samples[0]?.id || null);
    for (const s of samples) {
      await dbSaveDocument(s);
    }
    showToast('Reset library to default Kannada sample documents', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        documents,
        activeDocument,
        activeView,
        preferences,
        isOnline,
        isLoading,
        toasts,
        setActiveView,
        selectDocument,
        addDocument,
        updateDocument,
        deleteDocument,
        toggleFavourite,
        setTheme,
        setAccentColor,
        updatePreferences,
        showToast,
        dismissToast,
        loadSampleDocument,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
