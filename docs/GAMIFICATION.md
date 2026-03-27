# Gamification & Scoring

## Scoring System

### Format Completion Points

| Format | Score on Completion |
|--------|-------------------|
| Format A (Decision Simulation) | 15 pts per objective |
| Format B (AI Customer Conversation) | 20 pts per objective |
| Format C (Build & Apply) — Project grade: | |
| S (Superior) | 50 pts |
| A (Advanced) | 42 pts |
| B (Proficient) | 35 pts |
| C (Competent) | 30 pts |
| R (Revision needed) | 0 pts (must resubmit) |

### Streak Points
Consecutive days of meaningful activity (completing a format stage, saving an artefact, finishing a conversation).

| Streak Length | Daily Bonus |
|--------------|-------------|
| 1-3 days | +2 pts/day |
| 4-7 days | +3 pts/day |
| 8-14 days | +5 pts/day |
| 14+ days | +5 pts/day (capped) |

Streak resets if user misses a calendar day. Max streak scoring: 14 days.

### Active Days Points
Distinct days with activity in the last 30 days. +1 pt per active day, max 30.

### Total Score Calculation
```
totalScore = sum(formatCompletionPoints) + sum(streakBonuses) + activeDaysPoints
```

## Progress Tracking

### Objective Progress Ring
SVG ring component showing completion percentage per objective. Three segments representing formats A, B, C — each fills independently.

```
Ring segments:
  A (Decision Simulation): 0° → 120°     — fills when Format A completed
  B (AI Conversation):     120° → 240°   — fills when Format B completed
  C (Build & Apply):       240° → 360°   — fills when Format C completed
```

Colour: uses the objective's accent colour. Grey (#E2E8F0) for incomplete segments.

### Dashboard Metrics

| Metric | Calculation |
|--------|-------------|
| Objectives Completed | Count of objectives where all assigned formats are done |
| Objectives In Progress | Count of objectives with at least one format started |
| Formats Completed | Total format completions across all objectives |
| Artefacts Created | Count of non-archived artefacts |
| Current Streak | Consecutive days of activity |
| Total Score | As calculated above |

### Leaderboard
Org-scoped ranking by total score. Shows: rank, avatar, name, score, streak, objectives completed. Filterable by cohort. Updated in real-time via Supabase subscription.

Display rules:
- Top 3 get highlight treatment (teal accent background)
- Current user's row is always visible (pinned if not in top 10)
- Ties broken by: most objectives completed → longest streak → earliest start date

## Badges & Milestones

Visual indicators earned at key milestones. Displayed on user profile and in leaderboard.

| Badge | Trigger |
|-------|---------|
| First Steps | Complete first Format A |
| Conversationalist | Complete first Format B |
| Builder | Submit first Format C project |
| Hat Trick | Complete all 3 formats for one objective |
| Streak Master | Reach a 7-day streak |
| Marathon | Reach a 14-day streak |
| Artefact Collector | Save 10 artefacts |
| Full Journey | Complete all assigned objectives |
| Top Performer | Receive an S grade on any project |
| Peer Champion | (Future: help a cohort member) |

Badge display: small circular icons (24px) with the objective's accent colour or teal for cross-objective badges. Tooltip shows badge name and earn date.

## Engagement Mechanics

### Progress Nudges
- If user hasn't logged in for 3+ days: email reminder (if org allows)
- If user is mid-format and hasn't returned in 2 days: "Pick up where you left off" prompt on next login
- If user completed Format A but hasn't started Format B: "Ready for the next challenge?" prompt

### Celebration Moments
- Format completion: confetti animation + score display + "Next format unlocked" CTA
- Objective completion: full-screen celebration + badge award + leaderboard position update
- Streak milestone (7, 14 days): toast notification with badge
- Project grade S: special gold-themed celebration

### Cohort Engagement
- Cohort leaderboard visible in `/app/cohort`
- "X people in your cohort completed Objective Y this week" notifications
- Facilitator can send encouragement messages (future feature)

## Admin Analytics (Gamification View)

Org admins and facilitators see:
- Completion funnel: % of users at each format stage per objective
- Average scores per objective and format
- Streak distribution (histogram)
- Stalled users: users who haven't progressed in 7+ days
- Top performers: highest scores, most artefacts, longest streaks
- Cohort comparison: side-by-side metrics across cohorts
