import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Square,
  Sparkles,
  Headphones,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Radio,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';
import { voiceReader, VoiceReaderState } from '../../services/voiceReader';

export const VoiceReaderView: React.FC = () => {
  const { activeDocument, preferences, updatePreferences, setActiveView, showToast } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const [readerState, setReaderState] = useState<VoiceReaderState>({
    isPlaying: false,
    isPaused: false,
    isLoadingAudio: false,
    currentParagraphIndex: 0,
    currentSentence: '',
    playbackRate: preferences.kannadaVoiceSpeed || 1.0,
    activeEngine: 'gemini-ai',
    selectedVoice: 'Kore',
    error: null,
    totalSentences: 0,
  });

  const [targetSource, setTargetSource] = useState<'kannada' | 'translation'>('kannada');
  const [selectedTranslationLang, setSelectedTranslationLang] = useState<string>('English');

  const page = activeDocument?.pages[activeDocument.currentPageIndex] || activeDocument?.pages[0];
  const ocrText = page?.ocrResult?.correctedText || page?.ocrResult?.extractedText || '';

  // Subscribe to voice reader updates
  useEffect(() => {
    const unsubscribe = voiceReader.subscribe((state) => {
      setReaderState(state);
    });
    return () => {
      unsubscribe();
      voiceReader.stop();
    };
  }, []);

  if (!activeDocument || !page) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
        <Volume2 className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
        <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">No Document Selected</h3>
        <p className="text-xs text-[#858B9E] mt-1">Upload a Kannada document or load a sample to listen to text-to-speech.</p>
        <button
          onClick={() => setActiveView('upload')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm"
          style={{ backgroundColor: accent.hex }}
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const getActiveTextToRead = (): { text: string; lang: string } => {
    if (targetSource === 'translation' && activeDocument.translations[selectedTranslationLang]) {
      return {
        text: activeDocument.translations[selectedTranslationLang].translatedText,
        lang: 'hi-IN',
      };
    }
    return {
      text: ocrText,
      lang: 'kn-IN',
    };
  };

  const handlePlay = () => {
    const { text, lang } = getActiveTextToRead();
    if (!text) {
      showToast('No text available to read.', 'error');
      return;
    }

    if (readerState.isPaused) {
      voiceReader.resume();
    } else {
      voiceReader.playText(text, lang);
    }
  };

  const handlePause = () => {
    voiceReader.pause();
  };

  const handleStop = () => {
    voiceReader.stop();
  };

  const handleSpeedChange = (speed: number) => {
    voiceReader.setSpeed(speed);
    updatePreferences({ kannadaVoiceSpeed: speed });
  };

  const handleVoiceChange = (voice: string) => {
    voiceReader.setVoice(voice);
    showToast(`Switched voice persona to ${voice}`, 'info');
  };

  const sentences = ocrText
    .split(/(?<=[.?!।॥\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Controller Player Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-[#7C3AED]" />
              <h2 className="text-lg font-bold text-[#1C2337] dark:text-[#F3F1FA]">
                Kannada Speech Synthesizer & Voice Reader
              </h2>
              <span className="text-xs font-kannada text-[#858B9E]">(ಧ್ವನಿ ವಾಚಕ)</span>
            </div>
            <p className="text-xs text-[#858B9E] mt-1">
              Natural neural speech generation powered by Gemini 3.8 Flash Lite TTS with sentence highlighting.
            </p>
          </div>

          {/* Engine & Voice Selector Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{readerState.activeEngine === 'gemini-ai' ? 'Gemini 3.8 TTS' : 'Web Speech'}</span>
            </span>

            {/* Voice Persona Selector */}
            <div className="inline-flex items-center gap-1 bg-[#F7F4EE] dark:bg-[#22263A] p-1 rounded-xl border border-[#E3DDD2] dark:border-[#2E354D] text-xs">
              {(['Kore', 'Puck', 'Fenrir', 'Zephyr'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => handleVoiceChange(v)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                    readerState.selectedVoice === v
                      ? 'bg-white dark:bg-[#1A1E2F] text-[#7C3AED] dark:text-[#B7AAFF] font-bold shadow-2xs'
                      : 'text-[#858B9E] hover:text-[#1C2337]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#222A48] via-[#1E243D] to-[#15192B] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          {/* Main Play/Pause/Stop Buttons */}
          <div className="flex items-center gap-3">
            {readerState.isLoadingAudio ? (
              <button
                disabled
                className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center animate-pulse"
                title="Generating Speech..."
              >
                <RefreshCw className="w-5 h-5 animate-spin" />
              </button>
            ) : readerState.isPlaying && !readerState.isPaused ? (
              <button
                onClick={handlePause}
                className="w-12 h-12 rounded-full bg-white text-[#222A48] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
                title="Pause"
              >
                <Pause className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="w-12 h-12 rounded-full text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
                style={{ backgroundColor: accent.hex }}
                title="Play Audio"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            )}

            <button
              onClick={handleStop}
              disabled={!readerState.isPlaying}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors"
              title="Stop"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>

            <div className="ml-2">
              <span className="text-xs font-semibold block text-white/90">
                {readerState.isLoadingAudio
                  ? 'Synthesizing Kannada audio...'
                  : readerState.isPlaying
                  ? readerState.isPaused
                    ? 'Audio Paused'
                    : `Reading sentence #${readerState.currentParagraphIndex + 1} of ${sentences.length}`
                  : 'Ready to Read'}
              </span>
              <span className="text-[10px] text-white/60">
                Voice: {readerState.selectedVoice} • Speed: {readerState.playbackRate}x • 24kHz Audio
              </span>
            </div>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl text-xs font-semibold">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  readerState.playbackRate === spd
                    ? 'bg-white text-[#222A48] font-bold shadow-xs'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {readerState.error && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{readerState.error}</span>
          </div>
        )}
      </div>

      {/* Sentence / Paragraph Stream with Real-time Highlighting & Click-to-Play */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2] dark:border-[#2D334C]">
          <h3 className="font-bold text-sm text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#7C3AED]" />
            <span>Interactive Reading Flow</span>
          </h3>
          <span className="text-xs text-[#858B9E]">
            Click any sentence below to synthesize and read from that point
          </span>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {sentences.map((sentence, idx) => {
            const isCurrent = readerState.isPlaying && readerState.currentParagraphIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => {
                  voiceReader.playText(
                    sentences.join(' '),
                    targetSource === 'kannada' ? 'kn-IN' : 'en-US',
                    idx
                  );
                }}
                className={`p-3.5 rounded-2xl border text-sm font-kannada leading-relaxed cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-[#1C2337] dark:text-[#F3F1FA] font-bold shadow-sm ring-2 ring-[#7C3AED]/40'
                    : 'border-[#E3DDD2] dark:border-[#2D334C] hover:bg-[#F7F4EE] dark:hover:bg-[#22263A] text-[#1C2337] dark:text-[#F3F1FA]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex-1">{sentence}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCurrent && readerState.isLoadingAudio && (
                      <RefreshCw className="w-3.5 h-3.5 text-[#7C3AED] animate-spin" />
                    )}
                    <span className="text-[10px] text-[#858B9E] font-sans opacity-60 mt-0.5">
                      #{idx + 1}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
