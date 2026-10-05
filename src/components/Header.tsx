import React, { useState } from 'react';
import { ChildProfile } from '../types';
import { BookOpen, UserCheck, ShieldAlert, Sparkles, Plus, GraduationCap, FileText, User, Sun, Moon, AlertTriangle, BarChart3 } from 'lucide-react';
import { useParentAuth } from '../context/AuthContext';
import { checkClientModeration } from '../utils/moderationGuard';

interface HeaderProps {
  profiles: ChildProfile[];
  activeProfile: ChildProfile | null;
  onSelectProfile: (profile: ChildProfile) => void;
  onCreateProfile: (name: string, age: number, gradeLevel: string) => void;
  mode: 'reader' | 'dashboard' | 'parent';
  onToggleMode: (mode: 'reader' | 'dashboard' | 'parent') => void;
  onGenerateStory: (topic: string) => void;
  onOpenImportModal: () => void;
  onOpenParentAuth: () => void;
  isGeneratingStory: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const TOPICS = [
  "Mystery of the Echo Cave",
  "The Island of Lost Gadgets",
  "Space Station Botanist",
  "Ancient Pyramid Key",
  "The Secret Animal Sanctuary",
  "Time Traveler's Compass",
  "Mountain Rescue Team"
];

export const Header: React.FC<HeaderProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile,
  mode,
  onToggleMode,
  onGenerateStory,
  onOpenImportModal,
  onOpenParentAuth,
  isGeneratingStory,
  theme,
  onToggleTheme
}) => {
  const { user: parentUser, isSignedIn: isParentSignedIn } = useParentAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState(9);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [moderationError, setModerationError] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    const grade = `Grade ${Math.min(6, Math.max(3, newProfileAge - 5))}`;
    onCreateProfile(newProfileName.trim(), newProfileAge, grade);
    setNewProfileName('');
    setShowAddModal(false);
  };

  const handleStoryStart = () => {
    setModerationError(null);
    const topicToUse = customTopic.trim() || selectedTopic;
    if (customTopic.trim()) {
      const modResult = checkClientModeration(customTopic.trim());
      if (!modResult.safe) {
        setModerationError(modResult.reason || 'Topic flagged by content filter.');
        return;
      }
    }
    onGenerateStory(topicToUse);
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Name */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 p-2.5 sm:p-3 rounded-2xl text-white shadow-md ring-2 ring-emerald-500/20 transform transition hover:scale-105">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-xs" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 dark:from-white dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                Story<span className="text-amber-500 dark:text-amber-400">Nest</span>
              </span>
              <span className="text-[10px] sm:text-xs bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wider shadow-2xs">
                Ages 8-12
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wide">
              Interactive AI Reading & Comprehension
            </p>
          </div>
        </div>

        {/* Story Generator & Custom Story Buttons (only in reader mode) */}
        {mode === 'reader' && (
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Read a Built-In Story */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-2 hidden sm:inline" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-medium rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t}</option>
                ))}
              </select>
              <button
                onClick={handleStoryStart}
                disabled={isGeneratingStory}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
              >
                {isGeneratingStory ? 'Structuring...' : 'Read Built-In Story'}
              </button>
            </div>

            {/* Equal Visual Importance: Bring Your Own Story */}
            <button
              onClick={onOpenImportModal}
              disabled={isGeneratingStory}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-2 border border-amber-600/30 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-amber-100" />
              Bring Your Own Story
            </button>

          </div>
        )}

        {/* Profile Switcher, Mode Toggle & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Active Profile Dropdown */}
          <div className="relative flex items-center bg-slate-100/90 dark:bg-slate-800/90 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-2" />
            <select
              value={activeProfile?.id || ''}
              onChange={(e) => {
                if (e.target.value === 'add_new') {
                  setShowAddModal(true);
                } else {
                  const p = profiles.find((prof) => prof.id === e.target.value);
                  if (p) onSelectProfile(p);
                }
              }}
              className="bg-transparent text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold px-2 py-1 focus:outline-none cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {p.name} ({p.age} yrs, {p.gradeLevel})
                </option>
              ))}
              <option value="add_new" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold">
                + Add Child Profile
              </option>
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex text-xs">
            <button
              onClick={() => onToggleMode('reader')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
                mode === 'reader'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Child Reader
            </button>
            <button
              onClick={() => onToggleMode('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
                mode === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Progress Dashboard
            </button>
            <button
              onClick={() => onToggleMode('parent')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
                mode === 'parent'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Parent Summary
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Parent Google Auth Account Button */}
          <button
            onClick={onOpenParentAuth}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs"
            title="Manage Parent Account & Google Sign-In"
          >
            {parentUser?.avatarUrl ? (
              <img src={parentUser.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
            ) : (
              <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span className="hidden sm:inline font-semibold">
              {isParentSignedIn ? (parentUser?.name || 'Parent Account') : 'Parent Sign-In'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Add Child Profile
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Child's Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya or Leo"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Age (8 - 12 years)</label>
                <input
                  type="number"
                  min={8}
                  max={12}
                  value={newProfileAge}
                  onChange={(e) => setNewProfileAge(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                Target Lexile band will be set automatically to Grade {Math.min(6, Math.max(3, newProfileAge - 5))} level vocabulary and sentence complexity.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

