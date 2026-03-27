import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { PlatformRole, OrgMembership } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthOrgMembership {
  orgId: string;
  orgName: string;
  role: OrgMembership['role'];
  cohortId: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  platformRole: PlatformRole | null;
  orgMemberships: AuthOrgMembership[];
  primaryOrg: AuthOrgMembership | null;
  isOxygyAdmin: boolean;
  isClientAdmin: boolean;
  enrollmentPending: boolean;
  enrollmentError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  dummySignIn: (role?: PlatformRole) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformRole, setPlatformRole] = useState<PlatformRole | null>(null);
  const [orgMemberships, setOrgMemberships] = useState<AuthOrgMembership[]>([]);
  const [enrollmentPending, setEnrollmentPending] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const primaryOrg = orgMemberships[0] ?? null;
  const isOxygyAdmin = platformRole === 'oxygy_admin' || platformRole === 'super_admin';
  const isClientAdmin = platformRole === 'client_admin';

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Placeholder: load platform role and org memberships when user changes
  useEffect(() => {
    if (!user) {
      setPlatformRole(null);
      setOrgMemberships([]);
      return;
    }
    // TODO: fetch profile.platform_role and org_memberships from Supabase
    setPlatformRole('learner');
    setEnrollmentPending(false);
    setEnrollmentError(null);
  }, [user]);

  const dummySignIn = useCallback((role: PlatformRole = 'learner') => {
    const dummyUser = {
      id: 'dummy-user-001',
      email: 'demo@salesacademy.dev',
      app_metadata: {},
      user_metadata: { full_name: 'Demo User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(dummyUser);
    setSession({ user: dummyUser } as unknown as Session);
    setPlatformRole(role);
    setOrgMemberships([
      {
        orgId: 'dummy-org-001',
        orgName: 'Demo Organisation',
        role: role === 'oxygy_admin' || role === 'super_admin' ? 'admin' : 'learner',
        cohortId: null,
      },
    ]);
    setEnrollmentPending(false);
    setEnrollmentError(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      dummySignIn();
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }, [dummySignIn]);

  const signInWithMicrosoft = useCallback(async () => {
    if (!isSupabaseConfigured) {
      dummySignIn();
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: 'azure' });
  }, [dummySignIn]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setPlatformRole(null);
    setOrgMemberships([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        platformRole,
        orgMemberships,
        primaryOrg,
        isOxygyAdmin,
        isClientAdmin,
        enrollmentPending,
        enrollmentError,
        signInWithGoogle,
        signInWithMicrosoft,
        dummySignIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
