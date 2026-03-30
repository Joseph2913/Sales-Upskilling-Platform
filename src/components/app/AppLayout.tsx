import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { colors, layout } from '../../constants/designTokens';
import { OrgProvider } from '../../context/OrgContext';
import { AppProvider } from '../../context/AppContext';
import { TourModeProvider } from '../../context/TourModeContext';

export function AppLayout() {
  return (
    <OrgProvider>
      <AppProvider>
        <TourModeProvider>
          <div style={{ minHeight: '100vh', background: colors.bg }}>
            <AppSidebar />
            <div style={{ marginLeft: layout.sidebarCollapsed }}>
              <AppTopBar />
              <main
                style={{
                  padding: '28px 36px',
                  minHeight: 'calc(100vh - 54px)',
                }}
              >
                <Outlet />
              </main>
            </div>
          </div>
        </TourModeProvider>
      </AppProvider>
    </OrgProvider>
  );
}
