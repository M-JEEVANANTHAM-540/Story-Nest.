import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClerkProvider, useUser, useClerk, useAuth } from '@clerk/clerk-react';

const rawClerkKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkPublishableKey = typeof rawClerkKey === 'string' && (rawClerkKey.trim().startsWith('pk_test_') || rawClerkKey.trim().startsWith('pk_live_'));
const CLERK_KEY = isValidClerkPublishableKey ? rawClerkKey.trim() : null;

if (rawClerkKey && !isValidClerkPublishableKey) {
  console.warn(`[StoryNest Auth] Provided VITE_CLERK_PUBLISHABLE_KEY is invalid (Clerk publishable keys must start with 'pk_test_' or 'pk_live_'). Falling back to local authentication.`);
}

export interface ParentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'clerk';
}

interface ParentAuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: ParentUser | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isClerkConfigured: boolean;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<ParentAuthContextType | null>(null);

const PARENT_STORAGE_KEY = 'storynest_parent_session_v1';

// Inner component when Clerk key is present
const ClerkAuthBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut, openSignIn } = useClerk();
  const { getToken: clerkGetToken } = useAuth();

  const user: ParentUser | null = React.useMemo(() => (clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || 'Parent',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    avatarUrl: clerkUser.imageUrl,
    provider: 'clerk' as const
  } : null), [clerkUser?.id, clerkUser?.fullName, clerkUser?.firstName, clerkUser?.primaryEmailAddress?.emailAddress, clerkUser?.imageUrl]);

  const signInWithGoogle = React.useCallback(async () => {
    openSignIn({});
  }, [openSignIn]);

  const signOut = React.useCallback(async () => {
    await clerkSignOut();
  }, [clerkSignOut]);

  const getToken = React.useCallback(async (): Promise<string | null> => {
    if (!clerkUser) return null;
    try {
      const token = await clerkGetToken();
      return token || clerkUser.id;
    } catch {
      return clerkUser.id;
    }
  }, [clerkUser?.id, clerkGetToken]);

  const contextValue = React.useMemo(() => ({
    isSignedIn: !!isSignedIn,
    isLoaded,
    user,
    signInWithGoogle,
    signOut,
    isClerkConfigured: true,
    getToken
  }), [isSignedIn, isLoaded, user, signInWithGoogle, signOut, getToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Provider component that handles both Clerk and local fallback
export const ParentAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Local fallback auth state (used if Clerk key is not provided in env)
  const [localUser, setLocalUser] = useState<ParentUser | null>(null);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  useEffect(() => {
    if (!CLERK_KEY) {
      try {
        const saved = localStorage.getItem(PARENT_STORAGE_KEY);
        if (saved) {
          setLocalUser(JSON.parse(saved));
        } else {
          setLocalUser(null);
        }
      } catch (e) {
        console.error('Error reading saved parent session:', e);
        setLocalUser(null);
      } finally {
        setIsLocalLoaded(true);
      }
    }
  }, []);

  const localSignInWithGoogle = async () => {
    const mockGoogleParent: ParentUser = {
      id: `google_${Date.now()}`,
      name: 'Parent Guardian',
      email: 'parent.guardian@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      provider: 'google'
    };
    setLocalUser(mockGoogleParent);
    localStorage.setItem(PARENT_STORAGE_KEY, JSON.stringify(mockGoogleParent));
  };

  const localSignOut = async () => {
    setLocalUser(null);
    localStorage.removeItem(PARENT_STORAGE_KEY);
  };

  const getToken = React.useCallback(async (): Promise<string | null> => {
    return localUser ? localUser.id : null;
  }, [localUser?.id]);

  const contextValue = React.useMemo(() => ({
    isSignedIn: !!localUser,
    isLoaded: isLocalLoaded,
    user: localUser,
    signInWithGoogle: localSignInWithGoogle,
    signOut: localSignOut,
    isClerkConfigured: false,
    getToken
  }), [localUser, isLocalLoaded, getToken]);

  if (CLERK_KEY) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY}>
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useParentAuth = (): ParentAuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useParentAuth must be used within ParentAuthProvider');
  }
  return ctx;
};
