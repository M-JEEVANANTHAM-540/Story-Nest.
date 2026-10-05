import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Story, ChildProfile, ChunkSkeleton, CheckpointAttempt, FlaggedWord, ChildTheme } from '../types';
import { StoryMap } from './StoryMap';
import { VocabScaffoldModal } from './VocabScaffoldModal';
import { VocabularyCheckModal } from './VocabularyCheckModal';
import { TTSReaderToolbar } from './TTSReaderToolbar';
import { PronunciationModal } from './PronunciationModal';
import { ChildAccessibilityToolbar } from './ChildAccessibilityToolbar';
import { PictureDictionaryModal } from './PictureDictionaryModal';
import { VocabMinigameModal } from './VocabMinigameModal';
import { StoryNestLoadingState } from './StoryNestLoadingState';
import { useParentAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import {
  BookOpen,
  HelpCircle,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  User,
  Activity,
  Target,
  FileSearch,
  Award,
  Volume2,
  Mic,
  Gamepad2,
  Settings,
  Image as ImageIcon
} from 'lucide-react';

interface ChildReaderProps {
  story: Story | null;
  activeProfile: ChildProfile;
  onUpdateProfile: (updatedProfile: ChildProfile) => void;
  onGenerateNewStory: () => void;
  isGeneratingStory: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const ChildReader: React.FC<ChildReaderProps> = ({
  story,
  activeProfile,
  onUpdateProfile,
  onGenerateNewStory,
  isGeneratingStory,
  theme,
  onToggleTheme
}) => {
  const { getToken } = useParentAuth();
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  // Child UI & Accessibility States
  const [currentTheme, setCurrentTheme] = useState<ChildTheme>('default');
  const [dyslexicFontEnabled, setDyslexicFontEnabled] = useState<boolean>(false);
  const [pictureDictData, setPictureDictData] = useState<{ word: string; definition?: string; exampleSentence?: string; illustrationEmoji?: string } | null>(null);
  const [showVocabMinigame, setShowVocabMinigame] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Time-per-chunk tracking
  const [chunkStartTime, setChunkStartTime] = useState<number>(Date.now());
  const [activeReadingSeconds, setActiveReadingSeconds] = useState(0);

  // Pronunciation Practice state
  const [pronunciationTarget, setPronunciationTarget] = useState<{ text: string; label: string } | null>(null);

  // Checkpoint Form state
  const [whoInput, setWhoInput] = useState('');
  const [whatInput, setWhatInput] = useState('');
  const [whyInput, setWhyInput] = useState('');
  const [isEvaluatingCheckpoint, setIsEvaluatingCheckpoint] = useState(false);
  const [checkpointError, setCheckpointError] = useState<string | null>(null);
  const [checkpointFeedback, setCheckpointFeedback] = useState<any | null>(null);

  // Inference state
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [inferenceAnswer, setInferenceAnswer] = useState('');
  const [isEvaluatingInference, setIsEvaluatingInference] = useState(false);
  const [inferenceFeedback, setInferenceFeedback] = useState<any | null>(null);

  // Analysis Tier state
  const [analysisAnswer, setAnalysisAnswer] = useState('');
  const [analysisSubmitted, setAnalysisSubmitted] = useState(false);

  // Text-To-Speech (TTS) state
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speakingLineIndex, setSpeakingLineIndex] = useState<number | null>(null);
  const [speakingCustomText, setSpeakingCustomText] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');

  // Tapped Word / Vocabulary Scaffolding state
  const [tappedWord, setTappedWord] = useState<string | null>(null);
  const [tappedSentence, setTappedSentence] = useState<string>('');
  const [scaffoldData, setScaffoldData] = useState<any | null>(null);
  const [isLoadingScaffold, setIsLoadingScaffold] = useState(false);
  const [scaffoldError, setScaffoldError] = useState<string | null>(null);

  // Pacing Intervention states
  const [showPacingFastLock, setShowPacingFastLock] = useState(false);
  const [showSlowWrongModal, setShowSlowWrongModal] = useState(false);
  const [currentFlaggedForSlow, setCurrentFlaggedForSlow] = useState<FlaggedWord | null>(null);

  // Inactivity detection (45 seconds)
  const [showInactivityPrompt, setShowInactivityPrompt] = useState(false);
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // Calculate Inference Tier Stats for Profile
  const recent10Inferences = activeProfile.inferenceHistory.slice(-10);
  const correctCountIn10 = recent10Inferences.filter(i => i.isCorrect).length;
  const inferenceAccuracy = recent10Inferences.length > 0
    ? Math.round((correctCountIn10 / recent10Inferences.length) * 100)
    : 0;
  const isAnalysisUnlocked = recent10Inferences.length > 0 && inferenceAccuracy >= 70;

  // Load browser voices & text selection listener
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection) {
        const text = selection.toString().trim();
        if (text.length >= 2) {
          setHighlightedText(text);
        } else {
          setHighlightedText('');
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Stop speech
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeakingLineIndex(null);
    setSpeakingCustomText(null);
  };

  // Speak specific text snippet
  const speakTextSnippet = (text: string, onEnd?: () => void, lineIdx?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;

    if (selectedVoiceName) {
      const v = voices.find(voice => voice.name === selectedVoiceName);
      if (v) utterance.voice = v;
    }

    if (lineIdx !== undefined) {
      setSpeakingLineIndex(lineIdx);
      setSpeakingCustomText(null);
    } else {
      setSpeakingCustomText(text);
      setSpeakingLineIndex(null);
    }

    setIsSpeaking(true);
    setIsPaused(false);

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingLineIndex(null);
      setSpeakingCustomText(null);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingLineIndex(null);
      setSpeakingCustomText(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Read full chunk lines sequentially
  const handlePlayFullChunk = () => {
    if (!story || !story.chunks[currentChunkIndex]) return;
    const lines = story.chunks[currentChunkIndex].lines;
    if (!lines.length) return;

    let idx = 0;
    const speakNext = (i: number) => {
      if (i >= lines.length) {
        stopSpeech();
        return;
      }
      speakTextSnippet(lines[i], () => speakNext(i + 1), i);
    };

    speakNext(0);
  };

  const handlePlaySingleLine = (lineIdx: number, lineText: string) => {
    speakTextSnippet(lineText, undefined, lineIdx);
  };

  const handlePlaySelectedText = () => {
    if (highlightedText) {
      speakTextSnippet(highlightedText);
    }
  };

  const handlePauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  // Reset chunk-specific form state when moving to a new chunk or story
  useEffect(() => {
    stopSpeech();
    setChunkStartTime(Date.now());
    setActiveReadingSeconds(0);
    setWhoInput('');
    setWhatInput('');
    setWhyInput('');
    setCheckpointFeedback(null);
    setSelectedLineIndex(null);
    setInferenceAnswer('');
    setInferenceFeedback(null);
    setAnalysisAnswer('');
    setAnalysisSubmitted(false);
    setShowPacingFastLock(false);
    setShowInactivityPrompt(false);
    lastInteractionTimeRef.current = Date.now();
  }, [currentChunkIndex, story?.id]);

  // Keep a ref of current inputs for inactivity checking without triggering effect re-runs
  const inputsRef = useRef({ whoInput, whatInput, whyInput, inferenceAnswer, analysisAnswer });
  useEffect(() => {
    inputsRef.current = { whoInput, whatInput, whyInput, inferenceAnswer, analysisAnswer };
  }, [whoInput, whatInput, whyInput, inferenceAnswer, analysisAnswer]);

  // Active Timer & Inactivity monitor
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReadingSeconds(prev => prev + 1);

      // Check inactivity (45s without interaction)
      const idleTime = (Date.now() - lastInteractionTimeRef.current) / 1000;
      const isInputFocused = Boolean(
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
      );
      const { whoInput: who, whatInput: what, whyInput: why, inferenceAnswer: inf, analysisAnswer: ana } = inputsRef.current;
      const hasTypedContent = Boolean(
        who.trim() || what.trim() || why.trim() || inf.trim() || ana.trim()
      );

      if (idleTime >= 45 && !isInputFocused && !hasTypedContent) {
        setShowInactivityPrompt(true);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleUserActivity = () => {
    lastInteractionTimeRef.current = Date.now();
    if (showInactivityPrompt) {
      setShowInactivityPrompt(false);
    }
  };

  // Listen to global user activity (keydown, input, click) to keep interaction timestamp fresh while typing/interacting
  useEffect(() => {
    const onActivity = () => {
      handleUserActivity();
    };

    window.addEventListener('keydown', onActivity);
    window.addEventListener('input', onActivity);
    window.addEventListener('mousedown', onActivity);
    window.addEventListener('touchstart', onActivity);

    return () => {
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('input', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('touchstart', onActivity);
    };
  }, [showInactivityPrompt]);

  // Prevent accidental page refresh / navigation when user has entered text on screen
  useEffect(() => {
    const hasTypedContent = Boolean(
      whoInput.trim() || whatInput.trim() || whyInput.trim() || inferenceAnswer.trim() || analysisAnswer.trim()
    );

    if (!hasTypedContent) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [whoInput, whatInput, whyInput, inferenceAnswer, analysisAnswer]);

  // Word tap handler (Core Function 1)
  const handleWordTap = async (word: string, lineSentence: string) => {
    handleUserActivity();
    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!cleanWord || cleanWord.length < 3) return;

    setTappedWord(cleanWord);
    setTappedSentence(lineSentence);
    setIsLoadingScaffold(true);
    setScaffoldError(null);
    setScaffoldData(null);

    try {
      const res = await fetchWithAuth('/api/vocab/scaffold', {
        method: 'POST',
        body: JSON.stringify({
          word: cleanWord,
          fullSentence: lineSentence,
          childProfileId: activeProfile.id,
          storyId: story?.id
        })
      }, getToken);

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to load simplified explanation.');
      }

      setScaffoldData(data);

      // Refresh local profile flagged words
      const existingIdx = activeProfile.flaggedWords.findIndex(w => w.word.toLowerCase() === cleanWord);
      let updatedWords = [...activeProfile.flaggedWords];
      if (existingIdx >= 0) {
        updatedWords[existingIdx].timesReused += 1;
        if (data.simpleDefinition) {
          updatedWords[existingIdx].simpleDefinition = data.simpleDefinition;
        }
      } else {
        updatedWords.push({
          word: cleanWord,
          originalSentence: lineSentence,
          simpleDefinition: data.simpleDefinition,
          simplifiedSentence: data.simplifiedSentence,
          extraExample: data.extraExample,
          flaggedAt: new Date().toISOString(),
          timesReused: 0,
          resolved: false,
        });
      }
      onUpdateProfile({
        ...activeProfile,
        flaggedWords: updatedWords
      });
    } catch (e: any) {
      console.error('Scaffold error:', e);
      setScaffoldError(e.message || "Couldn't load explanation. Tap to retry.");
    } finally {
      setIsLoadingScaffold(false);
    }
  };

  // Submit Structural Extraction Checkpoint (Core Function 2 & 4)
  const handleCheckpointSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleUserActivity();
    if (!whoInput.trim() || !whatInput.trim() || !whyInput.trim() || !story) {
      setCheckpointError('Please enter a brief answer for WHO, WHAT, and WHY IT MATTERS.');
      return;
    }

    setCheckpointError(null);
    setIsEvaluatingCheckpoint(true);

    const timeSpent = Math.max(5, activeReadingSeconds);
    const chunk = story.chunks[currentChunkIndex];

    try {
      const res = await fetchWithAuth('/api/checkpoint/verify', {
        method: 'POST',
        body: JSON.stringify({
          childProfileId: activeProfile.id,
          storyId: story.id,
          chunkIndex: currentChunkIndex,
          whoAnswer: whoInput,
          whatAnswer: whatInput,
          whyAnswer: whyInput,
          chunkSkeleton: chunk.skeleton,
          chunkText: chunk.text,
          timeSpentSeconds: timeSpent
        })
      }, getToken);

      const data = await res.json();
      setIsEvaluatingCheckpoint(false);
      setCheckpointFeedback(data.evalResult);

      if (data.evalResult?.overallValid) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Update active profile stats
      const updatedStats = [...activeProfile.checkpointStats, data.attempt];
      onUpdateProfile({
        ...activeProfile,
        checkpointStats: updatedStats
      });

      // Pacing Interventions based on Core Function 4
      if (data.pacingClass === 'fast_wrong') {
        setShowPacingFastLock(true);
      } else if (data.pacingClass === 'slow_wrong') {
        // Surface vocabulary check
        const strugglingWord = activeProfile.flaggedWords.find(w => !w.resolved) || null;
        setCurrentFlaggedForSlow(strugglingWord);
        setShowSlowWrongModal(true);
      }
    } catch (e) {
      console.error('Checkpoint verification error:', e);
      setIsEvaluatingCheckpoint(false);
      setCheckpointError('Could not verify checkpoint. Please try again.');
    }
  };

  // Submit Inference Question (Core Function 3)
  const handleInferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleUserActivity();
    if (selectedLineIndex === null || !inferenceAnswer.trim() || !story) return;

    setIsEvaluatingInference(true);
    const chunk = story.chunks[currentChunkIndex];
    const citedLineText = chunk.lines[selectedLineIndex] || '';

    const currentInferenceQ = story.inferenceQuestions.find(q => q.chunkIndex === currentChunkIndex) || {
      question: "What implied clue tells us how the character feels or what will happen?",
    };

    try {
      const res = await fetchWithAuth('/api/inference/verify', {
        method: 'POST',
        body: JSON.stringify({
          childProfileId: activeProfile.id,
          storyId: story.id,
          chunkIndex: currentChunkIndex,
          question: currentInferenceQ.question,
          childAnswer: inferenceAnswer,
          citedLineIndex: selectedLineIndex,
          citedLineText,
          chunkText: chunk.text
        })
      }, getToken);

      const data = await res.json();
      setIsEvaluatingInference(false);
      setInferenceFeedback(data);

      if (data.isCorrect) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Update profile inference history
      const newInferenceAttempt = {
        id: `inf-${Date.now()}`,
        storyId: story.id,
        chunkIndex: currentChunkIndex,
        question: currentInferenceQ.question,
        childAnswer: inferenceAnswer,
        citedLineIndex: selectedLineIndex,
        citedLineText,
        isCorrect: data.isCorrect,
        citationValid: data.citationValid,
        feedback: data.feedback,
        timestamp: new Date().toISOString()
      };

      onUpdateProfile({
        ...activeProfile,
        inferenceHistory: [...activeProfile.inferenceHistory, newInferenceAttempt]
      });
    } catch (e) {
      console.error('Inference error:', e);
      setIsEvaluatingInference(false);
    }
  };

  // Submit Analysis Tier Answer
  const handleAnalysisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisAnswer.trim() || !story) return;

    try {
      await fetchWithAuth('/api/analysis/submit', {
        method: 'POST',
        body: JSON.stringify({
          childProfileId: activeProfile.id,
          storyId: story.id,
          question: `Would you have made the same choice in Chunk ${currentChunkIndex + 1}? Why?`,
          childAnswer: analysisAnswer
        })
      }, getToken);
      setAnalysisSubmitted(true);

      onUpdateProfile({
        ...activeProfile,
        analysisHistory: [
          ...activeProfile.analysisHistory,
          {
            id: `ans-${Date.now()}`,
            storyId: story.id,
            question: `Would you have made the same choice in Chunk ${currentChunkIndex + 1}? Why?`,
            childAnswer: analysisAnswer,
            timestamp: new Date().toISOString()
          }
        ]
      });
    } catch (e) {
      console.error('Analysis error:', e);
    }
  };

  const handleNextChunk = () => {
    if (!story) return;
    if (currentChunkIndex < story.chunks.length - 1) {
      setCurrentChunkIndex(prev => prev + 1);
    }
  };

  if (isGeneratingStory || !story) {
    return (
      <StoryNestLoadingState 
        title="Structuring Story & Checkpoints..."
        subtitle={`Planning 100-150 word chunks and seeding inference opportunities tailored to ${activeProfile.name}'s reading level.`}
        stageHint="Organizing Who / What / Why Skeleton..."
        childName={activeProfile.name}
        readingLevel={activeProfile.gradeLevel}
        storyTheme={story?.topic || "Adventure"}
      />
    );
  }

  const currentChunk = story.chunks[currentChunkIndex];
  const currentInferenceQ = story.inferenceQuestions.find(q => q.chunkIndex === currentChunkIndex);
  const currentSavedCheckpoint = activeProfile.checkpointStats.find(
    c => c.storyId === story.id && c.chunkIndex === currentChunkIndex
  );

  const themeClass = currentTheme !== 'default' ? `theme-${currentTheme}` : '';
  const dyslexicClass = dyslexicFontEnabled ? 'font-dyslexic' : '';

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative transition-colors duration-300 ${themeClass} ${dyslexicClass}`} onClick={handleUserActivity}>
      
      {/* Top Banner: Story Title + Kid Controls & Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs text-slate-800 dark:text-slate-100">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400 block mb-0.5">
            Active Story • {story.topic}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {story.title}
          </h1>
        </div>

        {/* Compact Kid-Focused Controls & Settings */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Word Minigame Launch Pill */}
          <button
            onClick={() => setShowVocabMinigame(true)}
            className="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs text-xs"
            title="Play Word Master Flashcard Minigame"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Word Game 🎮</span>
          </button>

          {/* Settings Trigger Pill */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs text-xs"
            title="Open Reading Settings"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Reading Settings Modal */}
      <ChildAccessibilityToolbar
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        dyslexicFontEnabled={dyslexicFontEnabled}
        onToggleDyslexicFont={() => setDyslexicFontEnabled(prev => !prev)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Gentle 45-Second Inactivity Re-engagement Prompt (Core Function 4) */}
      {showInactivityPrompt && (
        <div className="bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 p-3.5 rounded-xl text-sky-900 dark:text-sky-200 text-sm flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="font-semibold">What do you think happens next in this scene?</span>
          </div>
          <button
            onClick={() => setShowInactivityPrompt(false)}
            className="text-xs bg-sky-700 hover:bg-sky-800 text-white px-3 py-1 rounded-lg border border-sky-600 transition cursor-pointer font-semibold"
          >
            I'm reading!
          </button>
        </div>
      )}

      {/* Main Grid: Reading Stage + Persistent Story Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Reading Stage (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Chunk Reader Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative space-y-6">
            
            {/* Chunk Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  Chunk {currentChunkIndex + 1} of {story.chunks.length}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Reading Time: {activeReadingSeconds}s</span>
              </div>
            </div>

            <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              💡 <strong>Tip for Reader:</strong> Tap any unfamiliar word to simplify the sentence. Highlight any text or click 🔊 next to any sentence to hear it read aloud!
            </p>

            {/* Text-To-Speech Controls Toolbar */}
            <TTSReaderToolbar
              isSpeaking={isSpeaking}
              isPaused={isPaused}
              speakingLineIndex={speakingLineIndex}
              speakingCustomText={speakingCustomText}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              highlightedText={highlightedText}
              totalLines={currentChunk.lines.length}
              voices={voices}
              selectedVoiceName={selectedVoiceName}
              setSelectedVoiceName={setSelectedVoiceName}
              onPlayFullChunk={handlePlayFullChunk}
              onPlaySelectedText={handlePlaySelectedText}
              onPause={handlePauseSpeech}
              onResume={handleResumeSpeech}
              onStop={stopSpeech}
            />

            {/* Chunk Lines with Clickable Words, Read Buttons & Line Numbers */}
            <div className="space-y-3 font-serif text-slate-800 text-base sm:text-lg leading-relaxed">
              {currentChunk.lines.map((lineText, lineIdx) => {
                const words = lineText.split(' ');
                const isSelectedLine = selectedLineIndex === lineIdx;
                const isSpeakingLine = speakingLineIndex === lineIdx;

                return (
                  <div
                    key={lineIdx}
                    className={`flex items-start gap-2.5 p-3 rounded-xl transition-all duration-200 ${
                      isSpeakingLine
                        ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-300/60'
                        : isSelectedLine
                          ? 'bg-sky-50 border-2 border-sky-400 text-sky-950 shadow-xs'
                          : 'bg-slate-50/60 border border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Controls Column: Line Citation & Read Sentence Aloud */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Read Sentence Aloud Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserActivity();
                          if (isSpeakingLine && !isPaused) {
                            handlePauseSpeech();
                          } else if (isSpeakingLine && isPaused) {
                            handleResumeSpeech();
                          } else {
                            handlePlaySingleLine(lineIdx, lineText);
                          }
                        }}
                        title="Read sentence aloud with adjustable speed"
                        className={`font-sans text-xs px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 font-semibold ${
                          isSpeakingLine
                            ? 'bg-amber-500 text-white font-bold shadow-xs animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isSpeakingLine ? 'Playing' : 'Read'}</span>
                      </button>

                      {/* Say It Back / Pronunciation Practice Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserActivity();
                          setPronunciationTarget({
                            text: lineText,
                            label: `Line ${lineIdx + 1} Practice`
                          });
                        }}
                        title="Practice pronouncing this sentence with speech recognition"
                        className="font-sans text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer flex items-center gap-1 font-semibold"
                      >
                        <Mic className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Say It Back</span>
                      </button>

                      {/* Line Citation Button */}
                      <button
                        onClick={() => {
                          handleUserActivity();
                          setSelectedLineIndex(lineIdx);
                        }}
                        title="Click line number to cite this line for inference"
                        className={`font-mono text-xs px-2 py-1 rounded-md transition cursor-pointer font-semibold ${
                          isSelectedLine
                            ? 'bg-sky-600 text-white font-bold'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Line {lineIdx + 1}
                      </button>
                    </div>

                    {/* Interactive Words */}
                    <div className="flex flex-wrap gap-x-1.5 gap-y-1 items-center">
                      {words.map((w, wIdx) => {
                        const cleanWord = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
                        const isFlaggedWord = activeProfile.flaggedWords.some(
                          fw => fw.word.toLowerCase() === cleanWord && !fw.resolved
                        );

                        return (
                          <span
                            key={wIdx}
                            onClick={() => handleWordTap(w, lineText)}
                            className={`cursor-pointer rounded px-1 transition duration-150 ${
                              isFlaggedWord
                                ? 'bg-amber-200 text-amber-900 font-bold border-b-2 border-amber-600 hover:bg-amber-300'
                                : 'hover:bg-emerald-100 hover:text-emerald-900'
                            }`}
                            title="Tap word for vocabulary scaffolding"
                          >
                            {w}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CORE FUNCTION 2: Structural Extraction Checkpoint (WHO / WHAT / WHY) */}
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <Activity className="w-5 h-5 text-emerald-700" />
                  <h3>Story Skeleton Checkpoint</h3>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-mono font-semibold border border-slate-200">
                  Function 2 Mechanic
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Answer WHO, WHAT, and WHY IT MATTERS for this chunk to map your working memory and unlock the next part!
              </p>

              {checkpointError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  {checkpointError}
                </div>
              )}

              {/* Fast + Wrong Lock Notice (Core Function 4) */}
              {showPacingFastLock && (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Pacing Check: Fast Response
                  </div>
                  <p>
                    You moved very quickly through this chunk! Take a moment to re-read the lines and ensure your WHO, WHAT, and WHY checkpoint answers accurately reflect what happened.
                  </p>
                </div>
              )}

              <form onSubmit={handleCheckpointSubmit} className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                
                {/* Prompt 1: WHO */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-700" />
                    1. {currentChunk.skeleton?.whoPrompt || "WHO is the main character or agent in this chunk?"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      currentChunkIndex === 0
                        ? "e.g. Maya and her brother Sam"
                        : "Name the character(s) in this scene..."
                    }
                    value={whoInput}
                    onChange={(e) => setWhoInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                  {checkpointFeedback?.whoFeedback && (
                    <p className="text-xs text-emerald-700 font-medium mt-1 pl-1">
                      {checkpointFeedback.whoFeedback}
                    </p>
                  )}
                </div>

                {/* Prompt 2: WHAT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-700" />
                    2. {currentChunk.skeleton?.whatPrompt || "WHAT key event happened in this chunk?"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      currentChunkIndex === 0
                        ? "e.g. They found a hidden key inside an old hollow oak tree"
                        : "Describe what happened..."
                    }
                    value={whatInput}
                    onChange={(e) => setWhatInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-600 font-medium"
                  />
                  {checkpointFeedback?.whatFeedback && (
                    <p className="text-xs text-sky-700 font-medium mt-1 pl-1">
                      {checkpointFeedback.whatFeedback}
                    </p>
                  )}
                </div>

                {/* Prompt 3: WHY IT MATTERS */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-700" />
                    3. {currentChunk.skeleton?.whyPrompt || "WHY IT MATTERS (How does this connect to the larger story)?"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      currentChunkIndex === 0
                        ? "e.g. The key will unlock the secret gate to help them find their way home"
                        : "Explain why this matters to the story..."
                    }
                    value={whyInput}
                    onChange={(e) => setWhyInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
                  />
                  {checkpointFeedback?.whyFeedback && (
                    <p className="text-xs text-amber-700 font-medium mt-1 pl-1">
                      {checkpointFeedback.whyFeedback}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    disabled={isEvaluatingCheckpoint}
                    className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isEvaluatingCheckpoint ? 'Evaluating Checkpoint...' : 'Save to Story Map & Verify'}
                  </button>

                  {currentSavedCheckpoint?.overallValid && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Validated in Story Map
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* CORE FUNCTION 3: Inference Question & Line Citation */}
            {currentInferenceQ && (
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-800 font-bold text-base">
                    <FileSearch className="w-5 h-5 text-sky-700" />
                    <h3>Inference Question (Line Citation Required)</h3>
                  </div>
                  <span className="text-xs bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-full font-mono font-semibold">
                    Sequenced Function 3
                  </span>
                </div>

                <div className="bg-sky-50/70 border border-sky-200 p-4 rounded-xl space-y-3">
                  <p className="text-sm font-bold text-sky-950">
                    "{currentInferenceQ.question}"
                  </p>
                  
                  <p className="text-xs text-slate-600 font-medium">
                    Point to the specific line that gives you this clue (Click line number in chunk text above):
                  </p>

                  <div className="text-xs font-mono bg-white p-2.5 rounded-lg border border-sky-200 text-sky-900 font-semibold shadow-2xs">
                    {selectedLineIndex !== null
                      ? `Selected: Line ${selectedLineIndex + 1} — "${currentChunk.lines[selectedLineIndex]}"`
                      : '⚠️ No line selected yet. Click a Line number above.'}
                  </div>

                  <form onSubmit={handleInferenceSubmit} className="space-y-3 pt-2">
                    <input
                      type="text"
                      required
                      placeholder="Explain what clue in this line tells you the answer..."
                      value={inferenceAnswer}
                      onChange={(e) => setInferenceAnswer(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-600 font-medium"
                    />

                    <div className="flex items-center justify-between">
                      <button
                        type="submit"
                        disabled={selectedLineIndex === null || isEvaluatingInference}
                        className="bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        {isEvaluatingInference ? 'Checking Clue...' : 'Submit Inference'}
                      </button>

                      {inferenceFeedback && (
                        <div className={`text-xs px-3 py-1.5 rounded-lg border font-semibold ${
                          inferenceFeedback.isCorrect
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-amber-100 border-amber-300 text-amber-900'
                        }`}>
                          {inferenceFeedback.feedback}
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Analysis Tier Prompt (Unlocked ONLY when inference accuracy > 70%) */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              {isAnalysisUnlocked ? (
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <Award className="w-5 h-5 text-amber-700" />
                    <span>Analysis Tier Prompt (Unlocked!)</span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">
                    "Would you have made the same choice as the character in Chunk {currentChunkIndex + 1}? Why?"
                  </p>

                  <form onSubmit={handleAnalysisSubmit} className="space-y-3">
                    <textarea
                      required
                      rows={2}
                      placeholder="Share your personal analysis and reasoning..."
                      value={analysisAnswer}
                      onChange={(e) => setAnalysisAnswer(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        Submit Analysis
                      </button>
                      {analysisSubmitted && (
                        <span className="text-xs text-amber-800 font-bold">Recorded in Parent/Teacher Summary!</span>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Analysis Tier Locked:</strong> {recent10Inferences.length === 0 ? "Complete inference questions above to unlock Analysis Tier (Requires ≥70% accuracy)." : `Requires ≥70% accuracy over recent inference questions (Current: ${inferenceAccuracy}%).`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chunk Navigation Button */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">
                Chunk {currentChunkIndex + 1} of {story.chunks.length}
              </span>

              {currentChunkIndex < story.chunks.length - 1 ? (
                <button
                  onClick={handleNextChunk}
                  disabled={!currentSavedCheckpoint?.overallValid}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  Next Chunk <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onGenerateNewStory}
                  className="bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" /> Story Complete — Start New Story
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Persistent Story Map (4 cols lg, 4 cols xl) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-20">
            <StoryMap
              story={story}
              checkpointStats={activeProfile.checkpointStats}
              currentChunkIndex={currentChunkIndex}
            />
          </div>
        </div>

      </div>

      {/* Vocabulary Scaffolding Modal (Core Function 1) */}
      {tappedWord && (
        <VocabScaffoldModal
          word={tappedWord}
          originalSentence={tappedSentence}
          simpleDefinition={scaffoldData?.simpleDefinition || ''}
          simplifiedSentence={scaffoldData?.simplifiedSentence || ''}
          extraExample={scaffoldData?.extraExample || ''}
          isLoading={isLoadingScaffold}
          error={scaffoldError}
          onRetry={() => handleWordTap(tappedWord, tappedSentence)}
          onClose={() => {
            setTappedWord(null);
            setScaffoldError(null);
            setScaffoldData(null);
          }}
        />
      )}

      {/* Slow + Wrong Reroute Modal (Core Function 4) */}
      {showSlowWrongModal && (
        <VocabularyCheckModal
          flaggedWord={currentFlaggedForSlow}
          onComplete={() => setShowSlowWrongModal(false)}
        />
      )}

      {/* Say It Back / Pronunciation Practice Modal */}
      {pronunciationTarget && (
        <PronunciationModal
          isOpen={!!pronunciationTarget}
          onClose={() => setPronunciationTarget(null)}
          targetText={pronunciationTarget.text}
          label={pronunciationTarget.label}
        />
      )}

      {/* Picture Dictionary Modal */}
      {pictureDictData && (
        <PictureDictionaryModal
          word={pictureDictData.word}
          definition={pictureDictData.definition}
          exampleSentence={pictureDictData.exampleSentence}
          illustrationEmoji={pictureDictData.illustrationEmoji}
          onClose={() => setPictureDictData(null)}
          onSpeak={(w) => speakTextSnippet(w)}
        />
      )}

      {/* Vocabulary Minigame Modal */}
      {showVocabMinigame && (
        <VocabMinigameModal
          flaggedWords={activeProfile.flaggedWords}
          currentChunkText={story?.chunks[currentChunkIndex]?.text}
          currentChunkIndex={currentChunkIndex}
          onClose={() => setShowVocabMinigame(false)}
        />
      )}

    </div>
  );
};
