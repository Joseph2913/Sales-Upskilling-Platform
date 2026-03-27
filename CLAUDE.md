# Pharma Sales E-Learning Platform

## Domain Focus
This platform is specifically designed for **pharmaceutical and life sciences sales professionals**. All learning content, simulations, scenarios, and AI personas must reflect pharma sales contexts: HCP engagement, formulary processes, P&T committees, clinical evidence-based selling, HEOR value articulation, and post-sale adoption in healthcare settings. Never use generic B2B or technology sales examples unless explicitly connecting them to pharma.

## Stack
React 19 + TypeScript 5.8 + Vite 6 + React Router v7 + Supabase (PostgreSQL + Auth + Storage) + Google Gemini API. Inline styles throughout — no CSS modules, no Tailwind, no styled-components. Voice simulation backend: Express + SQLite (local dev) with OpenAI Realtime API via WebRTC.

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build (must pass before any PR)
- `npm run typecheck` — run TypeScript compiler check
- `npm test` — run Vitest suite
- `npm run lint` — ESLint check

Run typecheck after completing a series of code changes. Run individual test files, not the full suite, during development.

## Architecture
Three-shell app: Marketing Site (public), App Shell (`/app/*`, auth-gated), Admin Shell (`/admin/*`, role-gated). Fixed left sidebar (60px collapsed, 240px on hover) + sticky top bar (54px). Page content in `#F7FAFC` background, `marginLeft: 60px`, max 1100px centred, 40px horizontal padding.

See @docs/ARCHITECTURE.md for full routing, shell structure, and state management.

## Learning Model
Six sales objectives (personalised via onboarding survey). Each objective has three formats: A (Decision Simulation), B (AI Customer Conversation), C (Build & Apply). Not all users see all 6 — the survey gates the pathway. This mirrors the AI Upskilling platform's Level → Topic → Phase pattern.

See @docs/CONTENT_STRUCTURE.md for the full curriculum mapping.

## Voice Simulation (Format B)
OpenAI Realtime API via WebRTC for live voice conversations with AI customer personas. Backend (Express + SQLite in `server/`) mints ephemeral tokens and stores sessions. System prompts assembled server-side — never exposed to frontend. Start backend with `cd server && npx tsx src/index.ts`. Vite proxies `/api` to `localhost:3001`.

## Design
DM Sans for headings/nav/labels (400-800). Plus Jakarta Sans for body/buttons (400-700). Teal (#38B2AC) primary, navy (#1A202C) sidebar/headings. Each objective has an accent/accentDark/accentLight triplet. All card borders: 1px solid #E2E8F0.

See @docs/DESIGN_SYSTEM.md for full token reference and component patterns.

## Data
Supabase with RLS. Core entities: profiles, objective_progress, learning_plans, project_submissions, artefacts, organisations, org_memberships, cohorts, enrollment_channels, audit_logs.

See @docs/DATA_MODEL.md for schema.

## AI
Each AI-powered feature gets its own hook (`useXxxApi.ts`) + system prompt file (`constants/xxxSystemPrompt.ts`). Rate limit per tool (5-8s cooldown). Timeout 45-90s. Error states always show user-friendly messages.

See @docs/AI_INTEGRATION.md for patterns.

## Key Rules
- Never use external CSS libraries. All styles are inline objects.
- Named exports for components, default exports only for pages.
- Every new feature needs a corresponding entry in @docs/DATA_MODEL.md if it touches the DB.
- Every AI feature must follow the modular hook + system prompt pattern.
- Components go in `components/app/` (learner), `components/admin/` (admin), or `components/` (shared).
- Hooks go in `hooks/`. Context providers go in `context/`.
- Constants and system prompts go in `constants/`.

## Self-Improvement
This project uses a living documentation system. Auto memory is enabled. Before debugging, check @docs/GOTCHAS.md. When making architectural decisions, log them in @docs/DECISIONS.md. Before ending a session with significant changes, run the closing loop defined in `.claude/rules/self-improvement.md`.
