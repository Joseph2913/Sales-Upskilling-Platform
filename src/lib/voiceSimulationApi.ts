import type { ScenarioBriefing, ConversationState, TranscriptTurn, EndReason } from '../types/voiceSimulation';

const API_BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(body.error?.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch briefing-safe scenario fields (hidden brief is never returned). */
export async function fetchScenario(scenarioId: string): Promise<ScenarioBriefing> {
  const res = await apiFetch<{ success: boolean; data: ScenarioBriefing }>(
    `/scenarios/${scenarioId}`
  );
  return res.data;
}

/** Create a new session record. */
export async function createSession(scenarioId: string): Promise<{ session_id: string; created_at: string }> {
  return apiFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify({ scenario_id: scenarioId }),
  });
}

/** Get an ephemeral token for the OpenAI Realtime API WebRTC connection. */
export async function getEphemeralToken(scenarioId: string): Promise<{ token: string; expires_at: string }> {
  return apiFetch('/sessions/ephemeral-token', {
    method: 'POST',
    body: JSON.stringify({ scenario_id: scenarioId }),
  });
}

/** Persist conversation state update. */
export async function updateSessionState(
  sessionId: string,
  state: ConversationState
): Promise<void> {
  await apiFetch(`/sessions/${sessionId}/state`, {
    method: 'POST',
    body: JSON.stringify(state),
  });
}

/** End a session with transcript and final state. */
export async function endSession(
  sessionId: string,
  data: {
    end_reason: EndReason;
    transcript: TranscriptTurn[];
    final_state: ConversationState | null;
  }
): Promise<{ session_id: string; duration_seconds: number }> {
  return apiFetch(`/sessions/${sessionId}/end`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
