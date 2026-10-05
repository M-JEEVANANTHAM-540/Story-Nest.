import React from 'react';
import { Story, CheckpointAttempt } from '../types';
import { MapPin, User, Activity, Target, CheckCircle2, Lock } from 'lucide-react';

interface StoryMapProps {
  story: Story | null;
  checkpointStats: CheckpointAttempt[];
  currentChunkIndex: number;
}

export const StoryMap: React.FC<StoryMapProps> = ({
  story,
  checkpointStats,
  currentChunkIndex
}) => {
  if (!story) return null;

  // Filter completed checkpoints for this story
  const completedCheckpoints = checkpointStats.filter(c => c.storyId === story.id);

  return (
    <div id="story-map-container" className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-wide">
            Persistent Story Map
          </h3>
        </div>
        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-mono font-semibold border border-slate-200 dark:border-slate-700">
          Working Memory Tool
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">
        As you read each chunk, your Who, What, and Why summaries stay mapped here to help you remember the story structure!
      </p>

      {story.chunks.map((chunk, idx) => {
        const isCompleted = idx < currentChunkIndex || completedCheckpoints.some(c => c.chunkIndex === idx);
        const isCurrent = idx === currentChunkIndex;
        const savedCheckpoint = completedCheckpoints.find(c => c.chunkIndex === idx);
        const isLocked = !isCompleted && !isCurrent;

        return (
          <div
            key={idx}
            className={`mb-4 p-3.5 rounded-xl border transition ${
              isCurrent
                ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20 shadow-sm opacity-100'
                : isCompleted
                ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 opacity-100'
                : 'bg-slate-100/50 dark:bg-slate-950/40 border-dashed border-slate-300 dark:border-slate-800 opacity-40 grayscale select-none'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold font-mono flex items-center gap-1.5 ${
                isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-800 dark:text-emerald-400'
              }`}>
                Chunk {idx + 1} of {story.chunks.length}
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              </span>
              {isCurrent ? (
                <span className="text-[10px] uppercase font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded shadow-2xs">
                  Active Reading
                </span>
              ) : isLocked ? (
                <span className="text-[10px] uppercase font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              ) : null}
            </div>

            {savedCheckpoint ? (
              <div className="space-y-2 text-xs font-medium">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px] mb-0.5">
                    <User className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> WHO:
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{savedCheckpoint.whoAnswer}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px] mb-0.5">
                    <Activity className="w-3 h-3 text-sky-700 dark:text-sky-400" /> WHAT:
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{savedCheckpoint.whatAnswer}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px] mb-0.5">
                    <Target className="w-3 h-3 text-amber-700 dark:text-amber-400" /> WHY IT MATTERS:
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{savedCheckpoint.whyAnswer}</p>
                </div>
              </div>
            ) : isCurrent ? (
              <div className="text-xs italic text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700">
                Read Chunk {idx + 1} on the left, then fill in your WHO / WHAT / WHY checkpoint to add it to your story map.
              </div>
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 italic py-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Complete previous chunk checkpoint to unlock.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
