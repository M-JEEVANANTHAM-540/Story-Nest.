import React, { useState } from 'react';
import { ChildProfile, Story, ReadingGoals } from '../types';
import { processDashboardData, DEFAULT_READING_GOALS } from '../utils/dashboardData';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  Target,
  Calendar,
  Heart,
  ArrowRight,
  RotateCcw,
  BookMarked,
  Cpu,
  Layers,
  Edit3,
  Check,
  Zap,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

interface ProgressDashboardProps {
  activeProfile: ChildProfile;
  onUpdateProfile?: (updated: ChildProfile) => void;
  onSwitchToReader: (storyId?: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  activeProfile,
  onUpdateProfile,
  onSwitchToReader
}) => {
  const stats = processDashboardData(activeProfile);

  // Local state for goals (persisted to profile)
  const [goals, setGoals] = useState<ReadingGoals>(
    activeProfile.readingGoals || DEFAULT_READING_GOALS
  );
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempDaily, setTempDaily] = useState(goals.dailyMinutes);
  const [tempWeekly, setTempWeekly] = useState(goals.weeklyMinutes);
  const [tempMonthly, setTempMonthly] = useState(goals.monthlyStories);

  // Local state for favorite words (persisted to profile)
  const [favoriteWords, setFavoriteWords] = useState<string[]>(
    activeProfile.favoriteWords || ['luminous', 'hesitated']
  );

  // Active tabs for charts & vocab
  const [chartTab, setChartTab] = useState<'weekly' | 'monthly' | 'vocab'>('weekly');
  const [vocabTab, setVocabTab] = useState<'all' | 'learned' | 'practice' | 'favorites'>('all');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const handleSaveGoals = () => {
    const newGoals: ReadingGoals = {
      dailyMinutes: Math.max(1, Number(tempDaily)),
      weeklyMinutes: Math.max(5, Number(tempWeekly)),
      monthlyStories: Math.max(1, Number(tempMonthly))
    };
    setGoals(newGoals);
    setIsEditingGoals(false);

    if (onUpdateProfile) {
      onUpdateProfile({
        ...activeProfile,
        readingGoals: newGoals
      });
    }
  };

  const toggleFavoriteWord = (word: string) => {
    let updated: string[];
    if (favoriteWords.includes(word)) {
      updated = favoriteWords.filter(w => w !== word);
    } else {
      updated = [...favoriteWords, word];
    }
    setFavoriteWords(updated);

    if (onUpdateProfile) {
      onUpdateProfile({
        ...activeProfile,
        favoriteWords: updated
      });
    }
  };

  // Percentages for Goals
  const dailyPercent = Math.min(100, Math.round((stats.totalReadingTimeMinutes / goals.dailyMinutes) * 100));
  const weeklyPercent = Math.min(100, Math.round((stats.totalReadingTimeMinutes / goals.weeklyMinutes) * 100));
  const monthlyPercent = Math.min(100, Math.round((stats.totalStoriesCompleted / goals.monthlyStories) * 100));

  // Vocabulary Filtering
  const allWords = activeProfile.flaggedWords || [];
  const filteredWords = allWords.filter(w => {
    if (vocabTab === 'learned') return w.resolved;
    if (vocabTab === 'practice') return !w.resolved;
    if (vocabTab === 'favorites') return favoriteWords.includes(w.word);
    return true;
  });

  // Achievements Filtering
  const filteredAchievements = stats.achievements.filter(ach => {
    if (achievementFilter === 'unlocked') return ach.unlocked;
    if (achievementFilter === 'locked') return !ach.unlocked;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* 1. Header Banner & Reader Level Summary */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Personalized Progress Dashboard</span>
              <span className="bg-emerald-800/80 text-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-700 font-mono">
                Real-Time Sync
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {activeProfile.name}'s Reading Dashboard
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-xl">
              Track reading streaks, goals, vocabulary mastery, and AI-derived comprehension metrics for {activeProfile.gradeLevel}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 text-center sm:text-left space-y-1 min-w-[160px]">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Comprehension Level</div>
              <div className="text-xl font-black text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Cpu className="w-5 h-5 text-amber-400" />
                <span>{activeProfile.dciBreakdown?.levelLabel || 'Proficient Reader'}</span>
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold font-mono">
                DCI Score: {activeProfile.dciScore || 85} / 100
              </div>
            </div>

            <button
              onClick={() => onSwitchToReader()}
              className="px-6 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <BookOpen className="w-5 h-5" />
              <span>Continue Reading</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 📊 Primary Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Stories Read */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stories Read</span>
            <div className="bg-emerald-100 dark:bg-emerald-950/80 p-2 rounded-xl text-emerald-700 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalStoriesRead}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{stats.totalStoriesCompleted} fully completed</span>
          </p>
        </div>

        {/* Total Reading Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:border-sky-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reading Time</span>
            <div className="bg-sky-100 dark:bg-sky-950/80 p-2 rounded-xl text-sky-700 dark:text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalReadingTimeMinutes} <span className="text-sm font-semibold text-slate-500">mins</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Avg {stats.avgSessionLengthMinutes} mins / session
          </p>
        </div>

        {/* Current Reading Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Streak</span>
            <div className="bg-amber-100 dark:bg-amber-950/80 p-2 rounded-xl text-amber-700 dark:text-amber-400">
              <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
            {stats.currentStreak} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Best record: <strong className="text-amber-700 dark:text-amber-300">{stats.bestStreak} days</strong>
          </p>
        </div>

        {/* Words Learned */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vocab Learned</span>
            <div className="bg-purple-100 dark:bg-purple-950/80 p-2 rounded-xl text-purple-700 dark:text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
            {stats.totalVocabLearned}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {stats.totalVocabSaved} words saved in bank
          </p>
        </div>

      </div>

      {/* 3. 🎯 Goals Section with Interactive Modal/Editor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-950/80 p-2.5 rounded-2xl text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Personalized Reading Goals</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Custom targets set for daily, weekly, and monthly reading milestones.</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingGoals(!isEditingGoals)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{isEditingGoals ? 'Close Editor' : 'Adjust Target Goals'}</span>
          </button>
        </div>

        {/* Goal Editors Form (if open) */}
        {isEditingGoals && (
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 space-y-4 animate-fade-in">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">Update Target Reading Goals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Reading Goal (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={tempDaily}
                  onChange={(e) => setTempDaily(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weekly Goal (Mins)
                </label>
                <input
                  type="number"
                  min={10}
                  max={600}
                  value={tempWeekly}
                  onChange={(e) => setTempWeekly(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Goal (Stories)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={tempMonthly}
                  onChange={(e) => setTempMonthly(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleSaveGoals}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save New Goals</span>
              </button>
            </div>
          </div>
        )}

        {/* Goal Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Daily Goal */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Daily Reading Goal</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{dailyPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{stats.totalReadingTimeMinutes} / {goals.dailyMinutes} mins today</span>
              {dailyPercent >= 100 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">🎯 Completed!</span>}
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Weekly Target (Mins)</span>
              <span className="text-sky-600 dark:text-sky-400 font-mono">{weeklyPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{stats.totalReadingTimeMinutes} / {goals.weeklyMinutes} mins this week</span>
              {weeklyPercent >= 100 && <span className="text-sky-600 dark:text-sky-400 font-bold">🎯 Completed!</span>}
            </div>
          </div>

          {/* Monthly Story Goal */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Monthly Stories Completed</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono">{monthlyPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{stats.totalStoriesCompleted} / {goals.monthlyStories} stories</span>
              {monthlyPercent >= 100 && <span className="text-purple-600 dark:text-purple-400 font-bold">🎯 Completed!</span>}
            </div>
          </div>

        </div>
      </div>

      {/* 4. 📈 Interactive Progress Charts Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-950/80 p-2.5 rounded-2xl text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Reading Activity Charts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Visual metrics of reading time, stories completed, and vocabulary growth.</p>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setChartTab('weekly')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                chartTab === 'weekly' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Weekly Activity
            </button>
            <button
              onClick={() => setChartTab('monthly')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                chartTab === 'monthly' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Monthly Trend
            </button>
            <button
              onClick={() => setChartTab('vocab')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                chartTab === 'vocab' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Vocab Growth
            </button>
          </div>
        </div>

        {/* Chart Render Area */}
        <div className="h-64 sm:h-72 w-full">
          {chartTab === 'weekly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} mins`, 'Reading Time']}
                />
                <Bar dataKey="minutes" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartTab === 'monthly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="minutesRead" name="Minutes Read" fill="#0284C7" radius={[8, 8, 0, 0]} />
                <Bar dataKey="storiesCompleted" name="Stories Completed" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartTab === 'vocab' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.vocabTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} words`, 'Mastered Words']}
                />
                <Area type="monotone" dataKey="wordsLearned" stroke="#A855F7" fill="#F3E8FF" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 5. 🔥 Streak Section & 30-Day Activity Calendar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-950/80 p-2.5 rounded-2xl text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Reading Streak & Activity Grid</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">30-day interactive calendar map of daily reading sessions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-2xl">
            <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Current: <span className="text-base font-black text-amber-600 dark:text-amber-400">{stats.currentStreak} Days</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Best: <span className="font-extrabold">{stats.bestStreak} Days</span>
            </div>
          </div>
        </div>

        {/* Past 30 Days Mini Calendar Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>Past 30 Days Activity Heat Map</span>
            <div className="flex items-center gap-2 text-[11px] font-normal">
              <span className="text-slate-400">Inactive</span>
              <span className="w-3 h-3 bg-slate-200 dark:bg-slate-800 rounded-md"></span>
              <span className="w-3 h-3 bg-emerald-500 rounded-md"></span>
              <span className="text-slate-400">Active Reading</span>
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
            {stats.streakInfo.past30DaysGrid.map((item, idx) => (
              <div
                key={idx}
                title={`${item.date}: ${item.active ? `${item.minutes} mins reading` : 'No reading registered'}`}
                className={`p-2 rounded-xl text-center border transition transform hover:scale-105 cursor-pointer ${
                  item.active
                    ? 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="text-[10px] uppercase font-mono">{item.dayNum}</div>
                {item.active && <div className="text-[9px] font-mono leading-none mt-0.5">✓</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. 🏆 Achievements Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-950/80 p-2.5 rounded-2xl text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Milestones & Achievements</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Earn badges by completing stories, keeping streaks, and learning vocabulary.</p>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setAchievementFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                achievementFilter === 'all' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              All Badges ({stats.achievements.length})
            </button>
            <button
              onClick={() => setAchievementFilter('unlocked')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                achievementFilter === 'unlocked' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Unlocked ({stats.achievements.filter(a => a.unlocked).length})
            </button>
            <button
              onClick={() => setAchievementFilter('locked')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                achievementFilter === 'locked' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Locked ({stats.achievements.filter(a => !a.unlocked).length})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((ach) => {
            const pct = Math.min(100, Math.round((ach.currentValue / ach.targetValue) * 100));
            return (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between space-y-3 ${
                  ach.unlocked
                    ? 'bg-gradient-to-br from-purple-50/60 to-amber-50/60 dark:from-purple-950/30 dark:to-slate-900 border-purple-200 dark:border-purple-800/80 shadow-2xs'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-3xl p-2.5 rounded-2xl border shrink-0 ${
                    ach.unlocked
                      ? 'bg-white dark:bg-slate-800 border-purple-300 dark:border-purple-700 shadow-2xs'
                      : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 grayscale'
                  }`}>
                    {ach.badgeIcon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ach.name}</h3>
                      {ach.unlocked ? (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-300 dark:border-emerald-700">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-semibold">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-1">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar for locked badges */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    <span>Progress: {ach.currentValue} / {ach.targetValue}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ach.unlocked ? 'bg-purple-600' : 'bg-slate-400 dark:bg-slate-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. 📖 Vocabulary Progress & Bank */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-sky-100 dark:bg-sky-950/80 p-2.5 rounded-2xl text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Vocabulary Growth & Bank</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tricky words encountered in stories, simplified definitions, and favorite bookmarks.</p>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setVocabTab('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                vocabTab === 'all' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              All ({allWords.length})
            </button>
            <button
              onClick={() => setVocabTab('learned')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                vocabTab === 'learned' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Mastered ({allWords.filter(w => w.resolved).length})
            </button>
            <button
              onClick={() => setVocabTab('practice')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                vocabTab === 'practice' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Needs Practice ({allWords.filter(w => !w.resolved).length})
            </button>
            <button
              onClick={() => setVocabTab('favorites')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                vocabTab === 'favorites' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Favorites ({favoriteWords.length})
            </button>
          </div>
        </div>

        {/* Word Cards List */}
        {filteredWords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((wordObj) => {
              const isFav = favoriteWords.includes(wordObj.word);
              return (
                <div
                  key={wordObj.word}
                  className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900 dark:text-white capitalize">
                        {wordObj.word}
                      </span>
                      {wordObj.resolved ? (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          Mastered
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          In Practice
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleFavoriteWord(wordObj.word)}
                      className={`p-1.5 rounded-xl transition cursor-pointer ${
                        isFav ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Add to favorite words'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <strong className="text-slate-800 dark:text-slate-200">Simplified: </strong>
                    {wordObj.simplifiedSentence}
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    "{wordObj.extraExample || wordObj.originalSentence}"
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
            No vocabulary words found in this filter view.
          </div>
        )}
      </div>

      {/* 8. 🤖 AI Personalised Insights Section */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2.5 rounded-2xl border border-indigo-500/30 text-indigo-300">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Personalised Reading Insights</h2>
            <p className="text-xs text-indigo-200/80 font-medium">Automated observations calculated directly from reading behaviors & comprehension stats.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {stats.aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-indigo-950/60 border border-indigo-800/60 p-4 rounded-2xl flex items-start gap-3 text-xs text-indigo-100 font-medium leading-relaxed"
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
