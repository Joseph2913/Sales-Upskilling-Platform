import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScenarioBriefing } from '../../components/app/voiceSimulation/ScenarioBriefing';
import { DiallingScreen } from '../../components/app/voiceSimulation/DiallingScreen';
import { LiveCallScreen } from '../../components/app/voiceSimulation/LiveCallScreen';
import { useRealtimeSession } from '../../hooks/useRealtimeSession';
import type { ConnectionStatus } from '../../hooks/useRealtimeSession';
import {
  fetchScenario,
  createSession,
  getEphemeralToken,
  endSession,
} from '../../lib/voiceSimulationApi';
import type {
  ScenarioBriefing as ScenarioBriefingType,
  SimulationScreen,
  TranscriptTurn,
  ConversationState,
  EndReason,
} from '../../types/voiceSimulation';
import { colors, fonts } from '../../constants/designTokens';

// Hard timeout at 15 minutes (FR17, AC13)
const HARD_TIMEOUT_MS = 15 * 60 * 1000;
// Minimum dialling duration (FR8)
const MIN_DIAL_MS = 3000;
// Maximum time to wait for connection during dialling (FR8 — 15s max)
const MAX_DIAL_MS = 15000;

/**
 * Voice Simulation Experience — orchestrates the three screens:
 * briefing → dialling → live call.
 */
export default function VoiceSimulationPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();

  // ─── State ───
  const [screen, setScreen] = useState<SimulationScreen>('briefing');
  const [scenario, setScenario] = useState<ScenarioBriefingType | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [aiInterimText, setAiInterimText] = useState('');
  const [userInterimText, setUserInterimText] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const [callStartTime, setCallStartTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connection state
  const connectionStatus = useRef<ConnectionStatus>('idle');
  const dialStartTime = useRef(0);
  const hardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionReadyResolve = useRef<(() => void) | null>(null);
  const turnStartTime = useRef(Date.now());
  const callStartTimeRef = useRef(0);

  const realtime = useRealtimeSession();

  // ─── Load scenario on mount ───
  useEffect(() => {
    if (!scenarioId) return;
    fetchScenario(scenarioId)
      .then((s) => {
        setScenario(s);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [scenarioId]);

  // ─── Transcript helpers ───
  // Uses ref for callStartTime to avoid stale closures in the WebRTC callbacks
  const addTurn = useCallback((speaker: 'user' | 'customer', text: string) => {
    const now = Date.now();
    const start = callStartTimeRef.current;
    const timestamp = start > 0 ? (now - start) / 1000 : 0;
    const duration = (now - turnStartTime.current) / 1000;
    turnStartTime.current = now;

    setTranscript((prev) => [...prev, { speaker, text, timestamp, duration }]);
  }, []);

  // ─── Start Call flow ───
  const handleStartCall = useCallback(async () => {
    if (!scenarioId) return;
    setError(null);

    try {
      // Create session record and get ephemeral token in parallel
      const [sessionResult, tokenResult] = await Promise.all([
        createSession(scenarioId),
        getEphemeralToken(scenarioId),
      ]);

      setSessionId(sessionResult.session_id);

      // Transition to dialling screen
      setScreen('dialling');
      dialStartTime.current = Date.now();

      // Create a promise that resolves when WebRTC is connected
      const connectionReady = new Promise<void>((resolve) => {
        connectionReadyResolve.current = resolve;
      });

      // Start WebRTC connection (FR10)
      await realtime.connect({
        sessionId: sessionResult.session_id,
        ephemeralToken: tokenResult.token,
        onAiTurnComplete: (text) => { addTurn('customer', text); setAiInterimText(''); },
        onUserTurnComplete: (text) => { addTurn('user', text); setUserInterimText(''); },
        onAiInterim: setAiInterimText,
        onUserInterim: setUserInterimText,
        onAiSpeakingChange: setIsAiSpeaking,
        onStateUpdate: (state) => setConversationState(state),
        onStatusChange: (status) => {
          connectionStatus.current = status;
          if (status === 'connected' && connectionReadyResolve.current) {
            connectionReadyResolve.current();
            connectionReadyResolve.current = null;
          }
          if (status === 'error') {
            // If still in dialling, the dial timeout will handle the error display
          }
        },
        onError: (msg) => {
          setError(msg);
          setScreen('briefing');
        },
      });

      // Wait for minimum 3 seconds AND connection ready, or max 15 seconds (FR8)
      const minWait = new Promise<void>((resolve) =>
        setTimeout(resolve, MIN_DIAL_MS)
      );

      const maxTimeout = new Promise<'timeout'>((resolve) => {
        dialTimeoutRef.current = setTimeout(() => resolve('timeout'), MAX_DIAL_MS);
      });

      // Wait for both minimum dial time and connection
      const raceResult = await Promise.race([
        Promise.all([minWait, connectionReady]).then(() => 'ready' as const),
        maxTimeout,
      ]);

      // Clear the dial timeout
      if (dialTimeoutRef.current) clearTimeout(dialTimeoutRef.current);

      if (raceResult === 'timeout' && connectionStatus.current !== 'connected') {
        // Connection failed within 15 seconds (AC5)
        realtime.disconnect();
        setError('Unable to connect to the voice service. Please check your connection and try again.');
        setScreen('briefing');
        return;
      }

      // Transition to live call
      const now = Date.now();
      setCallStartTime(now);
      callStartTimeRef.current = now;
      turnStartTime.current = now;
      setScreen('live_call');

      // Set hard timeout at 15 minutes (FR17, AC13)
      hardTimeoutRef.current = setTimeout(() => {
        handleCallEnd('hard_timeout');
      }, HARD_TIMEOUT_MS);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start the call';
      setError(message);
      setScreen('briefing');
    }
  }, [scenarioId, realtime, addTurn]);

  // ─── End call flow (FR18, AC14) ───
  const handleCallEnd = useCallback(async (reason?: EndReason) => {
    const endReason: EndReason = reason || 'user_ended';

    // If first press and not a hard timeout — request AI goodbye (FR18)
    if (!isEnding && endReason === 'user_ended') {
      setIsEnding(true);
      realtime.requestGoodbye();
      // Give AI 5 seconds to say goodbye, then disconnect
      setTimeout(() => {
        finalizeCall(endReason);
      }, 5000);
      return;
    }

    // Second press or non-user-ended — immediate disconnect
    finalizeCall(endReason);
  }, [isEnding, realtime]);

  const finalizeCall = useCallback(async (endReason: EndReason) => {
    // Clear hard timeout
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }

    // Disconnect WebRTC
    realtime.disconnect();

    // Get the latest transcript (need to use ref pattern since state may be stale)
    setTranscript((currentTranscript) => {
      // Persist session to backend
      if (sessionId) {
        endSession(sessionId, {
          end_reason: endReason,
          transcript: currentTranscript,
          final_state: conversationState,
        }).catch(console.error);
      }
      return currentTranscript;
    });

    // For now, go back to briefing. Future: navigate to post-call diagnostic.
    setScreen('briefing');
    setIsEnding(false);
    setTranscript([]);
    setConversationState(null);
    setSessionId(null);
  }, [sessionId, conversationState, realtime]);

  // ─── Cancel during dialling (AC23) ───
  const handleDialCancel = useCallback(() => {
    if (dialTimeoutRef.current) clearTimeout(dialTimeoutRef.current);
    realtime.disconnect();
    setScreen('briefing');
  }, [realtime]);

  // ─── Cleanup on unmount only ───
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);
      if (dialTimeoutRef.current) clearTimeout(dialTimeoutRef.current);
      realtime.disconnect();
    };
  }, []);

  // ─── Render ───
  if (loading) {
    return (
      <div style={centeredStyle}>
        <p style={loadingTextStyle}>Loading scenario...</p>
      </div>
    );
  }

  if (error && screen === 'briefing') {
    return (
      <div style={centeredStyle}>
        <div style={errorCardStyle}>
          <h2 style={errorTitleStyle}>Connection Issue</h2>
          <p style={errorMessageStyle}>{error}</p>
          {scenario ? (
            <button
              onClick={() => setError(null)}
              style={retryButtonStyle}
            >
              Back to Briefing
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              style={retryButtonStyle}
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div style={centeredStyle}>
        <p style={loadingTextStyle}>Scenario not found.</p>
      </div>
    );
  }

  switch (screen) {
    case 'briefing':
      return <ScenarioBriefing scenario={scenario} onStartCall={handleStartCall} />;

    case 'dialling':
      return <DiallingScreen contactName={scenario.contact_name} onCancel={handleDialCancel} />;

    case 'live_call':
      return (
        <LiveCallScreen
          contactName={scenario.contact_name}
          companyName={scenario.company_name}
          transcript={transcript}
          aiInterimText={aiInterimText}
          userInterimText={userInterimText}
          isAiSpeaking={isAiSpeaking}
          isMuted={realtime.isMuted}
          isSpeakerOff={realtime.isSpeakerOff}
          onToggleMute={realtime.toggleMute}
          onToggleSpeaker={realtime.toggleSpeaker}
          onEndCall={() => handleCallEnd()}
          isEnding={isEnding}
          callStartTime={callStartTime}
        />
      );
  }
}

// ─── Shared styles ───

const centeredStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: colors.bg,
  padding: 40,
};

const loadingTextStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 14,
  color: colors.light,
};

const errorCardStyle: React.CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 32,
  maxWidth: 480,
  textAlign: 'center' as const,
};

const errorTitleStyle: React.CSSProperties = {
  fontFamily: fonts.heading,
  fontSize: 20,
  fontWeight: 700,
  color: colors.navy,
  margin: '0 0 12px',
};

const errorMessageStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 14,
  color: colors.body,
  lineHeight: 1.6,
  margin: '0 0 24px',
};

const retryButtonStyle: React.CSSProperties = {
  background: colors.teal,
  color: colors.white,
  border: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  fontFamily: fonts.body,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};
