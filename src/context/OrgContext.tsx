import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { OrgRole } from '../types/database';
import { useAuth } from './AuthContext';

export interface OrgMember {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  role: OrgRole;
}

interface OrgContextValue {
  orgId: string | null;
  orgName: string | null;
  orgTier: string | null;
  userRole: OrgRole | null;
  members: OrgMember[];
  loading: boolean;
  isAdmin: boolean;
  isFacilitator: boolean;
  objectiveAccess: number[];
  cohortId: string | null;
  cohortName: string | null;
  refreshOrg: () => void;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return ctx;
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const { primaryOrg } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [orgTier, setOrgTier] = useState<string | null>(null);
  const [objectiveAccess, setObjectiveAccess] = useState<number[]>([]);
  const [cohortName, setCohortName] = useState<string | null>(null);

  const orgId = primaryOrg?.orgId ?? null;
  const orgName = primaryOrg?.orgName ?? null;
  const userRole = primaryOrg?.role ?? null;
  const cohortId = primaryOrg?.cohortId ?? null;
  const isAdmin = userRole === 'admin';
  const isFacilitator = userRole === 'facilitator';

  const refreshOrg = useCallback(() => {
    // TODO: re-fetch org details, members, tier, objective_access
  }, [orgId]);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    // TODO: fetch org details and members from Supabase
    setMembers([]);
    setOrgTier(null);
    setObjectiveAccess([]);
    setCohortName(null);
    setLoading(false);
  }, [orgId]);

  return (
    <OrgContext.Provider
      value={{
        orgId,
        orgName,
        orgTier,
        userRole,
        members,
        loading,
        isAdmin,
        isFacilitator,
        objectiveAccess,
        cohortId,
        cohortName,
        refreshOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}
