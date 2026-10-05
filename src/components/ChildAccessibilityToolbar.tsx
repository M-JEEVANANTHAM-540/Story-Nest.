import React from 'react';
import { ChildTheme } from '../types';
import { Sparkles, Type, Settings, X, Sun, Moon } from 'lucide-react';

interface ChildAccessibilityToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ChildTheme;
  onSelectTheme: (theme: ChildTheme) => void;
  dyslexicFontEnabled: boolean;
  onToggleDyslexicFont: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const ChildAccessibilityToolbar: React.FC<ChildAccessibilityToolbarProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  dyslexicFontEnabled,
  onToggleDyslexicFont,
  theme,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  const themes: { id: ChildTheme; label: string; bg: string; icon: string }[] = [
    { id: 'default', label: 'Classic', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: '📖' },
    { id: 'enchanted_forest', label: 'Forest', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: '🌲' },
    { id: 'deep_sea', label: 'Deep Sea', bg: 'bg-sky-100 text-sky-900 border-sky-300', icon: '🌊' },
    { id: 'outer_space', label: 'Space', bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: '🚀' },
    { id: 'cozy_nook', label: 'Cozy Nook', bg: 'bg-orange-100 text-orange-900 border-orange-300', icon: '☕' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 shadow-2xl relative space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Reading Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Customize themes, fonts, and dark mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Visual Theme Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Story Visual Theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border shadow-2xs ${
                  currentTheme === t.id
                    ? 'ring-2 ring-emerald-500 border-emerald-500 scale-105'
                    : 'opacity-80 hover:opacity-100'
                } ${t.bg}`}
              >
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Display & Typography Preferences */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Display & Typography
          </label>
          
          <div className="space-y-2">
            {/* Easy Font Toggle */}
            <button
              onClick={onToggleDyslexicFont}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                dyslexicFontEnabled
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Type className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div className="text-left">
                  <div className="font-bold">Easy-Read Font (OpenDyslexic style)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Increases letter spacing & readability</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                dyslexicFontEnabled ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {dyslexicFontEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                  <div className="text-left">
                    <div className="font-bold">Display Mode</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {theme === 'dark' ? 'Dark 🌙' : 'Light ☀️'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

