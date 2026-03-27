import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import type { TranscriptTurn } from '../../../types/voiceSimulation';
import { colors, fonts } from '../../../constants/designTokens';

interface LiveCallScreenProps {
  contactName: string;
  companyName: string;
  transcript: TranscriptTurn[];
  /** Live AI text as it streams in — displayed as a growing bubble. */
  aiInterimText: string;
  /** Live user text from Web Speech API — displayed as a growing bubble. */
  userInterimText: string;
  isAiSpeaking: boolean;
  isMuted: boolean;
  isSpeakerOff: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  isEnding: boolean;
  callStartTime: number;
}

/**
 * Screen 3: Live Call (FR11-20, AC6-14, AC24).
 * Three-zone layout: top bar, scrolling transcript, bottom controls.
 */
export function LiveCallScreen({
  contactName,
  companyName,
  transcript,
  aiInterimText,
  userInterimText,
  isAiSpeaking,
  isMuted,
  isSpeakerOff,
  onToggleMute,
  onToggleSpeaker,
  onEndCall,
  isEnding,
  callStartTime,
}: LiveCallScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [styleInjected, setStyleInjected] = useState(false);

  // Timer (FR11 — MM:SS format)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [callStartTime]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript.length, isAiSpeaking]);

  // Inject keyframe for the Live dot pulse
  useEffect(() => {
    if (styleInjected) return;
    const styleId = 'live-call-keyframes';
    if (document.getElementById(styleId)) {
      setStyleInjected(true);
      return;
    }
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes livePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      @keyframes dotBounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(style);
    setStyleInjected(true);
  }, [styleInjected]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const firstName = contactName.split(' ')[0];

  return (
    <div style={containerStyle}>
      {/* ─── Top Bar (FR11) ─── */}
      <div style={topBarStyle}>
        <div style={topLeftStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#38A169',
              animation: 'livePulse 2s ease-in-out infinite',
            }} />
            <span style={liveTextStyle}>Live</span>
          </div>
          <span style={contactInfoStyle}>{contactName} · {companyName}</span>
        </div>
        <span style={timerStyle}>{formatTime(elapsed)}</span>
      </div>

      {/* ─── Transcript Panel (FR12-14) ─── */}
      <div style={transcriptPanelStyle}>
        {transcript.map((turn, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: turn.speaker === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div style={turn.speaker === 'user' ? userBubbleStyle : customerBubbleStyle}>
              <span style={speakerLabelStyle}>
                {turn.speaker === 'user' ? 'You' : firstName}
              </span>
              <p style={bubbleTextStyle}>{turn.text}</p>
            </div>
          </div>
        ))}

        {/* Live user interim transcript (Web Speech API) */}
        {userInterimText && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <div style={{ ...userBubbleStyle, opacity: 0.6 }}>
              <span style={speakerLabelStyle}>You</span>
              <p style={{ ...bubbleTextStyle, fontStyle: 'italic' }}>{userInterimText}</p>
            </div>
          </div>
        )}

        {/* Live AI interim transcript (streaming deltas) */}
        {aiInterimText ? (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{ ...customerBubbleStyle, opacity: 0.8 }}>
              <span style={speakerLabelStyle}>{firstName}</span>
              <p style={bubbleTextStyle}>{aiInterimText}</p>
            </div>
          </div>
        ) : isAiSpeaking ? (
          /* Fallback dots indicator if no interim text yet */
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={speakingIndicatorStyle}>
              <span style={{ ...speakerLabelStyle, marginBottom: 4 }}>{firstName} is speaking</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: colors.light,
                      animation: `dotBounce 1.2s ease-in-out infinite ${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div ref={transcriptEndRef} />
      </div>

      {/* ─── Bottom Controls (FR15, AC24) — exactly 3 buttons ─── */}
      <div style={bottomBarStyle}>
        <button onClick={onToggleMute} style={controlButtonStyle} title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <MicOff size={22} color={colors.error} /> : <Mic size={22} color={colors.white} />}
        </button>

        <button onClick={onEndCall} style={endCallButtonStyle} title={isEnding ? 'Disconnect now' : 'End call'}>
          <PhoneOff size={24} />
        </button>

        <button onClick={onToggleSpeaker} style={controlButtonStyle} title={isSpeakerOff ? 'Speaker on' : 'Speaker off'}>
          {isSpeakerOff ? <VolumeX size={22} color={colors.error} /> : <Volume2 size={22} color={colors.white} />}
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  background: '#0F1117',
  color: colors.white,
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  flexShrink: 0,
};

const topLeftStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const liveTextStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 12,
  fontWeight: 600,
  color: '#38A169',
  textTransform: 'uppercase',
  letterSpacing: 1,
};

const contactInfoStyle: React.CSSProperties = {
  fontFamily: fonts.heading,
  fontSize: 16,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.9)',
};

const timerStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', monospace",
  fontSize: 20,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.7)',
  letterSpacing: 2,
};

const transcriptPanelStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px 24px 8px',
};

const customerBubbleStyle: React.CSSProperties = {
  background: '#1E2030',
  borderRadius: '16px 16px 16px 4px',
  padding: '12px 16px',
  maxWidth: '75%',
};

const userBubbleStyle: React.CSSProperties = {
  background: '#2563EB',
  borderRadius: '16px 16px 4px 16px',
  padding: '12px 16px',
  maxWidth: '75%',
};

const speakerLabelStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  display: 'block',
  marginBottom: 4,
};

const bubbleTextStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 14,
  lineHeight: 1.5,
  color: 'rgba(255,255,255,0.9)',
  margin: 0,
};

const speakingIndicatorStyle: React.CSSProperties = {
  background: '#1E2030',
  borderRadius: '16px 16px 16px 4px',
  padding: '10px 16px',
};

const bottomBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 32,
  padding: '20px 24px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  flexShrink: 0,
};

const controlButtonStyle: React.CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const endCallButtonStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: colors.error,
  color: colors.white,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};
