export interface FlaggedWord {
  word: string;
  originalSentence: string;
  simplifiedSentence: string;
  extraExample: string;
  simpleDefinition?: string;
  flaggedAt: string;
  timesReused: number;
  resolved: boolean;
}

export interface ChunkSkeleton {
  whoPrompt: string;
  whoExpectedAnswer: string;
  whatPrompt: string;
  whatExpectedAnswer: string;
  whyPrompt: string;
  whyExpectedAnswer: string;
}

export interface StoryChunk {
  chunkIndex: number;
  text: string;
  lines: string[];
  skeleton: ChunkSkeleton;
}

export interface InferenceQuestion {
  id: string;
  chunkIndex: number;
  question: string;
  explanation: string;
  targetLineIndices: number[];
  tier: 'inference' | 'analysis';
}

export interface Story {
  id: string;
  title: string;
  topic: string;
  targetAge: number;
  chunks: StoryChunk[];
  seededVocab: string[];
  inferenceQuestions: InferenceQuestion[];
  createdAt: string;
  isCustom?: boolean;
  safetyStatus?: 'passed' | 'pending_parent_review' | 'rejected';
  safetyReason?: string;
  pastedText?: string;
}

export interface InferenceAttempt {
  id: string;
  storyId: string;
  chunkIndex: number;
  question: string;
  childAnswer: string;
  citedLineIndex: number;
  citedLineText: string;
  isCorrect: boolean;
  citationValid: boolean;
  feedback: string;
  timestamp: string;
}

export interface AnalysisAttempt {
  id: string;
  storyId: string;
  question: string;
  childAnswer: string;
  timestamp: string;
}

export type PacingPattern = 'fast_wrong' | 'slow_wrong' | 'slow_right' | 'balanced';

export interface CheckpointAttempt {
  id: string;
  storyId: string;
  chunkIndex: number;
  whoAnswer: string;
  whatAnswer: string;
  whyAnswer: string;
  whoValid: boolean;
  whatValid: boolean;
  whyValid: boolean;
  overallValid: boolean;
  timeSpentSeconds: number;
  pacingClass: PacingPattern;
  feedback: {
    whoFeedback: string;
    whatFeedback: string;
    whyFeedback: string;
    gentlePrompt?: string;
  };
  timestamp: string;
}

export interface DCIBreakdown {
  score: number;
  checkpointWeight: number;
  inferenceWeight: number;
  pacingWeight: number;
  vocabWeight: number;
  levelLabel: 'Emerging Reader' | 'Developing Reader' | 'Proficient Reader' | 'Master Reader';
}

export interface ReadingGoals {
  dailyMinutes: number;
  weeklyMinutes: number;
  monthlyStories: number;
}

export interface ReadingSessionRecord {
  id: string;
  storyId: string;
  storyTitle: string;
  topic: string;
  date: string;
  durationSeconds: number;
  chunksCompleted: number;
  totalChunks: number;
  completed: boolean;
}

export interface ChildProfile {
  id: string;
  parentId?: string;
  name: string;
  age: number;
  gradeLevel: string;
  flaggedWords: FlaggedWord[];
  inferenceHistory: InferenceAttempt[];
  analysisHistory: AnalysisAttempt[];
  checkpointStats: CheckpointAttempt[];
  createdAt: string;
  xpPoints?: number;
  dciScore?: number;
  dciBreakdown?: DCIBreakdown;
  readingGoals?: ReadingGoals;
  favoriteWords?: string[];
  readingSessions?: ReadingSessionRecord[];
}

export interface ParentTeacherSummary {
  childId: string;
  childName: string;
  age: number;
  gradeLevel: string;
  flaggedWords: FlaggedWord[];
  resolvedWordsCount: number;
  strugglingWordsCount: number;
  checkpointCompletionCount: number;
  checkpointAccuracyRate: number;
  inferenceCount: number;
  inferenceAccuracyLast10: number;
  analysisUnlocked: boolean;
  dciScore?: number;
  dciBreakdown?: DCIBreakdown;
  pacingDistribution: {
    fastWrong: number;
    slowWrong: number;
    slowRight: number;
    balanced: number;
  };
  storiesReadCount: number;
  pendingReviewStories?: Story[];
  narrativeInsight?: string;
  recentSessions: Array<{
    storyId: string;
    storyTitle: string;
    topic: string;
    date: string;
    chunksCompleted: number;
    totalChunks: number;
  }>;
}

export type ChildTheme = 'default' | 'enchanted_forest' | 'deep_sea' | 'outer_space' | 'cozy_nook';
export type ChildAvatar = 'owl' | 'robot' | 'fox' | 'dragon' | 'cat';

export interface ChildBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface VocabCheckResult {
  word: string;
  sentenceContext: string;
  options: string[];
  correctOption: string;
  explanation: string;
}
