# PRD: Voice Simulation Experience (AI Customer Conversation — Screens 1-3)

## Overview

The Voice Simulation Experience is the core interaction layer of Format B (AI Customer Conversation) on the sales e-learning platform. It places the learner in a live, voice-based conversation with an AI-powered customer persona, simulating a realistic first sales call. The experience spans three screens — a scenario briefing, a dialling transition, and the live call interface — backed by a real-time voice pipeline and dynamic conversation state engine. This feature targets Learning Objective 1 (Diagnose Before You Sell) as its primary objective, with secondary coverage of LO2 (Build Trust in Low-Touch Environments) and LO5 (Navigate Complexity and Resistance).

The pedagogical design follows the PAK paradigm (Practice → Attitude → Knowledge) from the Sibelco program: the learner practises diagnostic questioning in a realistic setting before receiving any feedback or instruction. The "no coaching during the call" principle is grounded in IQVIA Field Force Agent Adoption findings — real-time nudges create dependency rather than skill development.

## Critical Technical Finding: OpenRouter and Real-Time Voice

**OpenRouter does not support OpenAI's Realtime API.** OpenRouter's audio capabilities are limited to standard chat completion endpoints (gpt-4o-audio, gpt-audio) which accept audio input and return audio output via HTTP requests. These are not real-time streaming models — they cannot support the sub-second latency, native turn detection, interruption handling, or WebSocket/WebRTC streaming that this feature requires.

**OpenAI's Realtime API (gpt-realtime model) requires a direct connection to OpenAI's infrastructure** via WebRTC (recommended for browser clients) or WebSocket. It uses ephemeral API tokens for security — the browser never holds a persistent API key.

**Recommendation for this PRD:** Use the OpenAI Realtime API directly via WebRTC for the voice pipeline. This requires a direct OpenAI API key (separate from the OpenRouter key). The OpenRouter API key can still be used for all other platform features (report generation via Claude, decision simulations, etc.), but the voice pipeline must connect to OpenAI directly. A modular fallback architecture is documented in the Dependencies section should model routing through OpenRouter become supported in the future.

## User Stories

- As a **learner (sales rep)**, I want to read a realistic scenario briefing so that I can prepare mentally for the call the way I would for a real client meeting.
- As a **learner**, I want to experience a natural dialling transition so that I psychologically shift from "training mode" to "call mode."
- As a **learner**, I want to have a live voice conversation with an AI customer that responds dynamically to my questions so that I can practise diagnostic selling in a safe environment.
- As a **learner**, I want to see a running transcript during the call so that I can reference what was said without it distracting me from active listening.
- As a **learner**, I want the AI customer to naturally manage the call length so that I experience realistic time pressure without an arbitrary timer cutting me off.
- As a **manager**, I want learners to complete realistic call simulations so that I can assess their diagnostic skills based on how they perform in conversation, not just quizzes.
- As an **admin/L&D team member**, I want to create and configure scenario briefings with hidden briefs so that I can design learning experiences targeting specific skills and industries.
- As a **facilitator**, I want the conversation state to be tracked automatically so that post-call feedback is grounded in what actually happened, not self-reporting alone.

## Functional Requirements

### Screen 1: Scenario Briefing

1. The briefing screen SHALL display a card containing: contact name, contact title, company name, a short company description (2-3 sentences), the stated challenge (1-2 sentences), and the call context (meeting type, duration, prior relationship status).
2. The briefing card SHALL NOT display learning objectives, tips, coaching hints, or any instructional content — it presents only what a salesperson would realistically know before a first call.
3. An amber constraint banner SHALL appear at the bottom of the briefing card with the text: "Your job is to diagnose, not sell."
4. A green "Call [Contact Name]" button SHALL be the sole call-to-action. It SHALL be disabled until the briefing has been visible for at least 5 seconds (to ensure the user has read the brief).
5. The briefing content SHALL be loaded from a scenario configuration stored in the local database.

### Screen 2: Dialling State

6. Upon pressing the Call button, the screen SHALL transition to a centred contact avatar (initials-based or generic silhouette) with a pulsing ring animation.
7. An audible ringing tone SHALL play during the dialling state, using a standard phone ring sound.
8. The dialling state SHALL last exactly 3 seconds regardless of actual API connection speed. If the WebRTC connection is established before 3 seconds, it SHALL wait. If it takes longer than 3 seconds, the dialling animation SHALL continue until the connection is ready (up to a maximum of 15 seconds before showing an error).
9. A red hang-up button SHALL be the only control during the dialling state, allowing the user to cancel before the call connects.
10. During the dialling state, the frontend SHALL establish a WebRTC connection to OpenAI's Realtime API using an ephemeral token obtained from the backend.

### Screen 3: Live Call

11. The top bar SHALL display: contact name, company name, a green pulsing "Live" indicator dot, and a running call timer (MM:SS format, starting from 00:00 when the AI customer speaks their opening line).
12. Below the top bar, a scrolling transcript panel SHALL display the conversation. Customer turns appear as left-aligned neutral-coloured bubbles. User turns appear as right-aligned blue bubbles.
13. Each transcript turn SHALL appear as a complete block once the turn is finished — not word-by-word or token-by-token — to avoid distracting from active listening.
14. A "Sarah is speaking…" indicator (using the contact's actual name) with animated dots SHALL appear when the AI customer is generating/speaking a response.
15. The bottom bar SHALL contain exactly three controls: mute (toggle microphone), end call (red button), and speaker (toggle audio output). No coaching, scoring, suggested questions, or any other controls.
16. The AI customer persona SHALL speak an opening line automatically once the WebRTC connection is established and the dialling transition completes.
17. The AI customer SHALL manage call length naturally, beginning to give closing signals (e.g., "I have another meeting shortly," "Let me think about this") around the 10-minute mark and naturally wrapping the conversation by 12 minutes. A hard timeout at 15 minutes SHALL end the call automatically with the AI delivering a closing statement.
18. If the user presses "End Call," the AI SHALL NOT abruptly disconnect — a brief closing exchange SHALL occur (the AI says a natural goodbye) before the call terminates, unless the user presses End Call a second time for immediate disconnect.
19. The mute button SHALL mute the user's microphone input to the Realtime API. While muted, the user's speech SHALL NOT be transmitted or transcribed.
20. The speaker button SHALL toggle audio output from the AI customer. When speaker is off, the user can still see the transcript updating but will not hear the AI's voice.

### Voice Pipeline (Backend Layer 1)

21. The backend SHALL expose an endpoint (`POST /api/sessions/ephemeral-token`) that generates an ephemeral API token from OpenAI's Realtime API using the server's stored OpenAI API key. This token SHALL be short-lived (max 60 seconds validity).
22. The frontend SHALL use the ephemeral token to establish a WebRTC peer connection directly with OpenAI's Realtime API media edge — the audio stream SHALL NOT route through the application backend (no double-hop latency).
23. The Realtime API session SHALL be configured with the `gpt-4o-realtime-preview` model (or the latest available `gpt-realtime` model) with the following session parameters: voice set to a natural-sounding option (e.g., "shimmer" or "alloy"), input audio transcription enabled, turn detection set to "server_vad" (server-side voice activity detection), and temperature set to 0.7 for natural variation.
24. The system prompt loaded into the Realtime API session SHALL contain four components: the persona definition, the hidden brief, the response rules, and the function definitions (see Conversation State Engine below).

### Conversation State Engine (Backend Layer 2)

25. The Realtime API session SHALL be configured with a function definition called `update_conversation_state` that the AI calls after processing each user turn.
26. The `update_conversation_state` function SHALL accept a JSON object tracking: `trust_level` (integer 1-10), `information_gates_unlocked` (array of gate IDs from the hidden brief that have been revealed), `pitch_count` (integer — number of times the user has pitched rather than diagnosed), `signals_dropped` (array of signal IDs the customer has given that the user missed), `signals_picked_up` (array of signal IDs the user correctly identified or probed), `conversation_phase` (enum: opening, rapport_building, discovery, deepening, closing), and `notes` (free text observations about the user's approach).
27. When the AI calls `update_conversation_state`, the frontend SHALL send the state update to the backend via a REST endpoint (`POST /api/sessions/{sessionId}/state`), which persists it to the local database.
28. The updated conversation state SHALL be fed back into the Realtime API session context so that the AI's subsequent responses reflect the tracked dynamics — e.g., if trust_level increases above 6, the customer volunteers more detailed information; if pitch_count exceeds 2, the customer becomes noticeably more guarded.
29. The hidden brief SHALL define a minimum of: 3 information gates (facts the customer only reveals when trust is earned or the right questions are asked), 2 hidden stakeholders (people involved in the decision who the customer won't mention unless specifically asked), 1 planted trap (a stated need that masks a different real driver), and 4 signals (verbal cues the customer drops that indicate important information the user should probe further).

### Transcript and Storage (Backend Layer 3)

30. The Realtime API SHALL produce transcripts as structured text with speaker labels alongside the audio stream. The frontend SHALL capture these transcript events and display them in the transcript panel.
31. When the call ends (either via user action, AI natural closing, or hard timeout), the full transcript SHALL be saved to the local database as a JSON array of turn objects, each containing: `speaker` (user or customer), `text` (the transcribed content), `timestamp` (seconds from call start), and `duration` (length of the turn in seconds).
32. The final conversation state object SHALL be saved alongside the transcript in the same session record.
33. The session record SHALL also store: `scenario_id` (reference to the scenario configuration), `started_at` (ISO timestamp), `ended_at` (ISO timestamp), `duration_seconds` (total call length), and `end_reason` (enum: user_ended, ai_natural_close, hard_timeout, connection_error).

### System Prompt Architecture

34. Each scenario SHALL have a system prompt composed of four sections, stored as a structured JSON object in the local database:
    - **Persona**: name, title, company, personality traits (array), communication style description, busyness level (1-5), and default emotional tone.
    - **Hidden Brief**: buying_stage (the real stage, not the stated one), full_stakeholder_map (array of stakeholder objects with name, role, relationship to contact, and reveal_condition), emerging_needs (array of need objects with description and whether it's stated or hidden), internal_politics (free text), planted_traps (array with stated_need and real_driver), and information_gates (array with gate_id, content, and unlock_condition).
    - **Response Rules**: a set of behavioural directives defining how the AI responds to open questions vs. closed questions, how trust affects disclosure, how pushing/pitching triggers deflection, how the call is naturally time-managed, and how the AI handles edge cases (user going off-script, asking irrelevant questions, being silent for extended periods).
    - **Function Definitions**: the `update_conversation_state` function schema as defined in requirement 26.
35. The combined system prompt SHALL NOT exceed 4,000 tokens to leave sufficient context window for the conversation itself.

### Local Database

36. All data SHALL be stored in a local SQLite database file within the project directory. No external database services (e.g., Supabase, PostgreSQL) SHALL be required.
37. The database SHALL be initialised automatically on first application start, creating all required tables if they do not exist.
38. The database SHALL include seed data for at least one complete scenario (persona, hidden brief, response rules, and function definitions) so the feature is immediately testable after setup.

## Data Model

### Scenarios Table
- `id` (TEXT, PRIMARY KEY — UUID)
- `title` (TEXT — internal name for the scenario)
- `contact_name` (TEXT)
- `contact_title` (TEXT)
- `company_name` (TEXT)
- `company_description` (TEXT)
- `stated_challenge` (TEXT)
- `call_context` (TEXT — e.g., "First meeting, 20 minutes, no prior contact")
- `constraint_message` (TEXT — e.g., "Your job is to diagnose, not sell.")
- `persona` (JSON — personality traits, communication style, busyness level, emotional tone)
- `hidden_brief` (JSON — buying stage, stakeholder map, emerging needs, politics, traps, information gates)
- `response_rules` (JSON — behavioural directives)
- `system_prompt_template` (TEXT — the assembled prompt template with placeholders)
- `created_at` (TEXT — ISO timestamp)
- `updated_at` (TEXT — ISO timestamp)

### Sessions Table
- `id` (TEXT, PRIMARY KEY — UUID)
- `scenario_id` (TEXT, FOREIGN KEY → scenarios.id)
- `started_at` (TEXT — ISO timestamp)
- `ended_at` (TEXT — ISO timestamp, nullable until call ends)
- `duration_seconds` (INTEGER, nullable until call ends)
- `end_reason` (TEXT — enum: user_ended, ai_natural_close, hard_timeout, connection_error)
- `transcript` (JSON — array of turn objects as defined in requirement 31)
- `final_state` (JSON — the last conversation state object as defined in requirement 26)
- `user_diagnosis` (JSON — nullable, populated by post-call diagnostic screen, out of scope for this PRD)
- `report` (JSON — nullable, populated by report generation pipeline, out of scope for this PRD)
- `created_at` (TEXT — ISO timestamp)

### Relationships
- One Scenario → Many Sessions
- Each Session belongs to exactly one Scenario

## UI/UX Description

### Screen 1: Scenario Briefing
The briefing screen uses a single centred card on a clean, neutral background. The card is structured as a vertical stack: contact name in bold (large), title and company on the next line (medium, muted), a thin divider, the company description paragraph, another divider, the stated challenge in slightly emphasised text, and a context line at the bottom (e.g., "First meeting · 20 minutes · No prior contact"). The amber constraint banner sits below the card, full-width, with an icon and the diagnostic reminder text. The green Call button sits below the banner, centred, with the text "Call [First Name]."

This mirrors the ABE workshop briefing flow from the Blended Learning Handbook (file 04): participants receive a scenario brief, absorb it, then enter the exercise. No pre-coaching, no tips — just enough context to act.

### Screen 2: Dialling State
Full-screen transition. The background dims slightly. A large circle in the centre contains the contact's initials (or a generic avatar). Three concentric rings pulse outward from the circle at staggered intervals, fading as they expand — evoking a phone ringing. The ringing audio plays in sync. The contact name appears below the avatar. A red circular hang-up button sits at the bottom centre.

This is a deliberate psychological transition. The IQVIA adoption work (file 09) emphasises that "behaviour change drives mindset change" — the ringing state shifts the user's mental model from "I'm doing training" to "I'm making a real call," which changes how they show up in the conversation.

### Screen 3: Live Call
The layout is divided into three horizontal zones. The top bar (fixed) contains the contact info and live indicator on the left, the timer on the right. The middle zone (scrollable) is the transcript panel, which takes up the majority of the screen. Bubbles appear from the bottom as new turns complete — the panel auto-scrolls to the latest message. The bottom bar (fixed) contains the three control buttons evenly spaced: mute (left), end call (centre, larger and red), speaker (right).

The transcript panel design follows the principle from file 09 that field force users are "very sensitive to anything taking time away from customer-facing work" — the interface is stripped to essentials. Nothing competes for attention. The user's sole job is to listen and respond.

## API Endpoints

### `POST /api/sessions/ephemeral-token`
- **Request body**: `{ "scenario_id": "uuid" }`
- **Response**: `{ "token": "eph_...", "expires_at": "ISO timestamp" }`
- **Behaviour**: Validates the scenario exists. Fetches the scenario's four system prompt components (persona, hidden brief, response rules, function definitions) from the database. Assembles the full system prompt from these components. Calls OpenAI's REST API (`POST /v1/realtime/sessions`) with the assembled system prompt, model configuration (voice, turn detection, temperature), and function definitions to create a Realtime session and obtain an ephemeral token. Returns only the token and expiry to the frontend — the system prompt never leaves the backend.

### `POST /api/sessions`
- **Request body**: `{ "scenario_id": "uuid" }`
- **Response**: `{ "session_id": "uuid", "created_at": "ISO timestamp" }`
- **Behaviour**: Creates a new session record in the local database with the given scenario_id and a started_at timestamp.

### `POST /api/sessions/:sessionId/state`
- **Request body**: The conversation state JSON object (trust_level, information_gates_unlocked, pitch_count, signals_dropped, signals_picked_up, conversation_phase, notes)
- **Response**: `{ "success": true }`
- **Behaviour**: Overwrites the current state for this session in the database. Each state update replaces the previous one (the latest state is the canonical state).

### `PATCH /api/sessions/:sessionId/end`
- **Request body**: `{ "end_reason": "user_ended|ai_natural_close|hard_timeout|connection_error", "transcript": [...], "final_state": {...} }`
- **Response**: `{ "session_id": "uuid", "duration_seconds": 720 }`
- **Behaviour**: Sets the ended_at timestamp, calculates duration_seconds, saves the full transcript and final conversation state to the session record.

### `GET /api/scenarios/:scenarioId`
- **Response**: The full scenario object (briefing fields only — the hidden brief, response rules, and system prompt are NOT returned to the frontend to prevent the user from reading the answers).
- **Behaviour**: Returns only the fields needed for Screen 1: contact_name, contact_title, company_name, company_description, stated_challenge, call_context, constraint_message.

### `GET /api/sessions/:sessionId`
- **Response**: `{ "session_id": "uuid", "scenario_id": "uuid", "started_at": "...", "ended_at": "...", "duration_seconds": 720, "end_reason": "...", "transcript": [...], "final_state": {...} }`
- **Behaviour**: Returns the session record including transcript and final conversation state. Does NOT return the scenario's hidden brief or system prompt. Used by the post-call diagnostic and report generation features (separate PRDs).

## Acceptance Criteria

1. A user can navigate to a scenario briefing screen and see all briefing fields (contact name, title, company, description, challenge, context) rendered correctly from the local database.
2. The "Call" button is disabled for the first 5 seconds after the briefing loads, then becomes active.
3. Pressing the Call button transitions to the dialling screen with a pulsing ring animation and audible ringing tone.
4. The dialling state lasts exactly 3 seconds before the call connects when the WebRTC connection is established sooner. If the connection takes longer than 3 seconds, the dialling animation continues until the connection is ready.
5. If the WebRTC connection fails to establish within 15 seconds, an error message is displayed and the user is returned to the briefing screen.
6. Once connected, the AI customer speaks an opening line without any user action.
7. The user can speak and the AI customer responds with sub-second latency (under 500ms to first audio response after the user finishes speaking).
8. The transcript panel updates with completed turns (not streaming tokens) — each bubble appears only after the speaker has finished their turn.
9. The "is speaking" indicator appears when the AI is generating a response and disappears when the AI finishes speaking.
10. The mute button toggles microphone transmission — when muted, the user's speech is not transcribed or sent to the API.
11. The speaker button toggles AI audio output — when off, the transcript still updates but no sound plays.
12. The AI customer begins giving closing signals around the 10-minute mark.
13. The call auto-terminates at 15 minutes with a natural AI closing statement.
14. Pressing End Call triggers a brief AI goodbye response before disconnecting. Pressing End Call again during the goodbye immediately disconnects.
15. After the call ends, the full transcript (JSON array of turn objects with speaker, text, timestamp, duration) is saved to the local SQLite database.
16. The final conversation state object is saved alongside the transcript.
17. The session record includes scenario_id, started_at, ended_at, duration_seconds, and end_reason.
18. The `update_conversation_state` function is called by the AI after each user turn, and the state is persisted to the backend.
19. The conversation state visibly influences AI behaviour — a user who builds trust (asks open diagnostic questions, listens, does not pitch) receives richer information than a user who pitches aggressively.
20. The local SQLite database is created automatically on first run with all required tables and at least one seed scenario.
21. No external database services are required — the application runs entirely with local storage.
22. The hidden brief, response rules, and system prompt are never exposed to the frontend — only briefing-safe fields are returned by the scenarios API endpoint.
23. A red hang-up button is visible and functional during the dialling state, allowing the user to cancel before the call connects and returning them to the briefing screen.
24. The live call screen displays exactly three controls in the bottom bar: mute, end call, and speaker — no other interactive elements.
25. The backend generates an ephemeral token by assembling the system prompt from the scenario's four components (persona, hidden brief, response rules, function definitions) and configuring the OpenAI Realtime API session before returning the token. The system prompt assembly happens entirely server-side.
26. The seed scenario includes at least 3 information gates, 2 hidden stakeholders, 1 planted trap, and 4 signals as defined in the hidden brief structure (FR29).
27. The application gracefully handles browser microphone permission denial — displaying a clear message explaining that microphone access is required and providing instructions to enable it.
28. A completed session can be retrieved via API (`GET /api/sessions/:sessionId`) returning the transcript, final state, duration, and end reason — but NOT the hidden brief or system prompt.

## Dependencies

- **OpenAI API key** (direct — not via OpenRouter): Required for the Realtime API. The ephemeral token endpoint on the backend must have access to a valid OpenAI API key with Realtime API permissions. This is stored as an environment variable (`OPENAI_API_KEY`).
- **OpenAI Realtime API access**: The `gpt-4o-realtime-preview` or `gpt-realtime` model must be available on the OpenAI account.
- **Browser microphone permissions**: The WebRTC connection requires the user to grant microphone access. The application should handle the permission request gracefully and display clear instructions if denied.
- **Existing platform skeleton**: Vite + React 19 + TypeScript 5.8 + React Router v7 (as established in the reference repo). The backend should use a lightweight Node.js server (Express or Hono) that can be run alongside the Vite dev server.
- **SQLite library**: A Node.js SQLite driver (e.g., `better-sqlite3` or `sql.js`) for the local database.
- **Audio assets**: A phone ringing sound file (MP3 or WAV, <100KB) for the dialling state.

## Out of Scope

- **Screen 4 (Post-Call Diagnostic Capture)** — Covered in a separate PRD. The session record includes a nullable `user_diagnosis` field ready for this feature.
- **Screen 5 (Report Generation)** — Covered in a separate PRD. The session record includes a nullable `report` field ready for this feature.
- **Scenario authoring UI** — Scenarios are seeded via the database or created via direct database manipulation. An admin UI for creating/editing scenarios is a future feature.
- **User authentication and multi-user support** — This PRD assumes a single-user local environment. User accounts and multi-tenancy are future features.
- **Analytics and dashboards** — Session data is stored but not visualised in this PRD.
- **Mobile responsiveness** — The live call interface is designed for desktop browser use. Mobile adaptation is a future feature.
- **Modular voice architecture (Claude reasoning + OpenAI voice)** — If testing reveals the AI customer breaks character or handles edge cases poorly, a modular architecture that routes reasoning through Claude while keeping OpenAI for voice I/O is a documented fallback. This PRD uses the integrated OpenAI Realtime approach as the primary path.
- **OpenRouter integration for the voice pipeline** — OpenRouter does not currently support the Realtime API. If this changes, the ephemeral token endpoint can be adapted to route through OpenRouter instead of directly to OpenAI.

## Knowledge Base References

- **File 03 (GFT Green Line Sales Academy)** — The TRICIS trust model and consultative selling methodology informed the design of the trust-gated information system. The ABE workshop case studies (FEBRABAN, SCHRODERS, SANTALUCIA) provided the template for scenario hidden briefs with layered information that must be discovered through questioning.
- **File 04 (Blended Learning Academy Handbook)** — The ABE workshop flow (briefing → prework → exercise → breakout → debrief → feedback) informed the screen sequence. Adult learning principles (exercises + application, immediately applicable, behaviour drives attitude) shaped the "no coaching during the call" decision.
- **File 05 (GFT User Report Summary)** — E-Learning 1 completion data (45.89% completed, 27.40% not started) and engagement drop-off patterns informed the 10-12 minute target call length. Activities exceeding 12 minutes showed diminished engagement.
- **File 09 (IQVIA Field Force Agent Adoption)** — Design principles including "behaviour change drives mindset change," micro-learning over formal training, zero friction, and the finding that field force users won't tolerate heavy training or abstract instruction directly shaped the stripped-down call interface and the absence of in-call coaching.
- **File 10 (Sibelco Sales Capability Program)** — The PAK paradigm (Practice → Attitude → Knowledge) is the pedagogical backbone: the user practises first, forms attitudes about their performance, then receives knowledge via the feedback report. The 70-20-10 model supports the design — this is an experiential (70%) learning feature, not a formal course (10%).
- **File 11 (Learning Objectives Delivery Matrix)** — This feature implements Format B (AI Customer Conversation) for Learning Objective 1 (Diagnose Before You Sell), with secondary coverage of LO2 and LO5.

