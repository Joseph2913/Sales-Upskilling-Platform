# Architecture

## Three-Shell App Structure

### 1. Marketing Site (public)
All paths not matching `/app`, `/admin`, `/login`, `/join` render `MarketingSite.tsx`. Hash-based redirector for legacy links. Post-OAuth redirect handling.

### 2. App Shell (`/app/*` — Learner Platform)
Protected by `AppAuthGuard` (must be authenticated) + `OrgCheckGuard` (must belong to an org).

```
/app/dashboard              → DashboardPage (progress, leaderboard, streaks)
/app/journey                → JourneyPage (AI-generated pathway, objective overview)
/app/objective/:id          → ObjectivePage (current objective, format selector A/B/C)
/app/objective/:id/format-a → DecisionSimulationPlayer (structured scenario player)
/app/objective/:id/format-b → AIConversationPlayer (live generative dialogue)
/app/objective/:id/format-c → BuildApplyPage (artefact creation + project submission)
/app/practice-arena         → PracticeArenaPage (aggregated simulations across objectives)
/app/sales-coach            → SalesCoachPage (aggregated AI conversations across objectives)
/app/toolkit                → ToolkitPage (hub for all tools)
/app/artefacts              → ArtefactsPage (filterable grid of saved work)
/app/cohort                 → CohortPage (team collaboration view)
/app/admin                  → OrgAdminPage (org-level admin dashboard)
/app/join                   → JoinPage (accept join codes)
```

### 3. Admin Shell (`/admin/*` — Platform Administration)
Protected by `AdminAuthGuard` (requires `oxygy_admin` or `super_admin` role).

```
/admin                      → AdminDashboardPage (cross-client metrics, funnels)
/admin/organisations        → OrgsListPage
/admin/organisations/:id    → OrgDetailPage (tabs: overview, analytics, users, enrollment, programme)
/admin/users                → UsersPage
/admin/content              → ContentPage (future CMS)
/admin/settings             → SettingsPage (feature flags, audit logs)
```

### Auth Routes
```
/login                      → AuthModal (Google + Microsoft OAuth via Supabase)
/join/:slug                 → Public invite link endpoint
```

## Layout Components

### AppLayout
Wraps the entire `/app/*` shell. Renders:
- `AppSidebar` (fixed left, 60px collapsed / 240px on hover)
- `AppTopBar` (sticky top, 54px height)
- `<Outlet />` for page content

### AppSidebar
Navy background (`#1A202C`). Collapses to 60px showing only icons; expands to 240px on hover with smooth transition. Navigation items:

```
My Journey          → /app/journey
Current Objective   → /app/objective/:current
Practice Arena      → /app/practice-arena
My Sales Coach      → /app/sales-coach
My Toolkit          → /app/toolkit
My Artefacts        → /app/artefacts
My Cohort           → /app/cohort
```

Active state: teal left border (3px) + `#E6FFFA` tint background. Icon + label fade in on expand.

### AppTopBar
White background, 54px height, `#E2E8F0` bottom border. Contains: breadcrumb / page title (left), search (centre), user avatar + org selector + notifications (right).

## State Management

Four React Context providers, nested in this order:

1. **AuthContext** — Supabase auth session, user profile, login/logout
2. **OrgContext** — Current org membership, org branding, role, level access
3. **AppContext** — Learning plan, objective progress, artefacts, streaks, active objective
4. **TourModeContext** — Product tour state (optional, for onboarding walkthroughs)

State flows downward. No prop drilling beyond 2 levels — use context instead.

## Build & Deploy
- Vite dev server + HMR for development
- Vite build → static assets deployed to Vercel or Firebase Hosting
- Supabase Edge Functions for AI endpoints
- Environment variables via `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`
