import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ObjectiveId } from '../types/database';
import { useAuth } from './AuthContext';

export interface UserProfile {
  fullName: string;
  currentObjective: ObjectiveId | null;
  streakDays: number;
  onboardingCompleted: boolean;
  role: string | null;
  seniority: string | null;
  industry: string | null;
}

interface AppContextValue {
  userProfile: UserProfile | null;
  loading: boolean;
  hasLearningPlan: boolean;
  learningPlanLoading: boolean;
  refreshLearningPlan: () => Promise<void>;
  setCurrentObjective: (objective: ObjectiveId) => void;
  refreshProfile: () => void;
  dataVersion: number;
  invalidateProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLearningPlan, setHasLearningPlan] = useState(false);
  const [learningPlanLoading, setLearningPlanLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);

  const invalidateProgress = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const setCurrentObjective = useCallback((_objective: ObjectiveId) => {
    // TODO: update profile.current_objective in Supabase
  }, []);

  const refreshLearningPlan = useCallback(async () => {
    if (!user) return;
    // TODO: check if learning_plans record exists for this user
    setHasLearningPlan(false);
    setLearningPlanLoading(false);
  }, [user]);

  const refreshProfile = useCallback(() => {
    if (!user) return;
    // TODO: re-fetch full profile from Supabase
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      setLearningPlanLoading(false);
      return;
    }
    // TODO: fetch profile + learning plan from Supabase
    setUserProfile({
      fullName: user.email?.split('@')[0] ?? 'User',
      currentObjective: null,
      streakDays: 0,
      onboardingCompleted: false,
      role: null,
      seniority: null,
      industry: null,
    });
    setLoading(false);
    setLearningPlanLoading(false);
  }, [user, dataVersion]);

  return (
    <AppContext.Provider
      value={{
        userProfile,
        loading,
        hasLearningPlan,
        learningPlanLoading,
        refreshLearningPlan,
        setCurrentObjective,
        refreshProfile,
        dataVersion,
        invalidateProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
