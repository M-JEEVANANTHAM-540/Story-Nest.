import React, { useEffect, useState } from 'react';
import { ParentTeacherSummary, ChildProfile } from '../types';
import { StoryNestLoadingState } from './StoryNestLoadingState';
import { useParentAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { calculateDCI } from '../utils/dci';
import {
  GraduationCap,
  BookMarked,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Lock,
  Unlock,
  Clock,
  Activity,
  User,
  Sparkles,
  BarChart3,
  Layers,
  Award,
  ShieldAlert,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Download,
  Trash2,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface ParentDashboardProps {
  activeProfile: ChildProfile;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ activeProfile }) => {
  const { getToken } = useParentAuth();
  const [summary, setSummary] = useState<ParentTeacherSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [activeProfile.id, activeProfile.flaggedWords, activeProfile.checkpointStats, activeProfile.inferenceHistory]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/parent-summary/${activeProfile.id}`, {}, getToken);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error('Failed to fetch parent summary:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStory = async (storyId: string) => {
    setApprovingId(storyId);
    try {
      const res = await fetchWithAuth('/api/story/approve-custom', {
        method: 'POST',
        body: JSON.stringify({
          storyId,
          childProfileId: activeProfile.id
        })
      }, getToken);
      if (res.ok) {
        fetchSummary();
      }
    } catch (e) {
      console.error('Error approving story:', e);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectStory = async (storyId: string) => {
    try {
      const res = await fetchWithAuth('/api/story/reject-custom', {
        method: 'POST',
        body: JSON.stringify({
          storyId,
          childProfileId: activeProfile.id
        })
      }, getToken);
      if (res.ok) {
        fetchSummary();
      }
    } catch (e) {
      console.error('Error rejecting story:', e);
    }
  };

  const toggleResolveWord = async (word: string) => {
    try {
      await fetchWithAuth('/api/vocab/toggle-resolved', {
        method: 'POST',
        body: JSON.stringify({
          childProfileId: activeProfile.id,
          word
        })
      }, getToken);
      fetchSummary();
    } catch (e) {
      console.error('Error toggling word resolve:', e);
    }
  };

  if (loading || !summary) {
    return (
      <StoryNestLoadingState 
        compact
        title={`Analyzing ${activeProfile.name}'s Reading Metrics...`}
        subtitle="Calculating skill-specific comprehension scores, inference accuracy, and reading progress."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-950/80 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
            <GraduationCap className="w-7 h-7 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {summary.childName}'s Skill Breakdown
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {summary.age} years old • {summary.gradeLevel} • Pedagogical Skill Summary (No Single Score)
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 font-medium">
          Stories Read: <strong className="text-slate-900 dark:text-white">{summary.storiesReadCount}</strong>
        </div>
      </div>

      {/* Narrative Progress Insight Layer (Gemini-generated, daily cached) */}
      {summary.narrativeInsight && (
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30 border border-amber-200/80 dark:border-amber-800/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>AI Pedagogical Progress Overview (Daily)</span>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            "{summary.narrativeInsight}"
          </p>
        </div>
      )}

      {/* Dynamic Comprehension Index (DCI) Card */}
      {(() => {
        const dci = calculateDCI(activeProfile, summary);
        return (
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800/50 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Dynamic Comprehension Index (DCI)</span>
                  <span className="bg-emerald-900/80 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full border border-emerald-700 font-mono">
                    Quantifiable Metric
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                  Score: {dci.score} / 100
                  <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                    {dci.levelLabel}
                  </span>
                </h2>
              </div>
              <div className="text-right text-xs font-mono text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div>DCI = 0.4(Checkpoint) + 0.3(Inference)</div>
                <div>+ 0.2(Pacing) + 0.1(Vocab)</div>
              </div>
            </div>

            {/* Metric Weights Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 font-medium">Checkpoint (40%)</div>
                <div className="text-emerald-300 font-bold text-base">{dci.checkpointWeight} pts</div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 font-medium">Inference (30%)</div>
                <div className="text-purple-300 font-bold text-base">{dci.inferenceWeight} pts</div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 font-medium">Pacing (20%)</div>
                <div className="text-amber-300 font-bold text-base">{dci.pacingWeight} pts</div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 font-medium">Vocab Mastery (10%)</div>
                <div className="text-sky-300 font-bold text-base">{dci.vocabWeight} pts</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4 Primary Skill Metric Cards (Separate breakdowns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Vocabulary Scaffolding */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><BookMarked className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> Vocab Scaffolding</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary.strugglingWordsCount} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">struggling</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {summary.resolvedWordsCount} words resolved & recognized in context.
          </p>
        </div>

        {/* Metric 2: Structural Extraction Accuracy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-sky-800 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-sky-700 dark:text-sky-400" /> Story Skeleton</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary.checkpointAccuracyRate}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            WHO / WHAT / WHY checkpoint completion accuracy over {summary.checkpointCompletionCount} chunks.
          </p>
        </div>

        {/* Metric 3: Inference Accuracy (Separate from Recall) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-purple-800 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><FileSearch className="w-4 h-4 text-purple-700 dark:text-purple-400" /> Inference Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary.inferenceAccuracyLast10}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Line citation & implied clue connection (Last 10 Qs).
          </p>
        </div>

        {/* Metric 4: Analysis Tier Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-700 dark:text-amber-400" /> Analysis Tier</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            {summary.analysisUnlocked ? (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Unlock className="w-4 h-4" /> Unlocked (&gt;70%)
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Lock className="w-4 h-4" /> Locked (&lt;70%)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Unlocks higher-order critical choice prompts when inference accuracy exceeds 70%.
          </p>
        </div>

      </div>

      {/* SECTION 1: Vocabulary Scaffolding Log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
            <BookMarked className="w-5 h-5 text-emerald-700" />
            <h2 className="text-slate-900">Core Function 1: Flagged Vocabulary Log</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Words tapped during reading • Auto-reused in future stories
          </span>
        </div>

        {summary.flaggedWords.length === 0 ? (
          <p className="text-xs text-slate-500 italic font-medium">No vocabulary words flagged yet. Tap unfamiliar words while reading to log them here!</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {summary.flaggedWords.map((item, idx) => (
              <div key={idx} className="py-3 flex flex-wrap items-start justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-emerald-900 capitalize">{item.word}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      Reused in future stories: {item.timesReused}x
                    </span>
                  </div>
                  <p className="text-slate-700 font-serif italic">
                    Original: "{item.originalSentence}"
                  </p>
                  <p className="text-emerald-800 font-medium">
                    Simplified: "{item.simplifiedSentence}"
                  </p>
                  <p className="text-sky-800 font-medium">
                    Example: "{item.extraExample}"
                  </p>
                </div>

                <button
                  onClick={() => toggleResolveWord(item.word)}
                  className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition cursor-pointer ${
                    item.resolved
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.resolved ? '✓ Resolved & Mastered' : 'Mark as Resolved'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Pacing Pattern Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-sky-800 font-bold text-base">
            <Clock className="w-5 h-5 text-sky-700" />
            <h2 className="text-slate-900">Core Function 4: Pacing & Engagement Monitoring</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Time-per-chunk cross-referenced against checkpoint accuracy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-rose-700 block">Fast + Wrong</span>
            <div className="text-xl font-bold text-slate-900">{summary.pacingDistribution.fastWrong}</div>
            <p className="text-slate-500 text-[11px] font-medium">Rushing; forward progress locked temporarily.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-amber-700 block">Slow + Wrong</span>
            <div className="text-xl font-bold text-slate-900">{summary.pacingDistribution.slowWrong}</div>
            <p className="text-slate-500 text-[11px] font-medium">Vocab gap; automatically rerouted to word check.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-700 block">Slow + Right</span>
            <div className="text-xl font-bold text-slate-900">{summary.pacingDistribution.slowRight}</div>
            <p className="text-slate-500 text-[11px] font-medium">Careful reader succeeding (No intervention).</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-sky-700 block">Balanced</span>
            <div className="text-xl font-bold text-slate-900">{summary.pacingDistribution.balanced}</div>
            <p className="text-slate-500 text-[11px] font-medium">Smooth reading pace and valid extraction.</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Core Function 5 - Custom Imported Story Safety Review */}
      {summary.pendingReviewStories && summary.pendingReviewStories.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
              <h2>Core Function 5: Parent Review Required ({summary.pendingReviewStories.length})</h2>
            </div>
            <span className="text-xs text-amber-800 font-medium">
              User-pasted stories requiring content safety pass approval
            </span>
          </div>

          <div className="space-y-4">
            {summary.pendingReviewStories.map((pendingStory) => (
              <div key={pendingStory.id} className="bg-white border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-700" />
                      {pendingStory.title}
                    </h3>
                    <p className="text-xs text-amber-900 mt-1 font-medium">
                      <strong>Flag Reason:</strong> {pendingStory.safetyReason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectStory(pendingStory.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveStory(pendingStory.id)}
                      disabled={approvingId === pendingStory.id}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {approvingId === pendingStory.id ? 'Structuring...' : 'Approve & Build Map'}
                    </button>
                  </div>
                </div>

                {pendingStory.pastedText && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed line-clamp-3">
                    "{pendingStory.pastedText}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Privacy First & Zero-PII Data Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Privacy First & Zero-PII Local Data Controls
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                No child PII is transmitted to LLM models. All prompts use anonymized profile tokens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProfile, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `${activeProfile.name.toLowerCase()}_storynest_data.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export Data (JSON)</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
