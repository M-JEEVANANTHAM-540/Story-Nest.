import React, { useState, useEffect } from 'react';
import { Story } from '../types';
import { StoryNestLoadingState } from './StoryNestLoadingState';
import { BookOpen, Sparkles, AlertCircle, ShieldAlert, CheckCircle2, ArrowRight, FileText, Upload, FileUp, Loader2 } from 'lucide-react';
import { useParentAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { checkClientModeration } from '../utils/moderationGuard';
import mammoth from 'mammoth';
import JSZip from 'jszip';

interface ImportStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfileId: string;
  onStoryLoaded: (story: Story) => void;
  onSwitchToBuiltIn: () => void;
}

export const ImportStoryModal: React.FC<ImportStoryModalProps> = ({
  isOpen,
  onClose,
  activeProfileId,
  onStoryLoaded,
  onSwitchToBuiltIn
}) => {
  const { getToken } = useParentAuth();
  const [pastedText, setPastedText] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'flagged'>('input');
  const [progressMsgIndex, setProgressMsgIndex] = useState(0);
  const [flaggedReason, setFlaggedReason] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFileName, setExtractedFileName] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const MIN_CHAR_COUNT = 40;
  const isShort = pastedText.trim().length > 0 && pastedText.trim().length < MIN_CHAR_COUNT;

  useEffect(() => {
    if (!isOpen) {
      setStep('input');
      setPastedText('');
      setProgressMsgIndex(0);
      setFlaggedReason('');
      setExtractedFileName(null);
      setExtractionError(null);
      setIsExtracting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !pastedText.trim()) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen, pastedText]);

  useEffect(() => {
    let timer1: any, timer2: any;
    if (step === 'processing') {
      setProgressMsgIndex(0);
      timer1 = setTimeout(() => {
        setProgressMsgIndex(1);
      }, 2500);

      timer2 = setTimeout(() => {
        setProgressMsgIndex(2);
      }, 5000);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractionError(null);
    setExtractedFileName(file.name);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'txt') {
        const text = await file.text();
        setPastedText(text);
      } else if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setPastedText(result.value || '');
      } else if (extension === 'epub') {
        const zip = await JSZip.loadAsync(file);
        let extractedText = '';
        const textFiles = Object.keys(zip.files).filter(fn =>
          (fn.endsWith('.html') || fn.endsWith('.xhtml') || fn.endsWith('.htm')) && !fn.includes('toc')
        ).sort();

        for (const fn of textFiles) {
          const htmlContent = await zip.files[fn].async('string');
          const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
          const pageText = doc.body?.textContent || '';
          if (pageText.trim()) {
            extractedText += pageText.trim() + '\n\n';
          }
        }
        setPastedText(extractedText || '');
      } else {
        throw new Error('Unsupported file format. Please upload EPUB, DOCX, or TXT.');
      }
    } catch (err: any) {
      console.error('File extraction error:', err);
      setExtractionError(err.message || 'Error extracting text from file.');
      setExtractedFileName(null);
    } finally {
      setIsExtracting(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pastedText.trim().length < MIN_CHAR_COUNT) return;

    // Fast Layer-1 Client Moderation Pass
    const modResult = checkClientModeration(pastedText);
    if (!modResult.safe) {
      setFlaggedReason(modResult.reason || 'Content was flagged by client safety filter.');
      setStep('flagged');
      return;
    }

    setStep('processing');

    try {
      const res = await fetchWithAuth('/api/story/retrofit', {
        method: 'POST',
        body: JSON.stringify({
          pastedText,
          childProfileId: activeProfileId
        })
      }, getToken);

      const data = await res.json();

      if (res.ok && data.safe && data.story) {
        onStoryLoaded(data.story);
        onClose();
      } else if (data.safe === false) {
        setFlaggedReason(data.reason || 'This story needs parent approval.');
        setStep('flagged');
      } else {
        setFlaggedReason(data.error || 'Something went wrong processing your story.');
        setStep('flagged');
      }
    } catch (err) {
      console.error('Error importing story:', err);
      setFlaggedReason('Network error while processing your story.');
      setStep('flagged');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-800 dark:text-slate-100 shadow-xl relative overflow-hidden">
        
        {/* Step 1: Input Screen */}
        {step === 'input' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-950/80 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                  <FileText className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Bring Your Own Story</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Upload a file (EPUB, DOCX, TXT) or paste custom text</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Upload File Zone */}
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center hover:border-amber-400 dark:hover:border-amber-600 transition relative">
                  <input
                    type="file"
                    accept=".epub,.docx,.txt"
                    onChange={handleFileUpload}
                    disabled={isExtracting}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-1">
                    {isExtracting ? (
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-semibold py-1">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-600 dark:text-amber-400" />
                        <span>Extracting text from document...</span>
                      </div>
                    ) : (
                      <>
                        <FileUp className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-1" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Drop a file or <span className="text-amber-700 dark:text-amber-400 underline">browse</span>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Supports EPUB, DOCX, and TXT</p>
                      </>
                    )}
                  </div>
            </div>

            {extractedFileName && (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Loaded text from <strong className="font-bold">{extractedFileName}</strong> ({pastedText.length.toLocaleString()} characters)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setExtractedFileName(null);
                    setPastedText('');
                  }}
                  className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white text-xs underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            {extractionError && (
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-2.5 rounded-lg font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{extractionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Story Text
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste your story here, or upload a document above."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-600 font-sans leading-relaxed resize-none font-medium shadow-2xs"
                />

                {isShort && (
                  <div className="flex items-center gap-2 mt-2 text-amber-900 dark:text-amber-200 text-xs bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-2.5 rounded-lg font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Add a little more so we can build your story map!</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  ✨ Automatic safety check & Who/What/Why story map generation.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pastedText.trim().length < MIN_CHAR_COUNT || isExtracting}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Build Story Map
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Processing Screen with Sequential Progress Messages */}
        {step === 'processing' && (
          <div className="py-6 px-4 text-center space-y-4">
            <StoryNestLoadingState 
              compact
              title="Structuring Custom Story Checkpoints..."
              subtitle="Gemini is analyzing your passage and dividing it into 100-150 word chunks."
            />

            {/* Sequential Progress Indicators */}
            <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-left">
              
              <div className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                progressMsgIndex >= 0 ? 'opacity-100 text-emerald-800' : 'opacity-30 text-slate-400'
              }`}>
                {progressMsgIndex > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin shrink-0"></div>
                )}
                <span className="font-bold">Reading your story...</span>
              </div>

              <div className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                progressMsgIndex >= 1 ? 'opacity-100 text-sky-800' : 'opacity-30 text-slate-400'
              }`}>
                {progressMsgIndex > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                ) : progressMsgIndex === 1 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-sky-600 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                )}
                <span className="font-bold">Finding the tricky parts...</span>
              </div>

              <div className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                progressMsgIndex >= 2 ? 'opacity-100 text-amber-800' : 'opacity-30 text-slate-400'
              }`}>
                {progressMsgIndex >= 2 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                )}
                <span className="font-bold">Almost ready!</span>
              </div>

            </div>
          </div>
        )}

        {/* Step 3: Flagged for Parent Approval */}
        {step === 'flagged' && (
          <div className="py-8 px-4 text-center space-y-6">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 border border-amber-300 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-amber-700" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-slate-900">Let's check this one with a grown-up first!</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                This story has been saved for parent approval in the Parent Dashboard.
              </p>
              {flaggedReason && (
                <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 p-3 rounded-xl italic mt-2 font-medium">
                  Note: {flaggedReason}
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onSwitchToBuiltIn();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                Read a Built-In Story
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
