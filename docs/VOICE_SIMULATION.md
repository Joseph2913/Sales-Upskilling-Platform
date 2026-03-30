# Voice Simulation Framework

## Overview

The voice simulation system powers Format B (AI Customer Conversation) across all six learning objectives. It provides real-time voice conversations with AI customer personas using Google Gemini 3.1 Flash Live API via a server-side WebSocket relay.

This is a **framework, not a per-scenario implementation**. Every voice simulation runs through the same pipeline. Adding a new scenario for a new objective requires only database content — no new components, hooks, routes, or pages.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Browser                                                  │
│                                                          │
│  AIConversationPlayer ──→ useGeminiLiveSession (hook)    │
│       │                        │                         │
│  BriefingPlayer               WebSocket (audio + events) │
│  DiallingScreen                │                         │
│  LiveCallScreen                │                         │
│  PostCallDebrief               │                         │
└────────────────────────────────┼─────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │ Express Server (3001)    │
                    │                          │
                    │  /ws/voice               │
                    │  geminiLive.ts ───────── │──→ Gemini 3.1 Flash Live API
                    │                          │    (WSS to Google)
                    │  /api/sessions/*         │
                    │  routes.ts               │
                    │                          │
                    │  prompt.ts               │
                    │  db.ts (SQLite)          │
                    └──────────────────────────┘
```

### Data Flow

1. Browser loads scenario briefing via `GET /api/scenarios/:id` (safe fields only)
2. User clicks "Call" → browser calls `POST /api/sessions/voice-config`
3. Server assembles system prompt from scenario's four JSON components, stores config in memory, returns `{ session_id, ws_url }`
4. Browser opens WebSocket to server's `/ws/voice?session_id=xxx`
5. Server opens corresponding WSS to Gemini Live API with assembled prompt, tools, voice config
6. Audio streams bidirectionally: browser ↔ server ↔ Gemini
7. Gemini calls `update_conversation_state` after each user turn → relayed to browser → persisted to DB
8. Call ends → session finalised with transcript, conversation state, duration

### Security Model

- System prompt (persona, hidden brief, response rules) is assembled **server-side only** and never returned to the frontend
- Gemini API key stays on the server — the browser never sees it
- Frontend receives only briefing-safe fields: contact name, title, company, stated challenge, call context, constraint message
- Hidden brief contains information gates, signals, stakeholder maps, planted traps — all invisible to the learner

## Framework vs Content

| Layer | What it is | Where it lives | Changes when... |
|-------|-----------|----------------|-----------------|
| **Framework** | Components, hooks, routes, protocol | `src/`, `server/src/` | Adding new features (rare) |
| **Content** | Persona, hidden brief, response rules, voice | `scenarios` table in SQLite | Adding/editing scenarios (frequent) |

### To add a voice simulation for a new objective:

1. Insert a row into the `scenarios` table in `server/src/db.ts` with the persona's four JSON components + voice ID
2. Set `scenarioId` on the corresponding objective in `src/constants/learningObjectives.ts`
3. Done. The framework handles briefing display, call flow, transcript, state tracking, and debrief automatically.

## Server Components

### Scenario Database Schema (`server/src/db.ts`)

**Table: `scenarios`**

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID, referenced by `learningObjectives.ts` |
| title | TEXT | Internal label (e.g., "NovaTech Discovery Call") |
| contact_name | TEXT | Persona's full name (shown in briefing) |
| contact_title | TEXT | Role/title (shown in briefing) |
| company_name | TEXT | Company name (shown in briefing) |
| company_description | TEXT | 2-3 sentence company overview (shown in briefing) |
| stated_challenge | TEXT | What the persona says their problem is (shown in briefing) |
| call_context | TEXT | Format: "Meeting type · Duration · Relationship" (shown in briefing) |
| constraint_message | TEXT | Amber banner text (e.g., "Your job is to diagnose, not sell.") |
| persona | TEXT (JSON) | Full persona definition — see Persona Schema below |
| hidden_brief | TEXT (JSON) | Hidden context — see Hidden Brief Schema below |
| response_rules | TEXT (JSON) | Behavioral rules — see Response Rules Schema below |
| system_prompt_template | TEXT | Base prompt with `{{placeholder}}` tokens |
| voice_id | TEXT | Gemini HD voice name (e.g., "Aoede", "Kore", "Fenrir") |

**Table: `sessions`**

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID |
| scenario_id | TEXT FK | Links to scenarios |
| started_at | TEXT | ISO timestamp |
| ended_at | TEXT | ISO timestamp (null until call ends) |
| duration_seconds | INTEGER | Calculated on end |
| end_reason | TEXT | `user_ended`, `ai_natural_close`, `hard_timeout`, `connection_error` |
| transcript | TEXT (JSON) | Array of `TranscriptTurn` objects |
| final_state | TEXT (JSON) | Final `ConversationState` snapshot |
| current_state | TEXT (JSON) | Latest state (updated per-turn) |
| mode | TEXT | `scored` or `practice` |

### Prompt Assembly (`server/src/prompt.ts`)

`assembleSystemPrompt(scenario)` combines four JSON components into a single prompt:

```
system_prompt_template
  ├── {{persona_name}}, {{persona_title}}, {{company_name}}
  ├── {{personality_traits}}, {{communication_style}}
  ├── {{busyness_level}}, {{emotional_tone}}
  ├── {{hidden_brief}}  ← full JSON of gates, signals, stakeholders, traps
  └── {{response_rules}} ← full JSON of trust dynamics, deflection, time management
```

The template is a plain string with `{{placeholder}}` tokens. Each scenario defines its own template, allowing full control over prompt structure while sharing the assembly mechanism.

### WebSocket Relay (`server/src/geminiLive.ts`)

The relay is **stateless per session** — it does not store, buffer, or modify audio. Each browser WebSocket maps 1:1 to a Gemini WebSocket. The relay:

1. Reads the pending session config from memory (stored by `voice-config` endpoint)
2. Opens WSS to Gemini with model, system instruction, tools, voice, VAD config
3. Translates between the custom browser protocol and Gemini's raw protocol
4. Forwards tool calls and tool responses bidirectionally

## Browser Protocol

Custom JSON protocol between browser and server (abstracts Gemini's raw protocol):

### Browser → Server

| Message | Fields | Purpose |
|---------|--------|---------|
| `audio_input` | `data: string` (base64 PCM 16kHz 16-bit) | Stream microphone audio |
| `tool_response` | `id, name, result` | Return function call result |
| `request_goodbye` | — | Ask persona to wrap up naturally |

### Server → Browser

| Message | Fields | Purpose |
|---------|--------|---------|
| `setup_complete` | — | Gemini session ready, start streaming |
| `audio_output` | `data: string` (base64 PCM 24kHz 16-bit) | Play persona audio |
| `transcript_input` | `text, is_final` | User's speech transcribed by Gemini |
| `transcript_output` | `text, is_final` | Persona's speech transcribed |
| `tool_call` | `id, name, args` | Function call from Gemini |
| `turn_complete` | — | Persona finished speaking |
| `interrupted` | — | User interrupted persona |
| `ai_speaking` | `speaking: boolean` | Speaking state indicator |
| `error` | `message: string` | Error from server or Gemini |

## Frontend Components

All components are **scenario-agnostic** — they render whatever data they receive via props.

### Page: `AIConversationPlayer` (`src/pages/app/AIConversationPlayer.tsx`)

Orchestrates the full voice simulation experience. State machine: `briefing → dialling → live_call → debrief`.

- Looks up `scenarioId` from `LEARNING_OBJECTIVES` via route param `:id`
- Calls `getVoiceConfig(scenarioId)` to create session
- Wires `useGeminiLiveSession` hook to state and sub-components
- Manages call lifecycle: start, end (with 5s goodbye grace), hard timeout (15 min), cleanup

### Hook: `useGeminiLiveSession` (`src/hooks/useGeminiLiveSession.ts`)

Manages WebSocket connection, audio capture, and audio playback. Returns:

```ts
{
  connect(options: GeminiSessionOptions): Promise<void>
  disconnect(): void
  toggleMute(): void
  toggleSpeaker(): void
  requestGoodbye(): void
  isMuted: boolean
  isSpeakerOff: boolean
}
```

Audio pipeline:
- **Capture:** `getUserMedia` → `AudioContext` (16kHz) → `ScriptProcessorNode` → Float32→Int16 → base64 → WebSocket
- **Playback:** WebSocket → base64 → Int16→Float32 → `AudioBuffer` → `AudioContext` (24kHz) → speaker

### Sub-Components (`src/components/app/voiceSimulation/`)

| Component | Screen | Purpose |
|-----------|--------|---------|
| `BriefingPlayer` | briefing | E-learning-style 3-slide player presenting scenario context before the call |
| `DiallingScreen` | dialling | Pulsing ring animation + ringing audio while WebSocket connects |
| `LiveCallScreen` | live_call | Three-zone layout: top bar (live indicator + timer), transcript panel, bottom controls |
| `PostCallDebrief` | debrief | Post-call analysis: trust arc, signals, emotional intelligence, coaching insights |

## Conversation State Tracking

The Gemini model calls `update_conversation_state` after each user turn via function calling. This provides real-time tracking of:

```ts
interface ConversationState {
  trust_level: number;              // 1-10, starts at 3
  information_gates_unlocked: string[];  // e.g., ["gate_erp_replacement"]
  pitch_count: number;              // Increments when user pitches instead of diagnoses
  signals_dropped: string[];        // Signals the user missed
  signals_picked_up: string[];      // Signals the user identified
  conversation_phase: string;       // opening → rapport_building → discovery → deepening → closing
  user_emotional_state: string;     // confident, hesitant, frustrated, engaged, nervous, relaxed
  user_confidence_level: number;    // 1-10, detected from vocal tone
  silence_events: SilenceEvent[];   // Deliberate pauses and whether the caller waited
  notes: string;                    // Free-text AI observations
}
```

State is persisted to the `sessions` table via `POST /api/sessions/:id/state` after each function call.

## Scenario Content Schema

### Persona Object

```ts
{
  name: string;                    // "Sarah Chen"
  title: string;                   // "VP of Operations"
  company: string;                 // "NovaTech Solutions"
  personality_traits: string[];    // ["sharp analytical thinker", "impatient with fluff", ...]
  communication_style: string;     // Prose description of how they speak
  busyness_level: number;          // 1-5 (affects patience and engagement)
  default_emotional_tone: string;  // "professionally skeptical but willing to be convinced"
}
```

### Hidden Brief Object

```ts
{
  buying_stage: string;            // "early_evaluation", "active_rfp", "renewal", etc.
  backstory: string;               // Internal context the persona knows but doesn't volunteer
  full_stakeholder_map: [{
    name: string;
    role: string;
    relationship_to_persona: string;
    stance: string;
    reveal_condition: string;       // "When user asks about technical decision-makers"
  }];
  emerging_needs: [{
    need: string;
    stated: boolean;                // false = hidden, must be uncovered through questioning
    detail: string;
  }];
  internal_politics: string;       // Power dynamics the persona navigates
  planted_traps: {
    stated_need: string;           // What they say they want
    real_driver: string;           // What's actually driving the urgency
  };
  information_gates: [{
    id: string;                    // "gate_erp_replacement"
    description: string;           // What information this unlocks
    unlock_condition: string;      // "Thoughtful open questions about systems/tech/operational pain"
    trust_threshold?: number;      // Minimum trust level required (optional)
  }];
  signals: [{
    id: string;                    // "signal_timeline_pressure"
    verbal_cue: string;            // What the persona says
    meaning: string;               // What it actually indicates
  }];
}
```

### Response Rules Object

```ts
{
  voice_and_speech_patterns: string;  // Natural speech, contractions, pacing
  open_vs_closed_questions: string;   // How persona responds to each
  trust_and_disclosure: {
    starting_trust: number;           // Default: 3
    increase_triggers: string[];      // "Diagnostic questions", "active listening"
    decrease_triggers: string[];      // "Pitching", "assumptions", "name-dropping"
  };
  pitching_triggers_deflection: string; // How persona reacts when user pitches
  call_time_management: {
    soft_warning_minutes: number;     // e.g., 10
    hard_wrap_minutes: number;        // e.g., 14
    hard_end_minutes: number;         // e.g., 15
  };
  adaptive_difficulty: {
    confident_caller: string;         // How to escalate for confident callers
    struggling_caller: string;        // How to ease for struggling callers
  };
  strategic_silence: {
    triggers: string[];               // Moments to deliberately pause
    duration_seconds: string;         // "3-5 seconds"
  };
  edge_cases: {
    off_topic: string;
    silence_from_caller: string;
    aggressive_closing: string;
    name_dropping: string;
  };
}
```

## Voice Configuration

Gemini 3.1 Flash Live provides 30 HD voices. Each scenario specifies a `voice_id`:

| Voice | Character | Suggested Use |
|-------|-----------|---------------|
| Aoede | Warm, professional female | Default for empathetic personas |
| Kore | Crisp, authoritative female | Procurement, C-suite personas |
| Fenrir | Deep, measured male | Finance, clinical stakeholders |
| Puck | Energetic, conversational male | Champions, collaborative personas |
| Charon | Gravelly, skeptical male | Resistant personas, blockers |

Choose voices that match the persona's personality and role. Avoid reusing the same voice across objectives — distinct voices reinforce that each scenario is a different person.

## Features

### Emotional Intelligence Scoring

Gemini's affective dialog capability detects the learner's vocal emotion (confident, hesitant, frustrated, etc.) per turn. This data feeds the `user_emotional_state` and `user_confidence_level` fields in `ConversationState`. The post-call debrief visualises this as an emotional timeline with coaching callouts.

### Adaptive Persona Difficulty

The system prompt instructs the persona to monitor `user_confidence_level` and dynamically adjust:
- **Confident caller (≥7):** Harder pushback, more complex objections, shorter responses
- **Struggling caller (≤4):** More accessible openings, warmer tone, more obvious cues

This is configured per-scenario in the `adaptive_difficulty` section of `response_rules`.

### Strategic Silence

The persona deliberately pauses at key moments (good diagnostic question, gate reveal, sensitive topic). The `silence_events` array tracks whether the learner waited or filled the silence. The post-call debrief includes a silence patience score.

Gemini VAD is configured with `endOfSpeechSensitivity: LOW` to support longer pauses without the system treating them as end-of-turn.

### Multi-Persona Scenarios

For scenarios with multiple stakeholders (e.g., Objective 3: Head of Pharmacy + CFO), the `scenario_personas` table stores individual persona configs with distinct voice IDs. The server maintains one Gemini WebSocket per persona, with lazy-connection for secondary personas.

### Practice Mode

Sessions can run in `practice` mode (no scoring, no progress tracking, no debrief). Enabled by a toggle on the briefing screen. Designed for unlimited repetition at low cost.

### Live Coaching Whisper

An optional parallel analysis stream that sends recent transcript turns to a standard Gemini text endpoint. Returns coaching hints displayed as translucent overlays during the call. Rate-limited to one hint per 15 seconds.

## Pharma Content Rules for Voice Scenarios

1. **Always pharma-specific:** Personas must be healthcare stakeholders — HCPs, procurement officers, formulary committee members, hospital administrators, clinical pharmacists
2. **Realistic buying context:** Scenarios reflect real pharma purchasing dynamics — formulary submissions, P&T committees, budget cycles, clinical evidence requirements
3. **Hidden complexity:** Every scenario must have at least 2 information gates and 3 signals. The stated need must differ from the real driver.
4. **Compliance-aware:** Personas should not invite off-label discussion. If the learner ventures off-label, the persona redirects or expresses concern.
5. **Multi-stakeholder reality:** Hidden briefs should reference other stakeholders even in single-persona scenarios. The persona's world should feel populated.
6. **Emotional range:** Personas should have authentic emotional responses — frustration with vendors, pride in their team, anxiety about deadlines. Never robotic.
7. **Time pressure:** Every scenario should have natural time constraints that create urgency without artificiality.

## Scenario Quality Checklist

- [ ] Persona has a distinct personality (not generic "busy executive")
- [ ] Hidden brief contains at least 2 information gates with clear unlock conditions
- [ ] At least 3 signals are defined with verbal cues and meanings
- [ ] Stated need differs from real driver (planted trap)
- [ ] Response rules define trust increase/decrease triggers specific to this persona
- [ ] Adaptive difficulty thresholds are calibrated for the persona's character
- [ ] Strategic silence moments are natural for this persona's personality
- [ ] Voice ID is distinct from other objectives' personas
- [ ] Constraint message is specific and actionable (not generic)
- [ ] Call context is realistic (meeting type, duration, prior relationship)
- [ ] Edge cases are defined (off-topic, aggressive closing, silence handling)
- [ ] Pharma compliance boundaries are respected
