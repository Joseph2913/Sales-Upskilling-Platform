import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
} from 'lucide-react';
import { colors, fonts, layout } from '../../constants/designTokens';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
  { label: 'Organisations', path: '/admin/organisations', icon: <Building2 size={20} strokeWidth={1.5} /> },
  { label: 'Users', path: '/admin/users', icon: <Users size={20} strokeWidth={1.5} /> },
  { label: 'Content', path: '/admin/content', icon: <FileText size={20} strokeWidth={1.5} /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} strokeWidth={1.5} /> },
];

export function AdminSidebar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const width = expanded ? layout.sidebarExpanded : layout.sidebarCollapsed;

  return (
    <nav
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width,
        background: colors.navy,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transition: 'width 0.2s ease',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height: layout.topBarHeight,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: colors.teal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.white,
            fontFamily: fonts.heading,
            fontWeight: 800,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          S
        </div>
        <span
          style={{
            fontFamily: fonts.heading,
            fontWeight: 700,
            fontSize: 15,
            color: colors.white,
            whiteSpace: 'nowrap',
            opacity: expanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          Admin Panel
        </span>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
        {navItems.map((item) => {
          const isActive =
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: isActive ? 'rgba(230,255,250,0.08)' : 'transparent',
                borderLeft: isActive ? `3px solid ${colors.teal}` : '3px solid transparent',
                color: isActive ? colors.white : '#A0AEC0',
                cursor: 'pointer',
                fontFamily: fonts.heading,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              <span
                style={{
                  opacity: expanded ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
