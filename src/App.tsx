import React, { useState, useEffect } from 'react';
import { ChildProfile, Story } from './types';
import { Header } from './components/Header';
import { ChildReader } from './components/ChildReader';
import { ParentDashboard } from './components/ParentDashboard';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ImportStoryModal } from './components/ImportStoryModal';
import { ParentAuthProvider, useParentAuth } from './context/AuthContext';
import { ParentLoginModal } from './components/ParentLoginModal';
import { fetchWithAuth } from './lib/api';
import { createClientFallbackStory } from './lib/fallback';

function AppContent() {
  const { user, isSignedIn, isLoaded, getToken } = useParentAuth();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [mode, setMode] = useState<'reader' | 'dashboard' | 'parent'>('reader');
  const [story, setStory] = useState<Story | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showParentAuthModal, setShowParentAuthModal] = useState(false);

  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('storynest_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('storynest_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (isSignedIn && user) {
      loadProfiles();
    }
  }, [isSignedIn, user?.id]);

  const loadProfiles = async () => {
    try {
      const res = await fetchWithAuth('/api/profiles', {}, getToken);
      if (res.ok) {
        const data: ChildProfile[] = await res.json();
        setProfiles(data);
        if (data.length > 0) {
          setActiveProfile(data[0]);
        } else {
          setActiveProfile(null);
        }
      }
    } catch (e) {
      console.error('Error loading profiles:', e);
    }
  };

  // Auto-load initial story ONLY if no story exists and no generation is in progress
  useEffect(() => {
    if (activeProfile?.id && !story && !isGeneratingStory) {
      generateStory('Mystery of the Echo Cave', activeProfile.id, 'auto-load');
    }
  }, [activeProfile?.id, story, isGeneratingStory]);

  const handleSelectProfile = (profile: ChildProfile) => {
    setActiveProfile(profile);
  };

  const handleCreateProfile = async (name: string, age: number, gradeLevel: string) => {
    try {
      const res = await fetchWithAuth('/api/profiles', {
        method: 'POST',
        body: JSON.stringify({ name, age, gradeLevel })
      }, getToken);
      if (res.ok) {
        const newProf: ChildProfile = await res.json();
        setProfiles(prev => [...prev, newProf]);
        setActiveProfile(newProf);
        generateStory('Mystery of the Echo Cave', newProf.id, 'user-created-profile');
      }
    } catch (e) {
      console.error('Error creating profile:', e);
    }
  };

  const generateStory = async (topic: string, childId?: string, reason: string = 'user-clicked') => {
    console.log(`[generateStory] triggered with reason: ${reason}`, { topic, childId });
    const targetChildId = childId || activeProfile?.id;
    if (!targetChildId) return;

    if (reason === 'auto-load' && (story || isGeneratingStory)) {
      console.log('[generateStory] Skipped auto-generation: story already exists or is currently generating');
      return;
    }

    setIsGeneratingStory(true);
    try {
      const res = await fetchWithAuth('/api/story/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          childProfileId: targetChildId
        })
      }, getToken);
      if (res.ok) {
        const newStory: Story = await res.json();
        setStory(newStory);
      } else {
        console.warn('[generateStory] API response non-ok, using fallback story');
        setStory(createClientFallbackStory(topic));
      }
    } catch (e) {
      console.error('Error generating story:', e);
      setStory(createClientFallbackStory(topic));
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleUpdateProfile = (updatedProfile: ChildProfile) => {
    setActiveProfile(updatedProfile);
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
        Loading authentication...
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col antialiased transition-colors">
        <Header
          profiles={[]}
          activeProfile={null}
          onSelectProfile={() => {}}
          onCreateProfile={() => {}}
          mode="reader"
          onToggleMode={() => {}}
          onGenerateStory={() => {}}
          onOpenImportModal={() => {}}
          onOpenParentAuth={() => setShowParentAuthModal(true)}
          isGeneratingStory={false}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center flex flex-col justify-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center font-bold text-2xl">
              📖
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Story Nest</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm max-w-md mx-auto">
              Please sign in as a parent or educator to access reader profiles, generate AI stories, and track comprehension.
            </p>
            <button
              onClick={() => setShowParentAuthModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition"
            >
              Sign In / Parent Login
            </button>
          </div>
        </main>
        <ParentLoginModal
          isOpen={showParentAuthModal}
          onClose={() => setShowParentAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white transition-colors">
      <Header
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        mode={mode}
        onToggleMode={setMode}
        onGenerateStory={(topic) => generateStory(topic)}
        onOpenImportModal={() => setShowImportModal(true)}
        onOpenParentAuth={() => setShowParentAuthModal(true)}
        isGeneratingStory={isGeneratingStory}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1">
        {activeProfile ? (
          mode === 'reader' ? (
            <ChildReader
              story={story}
              activeProfile={activeProfile}
              onUpdateProfile={handleUpdateProfile}
              onGenerateNewStory={() => generateStory('The Secret Animal Sanctuary')}
              isGeneratingStory={isGeneratingStory}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          ) : mode === 'dashboard' ? (
            <ProgressDashboard
              activeProfile={activeProfile}
              onUpdateProfile={handleUpdateProfile}
              onSwitchToReader={() => setMode('reader')}
            />
          ) : (
            <ParentDashboard activeProfile={activeProfile} />
          )
        ) : (
          <div className="max-w-md mx-auto py-20 text-center text-slate-600 dark:text-slate-400">
            <p className="mb-4">No child profile found. Create one above to begin!</p>
          </div>
        )}
      </main>

      {/* Bring Your Own Story Modal */}
      {activeProfile && (
        <ImportStoryModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          activeProfileId={activeProfile.id}
          onStoryLoaded={(importedStory) => {
            setStory(importedStory);
            setMode('reader');
          }}
          onSwitchToBuiltIn={() => {
            generateStory('The Secret Animal Sanctuary');
            setMode('reader');
          }}
        />
      )}

      {/* Parent Google Sign-In / Account Modal */}
      <ParentLoginModal
        isOpen={showParentAuthModal}
        onClose={() => setShowParentAuthModal(false)}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Story Nest Reading Companion • Ages 8-12 • Pedagogical Comprehension Engine
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ParentAuthProvider>
      <AppContent />
    </ParentAuthProvider>
  );
}

