import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { colors, layout, spacing } from '../../constants/designTokens';

export function AdminLayout() {
  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <AdminSidebar />
      <div style={{ marginLeft: layout.sidebarCollapsed }}>
        <AdminTopBar />
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
  );
}
