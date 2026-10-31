import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  User,
  Key,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { preferences, showToast, loadSampleDocument, setActiveView } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const [userName, setUserName] = useState<string>('Pramath Sherlekar');
  const [userRole, setUserRole] = useState<string>('Lead Document Analyst');

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Signed in as ${userName} (${userRole})`, 'success');
    onClose();
  };

  const handleQuickDemo = () => {
    loadSampleDocument(0);
    setActiveView('verification');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[var(--card-background)] border border-[var(--border-color)] shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header with Official Logo Artwork */}
        <div className="p-8 text-center bg-[var(--surface-secondary)] border-b border-[var(--border-color)] flex flex-col items-center">
          <div className="w-52 sm:w-64 mb-3 drop-shadow-sm transition-transform hover:scale-102">
            <img
              src={
                preferences.theme === 'dark'
                  ? '/assets/datakriti-logo-dark.png'
                  : '/assets/datakriti-logo.png'
              }
              alt="DataKriti: From Kannada Documents to Digital Knowledge"
              className="w-full h-auto object-contain rounded-2xl"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#B7AAFF] text-xs font-semibold mt-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Kannada Document Intelligence</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-center max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">
              Welcome to DataKriti Workspace
            </h3>
            <p className="text-xs text-[#858B9E] leading-relaxed">
              Transform printed, scanned, and archival Kannada documents into searchable, verified, and translated digital knowledge.
            </p>
          </div>

          {/* Quick Features Highlight */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#151827] border border-[#E3DDD2] dark:border-[#2D334C] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[#1C2337] dark:text-[#F3F1FA] font-medium">Multimodal OCR</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#151827] border border-[#E3DDD2] dark:border-[#2D334C] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[#1C2337] dark:text-[#F3F1FA] font-medium">8 Indian Translations</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#151827] border border-[#E3DDD2] dark:border-[#2D334C] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[#1C2337] dark:text-[#F3F1FA] font-medium">Restoration Studio</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#151827] border border-[#E3DDD2] dark:border-[#2D334C] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[#1C2337] dark:text-[#F3F1FA] font-medium">Voice Synthesizer</span>
            </div>
          </div>

          {/* User Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-3 pt-2 border-t border-[#E3DDD2] dark:border-[#2D334C]">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#858B9E]">
                User Name / Operator:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#858B9E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#151827] border border-[#E3DDD2] dark:border-[#2D334C] text-xs font-semibold text-[#1C2337] dark:text-[#F3F1FA] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#858B9E]">
                Designation / Role:
              </label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#151827] border border-[#E3DDD2] dark:border-[#2D334C] text-xs text-[#1C2337] dark:text-[#F3F1FA] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--button-background)', color: 'var(--button-text)' }}
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#D6A76C] bg-[#D6A76C]/10 text-[#1C2337] dark:text-[#F3F1FA] hover:bg-[#D6A76C]/20 transition-colors"
              >
                1-Click Official Sample
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
