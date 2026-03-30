import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BriefingPlayer } from '../../components/app/voiceSimulation/BriefingPlayer';
import { DiallingScreen } from '../../components/app/voiceSimulation/DiallingScreen';
import { LiveCallScreen } from '../../components/app/voiceSimulation/LiveCallScreen';
import { PostCallDebrief } from '../../components/app/voiceSimulation/PostCallDebrief';
import { useGeminiLiveSession } from '../../hooks/useGeminiLiveSession';
import type { ConnectionStatus } from '../../hooks/useGeminiLiveSession';
import { useCoachingWhisper } from '../../hooks/useCoachingWhisper';
import {
  fetchScenario,
  getVoiceConfig,
  endSession,
} from '../../lib/voiceSimulationApi';
import type {
  ScenarioBriefing as ScenarioBriefingType,
  SimulationScreen,
  TranscriptTurn,
  ConversationState,
  EmotionDataPoint,
  EndReason,
  DebriefData,
  SessionMode,
} from '../../types/voiceSimulation';
import { colors, fonts } from '../../constants/designTokens';
import { LEARNING_OBJECTIVES, OBJECTIVE_META } from '../../constants/learningObjectives';

// Hard timeout at 15 minutes
const HARD_TIMEOUT_MS = 15 * 60 * 1000;
// Minimum dialling duration
const MIN_DIAL_MS = 3000;
// Maximum time to wait for connection during dialling
const MAX_DIAL_MS = 15000;

export default function AIConversationPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const objectiveId = parseInt(id || '1', 10);

  const objective = LEARNING_OBJECTIVES.find((o) => o.id === objectiveId);
  const meta = OBJECTIVE_META.find((m) => m.id === objectiveId);
  const scenarioId = objective?.scenarioId;

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
  const [sessionMode, setSessionMode] = useState<SessionMode>('scored');
  const [stateHistory, setStateHistory] = useState<ConversationState[]>([]);
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionDataPoint[]>([]);
  const [debriefData, setDebriefData] = useState<DebriefData | null>(null);

  // Connection state
  const connectionStatus = useRef<ConnectionStatus>('idle');
  const dialStartTime = useRef(0);
  const hardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionReadyResolve = useRef<(() => void) | null>(null);
  const turnStartTime = useRef(Date.now());
  const callStartTimeRef = useRef(0);

  const realtime = useGeminiLiveSession();

  // Coaching whisper
  const [coachingEnabled, setCoachingEnabled] = useState(false);
  const coaching = useCoachingWhisper({ sessionId, enabled: coachingEnabled });

  // ─── Load scenario on mount ───
  useEffect(() => {
    if (!scenarioId) {
      setLoading(false);
      return;
    }
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
      // Get voice config (creates session + assembles prompt server-side)
      const voiceConfig = await getVoiceConfig(scenarioId);

      setSessionId(voiceConfig.session_id);
      setScreen('dialling');
      dialStartTime.current = Date.now();

      const connectionReady = new Promise<void>((resolve) => {
        connectionReadyResolve.current = resolve;
      });

      await realtime.connect({
        sessionId: voiceConfig.session_id,
        wsUrl: voiceConfig.ws_url,
        onAiTurnComplete: (text) => {
          addTurn('customer', text);
          setAiInterimText('');
          // Request coaching hint after each AI turn
          setTranscript((current) => {
            coaching.requestHint(current, conversationState);
            return current;
          });
        },
        onUserTurnComplete: (text) => { addTurn('user', text); setUserInterimText(''); },
        onAiInterim: setAiInterimText,
        onUserInterim: setUserInterimText,
        onAiSpeakingChange: setIsAiSpeaking,
        onStateUpdate: (state) => {
          setConversationState(state);
          setStateHistory((prev) => [...prev, state]);
          // Track emotion data point if available
          if (state.user_emotional_state) {
            const now = Date.now();
            const start = callStartTimeRef.current;
            setEmotionTimeline((prev) => [...prev, {
              timestamp: start > 0 ? (now - start) / 1000 : 0,
              emotion: state.user_emotional_state!,
              confidence_level: state.user_confidence_level ?? 5,
              conversation_phase: state.conversation_phase,
            }]);
          }
        },
        onStatusChange: (status) => {
          connectionStatus.current = status;
          if (status === 'connected' && connectionReadyResolve.current) {
            connectionReadyResolve.current();
            connectionReadyResolve.current = null;
          }
        },
        onError: (msg) => {
          setError(msg);
          setScreen('briefing');
        },
      });

      const minWait = new Promise<void>((resolve) =>
        setTimeout(resolve, MIN_DIAL_MS)
      );

      const maxTimeout = new Promise<'timeout'>((resolve) => {
        dialTimeoutRef.current = setTimeout(() => resolve('timeout'), MAX_DIAL_MS);
      });

      const raceResult = await Promise.race([
        Promise.all([minWait, connectionReady]).then(() => 'ready' as const),
        maxTimeout,
      ]);

      if (dialTimeoutRef.current) clearTimeout(dialTimeoutRef.current);

      if (raceResult === 'timeout' && connectionStatus.current !== 'connected') {
        realtime.disconnect();
        setError('Unable to connect to the voice service. Please check your connection and try again.');
        setScreen('briefing');
        return;
      }

      const now = Date.now();
      setCallStartTime(now);
      callStartTimeRef.current = now;
      turnStartTime.current = now;
      setScreen('live_call');

      hardTimeoutRef.current = setTimeout(() => {
        handleCallEnd('hard_timeout');
      }, HARD_TIMEOUT_MS);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start the call';
      setError(message);
      setScreen('briefing');
    }
  }, [scenarioId, realtime, addTurn]);

  // ─── End call flow ───
  const handleCallEnd = useCallback(async (reason?: EndReason) => {
    const endReason: EndReason = reason || 'user_ended';

    if (!isEnding && endReason === 'user_ended') {
      setIsEnding(true);
      realtime.requestGoodbye();
      setTimeout(() => {
        finalizeCall(endReason);
      }, 5000);
      return;
    }

    finalizeCall(endReason);
  }, [isEnding, realtime]);

  const finalizeCall = useCallback(async (endReason: EndReason) => {
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }

    realtime.disconnect();

    // Capture final data before resetting
    const callDuration = callStartTimeRef.current > 0
      ? Math.round((Date.now() - callStartTimeRef.current) / 1000)
      : 0;

    setTranscript((currentTranscript) => {
      if (sessionId) {
        endSession(sessionId, {
          end_reason: endReason,
          transcript: currentTranscript,
          final_state: conversationState,
        }).catch(console.error);
      }

      // Build debrief data from current state
      setDebriefData({
        transcript: currentTranscript,
        stateHistory: stateHistory,
        emotionTimeline: emotionTimeline,
        duration_seconds: callDuration,
        mode: sessionMode,
      });

      return currentTranscript;
    });

    setIsEnding(false);

    // In practice mode, skip debrief and go back to briefing
    if (sessionMode === 'practice') {
      resetCallState();
      setScreen('briefing');
    } else {
      setScreen('debrief');
    }
  }, [sessionId, conversationState, realtime, stateHistory, emotionTimeline, sessionMode]);

  /** Reset all call-specific state for a fresh attempt. */
  const resetCallState = useCallback(() => {
    setTranscript([]);
    setConversationState(null);
    setSessionId(null);
    setStateHistory([]);
    setEmotionTimeline([]);
    setDebriefData(null);
  }, []);

  // ─── Cancel during dialling ───
  const handleDialCancel = useCallback(() => {
    if (dialTimeoutRef.current) clearTimeout(dialTimeoutRef.current);
    realtime.disconnect();
    setScreen('briefing');
  }, [realtime]);

  // ─── Cleanup on unmount ───
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);
      if (dialTimeoutRef.current) clearTimeout(dialTimeoutRef.current);
      realtime.disconnect();
    };
  }, []);

  // ─── No scenario available for this objective ───
  if (!scenarioId || !objective || !meta) {
    return (
      <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <Link to="/app/journey" style={breadcrumbStyle}>
          <ArrowLeft size={14} /> Back to My Journey
        </Link>
        <div style={placeholderCardStyle}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎙️</div>
          <h2 style={placeholderTitleStyle}>Voice Simulation Coming Soon</h2>
          <p style={placeholderTextStyle}>
            The voice simulation for Objective {objectiveId} is currently being developed.
          </p>
        </div>
      </div>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <Link to="/app/journey" style={breadcrumbStyle}>
          <ArrowLeft size={14} /> Back to My Journey
        </Link>
        <div style={placeholderCardStyle}>
          <p style={placeholderTextStyle}>Loading scenario...</p>
        </div>
      </div>
    );
  }

  // ─── Error on briefing screen ───
  if (error && screen === 'briefing') {
    return (
      <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <Link to="/app/journey" style={breadcrumbStyle}>
          <ArrowLeft size={14} /> Back to My Journey
        </Link>
        <div style={errorCardStyle}>
          <h2 style={errorTitleStyle}>Connection Issue</h2>
          <p style={errorMessageStyle}>{error}</p>
          {scenario ? (
            <button onClick={() => setError(null)} style={retryButtonStyle}>
              Back to Briefing
            </button>
          ) : (
            <button onClick={() => navigate('/app/journey')} style={retryButtonStyle}>
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <Link to="/app/journey" style={breadcrumbStyle}>
          <ArrowLeft size={14} /> Back to My Journey
        </Link>
        <div style={placeholderCardStyle}>
          <p style={placeholderTextStyle}>Scenario not found.</p>
        </div>
      </div>
    );
  }

  const formatBPhase = objective.formats.find((f) => f.format === 'B');

  return (
    <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      {/* Breadcrumb */}
      <Link to="/app/journey" style={breadcrumbStyle}>
        <ArrowLeft size={14} />
        Back to My Journey
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: meta.accentDark,
          background: `${meta.accentColor}20`, border: `1px solid ${meta.accentColor}50`,
          borderRadius: 6, padding: '3px 10px',
          textTransform: 'uppercase' as const, letterSpacing: '0.05em',
        }}>
          Format B · Voice Simulation
        </span>
        {formatBPhase && (
          <span style={{ fontFamily: fonts.body, fontSize: 11, color: '#A0AEC0' }}>
            ~{formatBPhase.estimatedMinutes} min · 3 slides
          </span>
        )}
      </div>

      {/* Voice simulation screens */}
      {screen === 'briefing' && (
        <BriefingPlayer
          scenario={scenario}
          accentColor={meta.accentColor}
          accentDark={meta.accentDark}
          sessionMode={sessionMode}
          onSessionModeChange={setSessionMode}
          onStartCall={handleStartCall}
        />
      )}

      {screen === 'dialling' && (
        <DiallingScreen contactName={scenario.contact_name} onCancel={handleDialCancel} />
      )}

      {screen === 'live_call' && (
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
          coachingHint={coaching.hint}
          coachingEnabled={coachingEnabled}
          onToggleCoaching={() => setCoachingEnabled((c) => !c)}
        />
      )}

      {screen === 'debrief' && debriefData && (
        <PostCallDebrief
          data={debriefData}
          contactName={scenario.contact_name}
          accentColor={meta.accentColor}
          accentDark={meta.accentDark}
          onTryAgain={() => {
            resetCallState();
            setScreen('briefing');
          }}
          onBackToJourney={() => navigate('/app/journey')}
        />
      )}
    </div>
  );
}

// ─── Styles ───

const breadcrumbStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: fonts.body,
  fontSize: 12,
  fontWeight: 600,
  color: '#718096',
  textDecoration: 'none',
  marginBottom: 16,
};

const placeholderCardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 14,
  padding: 40,
  textAlign: 'center' as const,
};

const placeholderTitleStyle: React.CSSProperties = {
  fontFamily: fonts.heading,
  fontSize: 18,
  fontWeight: 700,
  color: '#1A202C',
  margin: '0 0 8px',
};

const placeholderTextStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 13,
  color: '#718096',
};

const errorCardStyle: React.CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: 14,
  padding: 32,
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
