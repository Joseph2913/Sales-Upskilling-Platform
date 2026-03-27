# Self-Improvement Protocol

## When to Update Project Documentation
After any session where you:
- Discover a non-obvious build, deploy, or runtime issue → add to `docs/GOTCHAS.md`
- Identify a pattern that should be followed consistently → add to the relevant `.claude/rules/` file
- Create a new feature that changes the architecture → update `docs/ARCHITECTURE.md`
- Add or modify a database table → update `docs/DATA_MODEL.md`
- Add or modify an AI feature → update `docs/AI_INTEGRATION.md`
- Discover a new design token or component pattern → update `docs/DESIGN_SYSTEM.md`

## GOTCHAS.md Protocol
`docs/GOTCHAS.md` is the project's mistake log. Every non-trivial bug, workaround, or "gotcha" that took more than 5 minutes to diagnose gets an entry. Format:

```
### [SHORT TITLE]
**Date:** YYYY-MM-DD
**Symptom:** What went wrong
**Root Cause:** Why it went wrong
**Fix:** How it was resolved
**Prevention:** How to avoid it in future
```

Check GOTCHAS.md before debugging any issue — the answer may already be there.

## Session Closing Loop
Before ending a session with significant code changes, do the following:
1. Review what was built, changed, or debugged
2. Check if any new gotchas were discovered → append to `docs/GOTCHAS.md`
3. Check if any docs are now stale → update them
4. Check if CLAUDE.md summary lines still accurately describe the project → update if needed
5. Run `npm run typecheck` and `npm test` to confirm the project is in a clean state

## Decision Log
When making a non-trivial architectural or design decision, append it to `docs/DECISIONS.md`. Format:

```
### [DECISION TITLE]
**Date:** YYYY-MM-DD
**Context:** Why this decision came up
**Options Considered:** What alternatives existed
**Decision:** What was chosen and why
**Consequences:** What this means going forward
```

## Auto Memory
Claude Code's auto memory is enabled. It stores learnings in `~/.claude/projects/<project>/memory/MEMORY.md`. This captures:
- Build commands that worked
- Debugging insights
- User preferences discovered during sessions
- Environment-specific quirks

Auto memory is machine-local and not committed to the repo. For team-shared knowledge, always use `docs/GOTCHAS.md` or `docs/DECISIONS.md` instead.

## What Goes Where

| Type of Knowledge | Where It Lives | Who Reads It |
|-------------------|---------------|-------------|
| Project rules & coding standards | `.claude/rules/*.md` | Claude Code (auto-loaded every session) |
| Architecture & feature specs | `docs/*.md` | Claude Code (loaded on demand via @docs/) |
| Mistakes & workarounds | `docs/GOTCHAS.md` | Claude Code (should check before debugging) |
| Architectural decisions | `docs/DECISIONS.md` | Claude Code + humans reviewing history |
| Session-specific learnings | Auto memory (MEMORY.md) | Claude Code (machine-local, auto-loaded) |
| Master summary | `CLAUDE.md` | Claude Code (loaded every session, keep <200 lines) |
