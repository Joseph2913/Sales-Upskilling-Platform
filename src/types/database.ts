// TypeScript interfaces for all database tables — reference: docs/DATA_MODEL.md

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
  function: string | null;
  seniority: string | null;
  industry: string | null;
  sales_experience: string | null;
  primary_challenge: string | null;
  goal_description: string | null;
  availability: string | null;
  created_at: string;
  updated_at: string;
}

export type ObjectiveId = 1 | 2 | 3 | 4 | 5 | 6;
export type FormatType = 'A' | 'B' | 'C';
export type ProgressStatus = 'locked' | 'in_progress' | 'completed';

export interface ObjectiveProgress {
  id: string;
  user_id: string;
  objective_id: ObjectiveId;
  format: FormatType;
  status: ProgressStatus;
  slide: number | null;
  visited_slides: number[] | null;
  conversation_turns: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ObjectiveDepth = 'full' | 'fast-track' | 'awareness' | 'skip';

export interface LearningPlanObjective {
  title: string;
  description: string;
  depth: ObjectiveDepth;
  projectBrief: string;
  deliverable: string;
  challengeConnection: string;
  resources: string[];
}

export interface LearningPlan {
  id: string;
  user_id: string;
  pathway_summary: string;
  total_estimated_weeks: number;
  objectives_data: Record<number, LearningPlanObjective>;
  objective_depths: Record<number, ObjectiveDepth>;
  assigned_objectives: number[];
  created_at: string;
  regenerated_at: string | null;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'passed' | 'needs_revision';
export type ScoreGrade = 'S' | 'A' | 'B' | 'C' | 'R';

export interface ProjectSubmissionReview {
  score: ScoreGrade;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  frameworkApplication: string;
}

export interface ProjectSubmission {
  id: string;
  user_id: string;
  objective_id: ObjectiveId;
  status: SubmissionStatus;
  user_response: string;
  screenshots: string[] | null;
  ai_review: ProjectSubmissionReview | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export type ArtefactType =
  | 'coba_analysis'
  | 'power_matrix'
  | 'objection_guide'
  | 'account_plan'
  | 'stakeholder_map'
  | 'sales_pitch'
  | 'conversation_transcript'
  | 'simulation_debrief';

export interface Artefact {
  id: string;
  user_id: string;
  org_id: string;
  type: ArtefactType;
  objective_id: ObjectiveId;
  name: string;
  preview: string;
  content: Record<string, unknown>;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationFeedback {
  overallScore: ScoreGrade;
  strengths: string[];
  missedOpportunities: string[];
  recommendations: string[];
  frameworksUsed: string[];
  frameworksMissed: string[];
}

export interface ConversationSession {
  id: string;
  user_id: string;
  objective_id: ObjectiveId;
  scenario_id: string;
  messages: ConversationMessage[];
  ai_feedback: ConversationFeedback | null;
  duration_seconds: number | null;
  completed: boolean;
  created_at: string;
}

// Multi-tenancy

export type OrgTier = 'foundation' | 'accelerator' | 'catalyst';

export interface OrgBranding {
  logoUrl: string | null;
  programmeName: string | null;
  primaryColor: string | null;
  welcomeMessage: string | null;
}

export interface Organisation {
  id: string;
  name: string;
  domain: string | null;
  tier: OrgTier;
  objective_access: number[];
  branding: OrgBranding;
  max_users: number;
  contact_email: string | null;
  active: boolean;
  created_at: string;
}

export type OrgRole = 'learner' | 'facilitator' | 'admin';
export type EnrollmentMethod = 'link' | 'code' | 'domain' | 'manual';

export interface OrgMembership {
  id: string;
  user_id: string;
  org_id: string;
  role: OrgRole;
  cohort_id: string | null;
  enrolled_via: EnrollmentMethod;
  enrolled_at: string;
  active: boolean;
}

export interface Cohort {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
}

export type EnrollmentChannelType = 'link' | 'code' | 'domain';

export interface EnrollmentChannel {
  id: string;
  org_id: string;
  type: EnrollmentChannelType;
  value: string;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  auto_enroll: boolean;
  created_at: string;
}

// Admin & Tracking

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  org_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ToolUsage {
  id: string;
  user_id: string;
  tool_id: string;
  last_used_at: string;
  count: number;
}

export type ActivityAction =
  | 'login'
  | 'view_objective'
  | 'complete_format'
  | 'save_artefact'
  | 'submit_project';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: ActivityAction;
  objective_id: ObjectiveId | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Platform roles
export type PlatformRole = 'oxygy_admin' | 'super_admin' | 'client_admin' | 'learner';
