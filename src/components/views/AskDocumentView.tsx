import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bookmark,
  Volume2,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  FileText,
  User,
  ExternalLink,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACCENT_COLORS } from '../../constants/accentColors';
import { askDocument } from '../../services/api';
import { ChatMessage } from '../../types';
import { voiceReader } from '../../services/voiceReader';

export const AskDocumentView: React.FC = () => {
  const { activeDocument, updateDocument, setActiveView, preferences, showToast } = useApp();
  const accent = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.purple;

  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const page = activeDocument?.pages[activeDocument.currentPageIndex] || activeDocument?.pages[0];
  const docText = page?.ocrResult?.correctedText || page?.ocrResult?.extractedText || '';

  const messages = activeDocument?.chatHistory || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnswering]);

  if (!activeDocument || !page) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1E2235] rounded-3xl border border-[#E3DDD2] dark:border-[#2D334C]">
        <MessageSquare className="w-12 h-12 mx-auto text-[#858B9E] mb-3 opacity-40" />
        <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">No Document Selected</h3>
        <p className="text-xs text-[#858B9E] mt-1">Select or upload a Kannada document to begin contextual Q&A.</p>
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

  // Pre-configured intelligent question suggestions based on document category
  const suggestedQuestions: string[] =
    activeDocument.documentCategory === 'Government Document'
      ? [
          'What is the last date to submit applications?',
          'What is the prescribed fee for certificates?',
          'Who is the competent authority responsible for delay?',
          'ಈ ಸುತ್ತೋಲೆಯ ಮುಖ್ಯ ಉದ್ದೇಶವೇನು?',
        ]
      : activeDocument.documentCategory === 'Historical Document'
      ? [
          'Which king or dynasty issued this inscription?',
          'What year or Shaka era date is mentioned?',
          'What land or temple grant was donated?',
          'ಈ ಶಾಸನದ ಐತಿಹಾಸಿಕ ಮಹತ್ವವೇನು?',
        ]
      : [
          'What is this document about?',
          'Explain the key instructions in English.',
          'Summarize the important dates and contacts.',
          'ಈ ದಾಖಲೆಯಲ್ಲಿರುವ ಮುಖ್ಯ ನಿಯಮಗಳನ್ನು ತಿಳಿಸಿ.',
        ];

  const handleSend = async (questionText: string = inputQuestion) => {
    if (!questionText.trim()) return;
    if (!docText) {
      showToast('No extracted text available for this document to answer from.', 'error');
      return;
    }

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now().toString(36),
      role: 'user',
      text: questionText.trim(),
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setInputQuestion('');
    setIsAnswering(true);

    // Optimistically update document chat history
    updateDocument({
      ...activeDocument,
      chatHistory: newHistory,
    });

    try {
      const response = await askDocument(
        questionText.trim(),
        docText,
        newHistory.slice(-4),
        activeDocument.documentCategory
      );

      const botMsg: ChatMessage = {
        id: 'msg-' + Date.now().toString(36) + 'b',
        role: 'assistant',
        text: response.answer,
        textKannada: response.answerKannada,
        isFoundInDocument: response.isFoundInDocument,
        confidence: response.confidence,
        sourceReferences: response.sourceReferences || [],
        suggestedFollowUps: response.suggestedFollowUps || [],
        timestamp: new Date().toISOString(),
        durationMs: response.durationMs,
        cached: response.cached,
      };

      const finalHistory = [...newHistory, botMsg];
      await updateDocument({
        ...activeDocument,
        chatHistory: finalHistory,
      });
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg-' + Date.now().toString(36) + 'e',
        role: 'assistant',
        text: `Unable to process question: ${err.message}`,
        isFoundInDocument: false,
        confidence: 'unsupported',
        timestamp: new Date().toISOString(),
      };
      await updateDocument({
        ...activeDocument,
        chatHistory: [...newHistory, errorMsg],
      });
      showToast(err.message || 'Failed to answer question', 'error');
    } finally {
      setIsAnswering(false);
    }
  };

  const handleCopy = (textToCopy: string, id: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    showToast('Answer copied', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (textToSpeak: string) => {
    const isKannada = /[\u0C80-\u0CFF]/.test(textToSpeak);
    voiceReader.playText(textToSpeak, isKannada ? 'kn-IN' : 'en-US');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 flex flex-col h-[calc(100vh-140px)]">
      {/* Header Info */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] shadow-sm flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-[#1C2337] dark:text-[#F3F1FA] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
            <span>Ask Your Document (ಸಂವಾದಾತ್ಮಕ ಪ್ರಶ್ನೋತ್ತರ)</span>
          </h2>
          <p className="text-xs text-[#858B9E]">
            Grounded directly on &quot;{activeDocument.filename}&quot; — with clickable source citations.
          </p>
        </div>

        <button
          onClick={() => setActiveView('verification')}
          className="text-xs font-semibold hover:underline flex items-center gap-1"
          style={{ color: accent.hex }}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Source OCR</span>
        </button>
      </div>

      {/* Chat Thread Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-white/70 dark:bg-[#1E2235]/70 border border-[#E3DDD2] dark:border-[#2D334C] shadow-inner">
        {messages.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1C2337] dark:text-[#F3F1FA]">
              Ask anything about this Kannada document
            </h3>
            <p className="text-xs text-[#858B9E] leading-relaxed">
              DataKriti will answer using the verified extracted text and point out the exact paragraph or citation that proves the answer.
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#858B9E] block mb-2">
                Click a suggested question to begin:
              </span>
              <div className="flex flex-col gap-1.5">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="p-2.5 rounded-xl border border-[#E3DDD2] dark:border-[#2D334C] bg-white dark:bg-[#1A1E2F] hover:border-[#7C3AED] text-xs text-left text-[#1C2337] dark:text-[#F3F1FA] transition-all hover:shadow-xs flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3 h-3 text-[#7C3AED] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              } space-y-1`}
            >
              <div className="text-[10px] text-[#858B9E] px-2 flex items-center gap-1.5">
                <span>{msg.role === 'user' ? 'You' : 'DataKriti Intelligence'}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.cached && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono font-semibold">
                    ⚡ Cached
                  </span>
                )}
                {msg.durationMs && !msg.cached && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#858B9E] font-mono">
                    ⚡ {msg.durationMs}ms
                  </span>
                )}
              </div>

              <div
                className={`max-w-xl p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#222A48] dark:bg-[#7C3AED] text-white rounded-tr-sm'
                    : 'bg-white dark:bg-[#282D44] text-[#1C2337] dark:text-[#F3F1FA] border border-[#E3DDD2] dark:border-[#383F5E] rounded-tl-sm'
                }`}
              >
                {/* Answer in English */}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Answer in Kannada if available */}
                {msg.textKannada && (
                  <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 font-kannada text-xs text-[#575E75] dark:text-[#D1D5DB] leading-relaxed">
                    <span className="font-bold text-[10px] block opacity-70 mb-0.5">ಕನ್ನಡದಲ್ಲಿ ವಿವರಣೆ:</span>
                    {msg.textKannada}
                  </div>
                )}

                {/* Grounding & Source References (Feature 16) */}
                {msg.sourceReferences && msg.sourceReferences.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#D6A76C] dark:text-[#E5BE84] uppercase tracking-wider flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      <span>Verified Document Source Citation:</span>
                    </span>

                    {msg.sourceReferences.map((ref, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] text-xs font-kannada flex flex-col gap-1"
                      >
                        <p className="italic text-[#1C2337] dark:text-[#F3F1FA]">
                          &quot;{ref.sourceSnippet}&quot;
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[#858B9E] font-sans mt-0.5">
                          <span>
                            Provenance: {ref.relevance} (Page {ref.pageEstimate || 1})
                          </span>
                          <button
                            onClick={() => {
                              setActiveView('verification');
                              showToast('Navigated to verification workspace', 'info');
                            }}
                            className="font-semibold text-[#7C3AED] hover:underline flex items-center gap-0.5"
                          >
                            <span>Inspect Source</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* If information is missing warning */}
                {msg.isFoundInDocument === false && (
                  <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Not explicitly found in this uploaded document text.</span>
                  </div>
                )}

                {/* Action buttons for assistant answers */}
                {msg.role === 'assistant' && (
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <button
                      onClick={() => handleSpeak(msg.textKannada || msg.text)}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#858B9E]"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#858B9E]"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isAnswering && (
          <div className="flex items-center gap-2 text-xs text-[#7C3AED] p-3 rounded-2xl bg-[#7C3AED]/10 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Searching Kannada text and generating grounded answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-ups */}
      {messages.length > 0 && messages[messages.length - 1]?.suggestedFollowUps && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0">
          <span className="text-[10px] font-semibold text-[#858B9E] shrink-0">Follow-up:</span>
          {messages[messages.length - 1].suggestedFollowUps!.map((fu, i) => (
            <button
              key={i}
              onClick={() => handleSend(fu)}
              className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] hover:border-[#7C3AED] text-[#575E75] dark:text-[#9CA3AF] whitespace-nowrap"
            >
              {fu}
            </button>
          ))}
        </div>
      )}

      {/* Input Composer (Sticky bottom) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white dark:bg-[#1E2235] border border-[#E3DDD2] dark:border-[#2D334C] p-2 rounded-2xl shadow-sm shrink-0"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask a question in English or Kannada (ಉದಾ: ಅರ್ಜಿಯ ಕೊನೆಯ ದಿನಾಂಕವೇನು?)..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-[#1C2337] dark:text-[#F3F1FA]"
          disabled={isAnswering}
        />

        <button
          type="submit"
          disabled={!inputQuestion.trim() || isAnswering}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
          style={{ backgroundColor: accent.hex }}
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
