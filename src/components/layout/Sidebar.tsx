import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  CheckCircle,
  Languages,
  Sparkles,
  MessageSquare,
  GitCompare,
  ShieldCheck,
  FolderOpen,
  Download,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  BookOpen,
} from 'lucide-react';
import { NavigationTab, useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';

interface NavItem {
  id: NavigationTab;
  label: string;
  kannadaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', kannadaLabel: 'ಮುಖಪುಟ', icon: LayoutDashboard },
  { id: 'upload', label: 'Digitize Documents', kannadaLabel: 'ದಾಖಲೆ ಡಿಜಿಟಲೀಕರಣ', icon: FileText },
  { id: 'restoration', label: 'Restoration Studio', kannadaLabel: 'ಚಿತ್ರ ಪುನಶ್ಚೇತನ', icon: Sliders },
  { id: 'verification', label: 'OCR Verification', kannadaLabel: 'ಪಠ್ಯ ಪರಿಶೀಲನೆ', icon: CheckCircle },
  { id: 'translation', label: 'Multilingual Translation', kannadaLabel: 'ಬಹುಭಾಷಾ ಅನುವಾದ', icon: Languages },
  { id: 'intelligence', label: 'AI Intelligence', kannadaLabel: 'ದಸ್ತಾವೇಜು ವಿಶ್ಲೇಷಣೆ', icon: Sparkles },
  { id: 'ask', label: 'Ask Your Document', kannadaLabel: 'ಪ್ರಶ್ನೋತ್ತರ', icon: MessageSquare },
  { id: 'comparison', label: 'Smart Document Comparison', kannadaLabel: 'ದಾಖಲೆ ಹೋಲಿಕೆ', icon: GitCompare },
  { id: 'authenticity', label: 'Document Authenticity & Tampering', kannadaLabel: 'ದೃಢೀಕರಣ ತಪಾಸಣೆ', icon: ShieldCheck },
  { id: 'library', label: 'Document Library', kannadaLabel: 'ದಾಖಲೆಗಳ ಸಂಗ್ರಹ', icon: FolderOpen },
  { id: 'export', label: 'Export Centre', kannadaLabel: 'ರಫ್ತು ಕೇಂದ್ರ', icon: Download },
  { id: 'settings', label: 'Settings & Themes', kannadaLabel: 'ಸಂಯೋಜನೆಗಳು', icon: Settings },
];

interface SidebarProps {
  onOpenWelcome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenWelcome }) => {
  const {
    activeView,
    setActiveView,
    activeDocument,
    preferences,
    setTheme,
    isOnline,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  return (
    <aside
      className={`relative flex flex-col border-r transition-all duration-300 ease-in-out select-none z-30
        ${isCollapsed ? 'w-20' : 'w-72'}
        bg-[var(--sidebar-background)] border-[var(--sidebar-border)] text-[var(--sidebar-text)] h-full shadow-sm`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3.5 py-3.5 border-b border-[var(--sidebar-border)]">
        <div
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden group flex-1"
        >
          {/* Official Standalone Lotus Symbol */}
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-[var(--sidebar-border)] transition-transform group-hover:scale-105 bg-white/10 p-0.5">
            <img
              src={preferences.theme === 'dark' ? '/assets/datakriti-icon-dark.png' : '/assets/datakriti-icon.png'}
              alt="DataKriti Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-[var(--sidebar-text)] font-sans">
                  Data<span className="text-[#D6A76C] dark:text-[#E5BE84]">Kriti</span>
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  AI
                </span>
              </div>
              <span className="text-[10px] text-[var(--sidebar-text-muted)] font-kannada truncate">
                ಕನ್ನಡ ಜ್ಞಾನ ರೂಪಾಂತರ
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-white/10 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Document Info Chip */}
      {!isCollapsed && activeDocument && (
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl bg-black/10 dark:bg-black/25 border border-[var(--sidebar-border)] flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <BookOpen className="w-4 h-4 text-[#D6A76C] shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-[var(--sidebar-text)] truncate">
                {activeDocument.filename}
              </p>
              <p className="text-[10px] text-[var(--sidebar-text-muted)]">
                {activeDocument.documentCategory}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            {activeDocument.processingStatus === 'ready' ? 'Digitized' : 'Ready'}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group
                ${
                  isActive
                    ? 'shadow-sm font-semibold'
                    : 'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-white/10'
                }`}
              style={{
                backgroundColor: isActive ? 'var(--sidebar-active-bg)' : undefined,
                color: isActive ? 'var(--sidebar-active-text)' : undefined,
              }}
              title={isCollapsed ? `${item.label} (${item.kannadaLabel})` : undefined}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-white/70"
                />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'scale-105' : ''
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 text-left flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  <span className="text-[11px] opacity-75 font-kannada font-normal ml-1 shrink-0">
                    {item.kannadaLabel}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-[#E3DDD2] dark:border-[#2B3147] space-y-2">
        {/* Connectivity status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span className="truncate font-medium">Online (Gemini Ready)</span>}
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span className="truncate font-medium">Offline Mode (Cached)</span>}
            </>
          )}
        </div>

        {/* Theme and Quick Settings Toggle */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
            className="flex-1 flex items-center gap-2 p-2 rounded-xl text-[#575E75] dark:text-[#9CA3AF] hover:bg-[#F1ECE2] dark:hover:bg-[#282D44] transition-colors justify-center"
            title="Toggle Light/Dark Theme"
          >
            {preferences.theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                {!isCollapsed && <span className="text-xs">Light Theme</span>}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#222A48]" />
                {!isCollapsed && <span className="text-xs">Dark Theme</span>}
              </>
            )}
          </button>

          {onOpenWelcome && (
            <button
              onClick={onOpenWelcome}
              className="p-2 rounded-xl text-[#7C3AED] dark:text-[#D6A76C] hover:bg-[#F1ECE2] dark:hover:bg-[#282D44] transition-colors shrink-0"
              title="DataKriti Brand Overview & Sign In"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
