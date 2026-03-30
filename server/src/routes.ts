import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db.js';
import { assembleSystemPrompt, getGeminiConversationStateFunctionDef } from './prompt.js';
import { storePendingSession } from './geminiLive.js';

const router = Router();

// ─── GET /api/scenarios/:scenarioId ──────────────────────────────────
// Returns briefing-safe fields only. Hidden brief, response rules, and
// system prompt are NEVER returned to the frontend (FR5, AC22).
router.get('/api/scenarios/:scenarioId', (req, res) => {
  const db = getDb();
  const scenario = db.prepare(`
    SELECT id, contact_name, contact_title, company_name, company_description,
           stated_challenge, call_context, constraint_message
    FROM scenarios WHERE id = ?
  `).get(req.params.scenarioId) as Record<string, string> | undefined;

  if (!scenario) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scenario not found' } });
    return;
  }

  res.json({ success: true, data: scenario });
});

// ─── POST /api/sessions ─────────────────────────────────────────────
// Creates a new session record (FR — PRD requirement).
router.post('/api/sessions', (req, res) => {
  const { scenario_id } = req.body;
  if (!scenario_id) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'scenario_id is required' } });
    return;
  }

  const db = getDb();
  const scenario = db.prepare('SELECT id FROM scenarios WHERE id = ?').get(scenario_id);
  if (!scenario) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scenario not found' } });
    return;
  }

  const sessionId = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sessions (id, scenario_id, started_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, scenario_id, now, now);

  res.json({ session_id: sessionId, created_at: now });
});

// ─── POST /api/sessions/voice-config ────────────────────────────────
// Assembles system prompt server-side, stores it in memory keyed by
// session ID, and returns a WebSocket URL. The system prompt never
// leaves the backend (FR21-24, AC25).
router.post('/api/sessions/voice-config', (req, res) => {
  const { scenario_id } = req.body;
  if (!scenario_id) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'scenario_id is required' } });
    return;
  }

  const db = getDb();
  const scenario = db.prepare(`
    SELECT persona, hidden_brief, response_rules, system_prompt_template
    FROM scenarios WHERE id = ?
  `).get(scenario_id) as {
    persona: string;
    hidden_brief: string;
    response_rules: string;
    system_prompt_template: string;
  } | undefined;

  if (!scenario) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scenario not found' } });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ success: false, error: { code: 'CONFIG_ERROR', message: 'Gemini API key not configured' } });
    return;
  }

  // Assemble the full system prompt server-side
  const systemPrompt = assembleSystemPrompt(scenario);
  const functionDef = getGeminiConversationStateFunctionDef();

  // Log prompt size for debugging
  console.log(`System prompt assembled: ${systemPrompt.length} chars (~${Math.ceil(systemPrompt.length / 4)} tokens)`);

  // Create session record
  const sessionId = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sessions (id, scenario_id, started_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, scenario_id, now, now);

  // Store the assembled config in memory for the WebSocket handler to consume
  storePendingSession({
    sessionId,
    systemPrompt,
    tools: [functionDef],
    voiceId: 'Aoede', // Default Gemini HD voice — will be per-scenario in Phase 5
    createdAt: Date.now(),
  });

  // Return the session ID and WebSocket URL for the browser to connect to
  const protocol = req.protocol === 'https' ? 'wss' : 'ws';
  const host = req.get('host') || 'localhost:3001';
  const wsUrl = `${protocol}://${host}/ws/voice?session_id=${sessionId}`;

  res.json({ session_id: sessionId, ws_url: wsUrl });
});

// ─── POST /api/sessions/:sessionId/state ────────────────────────────
// Persists the latest conversation state. Each update replaces the
// previous one (FR27).
router.post('/api/sessions/:sessionId/state', (req, res) => {
  const db = getDb();
  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
    return;
  }

  db.prepare('UPDATE sessions SET current_state = ? WHERE id = ?')
    .run(JSON.stringify(req.body), req.params.sessionId);

  res.json({ success: true });
});

// ─── PATCH /api/sessions/:sessionId/end ─────────────────────────────
// Finalises a session with transcript, final state, and end reason (FR31-33).
router.patch('/api/sessions/:sessionId/end', (req, res) => {
  const { end_reason, transcript, final_state } = req.body;

  if (!end_reason) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'end_reason is required' } });
    return;
  }

  const db = getDb();
  const session = db.prepare('SELECT id, started_at FROM sessions WHERE id = ?')
    .get(req.params.sessionId) as { id: string; started_at: string } | undefined;

  if (!session) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
    return;
  }

  const endedAt = new Date().toISOString();
  const startedAt = new Date(session.started_at).getTime();
  const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

  db.prepare(`
    UPDATE sessions
    SET ended_at = ?, duration_seconds = ?, end_reason = ?,
        transcript = ?, final_state = ?
    WHERE id = ?
  `).run(
    endedAt,
    durationSeconds,
    end_reason,
    JSON.stringify(transcript || []),
    JSON.stringify(final_state || null),
    req.params.sessionId
  );

  res.json({ session_id: req.params.sessionId, duration_seconds: durationSeconds });
});

// ─── GET /api/sessions/:sessionId ───────────────────────────────────
// Returns the session record (AC28). Does NOT include the scenario's
// hidden brief or system prompt.
router.get('/api/sessions/:sessionId', (req, res) => {
  const db = getDb();
  const session = db.prepare(`
    SELECT id as session_id, scenario_id, started_at, ended_at,
           duration_seconds, end_reason, transcript, final_state
    FROM sessions WHERE id = ?
  `).get(req.params.sessionId) as Record<string, unknown> | undefined;

  if (!session) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
    return;
  }

  // Parse JSON fields
  session.transcript = JSON.parse(session.transcript as string || '[]');
  session.final_state = session.final_state ? JSON.parse(session.final_state as string) : null;

  res.json(session);
});

// ─── POST /api/sessions/:sessionId/coaching-hint ────────────────────
// Returns a coaching hint based on recent transcript + conversation state.
// Calls Gemini text API (not Live). Rate-limited: one call per 15 seconds.
const coachingCooldowns = new Map<string, number>();

router.post('/api/sessions/:sessionId/coaching-hint', async (req, res) => {
  const { sessionId } = req.params;
  const { recent_transcript, conversation_state } = req.body;

  // Rate limit: 15 seconds per session
  const lastCall = coachingCooldowns.get(sessionId) || 0;
  if (Date.now() - lastCall < 15000) {
    res.json({ hint: null });
    return;
  }
  coachingCooldowns.set(sessionId, Date.now());

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.json({ hint: null });
    return;
  }

  try {
    const { COACHING_SYSTEM_PROMPT } = await import('./coachingPrompt.js');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: COACHING_SYSTEM_PROMPT }] },
          contents: [{
            parts: [{
              text: `Recent transcript (last few turns):\n${JSON.stringify(recent_transcript, null, 2)}\n\nCurrent conversation state:\n${JSON.stringify(conversation_state, null, 2)}\n\nProvide a coaching hint or null.`,
            }],
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      res.json({ hint: null });
      return;
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.json({ hint: null });
      return;
    }

    const parsed = JSON.parse(text) as { hint: string | null };
    res.json({ hint: parsed.hint || null });
  } catch {
    res.json({ hint: null });
  }
});

export default router;
