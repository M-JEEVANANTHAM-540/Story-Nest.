import { ChildProfile, ParentTeacherSummary } from '../types';

export interface DCIBreakdown {
  score: number; // 0 - 100
  checkpointWeight: number; // e.g. 35.2
  inferenceWeight: number; // e.g. 24.0
  pacingWeight: number; // e.g. 18.0
  vocabWeight: number; // e.g. 9.5
  levelLabel: 'Emerging Reader' | 'Developing Reader' | 'Proficient Reader' | 'Master Reader';
}

/**
 * Dynamic Comprehension Index (DCI) Formula:
 * DCI = (0.4 * CheckpointAccuracy) + (0.3 * InferenceAccuracy) + (0.2 * PacingQuality) + (0.1 * VocabMastery)
 * Clamp range: [0, 100]
 */
export function calculateDCI(profile?: Partial<ChildProfile>, summary?: Partial<ParentTeacherSummary>): DCIBreakdown {
  const checkpoints = profile?.checkpointStats || [];
  const inferences = profile?.inferenceHistory || [];
  const flagged = profile?.flaggedWords || [];

  // 1. Checkpoint Accuracy (40% Weight)
  let checkpointAcc = summary?.checkpointAccuracyRate ?? 75;
  if (checkpoints.length > 0) {
    const validCount = checkpoints.filter(c => c.overallValid).length;
    checkpointAcc = (validCount / checkpoints.length) * 100;
  }
  const checkpointWeight = (checkpointAcc * 0.4);

  // 2. Inference Accuracy (30% Weight)
  let inferenceAcc = summary?.inferenceAccuracyLast10 ?? 70;
  if (inferences.length > 0) {
    const recent = inferences.slice(-10);
    const correctCount = recent.filter(i => i.isCorrect).length;
    inferenceAcc = (correctCount / recent.length) * 100;
  }
  const inferenceWeight = (inferenceAcc * 0.3);

  // 3. Pacing Quality (20% Weight)
  let pacingScore = 80;
  if (checkpoints.length > 0) {
    const balancedCount = checkpoints.filter(c => c.pacingClass === 'balanced' || c.pacingClass === 'slow_right').length;
    pacingScore = (balancedCount / checkpoints.length) * 100;
  }
  const pacingWeight = (pacingScore * 0.2);

  // 4. Vocab Mastery (10% Weight)
  let vocabScore = 100;
  if (flagged.length > 0) {
    const resolvedCount = flagged.filter(f => f.resolved).length;
    vocabScore = (resolvedCount / flagged.length) * 100;
  }
  const vocabWeight = (vocabScore * 0.1);

  const rawScore = Math.round(checkpointWeight + inferenceWeight + pacingWeight + vocabWeight);
  const score = Math.max(0, Math.min(100, rawScore));

  let levelLabel: DCIBreakdown['levelLabel'] = 'Developing Reader';
  if (score >= 85) levelLabel = 'Master Reader';
  else if (score >= 70) levelLabel = 'Proficient Reader';
  else if (score >= 50) levelLabel = 'Developing Reader';
  else levelLabel = 'Emerging Reader';

  return {
    score,
    checkpointWeight: Math.round(checkpointWeight * 10) / 10,
    inferenceWeight: Math.round(inferenceWeight * 10) / 10,
    pacingWeight: Math.round(pacingWeight * 10) / 10,
    vocabWeight: Math.round(vocabWeight * 10) / 10,
    levelLabel,
  };
}
