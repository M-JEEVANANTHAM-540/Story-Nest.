import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Award, AlertCircle, MessageSquare } from 'lucide-react';

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetText: string;
  label?: string;
}

export const PronunciationModal: React.FC<PronunciationModalProps> = ({
  isOpen,
  onClose,
  targetText,
  label = "Say It Back — Pronunciation Practice"
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualText, setManualText] = useState('');

  const recognitionRef = useRef<any>(null);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    if (!isOpen) {
      stopListening();
      setTranscript('');
      setAccuracyScore(null);
      setIsPlayingAudio(false);
      setSpeechError(null);
      setIsManualInput(false);
      setManualText('');
    }

    return () => {
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  const handleListenToModel = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.rate = 0.85; // slightly slower for kids to hear clearly
    setIsPlayingAudio(true);

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartListening = async () => {
    stopListening();
    setTranscript('');
    setAccuracyScore(null);
    setSpeechError(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError("Speech recognition is not supported in this browser. You can type what you said below!");
      setIsManualInput(true);
      return;
    }

    // Attempt to request mic permission explicitly
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err: any) {
      console.warn("Microphone access permission warning:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setSpeechError("Microphone permission was denied. Please allow microphone access in your browser settings.");
        setIsManualInput(true);
        return;
      }
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      let finalTranscript = '';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript;
          }
        }
        const fullTranscript = (finalTranscript + interimTranscript).trim();
        setTranscript(fullTranscript);

        if (fullTranscript.length > 0) {
          evaluatePronunciation(fullTranscript, targetText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone access was blocked. Please check your browser microphone settings.");
          setIsManualInput(true);
        } else if (event.error === 'no-speech') {
          setSpeechError("No speech was detected. Please try tapping the microphone again and speaking clearly!");
        } else if (event.error === 'audio-capture') {
          setSpeechError("No microphone found. Please connect a microphone or use manual typing below.");
          setIsManualInput(true);
        } else {
          setSpeechError(`Speech error: ${event.error}. You can also type what you said below!`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e: any) {
      console.error("Failed to initialize SpeechRecognition:", e);
      setIsListening(false);
      setSpeechError("Unable to start speech recognition. You can type what you said below!");
      setIsManualInput(true);
    }
  };

  const evaluatePronunciation = (spoken: string, target: string) => {
    const cleanSpoken = spoken.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    if (cleanTarget.length === 0) return;

    let matchedCount = 0;
    const targetSet = new Set(cleanTarget);
    cleanSpoken.forEach(word => {
      if (targetSet.has(word)) {
        matchedCount++;
      }
    });

    const matchRatio = matchedCount / cleanTarget.length;
    const score = Math.min(100, Math.round(matchRatio * 100));
    setAccuracyScore(score);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setTranscript(manualText.trim());
    evaluatePronunciation(manualText.trim(), targetText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 shadow-xl relative overflow-hidden text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{label}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Text Box */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl p-4 sm:p-5 mb-4 relative">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            Target Line to Practice
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
            "{targetText}"
          </p>

          <button
            onClick={handleListenToModel}
            disabled={isPlayingAudio}
            className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold cursor-pointer transition shadow-2xs"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            <span>{isPlayingAudio ? 'Speaking...' : 'Listen to Audio Model'}</span>
          </button>
        </div>

        {/* Error Notice if any */}
        {speechError && (
          <div className="p-3 mb-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 font-medium text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p>{speechError}</p>
            </div>
          </div>
        )}

        {/* Main Microphone Interaction Area */}
        <div className="space-y-4 my-3">
          {!isManualInput ? (
            <>
              <div className="flex justify-center">
                {isListening ? (
                  <button
                    onClick={stopListening}
                    className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg animate-pulse cursor-pointer hover:bg-rose-700 transition"
                    title="Stop Listening"
                  >
                    <MicOff className="w-8 h-8" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartListening}
                    className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-emerald-700 hover:scale-105 transition"
                    title="Start Speaking"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {isListening ? "Listening... Speak clearly into your microphone!" : "Tap the microphone to 'Say It Back'"}
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualInput(true)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 underline cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" /> Or type what you said
                </button>
              </div>
            </>
          ) : (
            /* Manual Text Input Fallback */
            <form onSubmit={handleManualSubmit} className="space-y-2 text-left bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                Type what you pronounced:
              </label>
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Type the sentence here..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
              <div className="flex justify-between items-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsManualInput(false);
                    setSpeechError(null);
                  }}
                  className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  ← Back to Microphone
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Check Pronunciation
                </button>
              </div>
            </form>
          )}

          {/* Captured Transcript */}
          {transcript && (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-200 font-medium italic">
              "{transcript}"
            </div>
          )}

          {/* Accuracy Score Feedback */}
          {accuracyScore !== null && (
            <div className="bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 animate-scale-up">
              <div className="flex items-center justify-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold text-xl mb-1">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span>{accuracyScore}% Pronunciation Accuracy!</span>
              </div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                {accuracyScore >= 80 ? "🎉 Outstanding pronunciation! Clear, confident, and accurate!" :
                 accuracyScore >= 50 ? "👍 Good effort! Listen once more and try again!" :
                 "💪 Great try! Tap 'Listen to Audio Model' to hear it again!"}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs cursor-pointer transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
