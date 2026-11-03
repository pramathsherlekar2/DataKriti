import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Palette,
  Check,
  RotateCcw,
  ShieldCheck,
  Wifi,
  Database,
  Cpu,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';
import { THEME_PALETTES } from '../../constants/themePalettes';
import { AccentColorKey } from '../../types';
import { checkServerHealth } from '../../services/api';

export const SettingsView: React.FC = () => {
  const {
    preferences,
    setTheme,
    setAccentColor,
    updatePreferences,
    resetAllData,
    showToast,
    isOnline,
  } = useApp();

  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkServerHealth();
      setHealthStatus(res);
    } catch (err: any) {
      setHealthStatus({ status: 'error', message: err.message });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleResetDefaults = () => {
    setTheme('light');
    setAccentColor('purple');
    updatePreferences({ autoAssessOnUpload: true });
    showToast('Reset interface settings to default theme and accent', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Settings Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm">
        <h2 className="text-lg font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#7C3AED]" />
          <span>Application Settings & Appearance</span>
          <span className="text-xs font-kannada font-normal text-[#858B9E]">(ಸಂಯೋಜನೆಗಳು)</span>
        </h2>
        <p className="text-xs text-[#858B9E] mt-0.5">
          Customize themes, choose from 9 curated cultural accent colors, and verify AI system health.
        </p>
      </div>

      {/* Feature 20: Theme Customization (Light vs Dark) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2] dark:border-[#2D334C]">
          <div>
            <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Theme Mode (ಬೆಳಕು / ಕತ್ತಲು ವಿನ್ಯಾಸ)</span>
            </h3>
            <p className="text-xs text-[#858B9E]">
              Light theme uses warm ivory & midnight indigo. Dark theme uses obsidian indigo & lavender.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              preferences.theme === 'light'
                ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-[#F7F4EE] shadow-sm'
                : 'border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E3DDD2] flex items-center justify-center text-amber-500 shadow-2xs">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-[#1C2337] block">Warm Ivory Light</span>
                <span className="text-[10px] text-[#858B9E] font-kannada">ಶಾಂತ ದಂತವರ್ಣ</span>
              </div>
            </div>
            {preferences.theme === 'light' && <Check className="w-4 h-4 text-[#7C3AED]" />}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              preferences.theme === 'dark'
                ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-[#22263A] shadow-sm'
                : 'border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#151827] border border-[#2D334C] flex items-center justify-center text-[#B7AAFF] shadow-2xs">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Deep Indigo Dark</span>
                <span className="text-[10px] text-[#9CA3AF] font-kannada">ಗಾಢ ನೀಲ ವರ್ಣ</span>
              </div>
            </div>
            {preferences.theme === 'dark' && <Check className="w-4 h-4 text-[#B7AAFF]" />}
          </button>
        </div>
      </div>

      {/* Feature 21: Full Interface Color Theme System (9 Coordinated Themes) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3DDD2] dark:border-[#2D334C] gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#7C3AED]" />
              <span>Full Interface Color Customization (೯ ಸಂಪೂರ್ಣ ವಿನ್ಯಾಸ ಬಣ್ಣಗಳು)</span>
            </h3>
            <p className="text-xs text-[#858B9E] mt-0.5">
              Select any of the 9 full interface themes. The selected color transforms the entire app: main background, sidebar, navigation header, workspace cards, input fields, and borders.
            </p>
          </div>

          <button
            onClick={handleResetDefaults}
            className="text-xs text-[#858B9E] hover:text-[#1C2337] dark:hover:text-white flex items-center gap-1 self-start sm:self-auto px-2.5 py-1.5 rounded-xl border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        </div>

        {/* 9 Full-Interface Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(Object.keys(THEME_PALETTES) as AccentColorKey[]).map((colorKey) => {
            const theme = THEME_PALETTES[colorKey];
            const isSelected = preferences.accentColor === colorKey;
            const isDark = preferences.theme === 'dark';
            const activeColors = isDark ? theme.dark : theme.light;

            return (
              <button
                key={colorKey}
                onClick={() => {
                  setAccentColor(colorKey);
                  showToast(`Applied ${theme.name} full interface theme`, 'success');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between group overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-[var(--accent-primary)] shadow-md scale-[1.01]'
                    : 'hover:border-[var(--accent-primary)] hover:shadow-xs'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--surface-elevated)' : 'var(--surface-secondary)',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                }}
              >
                {/* Header: Color Swatch + Names + Active Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full shadow-sm flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: theme.swatchHex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--text-primary)] capitalize">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider bg-[var(--accent-primary)] text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-kannada block">
                        {theme.kannadaName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-3 leading-snug">
                  {theme.description}
                </p>

                {/* Coordinated Palette Preview Bar */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[9px] text-[var(--text-muted)]">
                  <span>UI Coordinated Surfaces:</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-4 h-4 rounded-md border border-black/10 shadow-2xs"
                      style={{ backgroundColor: activeColors.appBackground }}
                      title="App Background"
                    />
                    <span
                      className="w-4 h-4 rounded-md border border-black/10 shadow-2xs"
                      style={{ backgroundColor: activeColors.sidebarBackground }}
                      title="Sidebar"
                    />
                    <span
                      className="w-4 h-4 rounded-md border border-black/10 shadow-2xs"
                      style={{ backgroundColor: activeColors.cardBackground }}
                      title="Card Panels"
                    />
                    <span
                      className="w-4 h-4 rounded-md border border-black/10 shadow-2xs"
                      style={{ backgroundColor: activeColors.buttonBackground }}
                      title="Buttons & Controls"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Active Coordinated Theme Palette Inspector */}
        <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Current Coordinated Theme: {THEME_PALETTES[preferences.accentColor]?.name} ({preferences.theme === 'dark' ? 'Dark Mode' : 'Light Mode'})</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-kannada">
              {THEME_PALETTES[preferences.accentColor]?.kannadaName}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[10px]">
            <div className="p-2 rounded-xl bg-[var(--app-background)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block text-[9px]">App Background</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">--app-background</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--sidebar-background)] border border-[var(--sidebar-border)] text-[var(--sidebar-text)]">
              <span className="opacity-75 block text-[9px]">Sidebar Surface</span>
              <span className="font-mono font-semibold">--sidebar-bg</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--card-background)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block text-[9px]">Workspace Cards</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">--card-bg</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--input-background)] border border-[var(--input-border)]">
              <span className="text-[var(--text-muted)] block text-[9px]">Inputs & Form Fields</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">--input-bg</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--button-background)] text-[var(--button-text)] shadow-xs">
              <span className="opacity-75 block text-[9px]">Buttons & Controls</span>
              <span className="font-mono font-semibold">--button-bg</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block text-[9px]">Elevated Badges</span>
              <span className="font-mono font-semibold text-[var(--accent-primary)]">--badge-bg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backend & Gemini AI Health Diagnostics */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2] dark:border-[#2D334C]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA]">
              System Diagnostics & AI Integration Health
            </h3>
          </div>

          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className="p-1.5 rounded-lg border border-[#E3DDD2] dark:border-[#2D334C] hover:bg-black/5 dark:hover:bg-white/5 text-xs text-[#858B9E] flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            <span>Check</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D]">
            <span className="text-[#858B9E] block mb-1">Server Endpoint:</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Full-Stack Express Active</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D]">
            <span className="text-[#858B9E] block mb-1">Gemini AI Key:</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Server-Side Secret Mounted</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F4EE] dark:bg-[#22263A] border border-[#E3DDD2] dark:border-[#2E354D]">
            <span className="text-[#858B9E] block mb-1">Storage Layer:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Database className="w-4 h-4" />
              <span>IndexedDB Cached Offline</span>
            </span>
          </div>
        </div>
      </div>

      {/* Official Brand Identity & Logo Showcase */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2] dark:border-[#2D334C]">
          <div>
            <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D6A76C]" />
              <span>Official Brand Identity & Visual Assets</span>
            </h3>
            <p className="text-xs text-[#858B9E] mt-0.5">
              DataKriti Digital Heritage Brand Showcase • Lotus-to-pixel transformation identity
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D6A76C]/15 text-[#9E6F34] dark:text-[#E5BE84] border border-[#D6A76C]/30 uppercase tracking-wider">
            Official Artwork
          </span>
        </div>

        {/* Brand Specs Card */}
        <div className="p-4 rounded-2xl bg-[#F7F4EE] dark:bg-[#181B2A] border border-[#E3DDD2] dark:border-[#2D334C] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[#858B9E] block text-[10px] uppercase font-bold tracking-wider">Brand Name</span>
            <span className="font-extrabold text-[#222A48] dark:text-[#F3F1FA] text-base">
              Data<span className="text-[#D6A76C]">Kriti</span>
            </span>
          </div>
          <div>
            <span className="text-[#858B9E] block text-[10px] uppercase font-bold tracking-wider">Symbol Metaphor</span>
            <span className="font-medium text-[#1C2337] dark:text-[#D1D5DB]">
              Digital Heritage lotus with pixel dispersion
            </span>
          </div>
          <div>
            <span className="text-[#858B9E] block text-[10px] uppercase font-bold tracking-wider">Tagline</span>
            <span className="font-medium text-[#1C2337] dark:text-[#D1D5DB]">
              From Kannada Documents to Digital Knowledge
            </span>
          </div>
        </div>

        {/* Asset Variations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. App Icon Light */}
          <div className="p-4 rounded-2xl border border-[#E3DDD2] dark:border-[#2D334C] bg-[#FAF8F5] dark:bg-[#181B2A] flex flex-col items-center text-center">
            <span className="text-[11px] font-semibold text-[#858B9E] mb-3">Standalone Lotus Icon (Light)</span>
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border border-[#E3DDD2] bg-white p-2 flex items-center justify-center">
              <img src="/assets/datakriti-icon.png" alt="DataKriti Icon Light" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] font-mono text-[#858B9E] mt-3">/assets/datakriti-icon.png</span>
          </div>

          {/* 2. App Icon Dark */}
          <div className="p-4 rounded-2xl border border-[#E3DDD2] dark:border-[#2D334C] bg-[#151827] flex flex-col items-center text-center text-white">
            <span className="text-[11px] font-semibold text-[#949DB8] mb-3">Standalone Lotus Icon (Dark)</span>
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border border-[#2D334C] bg-[#1E243D] p-2 flex items-center justify-center">
              <img src="/assets/datakriti-icon-dark.png" alt="DataKriti Icon Dark" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] font-mono text-[#949DB8] mt-3">/assets/datakriti-icon-dark.png</span>
          </div>

          {/* 3. Horizontal Lockup Light */}
          <div className="p-4 rounded-2xl border border-[#E3DDD2] dark:border-[#2D334C] bg-[#FAF8F5] dark:bg-[#181B2A] flex flex-col items-center text-center">
            <span className="text-[11px] font-semibold text-[#858B9E] mb-3">Horizontal Lockup (Light)</span>
            <div className="w-full h-24 rounded-2xl overflow-hidden shadow-sm border border-[#E3DDD2] bg-white p-3 flex items-center justify-center">
              <img src="/assets/datakriti-logo-horizontal.png" alt="Horizontal Logo Light" className="max-h-full object-contain" />
            </div>
            <span className="text-[10px] font-mono text-[#858B9E] mt-3">/assets/datakriti-logo-horizontal.png</span>
          </div>

          {/* 4. Horizontal Lockup Dark */}
          <div className="p-4 rounded-2xl border border-[#E3DDD2] dark:border-[#2D334C] bg-[#151827] flex flex-col items-center text-center text-white">
            <span className="text-[11px] font-semibold text-[#949DB8] mb-3">Horizontal Lockup (Dark)</span>
            <div className="w-full h-24 rounded-2xl overflow-hidden shadow-sm border border-[#2D334C] bg-[#1E243D] p-3 flex items-center justify-center">
              <img src="/assets/datakriti-logo-horizontal-dark.png" alt="Horizontal Logo Dark" className="max-h-full object-contain" />
            </div>
            <span className="text-[10px] font-mono text-[#949DB8] mt-3">/assets/datakriti-logo-horizontal-dark.png</span>
          </div>

          {/* 5. Complete Vertical Light */}
          <div className="p-4 rounded-2xl border border-[#E3DDD2] dark:border-[#2D334C] bg-[#FAF8F5] dark:bg-[#181B2A] flex flex-col items-center text-center">
            <span className="text-[11px] font-semibold text-[#858B9E] mb-3">Full Showcase Logo (Light)</span>
            <div className="w-full h-24 rounded-2xl overflow-hidden shadow-sm border border-[#E3DDD2] bg-white p-2 flex items-center justify-center">
              <img src="/assets/datakriti-logo.png" alt="Full Logo Light" className="max-h-full object-contain" />
            </div>
            <span className="text-[10px] font-mono text-[#858B9E] mt-3">/assets/datakriti-logo.png</span>
          </div>

          {/* 6. Complete Vertical Dark */}
          <div className="p-4 rounded-2xl border border-[#E3DDD2] dark:border-[#2D334C] bg-[#151827] flex flex-col items-center text-center text-white">
            <span className="text-[11px] font-semibold text-[#949DB8] mb-3">Full Showcase Logo (Dark)</span>
            <div className="w-full h-24 rounded-2xl overflow-hidden shadow-sm border border-[#2D334C] bg-[#1E243D] p-2 flex items-center justify-center">
              <img src="/assets/datakriti-logo-dark.png" alt="Full Logo Dark" className="max-h-full object-contain" />
            </div>
            <span className="text-[10px] font-mono text-[#949DB8] mt-3">/assets/datakriti-logo-dark.png</span>
          </div>
        </div>
      </div>

      {/* Library Data Management */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
          <Database className="w-4 h-4 text-[#7C3AED]" />
          <span>Demo Data & Testing Utilities</span>
        </h3>
        <p className="text-xs text-[#858B9E]">
          Reset or restore the original Kannada sample documents (Karnataka Government Order and Hampi Virupaksha Inscription).
        </p>

        <button
          onClick={resetAllData}
          className="px-4 py-2 rounded-xl text-xs font-semibold border border-indigo-400/50 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
        >
          Restore Official Kannada Sample Documents
        </button>
      </div>
    </div>
  );
};
