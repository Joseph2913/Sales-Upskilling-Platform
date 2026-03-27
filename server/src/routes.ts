import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db.js';
import { assembleSystemPrompt, getConversationStateFunctionDef } from './prompt.js';

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

// ─── POST /api/sessions/ephemeral-token ─────────────────────────────
// Assembles system prompt server-side, creates an OpenAI Realtime session,
// and returns only the ephemeral token. The system prompt never leaves
// the backend (FR21-24, AC25).
router.post('/api/sessions/ephemeral-token', async (req, res) => {
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ success: false, error: { code: 'CONFIG_ERROR', message: 'OpenAI API key not configured' } });
    return;
  }

  // Assemble the full system prompt server-side
  const systemPrompt = assembleSystemPrompt(scenario);
  const functionDef = getConversationStateFunctionDef();

  // Log prompt size for debugging (FR35: should not exceed ~4000 tokens)
  console.log(`System prompt assembled: ${systemPrompt.length} chars (~${Math.ceil(systemPrompt.length / 4)} tokens)`);

  try {
    // Create a Realtime API session via OpenAI REST endpoint
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'sage',
        instructions: systemPrompt,
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.7,           // Higher = needs more confident speech to trigger (default ~0.5)
          silence_duration_ms: 1200, // Wait 1.2s of silence before concluding the user is done
          prefix_padding_ms: 500,    // Include 500ms of audio before speech detection
        },
        temperature: 0.85,
        tools: [functionDef],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI Realtime session creation failed:', response.status, errorBody);
      res.status(502).json({
        success: false,
        error: { code: 'AI_TIMEOUT', message: 'Failed to create voice session. Please try again.' }
      });
      return;
    }

    const data = await response.json() as { client_secret?: { value: string; expires_at: number } };

    if (!data.client_secret) {
      console.error('Unexpected response structure from OpenAI:', data);
      res.status(502).json({
        success: false,
        error: { code: 'AI_TIMEOUT', message: 'Unexpected response from voice service.' }
      });
      return;
    }

    res.json({
      token: data.client_secret.value,
      expires_at: new Date(data.client_secret.expires_at * 1000).toISOString(),
    });
  } catch (err) {
    console.error('Error creating ephemeral token:', err);
    res.status(500).json({
      success: false,
      error: { code: 'AI_TIMEOUT', message: 'Failed to create voice session. Please try again.' }
    });
  }
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

export default router;
