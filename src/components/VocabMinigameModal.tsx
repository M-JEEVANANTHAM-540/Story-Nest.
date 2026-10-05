import React, { useState, useEffect, useMemo } from 'react';
import { FlaggedWord } from '../types';
import { Sparkles, Trophy, X, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchWithAuth } from '../lib/api';

interface VocabMinigameModalProps {
  flaggedWords: FlaggedWord[];
  currentChunkText?: string;
  currentChunkIndex?: number;
  onClose: () => void;
}

const COMMON_STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'if', 'in',
  'into', 'is', 'it', 'its', 'itself', 'just', 'like', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor',
  'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'said', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'came', 'went', 'looked',
  'back', 'into', 'over', 'then', 'upon', 'also', 'made', 'took', 'seen', 'know', 'thought'
]);

interface QuizOptionSet {
  correctDefinition: string;
  distractors: string[];
}

function generateLocalQuizOptions(wordObj: FlaggedWord): QuizOptionSet {
  const wordLower = wordObj.word.toLowerCase().trim();

  // Expanded dictionary map of curated definitions for common story vocabulary
  const knownWords: Record<string, { correct: string; distractors: [string, string, string] }> = {
    brother: {
      correct: "A male sibling who shares the same parents.",
      distractors: [
        "A close neighbor who lives in the same town.",
        "A travel guide who shows the way on a journey.",
        "A teacher who guides students through school lessons."
      ]
    },
    sister: {
      correct: "A female sibling who shares the same parents.",
      distractors: [
        "A young classmate who studies at school.",
        "A friendly neighbor from down the street.",
        "A helper who works in a community center."
      ]
    },
    stood: {
      correct: "Remained in an upright position on one's feet.",
      distractors: [
        "Ran quickly across open land toward a distant hill.",
        "Spoke in a low, quiet whisper so no one else heard.",
        "Laid down flat on the cool grass to rest."
      ]
    },
    mother: {
      correct: "A female parent who cares for and raises a child.",
      distractors: [
        "A friendly neighbor who lives across the road.",
        "A doctor who checks people when they feel unwell.",
        "An instructor who teaches music or sports."
      ]
    },
    father: {
      correct: "A male parent who cares for and raises a child.",
      distractors: [
        "A storekeeper who sells goods in a market.",
        "A captain who steers a ship across open waters.",
        "An architect who plans and designs new buildings."
      ]
    },
    friend: {
      correct: "A person whom one knows, likes, and trusts well.",
      distractors: [
        "A stranger passing by on a busy public sidewalk.",
        "A rival competing in a fast-paced sport match.",
        "An inspector checking equipment for safety."
      ]
    },
    family: {
      correct: "A group of related individuals living or caring together.",
      distractors: [
        "A crowd of people watching a public concert.",
        "A team of scientists researching weather patterns.",
        "A class of students studying a new topic."
      ]
    },
    walked: {
      correct: "Moved along on foot at a steady, natural pace.",
      distractors: [
        "Flew high above the clouds in an airplane.",
        "Swam swiftly across a deep flowing river.",
        "Slept deeply through a long quiet night."
      ]
    },
    looked: {
      correct: "Directed one's eyes toward something to see it clearly.",
      distractors: [
        "Listened carefully to a distant music melody.",
        "Carried a heavy wooden box up a steep flight of stairs.",
        "Wrote a message inside a secret journal."
      ]
    },
    called: {
      correct: "Spoke or shouted loudly to get someone's attention.",
      distractors: [
        "Hid quietly behind a thick green bush.",
        "Drew a colorful picture on a blank sheet of paper.",
        "Built a small shelter out of dry pine branches."
      ]
    },
    whispered: {
      correct: "Spoke in a very soft, quiet voice to avoid noise.",
      distractors: [
        "Shouted loudly across a busy crowded playground.",
        "Sang a song at the top of one's lungs.",
        "Blew a loud whistle to start a running race."
      ]
    },
    thought: {
      correct: "Formed an idea or mental picture inside one's mind.",
      distractors: [
        "Ran full speed down a winding outdoor trail.",
        "Picked up a fallen fruit from under a tree.",
        "Painted a wooden fence with bright blue paint."
      ]
    },
    discovered: {
      correct: "Found or learned about something new for the first time.",
      distractors: [
        "Lost a tiny key in a patch of tall grass.",
        "Fixed a broken wheel on a wooden bicycle.",
        "Finished reading the last chapter of a long book."
      ]
    },
    creature: {
      correct: "A living animal or mysterious organism.",
      distractors: [
        "A tall stone building built centuries ago.",
        "A wooden tool used for carving stone statues.",
        "A sparkling gemstone found deep inside a mine."
      ]
    },
    shadow: {
      correct: "A dark area formed when light is blocked by an object.",
      distractors: [
        "A bright flame dancing on top of a candle.",
        "A warm breeze blowing through open windows.",
        "A clear puddle of rainwater reflecting the sky."
      ]
    },
    echo: {
      correct: "A sound repeated by bouncing off a hard surface.",
      distractors: [
        "A sudden flash of lightning during a thunderstorm.",
        "A heavy blanket draped over a wooden chair.",
        "A steady stream of water flowing from a garden hose."
      ]
    },
    glimmer: {
      correct: "To shine softly with a gentle or flickering light.",
      distractors: [
        "To make a loud, ringing sound in the open air.",
        "To bend or fold smoothly without breaking.",
        "To disappear completely under cold, deep water."
      ]
    },
    ancient: {
      correct: "Belonging to a time very long ago in history.",
      distractors: [
        "Built very recently using modern tools.",
        "Hidden deep inside a dense and dark forest.",
        "Changing colors quickly under bright sunlight."
      ]
    },
    courage: {
      correct: "The quality of being brave when facing fear or danger.",
      distractors: [
        "The speed at which someone runs a long race.",
        "The desire to collect rare and shiny objects.",
        "The skill of solving difficult math puzzles."
      ]
    },
    hesitated: {
      correct: "Paused briefly before acting, speaking, or deciding.",
      distractors: [
        "Moved forward quickly without showing any fear.",
        "Shouted loudly to warn others of sudden danger.",
        "Decided immediately without taking any pause."
      ]
    },
    luminous: {
      correct: "Giving off a clear, soft, or bright glowing light.",
      distractors: [
        "Making a low, continuous humming noise.",
        "Heavy and difficult to carry across long distances.",
        "Cold and frozen to the touch like winter ice."
      ]
    },
    pondered: {
      correct: "Thought about something deeply and carefully.",
      distractors: [
        "Ran away quickly from an unknown noise.",
        "Spoke loudly to get everyone's attention.",
        "Forgot a detail after a short period of time."
      ]
    },
    mysterious: {
      correct: "Strange, secret, or difficult to understand or explain.",
      distractors: [
        "Brightly colored and easily seen from far away.",
        "Friendly and eager to talk to new people.",
        "Heavy and constructed from strong solid stone."
      ]
    },
    radiant: {
      correct: "Shining brightly and sending out rays of light.",
      distractors: [
        "Dark and covered in thick grey shadows.",
        "Quiet and soft like a whisper in the wind.",
        "Rough and jagged along the outer edges."
      ]
    },
    solitary: {
      correct: "Existing or living alone without others nearby.",
      distractors: [
        "Gathered together in a large noisy crowd.",
        "Moving constantly from one place to another.",
        "Filled with bright and cheerful music."
      ]
    },
    sanctuary: {
      correct: "A safe and peaceful place of protection and quiet.",
      distractors: [
        "A noisy marketplace filled with busy stalls.",
        "A steep mountain cliff exposed to harsh winds.",
        "A fast-moving current in an ocean channel."
      ]
    }
  };

  if (knownWords[wordLower]) {
    return {
      correctDefinition: knownWords[wordLower].correct,
      distractors: [...knownWords[wordLower].distractors]
    };
  }

  // 1. First priority: Use simpleDefinition if cached on wordObj
  let correctDef = wordObj.simpleDefinition || "";

  // 2. Dynamic definition extraction if simplifiedSentence uses "X means Y":
  if (!correctDef && wordObj.simplifiedSentence && wordObj.simplifiedSentence.toLowerCase().includes("means")) {
    const parts = wordObj.simplifiedSentence.split(/means\s+/i);
    if (parts.length > 1) {
      let extracted = parts[1].trim();
      extracted = extracted.charAt(0).toUpperCase() + extracted.slice(1);
      if (!extracted.endsWith(".")) extracted += ".";
      if (!extracted.toLowerCase().includes("related to")) {
        correctDef = extracted;
      }
    }
  }

  if (!correctDef) {
    // Smart fallback definitions based on word endings / part of speech without word self-references
    if (wordLower.endsWith("ed") || ["stood", "went", "came", "took", "saw", "said", "thought", "found", "heard", "felt", "ran", "sat"].includes(wordLower)) {
      correctDef = "Completed an action or posture described during the scene.";
    } else if (wordLower.endsWith("ing")) {
      correctDef = "Actively engaged in an ongoing action during the story.";
    } else if (wordLower.endsWith("ly")) {
      correctDef = "In a distinct or specific manner during the moment.";
    } else {
      correctDef = "A key person, object, concept, or setting element in the narrative.";
    }
  }

  // Generate 3 word-specific distractors matching grammatical structure and length
  const lowerDef = correctDef.toLowerCase();
  const startsWithTo = lowerDef.startsWith("to ");
  const startsWithArticle = lowerDef.startsWith("a ") || lowerDef.startsWith("an ") || lowerDef.startsWith("the ");
  const startsWithVerb = lowerDef.startsWith("completed") || lowerDef.startsWith("remained") || lowerDef.startsWith("actively");

  let distractors: string[];
  if (startsWithTo) {
    distractors = [
      "To move quickly and directly toward an opposite goal.",
      "To produce a loud, clear sound in a quiet place.",
      "To hold firmly onto something without letting go."
    ];
  } else if (startsWithArticle) {
    distractors = [
      "A sudden, bright flash seen in the night sky.",
      "A large, sturdy object built to withstand heavy weather.",
      "A quiet, gentle feeling that brings peaceful rest."
    ];
  } else if (startsWithVerb) {
    distractors = [
      "Moved rapidly across open land toward a distant hill.",
      "Spoke in a low, quiet whisper so no one else heard.",
      "Laid down flat on the cool grass to rest."
    ];
  } else {
    distractors = [
      "Describing something that is completely quiet and still.",
      "Describing something that moves rapidly without stopping.",
      "Describing something that is heavy and dense in weight."
    ];
  }

  return {
    correctDefinition: correctDef,
    distractors
  };
}

export const VocabMinigameModal: React.FC<VocabMinigameModalProps> = ({
  flaggedWords,
  currentChunkText,
  currentChunkIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [optionsMap, setOptionsMap] = useState<Record<string, QuizOptionSet>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // 1. Extract candidate words from the CURRENT CHUNK being read
  const chunkWords = useMemo(() => {
    if (!currentChunkText) return [];

    const sentences = currentChunkText.split(/(?<=[.!?])\s+/);
    
    // Clean text and extract candidate words
    const cleanTokens: string[] = currentChunkText
      .replace(/[^a-zA-Z\s'-]/g, ' ')
      .split(/\s+/)
      .map((w: string) => w.trim().toLowerCase())
      .filter((w: string) => w.length >= 5 && !COMMON_STOP_WORDS.has(w));

    const uniqueWords: string[] = Array.from(new Set<string>(cleanTokens));

    // Match with flagged words first if available in current chunk
    const matchingFlagged = flaggedWords.filter(fw => 
      currentChunkText.toLowerCase().includes(fw.word.toLowerCase())
    );

    const matchedFlaggedNames = new Set(matchingFlagged.map(f => f.word.toLowerCase()));

    // Map remaining chunk words to FlaggedWord shape
    const extractedChunkWords: FlaggedWord[] = uniqueWords
      .filter((w: string) => !matchedFlaggedNames.has(w))
      .map((w: string) => {
        const matchedSentence = sentences.find(s => s.toLowerCase().includes(w)) || currentChunkText;
        const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
        return {
          word: capitalized,
          originalSentence: matchedSentence,
          simplifiedSentence: `${capitalized} in Chunk ${(currentChunkIndex ?? 0) + 1}`,
          extraExample: '',
          flaggedAt: '',
          timesReused: 0,
          resolved: false
        };
      });

    return [...matchingFlagged, ...extractedChunkWords];
  }, [currentChunkText, currentChunkIndex, flaggedWords]);

  // 2. Build exactly up to 10 questions from the current chunk pool
  const wordsToPlay = useMemo(() => {
    let pool: FlaggedWord[] = [];
    if (chunkWords.length > 0) {
      pool = chunkWords;
    } else if (flaggedWords.length > 0) {
      pool = flaggedWords;
    } else {
      pool = [
        { word: 'Glimmer', originalSentence: 'A light began to glimmer.', simplifiedSentence: 'Glimmer means to shine softly with flickering light.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Ancient', originalSentence: 'The ancient tree stood tall.', simplifiedSentence: 'Ancient means very, very old from a long time ago.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Courage', originalSentence: 'She showed great courage.', simplifiedSentence: 'Courage means being brave when facing hard things.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Hesitated', originalSentence: 'He hesitated before entering.', simplifiedSentence: 'Hesitated means paused briefly before acting.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Luminous', originalSentence: 'The luminous crystal glowed softly.', simplifiedSentence: 'Luminous means giving off a soft glowing light.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Pondered', originalSentence: 'She pondered the mysterious clue.', simplifiedSentence: 'Pondered means thought deeply and carefully.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Mysterious', originalSentence: 'A mysterious key lay on the table.', simplifiedSentence: 'Mysterious means strange or secret.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Radiant', originalSentence: 'The radiant sun warmed the field.', simplifiedSentence: 'Radiant means shining brightly with rays of light.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Solitary', originalSentence: 'A solitary bird sat on the branch.', simplifiedSentence: 'Solitary means living or existing alone.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
        { word: 'Sanctuary', originalSentence: 'They found a quiet sanctuary in the woods.', simplifiedSentence: 'Sanctuary means a safe and peaceful place.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false }
      ];
    }

    if (pool.length >= 10) {
      return pool.slice(0, 10);
    }

    // Pad with fallbacks if pool has fewer than 10
    const result = [...pool];
    const fallbacks = [
      { word: 'Glimmer', originalSentence: 'A light began to glimmer.', simplifiedSentence: 'Glimmer means to shine softly.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Ancient', originalSentence: 'The ancient tree stood tall.', simplifiedSentence: 'Ancient means very old.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Courage', originalSentence: 'She showed great courage.', simplifiedSentence: 'Courage means being brave.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Hesitated', originalSentence: 'He hesitated before entering.', simplifiedSentence: 'Hesitated means paused briefly.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Luminous', originalSentence: 'The luminous crystal glowed.', simplifiedSentence: 'Luminous means glowing softly.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Pondered', originalSentence: 'She pondered the clue.', simplifiedSentence: 'Pondered means thought carefully.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Mysterious', originalSentence: 'A mysterious key lay here.', simplifiedSentence: 'Mysterious means strange or secret.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Radiant', originalSentence: 'The radiant sun warmed the field.', simplifiedSentence: 'Radiant means shining brightly.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Solitary', originalSentence: 'A solitary bird sat alone.', simplifiedSentence: 'Solitary means existing alone.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false },
      { word: 'Sanctuary', originalSentence: 'They found a sanctuary.', simplifiedSentence: 'Sanctuary means a safe place.', extraExample: '', flaggedAt: '', timesReused: 0, resolved: false }
    ];

    for (const fb of fallbacks) {
      if (result.length >= 10) break;
      if (!result.some(item => item.word.toLowerCase() === fb.word.toLowerCase())) {
        result.push(fb);
      }
    }

    return result.slice(0, 10);
  }, [chunkWords, flaggedWords]);

  const totalQuestions = Math.min(10, wordsToPlay.length);
  const currentWordObj = wordsToPlay[currentIndex % wordsToPlay.length];

  // Fetch or load options for current word
  useEffect(() => {
    if (!currentWordObj) return;
    const wordKey = currentWordObj.word;
    if (optionsMap[wordKey] || loadingMap[wordKey]) return;

    setLoadingMap(prev => ({ ...prev, [wordKey]: true }));

    fetchWithAuth('/api/vocab/quiz-options', {
      method: 'POST',
      body: JSON.stringify({
        word: currentWordObj.word,
        originalSentence: currentWordObj.originalSentence,
        simplifiedSentence: currentWordObj.simplifiedSentence,
        simpleDefinition: currentWordObj.simpleDefinition
      })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.correctDefinition && Array.isArray(data.distractors) && data.distractors.length >= 3) {
          setOptionsMap(prev => ({
            ...prev,
            [wordKey]: {
              correctDefinition: data.correctDefinition,
              distractors: data.distractors.slice(0, 3)
            }
          }));
        } else {
          console.warn('[VOCAB_QUIZ_FALLBACK_ALERT]', {
            word: wordKey,
            reason: 'API returned incomplete options or invalid payload',
            timestamp: new Date().toISOString()
          });
          setOptionsMap(prev => ({
            ...prev,
            [wordKey]: generateLocalQuizOptions(currentWordObj)
          }));
        }
      })
      .catch((err) => {
        console.warn('[VOCAB_QUIZ_FALLBACK_ALERT]', {
          word: wordKey,
          reason: err?.message || 'Network fetch error connecting to /api/vocab/quiz-options',
          timestamp: new Date().toISOString()
        });
        setOptionsMap(prev => ({
          ...prev,
          [wordKey]: generateLocalQuizOptions(currentWordObj)
        }));
      })
      .finally(() => {
        setLoadingMap(prev => ({ ...prev, [wordKey]: false }));
      });
  }, [currentWordObj, optionsMap, loadingMap]);

  // Active quiz set for the current word
  const activeQuizSet = useMemo(() => {
    if (!currentWordObj) return { correctDefinition: '', distractors: [] };
    return optionsMap[currentWordObj.word] || generateLocalQuizOptions(currentWordObj);
  }, [currentWordObj, optionsMap]);

  // Shuffled 4 choice options (1 correct + 3 word-specific distractors)
  const choices = useMemo(() => {
    const all = [activeQuizSet.correctDefinition, ...activeQuizSet.distractors];
    return [...all].sort(() => Math.random() - 0.5);
  }, [activeQuizSet]);

  const handleSelect = (choice: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(choice);
    setIsSubmitted(true);

    const isCorrect = choice === activeQuizSet.correctDefinition;
    if (isCorrect) {
      setScore(prev => prev + 1);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    if (currentIndex + 1 >= totalQuestions) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
    setCurrentIndex(prev => prev + 1);
  };

  const isGameFinished = currentIndex >= totalQuestions;

  // Encouraging feedback calculation based on score
  const chunkNum = (currentChunkIndex ?? 0) + 1;
  const ratio = totalQuestions > 0 ? score / totalQuestions : 0;

  let endEmoji = '🌟';
  let endHeading = 'Keep Going, Word Explorer!';
  let endMessage = `You scored ${score} out of ${totalQuestions}. Don't worry! Every new word takes practice. Read Chunk ${chunkNum} again and give it another try!`;
  let endCardBg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200';

  if (score === 0) {
    endEmoji = '🌱';
    endHeading = 'Keep Exploring, Word Detective!';
    endMessage = `You scored 0 out of ${totalQuestions}. No worries at all! Every word you practice helps you grow as a reader. Re-read Chunk ${chunkNum} and try again anytime!`;
    endCardBg = 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200';
  } else if (ratio < 0.5) {
    endEmoji = '💪';
    endHeading = 'Good Effort, Word Explorer!';
    endMessage = `You scored ${score} out of ${totalQuestions}! You're building your vocabulary power in Chunk ${chunkNum}. Keep reading and practicing!`;
    endCardBg = 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200';
  } else if (ratio < 0.8) {
    endEmoji = '⭐';
    endHeading = 'Great Job, Word Master!';
    endMessage = `You scored ${score} out of ${totalQuestions}! You have a solid understanding of the words in Chunk ${chunkNum}!`;
    endCardBg = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
  } else if (score < totalQuestions) {
    endEmoji = '🚀';
    endHeading = 'Super Star Reader!';
    endMessage = `Awesome work! You scored ${score} out of ${totalQuestions}! You really know your Chunk ${chunkNum} vocabulary!`;
    endCardBg = 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200';
  } else {
    endEmoji = '🏆';
    endHeading = 'Perfect Score, Champion!';
    endMessage = `Incredible! You scored a perfect ${score} out of ${totalQuestions} on Chunk ${chunkNum}! You mastered every single word!`;
    endCardBg = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200';
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-700 rounded-3xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                Chunk {chunkNum} Word Game
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                10 Questions from Active Chunk
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isGameFinished ? (
          <div className="space-y-4">
            {/* Word Prompt */}
            <div className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/50 dark:to-amber-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-2">
                Which definition best describes this word from Chunk {chunkNum}?
              </p>
              <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-200 tracking-wide capitalize">
                "{currentWordObj?.word}"
              </h3>
            </div>

            {/* Answer Choices */}
            <div className="space-y-2">
              {choices.map((choice, i) => {
                const isCorrect = choice === activeQuizSet.correctDefinition;
                const isSelected = selectedAnswer === choice;

                let btnClass = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-400";
                if (isSubmitted) {
                  if (isCorrect) {
                    btnClass = "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                  } else if (isSelected) {
                    btnClass = "bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-900 dark:text-rose-200";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isSubmitted}
                    onClick={() => handleSelect(choice)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between ${btnClass}`}
                  >
                    <span>{choice}</span>
                    {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />}
                    {isSubmitted && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            {isSubmitted && (
              <div className="pt-2">
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-xs cursor-pointer text-sm"
                >
                  {currentIndex + 1 >= totalQuestions ? 'See Results 🏆' : 'Next Question 🚀'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Encouraging End State */
          <div className="text-center space-y-4 py-2 animate-fade-in">
            <div className="text-6xl animate-bounce">{endEmoji}</div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {endHeading}
              </h3>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                Score: {score} / {totalQuestions}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed ${endCardBg}`}>
              {endMessage}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-xs cursor-pointer text-sm"
            >
              Back to Reader 📖
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
