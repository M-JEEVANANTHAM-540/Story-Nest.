import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Wand2, Bookmark, Lightbulb, Compass } from 'lucide-react';
import { fetchWithAuth } from '../lib/api';

export const buildTeaserPrompt = (
  childName: string,
  readingLevel: string,
  storyTheme: string,
  storySoFar?: string
) => `
You are generating a SHORT, exciting loading-screen teaser for a children's reading app.

CONTEXT:
- Child's name: ${childName}
- Reading level: ${readingLevel} (Emerging | Developing | Proficient | Master Reader)
- Story theme: ${storyTheme}
- Story content generated so far: ${storySoFar || "Not yet generated — this is a fresh story."}

RULES (must follow exactly):
1. Output ONE sentence only, under 15 words.
2. Must NOT reveal plot twists, endings, or major events — only build curiosity.
3. Match vocabulary complexity to the reading level (simpler words for Emerging, richer for Master Reader).
4. Include exactly one relevant emoji at the start.
5. Tone: playful, warm, exciting — like a friend hyping up what's coming next, NOT instructional or test-like.
6. Never use words like "test", "quiz", "assessment", "skills", or "practice" — this is entertainment, not homework.
7. Output ONLY the sentence. No preamble, no quotes, no explanation.

Example good outputs:
🌲 Someone is waiting for ${childName} in the forest...
🗝️ A mysterious door is about to creak open...
🐉 Something with wings is getting closer...

Now generate one teaser for this story.
`.trim();

export const LOADING_MESSAGES = [
  "🐙 Did you know an octopus has 3 hearts?",
  "🦉 Hoot! Turning pages while you wait...",
  "🧩 Riddle: What has keys but no locks? (Think about it!)",
  "🌟 Fun fact: Honey never spoils. Ever. Not even in 3000 years!",
  "🐝 A group of flamingos is called a 'flamboyance.'",
  "🔍 Sneaking a peek at your story's secret ending...",
  "🎨 Mixing the perfect colors for your next chapter...",
  "🌙 Did you know you can't sneeze with your eyes open?",
  "📖 Your story is warming up its imagination...",
  "🦋 A butterfly tastes with its feet!",
  "✨ Sprinkling a little magic into your next word...",
  "🐢 Turtles can breathe through their butts. (Yes, really.)",
  "🎭 Casting the perfect character for your adventure...",
  "🌈 Bananas are berries, but strawberries aren't!",
  "📚 Waking up the words that are about to become your story..."
];

// Rotate every 2-3s while loading
export const getRandomMessage = () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

interface StoryNestLoadingStateProps {
  title?: string;
  subtitle?: string;
  stageHint?: string;
  compact?: boolean;
  childName?: string;
  readingLevel?: string;
  storyTheme?: string;
  storySoFar?: string;
  teaserText?: string;
}

export const StoryNestLoadingState: React.FC<StoryNestLoadingStateProps> = ({
  title = "Crafting Your Story...",
  subtitle = "Structuring 100-150 word chunks, vocabulary scaffold opportunities, and story map checkpoints.",
  stageHint = "Organizing Who / What / Why Skeleton...",
  compact = false,
  childName,
  readingLevel = "Developing",
  storyTheme,
  storySoFar,
  teaserText: initialTeaserText
}) => {
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_MESSAGES.length)
  );
  const [aiTeaser, setAiTeaser] = useState<string | null>(initialTeaserText || null);
  const [isFetchingTeaser, setIsFetchingTeaser] = useState<boolean>(false);

  // Rotate fun facts / riddles / loading messages every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Fetch dynamic AI teaser if childName or storyTheme is provided and teaser wasn't passed directly
  useEffect(() => {
    if (initialTeaserText) {
      setAiTeaser(initialTeaserText);
      return;
    }

    if (!childName && !storyTheme) return;

    let isMounted = true;
    const fetchTeaser = async () => {
      setIsFetchingTeaser(true);
      try {
        const res = await fetchWithAuth('/api/story/teaser', {
          method: 'POST',
          body: JSON.stringify({
            childName: childName || 'Adventurer',
            readingLevel,
            storyTheme: storyTheme || 'Adventure',
            storySoFar
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.teaser && isMounted) {
            setAiTeaser(data.teaser);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch dynamic teaser:', e);
      } finally {
        if (isMounted) setIsFetchingTeaser(false);
      }
    };

    fetchTeaser();

    return () => {
      isMounted = false;
    };
  }, [childName, readingLevel, storyTheme, storySoFar, initialTeaserText]);

  if (compact) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 text-center border border-amber-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto my-4 space-y-3 animate-fade-in">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-500 animate-pulse blur-xs opacity-50 absolute"></div>
          <div className="relative w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
            <BookOpen className="w-6 h-6 animate-float-gentle text-amber-600 dark:text-amber-400" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 absolute -top-1 -right-1 animate-ping" />
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>

        {/* Dynamic AI Teaser in Compact Mode */}
        {aiTeaser && (
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-300/60 dark:border-amber-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 animate-fade-in shadow-2xs">
            {aiTeaser}
          </div>
        )}

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
          <div className="bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 h-full w-full animate-shimmer-fast"></div>
        </div>

        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 animate-fade-in">
          {LOADING_MESSAGES[loadingMsgIndex]}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-amber-200/80 dark:border-slate-800 shadow-xl max-w-2xl mx-auto my-8 space-y-6 relative overflow-hidden animate-fade-in">
      {/* Background Subtle Accent Glows */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Dynamic Teaser & Fun Fact Hero Card (Replaces static square box) */}
      <div className="relative max-w-md mx-auto my-3">
        {/* Pulsing Aura Background */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/40 via-emerald-400/40 to-sky-400/40 blur-md animate-pulse"></div>

        <div className="relative bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-850 border-2 border-amber-300/80 dark:border-amber-600/80 rounded-2xl p-5 shadow-md text-center space-y-2">
          {/* Top Label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{aiTeaser ? "Story Sneak Peek" : "Did You Know?"}</span>
          </div>

          {/* Featured Teaser or Fact Text */}
          <div className="min-h-[52px] flex items-center justify-center">
            <p className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 leading-snug animate-fade-in transition-all">
              {aiTeaser || LOADING_MESSAGES[loadingMsgIndex]}
            </p>
          </div>

          {/* Secondary rotator when AI teaser is shown */}
          {aiTeaser && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1 border-t border-amber-200/60 dark:border-slate-700/60 animate-fade-in">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
          )}
        </div>
      </div>

      {/* Title & Stage Information */}
      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          <span>{title}</span>
        </h2>
        
        {subtitle && (
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            {subtitle}
          </p>
        )}

        {stageHint && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>{stageHint}</span>
          </div>
        )}
      </div>

      {/* Animated Reading Progress Bar */}
      <div className="max-w-md mx-auto space-y-1.5 pt-2">
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700/80 relative">
          <div className="bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 h-full w-full animate-shimmer-fast rounded-full"></div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <span>Preparing story chunks...</span>
          <span>StoryNest AI Engine</span>
        </div>
      </div>
    </div>
  );
};
