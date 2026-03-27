import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts } from '../../constants/designTokens';

export function OrgCheckGuard({ children }: { children: ReactNode }) {
  const { orgMemberships, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: fonts.body,
          color: colors.light,
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    );
  }

  // Allow /app/join to bypass org check
  if (location.pathname.startsWith('/app/join')) {
    return <>{children}</>;
  }

  if (orgMemberships.length === 0) {
    return <Navigate to="/app/join" replace />;
  }

  return <>{children}</>;
}
