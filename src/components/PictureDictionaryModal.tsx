import React from 'react';
import { Volume2, X, Sparkles, BookOpen } from 'lucide-react';

interface PictureDictionaryModalProps {
  word: string;
  definition?: string;
  exampleSentence?: string;
  illustrationEmoji?: string;
  onClose: () => void;
  onSpeak: (text: string) => void;
}

export const PictureDictionaryModal: React.FC<PictureDictionaryModalProps> = ({
  word,
  definition = "A curious or important word in your story!",
  exampleSentence = "The brave explorer looked around with wonder.",
  illustrationEmoji = "🔍🌟",
  onClose,
  onSpeak,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700 rounded-3xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 shadow-2xl relative overflow-hidden text-center space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Picture Dictionary
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Illustration Canvas */}
        <div className="bg-gradient-to-tr from-amber-100 via-emerald-100 to-sky-100 dark:from-amber-950/60 dark:via-emerald-950/60 dark:to-sky-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner">
          <div className="text-6xl sm:text-7xl mb-2 animate-bounce">
            {illustrationEmoji}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
              {word}
            </h2>
            <button
              onClick={() => onSpeak(word)}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xs transition cursor-pointer"
              title="Hear Pronunciation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Simplified Definition Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs sm:text-sm">
          <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>What it means:</span>
          </div>
          <p className="text-slate-900 dark:text-white font-medium leading-relaxed">
            {definition}
          </p>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-500 dark:text-slate-400 text-xs">Example in a sentence:</span>
            <p className="text-slate-700 dark:text-slate-300 italic mt-0.5 font-sans">
              "{exampleSentence}"
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-xs cursor-pointer text-sm"
        >
          Got It! Back to Story 🚀
        </button>
      </div>
    </div>
  );
};
