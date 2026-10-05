import React from 'react';
import { FlaggedWord } from '../types';
import { HelpCircle, Sparkles, BookOpen } from 'lucide-react';

interface VocabularyCheckModalProps {
  flaggedWord?: FlaggedWord | null;
  onComplete: () => void;
}

export const VocabularyCheckModal: React.FC<VocabularyCheckModalProps> = ({
  flaggedWord,
  onComplete
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-amber-800">
          <HelpCircle className="w-6 h-6 text-amber-600" />
          <h3 className="font-bold text-lg text-slate-900">Vocabulary & Meaning Check</h3>
        </div>

        <p className="text-sm text-slate-600 font-medium">
          Let's make sure key words in this section are clear before moving forward!
        </p>

        {flaggedWord ? (
          <div className="space-y-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            <div>
              <span className="text-xs uppercase text-slate-500 font-semibold block mb-0.5">Key Word</span>
              <span className="text-lg font-bold text-amber-900 capitalize">{flaggedWord.word}</span>
            </div>

            <div>
              <span className="text-xs text-slate-600 font-semibold block mb-0.5">Simplified Meaning in Context:</span>
              <p className="text-sm text-slate-900 bg-white p-2.5 rounded-lg border border-amber-200 font-medium">
                "{flaggedWord.simplifiedSentence}"
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-600 font-semibold block mb-0.5">Everyday Usage:</span>
              <p className="text-sm text-slate-900 bg-white p-2.5 rounded-lg border border-amber-200 font-medium">
                "{flaggedWord.extraExample}"
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Quick Vocabulary Check
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Remember: whenever you see an unfamiliar or tricky word in the text, you can tap it anytime to get a rewritten sentence with simpler vocabulary!
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onComplete}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-sm transition cursor-pointer shadow-xs"
          >
            I Understand — Try Checkpoint Again
          </button>
        </div>
      </div>
    </div>
  );
};
