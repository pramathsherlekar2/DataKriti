import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { UploadView } from './components/views/UploadView';
import { RestorationStudioView } from './components/views/RestorationStudioView';
import { VerificationView } from './components/views/VerificationView';
import { TranslationView } from './components/views/TranslationView';
import { AIIntelligenceView } from './components/views/AIIntelligenceView';
import { AskDocumentView } from './components/views/AskDocumentView';
import { ComparisonView } from './components/views/ComparisonView';
import { AuthenticityView } from './components/views/AuthenticityView';
import { LibraryView } from './components/views/LibraryView';
import { ExportView } from './components/views/ExportView';
import { SettingsView } from './components/views/SettingsView';
import { WelcomeModal } from './components/modals/WelcomeModal';
import { WifiOff } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, isOnline, isLoading, preferences } = useApp();
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  // Application loading screen with official brand lotus symbol
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--app-background)] text-[var(--text-primary)]">
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D6A76C]/40 bg-[var(--card-background)] animate-pulse">
            <img
              src={preferences.theme === 'dark' ? '/assets/datakriti-icon-dark.png' : '/assets/datakriti-icon.png'}
              alt="DataKriti Lotus Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-500/20 to-amber-500/20 blur-md -z-10 animate-ping opacity-50" />
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight font-sans">
          Data<span className="text-[#D6A76C] dark:text-[#E5BE84]">Kriti</span>
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-kannada">ಕನ್ನಡ ದಾಖಲೆಗಳಿಂದ ಡಿಜಿಟಲ್ ಜ್ಞಾನದೆಡೆಗೆ...</p>
        <span className="text-[11px] text-[var(--text-secondary)] mt-3 font-mono">
          Loading AI Models & Persistent Cache
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--app-background)] text-[var(--text-primary)]">
      {/* Welcome / Brand Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      {/* Collapsible Sidebar */}
      <Sidebar onOpenWelcome={() => setShowWelcomeModal(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Bar */}
        <Header onOpenWelcome={() => setShowWelcomeModal(true)} />

        {/* Offline Awareness Banner (Feature 18) */}
        {!isOnline && (
          <div className="px-6 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Offline Mode Active:</strong> You can view, search, edit, verify, and export locally cached documents. Gemini AI operations will resume automatically when internet returns.
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded">
              Local Cache
            </span>
          </div>
        )}

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'upload' && <UploadView />}
          {activeView === 'restoration' && <RestorationStudioView />}
          {activeView === 'verification' && <VerificationView />}
          {activeView === 'translation' && <TranslationView />}
          {activeView === 'intelligence' && <AIIntelligenceView />}
          {activeView === 'ask' && <AskDocumentView />}
          {activeView === 'comparison' && <ComparisonView />}
          {activeView === 'authenticity' && <AuthenticityView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'export' && <ExportView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
