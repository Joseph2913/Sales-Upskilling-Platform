// ─── Scenario (briefing-safe fields only — hidden brief never reaches frontend) ───

export interface ScenarioBriefing {
  id: string;
  contact_name: string;
  contact_title: string;
  company_name: string;
  company_description: string;
  stated_challenge: string;
  call_context: string;
  constraint_message: string;
}

// ─── Session ───

export interface Session {
  session_id: string;
  scenario_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  end_reason: EndReason | null;
  transcript: TranscriptTurn[];
  final_state: ConversationState | null;
  mode: SessionMode;
}

export type EndReason = 'user_ended' | 'ai_natural_close' | 'hard_timeout' | 'connection_error';
export type SessionMode = 'scored' | 'practice';

// ─── Transcript ───

export interface TranscriptTurn {
  /** 'user' for the learner, or a persona key string for AI speakers */
  speaker: string;
  /** Display name for the speaker (e.g., "You", "Sarah Chen", "David Park") */
  speaker_name?: string;
  text: string;
  timestamp: number; // seconds from call start
  duration: number;  // length of the turn in seconds
}

// ─── Conversation State (tracked by AI via function calling) ───

export interface SilenceEvent {
  timestamp_approx: string;
  caller_waited: boolean;
  context: string;
}

export interface ConversationState {
  trust_level: number;
  information_gates_unlocked: string[];
  pitch_count: number;
  signals_dropped: string[];
  signals_picked_up: string[];
  conversation_phase: 'opening' | 'rapport_building' | 'discovery' | 'deepening' | 'closing';
  user_emotional_state?: 'confident' | 'hesitant' | 'frustrated' | 'engaged' | 'nervous' | 'relaxed';
  user_confidence_level?: number;
  silence_events?: SilenceEvent[];
  notes: string;
}

// ─── Emotional Intelligence ───

export interface EmotionDataPoint {
  timestamp: number;
  emotion: string;
  confidence_level: number;
  conversation_phase: string;
}

export interface DebriefData {
  transcript: TranscriptTurn[];
  stateHistory: ConversationState[];
  emotionTimeline: EmotionDataPoint[];
  duration_seconds: number;
  mode: SessionMode;
}

// ─── Interim Transcripts (live transcription) ───

export interface InterimTranscript {
  speaker: string;
  text: string;
}

// ─── Voice Simulation Screen States ───

export type SimulationScreen = 'briefing' | 'dialling' | 'live_call' | 'debrief';
