import React from 'react';
import { useParentAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Lock, CheckCircle2 } from 'lucide-react';

interface ParentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ParentLoginModal: React.FC<ParentLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { isSignedIn, user, signInWithGoogle, signOut, isClerkConfigured } = useParentAuth();

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error('Error signing in with Google:', e);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 shadow-xl relative overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-950/80 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-6 h-6 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Parent Authentication</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Google OAuth • Single Persistent Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="py-6 space-y-6">
          {isSignedIn && user ? (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-11 h-11 rounded-full border border-amber-300 dark:border-amber-700 object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 flex items-center justify-center font-bold text-amber-800 dark:text-amber-300 text-base">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    {user.name}
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded font-mono font-semibold">
                      Logged In
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 space-y-1 font-medium">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Persistent Session Active
                </div>
                <p>Children access profiles directly through this authenticated parent account.</p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Sign Out Parent Account
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Continue to App
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                Sign in as a parent to manage child profiles, review content safety flags, and view pedagogical skill metrics.
              </p>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google (Parent)
              </button>

              <div className="pt-2 text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" /> Persistent session • Children do not need separate accounts
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
