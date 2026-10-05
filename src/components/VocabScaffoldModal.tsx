import React, { useState } from 'react';
import { FlaggedWord } from '../types';
import { StoryNestLoadingState } from './StoryNestLoadingState';
import { BookMarked, Sparkles, X, CheckCircle, Volume2, Square, AlertCircle, RefreshCw, BookOpen, Check } from 'lucide-react';

interface VocabScaffoldModalProps {
  word: string;
  originalSentence: string;
  simpleDefinition: string;
  simplifiedSentence: string;
  extraExample: string;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const VocabScaffoldModal: React.FC<VocabScaffoldModalProps> = ({
  word,
  originalSentence,
  simpleDefinition,
  simplifiedSentence,
  extraExample,
  onClose,
  isLoading,
  error,
  onRetry
}) => {
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speakingText === text) {
      setSpeakingText(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    setSpeakingText(text);

    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 text-emerald-800">
          <BookMarked className="w-6 h-6 text-emerald-700" />
          <h3 className="font-bold text-lg text-slate-900">Vocabulary Scaffolder</h3>
        </div>

        {isLoading ? (
          <StoryNestLoadingState 
            compact
            title="Building Vocabulary Scaffold..."
            subtitle={`Generating clear definition and sentence rewrite for "${word}"...`}
          />
        ) : error ? (
          <div className="py-6 space-y-4 text-center">
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-amber-900 text-xs font-medium flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tap to Retry</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Flagged Word Badge */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">Tapped Word</span>
                <span className="text-xl font-bold text-emerald-800 capitalize">{word}</span>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> Logged to Profile
              </span>
            </div>

            {/* MEANING Section (Simple Definition) - Positioned at top above Original Sentence */}
            {simpleDefinition && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" /> MEANING
                  </label>
                  <button
                    onClick={() => speakText(simpleDefinition)}
                    className="text-xs text-amber-900 hover:text-black flex items-center gap-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-0.5 rounded transition cursor-pointer font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-700" /> Read
                  </button>
                </div>
                <p className={`text-sm font-semibold transition ${
                  speakingText === simpleDefinition ? 'text-amber-950 font-bold' : 'text-amber-900'
                }`}>
                  {simpleDefinition}
                </p>
              </div>
            )}

            {/* Original Sentence */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Original Sentence in Story
                </label>
                <button
                  onClick={() => speakText(originalSentence)}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition cursor-pointer font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" /> Read
                </button>
              </div>
              <p className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 font-serif italic">
                "{originalSentence}"
              </p>
            </div>

            {/* Simplified Sentence */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Rewritten for Clear Understanding
                </label>
                <button
                  onClick={() => speakText(simplifiedSentence)}
                  className="text-xs text-emerald-900 hover:text-black flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-0.5 rounded transition cursor-pointer font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" /> Read Aloud
                </button>
              </div>
              <p className={`text-sm p-3 rounded-xl border transition ${
                speakingText === simplifiedSentence
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
              }`}>
                "{simplifiedSentence}"
              </p>
            </div>

            {/* Everyday Example */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-sky-800 uppercase tracking-wide">
                  Everyday Example
                </label>
                <button
                  onClick={() => speakText(extraExample)}
                  className="text-xs text-sky-800 hover:text-sky-950 flex items-center gap-1 bg-sky-100 hover:bg-sky-200 border border-sky-300 px-2 py-0.5 rounded transition cursor-pointer font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-700" /> Read
                </button>
              </div>
              <p className="text-sm bg-sky-50 p-3 rounded-xl border border-sky-200 text-sky-950 font-medium">
                "{extraExample}"
              </p>
            </div>

            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-200">
              We logged <strong className="text-slate-800">"{word}"</strong>. It may reappear naturally in future stories to test if you recognize it!
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleClose}
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Got It! Return to Story</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
