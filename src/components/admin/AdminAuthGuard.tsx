import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts } from '../../constants/designTokens';

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, isOxygyAdmin } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isOxygyAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
