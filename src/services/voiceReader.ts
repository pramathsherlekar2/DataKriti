import { synthesizeKannadaSpeech } from './api';

export interface VoiceReaderState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoadingAudio: boolean;
  currentParagraphIndex: number;
  currentSentence: string;
  playbackRate: number; // 0.5 to 2.0
  activeEngine: 'gemini-ai' | 'browser-speech';
  selectedVoice: string; // 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'
  error: string | null;
  totalSentences: number;
}

export type VoiceStateListener = (state: VoiceReaderState) => void;

class HighFidelityVoiceReader {
  private audioElement: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private synth: SpeechSynthesis | null = null;
  private webSpeechUtterance: SpeechSynthesisUtterance | null = null;

  private sentences: string[] = [];
  private currentSentenceIdx = 0;
  private rate = 1.0;
  private isPaused = false;
  private isPlaying = false;
  private isLoadingAudio = false;
  private activeEngine: 'gemini-ai' | 'browser-speech' = 'gemini-ai';
  private selectedVoice = 'Kore';
  private listeners: Set<VoiceStateListener> = new Set();
  private targetLang = 'kn-IN';

  // Client-side cache: sentence text -> audio object URL
  private audioUrlCache = new Map<string, string>();
  private prefetchAbortController: AbortController | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.playbackRate = this.rate;

      this.audioElement.onended = () => {
        if (this.isPlaying && !this.isPaused) {
          this.playSentenceAt(this.currentSentenceIdx + 1);
        }
      };

      this.audioElement.onerror = (e) => {
        console.warn('Audio playback error, falling back to Web Speech API:', e);
        this.fallbackWebSpeech(this.sentences[this.currentSentenceIdx] || '');
      };

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  private notify(error: string | null = null) {
    const state: VoiceReaderState = {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isLoadingAudio: this.isLoadingAudio,
      currentParagraphIndex: this.currentSentenceIdx,
      currentSentence: this.sentences[this.currentSentenceIdx] || '',
      playbackRate: this.rate,
      activeEngine: this.activeEngine,
      selectedVoice: this.selectedVoice,
      error,
      totalSentences: this.sentences.length,
    };
    this.listeners.forEach((l) => l(state));
  }

  public setVoice(voice: string) {
    this.selectedVoice = voice;
    this.audioUrlCache.clear(); // Clear cache when voice changes
    this.notify();
  }

  public setSpeed(rate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
    if (this.audioElement) {
      this.audioElement.playbackRate = this.rate;
    }
    if (this.webSpeechUtterance) {
      this.webSpeechUtterance.rate = this.rate;
    }
    this.notify();
  }

  /**
   * Start reading full text or list of sentences
   */
  public async playText(text: string, lang = 'kn-IN', startIndex = 0) {
    this.stop();
    this.targetLang = lang;

    // Segment text by Kannada danda (।), double danda (॥), periods, exclamation, or newlines
    this.sentences = text
      .split(/(?<=[.?!।॥\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (this.sentences.length === 0) {
      this.notify('No readable text found');
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    await this.playSentenceAt(startIndex);
  }

  /**
   * Play a specific sentence by index with seamless buffering
   */
  public async playSentenceAt(index: number) {
    if (index >= this.sentences.length) {
      this.stop();
      return;
    }

    this.currentSentenceIdx = index;
    const sentence = this.sentences[index];
    if (!sentence) {
      this.stop();
      return;
    }

    // Try primary high-fidelity Gemini AI TTS first
    try {
      this.isLoadingAudio = true;
      this.activeEngine = 'gemini-ai';
      this.notify();

      let audioUrl = this.audioUrlCache.get(sentence);

      if (!audioUrl) {
        // Fetch WAV audio from Gemini TTS
        const result = await synthesizeKannadaSpeech(sentence, this.selectedVoice);
        if (result?.audioBase64) {
          // Convert base64 to Blob URL
          const binaryStr = atob(result.audioBase64);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/wav' });
          audioUrl = URL.createObjectURL(blob);
          this.audioUrlCache.set(sentence, audioUrl);
        }
      }

      if (audioUrl && this.audioElement) {
        this.isLoadingAudio = false;
        this.currentAudioUrl = audioUrl;
        this.audioElement.src = audioUrl;
        this.audioElement.playbackRate = this.rate;
        await this.audioElement.play();
        this.notify();

        // Background pre-fetch next sentence for instant gapless playback!
        this.prefetchNextSentence(index + 1);
        return;
      }
    } catch (err: any) {
      console.warn('Gemini TTS failed or offline, transitioning to Web Speech API fallback:', err);
      this.fallbackWebSpeech(sentence);
    }
  }

  /**
   * Pre-fetch next sentence in background
   */
  private async prefetchNextSentence(nextIdx: number) {
    if (nextIdx >= this.sentences.length) return;
    const nextSentence = this.sentences[nextIdx];
    if (!nextSentence || this.audioUrlCache.has(nextSentence)) return;

    try {
      const result = await synthesizeKannadaSpeech(nextSentence, this.selectedVoice);
      if (result?.audioBase64) {
        const binaryStr = atob(result.audioBase64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        this.audioUrlCache.set(nextSentence, url);
      }
    } catch {
      // Ignore background prefetch errors
    }
  }

  /**
   * Fallback using browser Web Speech API
   */
  private fallbackWebSpeech(sentence: string) {
    if (!this.synth) {
      this.isLoadingAudio = false;
      this.notify('Speech playback not supported in this environment.');
      return;
    }

    this.activeEngine = 'browser-speech';
    this.isLoadingAudio = false;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = this.rate;
    utterance.lang = this.targetLang;

    // Pick best available voice
    const voices = this.synth.getVoices();
    const kannadaVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('kn') ||
        v.lang.toLowerCase().includes('kannada') ||
        v.name.toLowerCase().includes('kannada')
    );
    const indianVoice = voices.find(
      (v) =>
        v.lang.includes('IN') ||
        v.lang.startsWith('hi') ||
        v.lang.startsWith('te') ||
        v.lang.startsWith('ta')
    );

    if (kannadaVoice) {
      utterance.voice = kannadaVoice;
    } else if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        this.playSentenceAt(this.currentSentenceIdx + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (this.isPlaying && !this.isPaused) {
        this.playSentenceAt(this.currentSentenceIdx + 1);
      }
    };

    this.webSpeechUtterance = utterance;
    this.notify();
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.isPlaying && !this.isPaused) {
      if (this.activeEngine === 'gemini-ai' && this.audioElement) {
        this.audioElement.pause();
      } else if (this.synth) {
        this.synth.pause();
      }
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.isPlaying && this.isPaused) {
      if (this.activeEngine === 'gemini-ai' && this.audioElement) {
        this.audioElement.play().catch(console.warn);
      } else if (this.synth) {
        this.synth.resume();
      }
      this.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoadingAudio = false;
    this.currentSentenceIdx = 0;
    this.notify();
  }
}

export const voiceReader = new HighFidelityVoiceReader();
