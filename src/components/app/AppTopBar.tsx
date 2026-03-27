import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { colors, fonts, layout } from '../../constants/designTokens';
import { useAuth } from '../../context/AuthContext';

const routeTitles: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/journey': 'My Journey',
  '/app/objective': 'Current Objective',
  '/app/practice-arena': 'Practice Arena',
  '/app/sales-coach': 'My Sales Coach',
  '/app/toolkit': 'My Toolkit',
  '/app/artefacts': 'My Artefacts',
  '/app/cohort': 'My Cohort',
  '/app/admin': 'Org Admin',
  '/app/join': 'Join Organisation',
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(routeTitles)) {
    if (pathname.startsWith(path)) return title;
  }
  return 'Dashboard';
}

export function AppTopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title = getPageTitle(location.pathname);
  const initial = (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        height: layout.topBarHeight,
        background: colors.white,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        zIndex: 90,
      }}
    >
      {/* Left: page title */}
      <span
        style={{
          fontFamily: fonts.heading,
          fontWeight: 600,
          fontSize: 15,
          color: colors.navy,
        }}
      >
        {title}
      </span>

      {/* Right: user avatar + dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: colors.teal,
            color: colors.white,
            border: 'none',
            cursor: 'pointer',
            fontFamily: fonts.heading,
            fontWeight: 700,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initial}
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: 38,
              right: 0,
              width: 220,
              background: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: '8px 0',
              zIndex: 200,
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.body,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              {user?.email ?? 'User'}
            </div>
            <button
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.error,
              }}
            >
              <LogOut size={14} strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
