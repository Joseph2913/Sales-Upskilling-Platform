import { useState, useRef, useCallback } from 'react';
import type { TranscriptTurn, ConversationState } from '../types/voiceSimulation';

const COACHING_COOLDOWN_MS = 15_000;
const HINT_DISPLAY_MS = 8_000;

interface UseCoachingWhisperOptions {
  sessionId: string | null;
  enabled: boolean;
}

/**
 * Runs a parallel coaching analysis stream during a live voice call.
 * After each AI turn, sends recent transcript + conversation state
 * to the coaching endpoint. Returns a hint string that auto-clears
 * after 8 seconds.
 */
export function useCoachingWhisper({ sessionId, enabled }: UseCoachingWhisperOptions) {
  const [hint, setHint] = useState<string | null>(null);
  const lastRequestTime = useRef(0);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestHint = useCallback(async (
    transcript: TranscriptTurn[],
    state: ConversationState | null,
  ) => {
    if (!enabled || !sessionId) return;

    // Rate limit client-side
    if (Date.now() - lastRequestTime.current < COACHING_COOLDOWN_MS) return;
    lastRequestTime.current = Date.now();

    // Send last 6 turns for context
    const recentTranscript = transcript.slice(-6);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/coaching-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recent_transcript: recentTranscript,
          conversation_state: state,
        }),
      });

      if (!response.ok) return;

      const data = await response.json() as { hint: string | null };

      if (data.hint) {
        setHint(data.hint);

        // Auto-clear after display duration
        if (clearTimer.current) clearTimeout(clearTimer.current);
        clearTimer.current = setTimeout(() => {
          setHint(null);
        }, HINT_DISPLAY_MS);
      }
    } catch {
      // Coaching is non-critical — fail silently
    }
  }, [enabled, sessionId]);

  const clearHint = useCallback(() => {
    setHint(null);
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
  }, []);

  return { hint, requestHint, clearHint };
}
