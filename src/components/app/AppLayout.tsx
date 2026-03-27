import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { colors, layout, spacing } from '../../constants/designTokens';
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
                  maxWidth: layout.contentMaxWidth,
                  margin: '0 auto',
                  padding: `${spacing.section}px ${spacing.pagePadding}px`,
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
