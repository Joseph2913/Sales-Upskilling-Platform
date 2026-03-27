# Architectural Decision Log

Non-trivial decisions made during development, with rationale. Helps future sessions understand *why* things are the way they are.

---

### Inline Styles Over CSS Libraries
**Date:** 2026-03-26
**Context:** Needed to choose a styling approach for the entire platform.
**Options Considered:** Tailwind CSS, CSS Modules, styled-components, inline styles.
**Decision:** Inline styles throughout. All styles are `style={{}}` objects. Reusable styles extracted to `const` with `React.CSSProperties` type.
**Consequences:** No build-time CSS processing needed. Hover/focus states require `onMouseEnter`/`onMouseLeave` with React state. Animations use CSS-in-JS keyframes injected via `<style>` tags. No class name collisions possible.

---

### Modular AI Hook Pattern
**Date:** 2026-03-26
**Context:** Platform has 5+ AI-powered features, each calling different endpoints with different prompts.
**Options Considered:** Centralised AI service class, individual fetch calls per component, modular hook + system prompt pattern.
**Decision:** Each AI feature gets its own hook (`useXxxApi.ts`) + system prompt file (`constants/xxxSystemPrompt.ts`). Hook manages loading, error, cooldown, and response parsing.
**Consequences:** Features can be developed and iterated independently. System prompts can be tuned without touching React code. Consistent error handling across all AI features via shared pattern.

---

### OAuth-Only Authentication
**Date:** 2026-03-26
**Context:** Enterprise clients need SSO; consumer email/password adds support burden and security surface.
**Options Considered:** Email/password + OAuth, OAuth only, Magic links.
**Decision:** Supabase Auth with Google + Microsoft OAuth only. No email/password auth.
**Consequences:** Simpler auth flow. No password reset logic needed. Depends on users having Google or Microsoft accounts (acceptable for B2B sales teams). Join flow handles first-login org enrollment.

---

### Three-Shell Architecture
**Date:** 2026-03-26
**Context:** Platform serves three distinct user types: public visitors, learners, and admins/facilitators.
**Options Considered:** Single SPA with role-based rendering, separate apps per audience, three-shell single app.
**Decision:** Three shells in one app: Marketing Site (public routes), App Shell (`/app/*`, auth-gated), Admin Shell (`/admin/*`, role-gated). Each shell has its own layout component.
**Consequences:** Single deployment. Shared component library. Route-level code splitting keeps bundle sizes manageable. Auth guards enforce access boundaries.

---

### Supabase for Everything
**Date:** 2026-03-26
**Context:** Need database, auth, storage, and real-time subscriptions. Small team, need to move fast.
**Options Considered:** Firebase, Supabase, custom backend (Node + PostgreSQL), AWS Amplify.
**Decision:** Supabase — PostgreSQL with RLS, built-in Auth, Edge Functions for AI endpoints, Storage for file uploads, Realtime for leaderboard subscriptions.
**Consequences:** PostgreSQL gives full SQL power (complex queries, joins, migrations). RLS handles multi-tenancy at the database level. Edge Functions run Deno (not Node) — need to account for Deno-specific patterns. Vendor lock-in is manageable since core is open-source PostgreSQL.
