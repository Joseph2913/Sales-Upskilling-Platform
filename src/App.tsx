import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppAuthGuard } from './components/app/AppAuthGuard';
import { OrgCheckGuard } from './components/app/OrgCheckGuard';
import { AdminAuthGuard } from './components/admin/AdminAuthGuard';
import { AppLayout } from './components/app/AppLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { MarketingSite } from './components/marketing/MarketingSite';
import { ScrollToTop } from './components/app/ScrollToTop';
import { colors, fonts } from './constants/designTokens';

// Lazy-loaded App pages
const DashboardPage = lazy(() => import('./pages/app/DashboardPage'));
const JourneyPage = lazy(() => import('./pages/app/JourneyPage'));
const DecisionSimulationPlayer = lazy(() => import('./pages/app/DecisionSimulationPlayer'));
const AIConversationPlayer = lazy(() => import('./pages/app/AIConversationPlayer'));
const BuildApplyPage = lazy(() => import('./pages/app/BuildApplyPage'));
const PracticeArenaPage = lazy(() => import('./pages/app/PracticeArenaPage'));
const SalesCoachPage = lazy(() => import('./pages/app/SalesCoachPage'));
const ToolkitPage = lazy(() => import('./pages/app/ToolkitPage'));
const ArtefactsPage = lazy(() => import('./pages/app/ArtefactsPage'));
const CohortPage = lazy(() => import('./pages/app/CohortPage'));
const OrgAdminPage = lazy(() => import('./pages/app/OrgAdminPage'));
const JoinPage = lazy(() => import('./pages/app/JoinPage'));
// Lazy-loaded Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const OrgsListPage = lazy(() => import('./pages/admin/OrgsListPage'));
const OrgDetailPage = lazy(() => import('./pages/admin/OrgDetailPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const ContentPage = lazy(() => import('./pages/admin/ContentPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// Lazy-loaded standalone pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PublicJoinPage = lazy(() => import('./pages/PublicJoinPage'));

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.light,
      }}
    >
      Loading...
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Admin shell (/admin/*) */}
            <Route
              path="/admin"
              element={
                <AdminAuthGuard>
                  <AdminLayout />
                </AdminAuthGuard>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="organisations" element={<OrgsListPage />} />
              <Route path="organisations/:id" element={<OrgDetailPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Join code entry (auth-protected, no org check) */}
            <Route
              path="/app/join"
              element={
                <AppAuthGuard>
                  <JoinPage />
                </AppAuthGuard>
              }
            />

            {/* App shell (/app/*) */}
            <Route
              path="/app"
              element={
                <AppAuthGuard>
                  <OrgCheckGuard>
                    <AppLayout />
                  </OrgCheckGuard>
                </AppAuthGuard>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="journey" element={<JourneyPage />} />
              <Route path="objective/:id/format-a" element={<DecisionSimulationPlayer />} />
              <Route path="objective/:id/format-b" element={<AIConversationPlayer />} />
              <Route path="objective/:id/format-c" element={<BuildApplyPage />} />
              <Route path="practice-arena" element={<PracticeArenaPage />} />
              <Route path="sales-coach" element={<SalesCoachPage />} />
              <Route path="toolkit" element={<ToolkitPage />} />
              <Route path="artefacts" element={<ArtefactsPage />} />
              <Route path="cohort" element={<CohortPage />} />
              <Route path="admin" element={<OrgAdminPage />} />
            </Route>

            {/* Public invite link */}
            <Route path="/join/:slug" element={<PublicJoinPage />} />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Marketing site (catch-all) */}
            <Route path="*" element={<MarketingSite />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
