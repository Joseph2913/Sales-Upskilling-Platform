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
}

export type EndReason = 'user_ended' | 'ai_natural_close' | 'hard_timeout' | 'connection_error';

// ─── Transcript ───

export interface TranscriptTurn {
  speaker: 'user' | 'customer';
  text: string;
  timestamp: number; // seconds from call start
  duration: number;  // length of the turn in seconds
}

// ─── Conversation State (tracked by AI via function calling) ───

export interface ConversationState {
  trust_level: number;
  information_gates_unlocked: string[];
  pitch_count: number;
  signals_dropped: string[];
  signals_picked_up: string[];
  conversation_phase: 'opening' | 'rapport_building' | 'discovery' | 'deepening' | 'closing';
  notes: string;
}

// ─── Interim Transcripts (live transcription) ───

export interface InterimTranscript {
  speaker: 'user' | 'customer';
  text: string;
}

// ─── Voice Simulation Screen States ───

export type SimulationScreen = 'briefing' | 'dialling' | 'live_call';
