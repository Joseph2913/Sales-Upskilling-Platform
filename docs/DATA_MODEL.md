# Data Model

All tables live in Supabase (PostgreSQL) with Row-Level Security (RLS) enabled. UUIDs for all primary keys. Timestamps in UTC.

## Core Entities

### profiles
Extends Supabase Auth `users` table.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (FK → auth.users) | Primary key |
| full_name | text | Display name |
| avatar_url | text | Profile image URL |
| role | text | Job role (e.g., "Account Executive", "Sales Manager") |
| function | text | Business function (e.g., "Sales", "BD", "Pre-Sales") |
| seniority | text | Level (e.g., "Junior", "Mid", "Senior", "Director") |
| industry | text | Industry context (e.g., "Pharma", "Tech", "Industrial") |
| sales_experience | text | Self-assessed sales experience level |
| primary_challenge | text | Main challenge from onboarding survey |
| goal_description | text | What they want to achieve |
| availability | text | Weekly hours available for learning |
| created_at | timestamptz | Account creation |
| updated_at | timestamptz | Last profile update |

**RLS:** Users can read/write their own profile. Org admins can read profiles within their org.

### objective_progress
Tracks per-user, per-objective, per-format progress.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid (FK → profiles) | |
| objective_id | int | 1-6, maps to sales objective |
| format | text | 'A' (Decision Sim), 'B' (AI Conversation), 'C' (Build & Apply) |
| status | text | 'locked', 'in_progress', 'completed' |
| slide | int | Current slide position (for Format A) |
| visited_slides | int[] | Set of visited slide numbers (Format A) |
| conversation_turns | int | Number of turns completed (Format B) |
| completed_at | timestamptz | When this format was completed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**RLS:** Users can read/write their own progress. Org admins can read within org.

### learning_plans
AI-generated personalised pathway from onboarding survey.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid (FK → profiles) | |
| pathway_summary | text | Narrative overview of the learning plan |
| total_estimated_weeks | int | Estimated completion time |
| objectives_data | jsonb | Per-objective: title, description, depth, project brief, resources |
| objective_depths | jsonb | Per-objective depth: 'full', 'fast-track', 'awareness', 'skip' |
| assigned_objectives | int[] | Which of the 6 objectives are assigned (e.g., [1,2,3,5]) |
| created_at | timestamptz | |
| regenerated_at | timestamptz | If the plan was regenerated |

**RLS:** Users can read/write their own plan.

### project_submissions
Per-objective project work (Format C output).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid (FK → profiles) | |
| objective_id | int | |
| status | text | 'draft', 'submitted', 'passed', 'needs_revision' |
| user_response | text | User's project write-up |
| screenshots | text[] | Storage paths for uploaded evidence |
| ai_review | jsonb | Structured feedback: score (S/A/B/C/R), strengths, gaps, recommendations |
| submitted_at | timestamptz | |
| reviewed_at | timestamptz | |
| created_at | timestamptz | |

**RLS:** Users can read/write their own submissions. Org admins and facilitators can read within org.

### artefacts
Saved outputs from tools and exercises.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid (FK → profiles) | |
| org_id | uuid (FK → organisations) | |
| type | text | 'coba_analysis', 'power_matrix', 'objection_guide', 'account_plan', 'stakeholder_map', 'sales_pitch', 'conversation_transcript', 'simulation_debrief' |
| objective_id | int | Which objective this relates to |
| name | text | User-given name |
| preview | text | First 100 chars of content (for grid display) |
| content | jsonb | Type-specific structured content |
| archived_at | timestamptz | Soft delete |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| last_opened_at | timestamptz | |

**RLS:** Users can CRUD their own artefacts. Org admins can read within org.

### conversation_sessions
Stores AI Customer Conversation (Format B) sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid (FK → profiles) | |
| objective_id | int | |
| scenario_id | text | Which scenario template was used |
| messages | jsonb[] | Array of { role, content, timestamp } |
| ai_feedback | jsonb | Post-conversation analysis: score, strengths, missed opportunities, recommendations |
| duration_seconds | int | Session length |
| completed | boolean | Whether the conversation reached conclusion |
| created_at | timestamptz | |

**RLS:** Users can read/write their own sessions.

## Multi-Tenancy

### organisations

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Organisation name |
| domain | text | Primary email domain |
| tier | text | 'foundation', 'accelerator', 'catalyst' |
| objective_access | int[] | Which objectives are enabled (e.g., [1,2,3]) |
| branding | jsonb | { logoUrl, programmeName, primaryColor, welcomeMessage } |
| max_users | int | License cap |
| contact_email | text | |
| active | boolean | |
| created_at | timestamptz | |

### org_memberships

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid (FK → profiles) | |
| org_id | uuid (FK → organisations) | |
| role | text | 'learner', 'facilitator', 'admin' |
| cohort_id | uuid (FK → cohorts, nullable) | |
| enrolled_via | text | 'link', 'code', 'domain', 'manual' |
| enrolled_at | timestamptz | |
| active | boolean | |

### cohorts

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| org_id | uuid (FK → organisations) | |
| name | text | |
| description | text | |
| start_date | date | |
| end_date | date | |

### enrollment_channels

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| org_id | uuid (FK → organisations) | |
| type | text | 'link', 'code', 'domain' |
| value | text | URL slug, 6-digit code, or domain name |
| max_uses | int | |
| uses_count | int | |
| expires_at | timestamptz | |
| auto_enroll | boolean | For domain-based |
| created_at | timestamptz | |

## Admin & Tracking

### audit_logs

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| actor_id | uuid (FK → profiles) | |
| action | text | e.g., 'create_org', 'update_user_role', 'toggle_feature' |
| target_type | text | 'org', 'user', 'feature_flag' |
| target_id | text | |
| org_id | uuid | |
| metadata | jsonb | Action-specific details |
| created_at | timestamptz | |

### tool_usage

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid (FK → profiles) | |
| tool_id | text | e.g., 'sales_coach', 'practice_arena', 'coba_builder' |
| last_used_at | timestamptz | |
| count | int | Total uses |

### activity_logs

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid (FK → profiles) | |
| action | text | 'login', 'view_objective', 'complete_format', 'save_artefact', 'submit_project' |
| objective_id | int | |
| metadata | jsonb | |
| created_at | timestamptz | |

## Key Relationships

```
profiles 1──∞ org_memberships ∞──1 organisations
profiles 1──∞ objective_progress
profiles 1──∞ learning_plans (typically 1, but supports regeneration)
profiles 1──∞ project_submissions
profiles 1──∞ artefacts
profiles 1──∞ conversation_sessions
organisations 1──∞ cohorts
organisations 1──∞ enrollment_channels
org_memberships ∞──1 cohorts (optional)
```
