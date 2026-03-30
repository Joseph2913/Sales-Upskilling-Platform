import { useMemo } from 'react';
import { ArrowRight, RotateCcw, Shield, Radio, Brain, Clock, Target, AlertTriangle } from 'lucide-react';
import type { DebriefData, ConversationState, EmotionDataPoint, SilenceEvent } from '../../../types/voiceSimulation';
import { fonts } from '../../../constants/designTokens';

interface PostCallDebriefProps {
  data: DebriefData;
  contactName: string;
  accentColor: string;
  accentDark: string;
  onTryAgain: () => void;
  onBackToJourney: () => void;
}

const EMOTION_COLORS: Record<string, string> = {
  confident: '#38A169',
  engaged: '#38B2AC',
  relaxed: '#4299E1',
  hesitant: '#D69E2E',
  nervous: '#ED8936',
  frustrated: '#E53E3E',
};

const EMOTION_LABELS: Record<string, string> = {
  confident: 'Confident',
  engaged: 'Engaged',
  relaxed: 'Relaxed',
  hesitant: 'Hesitant',
  nervous: 'Nervous',
  frustrated: 'Frustrated',
};

/**
 * Post-call debrief screen showing conversation analysis,
 * emotional intelligence scoring, and coaching insights.
 */
export function PostCallDebrief({
  data,
  contactName,
  accentColor,
  accentDark,
  onTryAgain,
  onBackToJourney,
}: PostCallDebriefProps) {
  const finalState = data.stateHistory.length > 0
    ? data.stateHistory[data.stateHistory.length - 1]
    : null;

  const trustArc = useMemo(() =>
    data.stateHistory.map((s, i) => ({
      index: i,
      trust: s.trust_level,
      phase: s.conversation_phase,
    })),
  [data.stateHistory]);

  const silenceEvents = finalState?.silence_events || [];
  const silenceScore = computeSilenceScore(silenceEvents);
  const eiScore = computeEIScore(data.emotionTimeline, data.stateHistory);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      {/* Header */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 14, padding: '24px 28px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: accentDark,
              textTransform: 'uppercase' as const, letterSpacing: '0.06em',
              marginBottom: 6,
            }}>
              Call Complete
            </div>
            <h2 style={{
              fontFamily: fonts.heading, fontSize: 20, fontWeight: 700,
              color: '#1A202C', margin: '0 0 4px',
            }}>
              Conversation with {contactName}
            </h2>
            <span style={{ fontFamily: fonts.body, fontSize: 13, color: '#718096' }}>
              Duration: {formatTime(data.duration_seconds)} · {data.transcript.length} turns
            </span>
          </div>
          {data.mode === 'practice' && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#D69E2E',
              background: '#FFFBEB', border: '1px solid #FDE68A',
              borderRadius: 8, padding: '4px 12px',
              textTransform: 'uppercase' as const,
            }}>
              Practice Mode
            </span>
          )}
        </div>
      </div>

      {/* Score cards row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 16,
      }}>
        <ScoreCard
          icon={<Shield size={16} />}
          label="Trust Achieved"
          value={`${finalState?.trust_level ?? 0}/10`}
          color={accentColor}
          detail={`Started at 3 · Ended at ${finalState?.trust_level ?? 0}`}
        />
        <ScoreCard
          icon={<Target size={16} />}
          label="Signals Detected"
          value={`${finalState?.signals_picked_up?.length ?? 0}/${(finalState?.signals_picked_up?.length ?? 0) + (finalState?.signals_dropped?.length ?? 0)}`}
          color="#38A169"
          detail={`${finalState?.signals_dropped?.length ?? 0} missed`}
        />
        <ScoreCard
          icon={<Brain size={16} />}
          label="Emotional Intelligence"
          value={`${eiScore}/10`}
          color="#9F7AEA"
          detail="Vocal adaptability score"
        />
        <ScoreCard
          icon={<Clock size={16} />}
          label="Silence Patience"
          value={`${silenceScore}/10`}
          color="#4299E1"
          detail={`${silenceEvents.length} pause moments`}
        />
      </div>

      {/* Trust arc */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 14, padding: '20px 24px', marginBottom: 16,
      }}>
        <SectionLabel text="Trust Arc" />
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 2,
          height: 80, padding: '8px 0',
        }}>
          {trustArc.map((point, i) => (
            <div
              key={i}
              title={`Turn ${i + 1}: Trust ${point.trust}/10 (${point.phase})`}
              style={{
                flex: 1,
                height: `${(point.trust / 10) * 100}%`,
                background: accentColor,
                borderRadius: '3px 3px 0 0',
                opacity: 0.4 + (point.trust / 10) * 0.6,
                transition: 'height 0.3s ease',
                minHeight: 4,
              }}
            />
          ))}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, color: '#A0AEC0', fontFamily: fonts.body, marginTop: 4,
        }}>
          <span>Start</span>
          <span>End</span>
        </div>
      </div>

      {/* Emotional timeline */}
      {data.emotionTimeline.length > 0 && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 14, padding: '20px 24px', marginBottom: 16,
        }}>
          <SectionLabel text="Emotional Timeline" />
          <div style={{
            display: 'flex', gap: 2, height: 32, borderRadius: 8,
            overflow: 'hidden', marginBottom: 12,
          }}>
            {data.emotionTimeline.map((point, i) => (
              <div
                key={i}
                title={`${EMOTION_LABELS[point.emotion] || point.emotion} (confidence: ${point.confidence_level})`}
                style={{
                  flex: 1,
                  background: EMOTION_COLORS[point.emotion] || '#A0AEC0',
                  opacity: 0.5 + (point.confidence_level / 10) * 0.5,
                }}
              />
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
              <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 11, color: '#718096', fontFamily: fonts.body }}>
                  {EMOTION_LABELS[emotion]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information gates */}
      {finalState && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 14, padding: '20px 24px', marginBottom: 16,
        }}>
          <SectionLabel text="Information Gates" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(finalState.information_gates_unlocked?.length ?? 0) > 0 ? (
              finalState.information_gates_unlocked.map((gate) => (
                <div key={gate} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#F0FFF4', border: '1px solid #C6F6D5',
                  borderRadius: 8, padding: '10px 14px',
                }}>
                  <Radio size={14} color="#38A169" />
                  <span style={{ fontSize: 13, color: '#276749', fontFamily: fonts.body, fontWeight: 500 }}>
                    {formatGateName(gate)}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                background: '#FFF5F5', border: '1px solid #FEB2B2',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 13, color: '#C53030', fontFamily: fonts.body,
              }}>
                No information gates were unlocked during this call.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Silence events */}
      {silenceEvents.length > 0 && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 14, padding: '20px 24px', marginBottom: 16,
        }}>
          <SectionLabel text="Silence Moments" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {silenceEvents.map((event, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: event.caller_waited ? '#F0FFF4' : '#FFF5F5',
                border: `1px solid ${event.caller_waited ? '#C6F6D5' : '#FEB2B2'}`,
                borderRadius: 8, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>
                  {event.caller_waited ? '✓' : '✗'}
                </span>
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: event.caller_waited ? '#276749' : '#C53030',
                    fontFamily: fonts.body, marginBottom: 2,
                  }}>
                    {event.caller_waited ? 'Good patience' : 'Filled the silence'}
                  </div>
                  <div style={{ fontSize: 12, color: '#4A5568', fontFamily: fonts.body }}>
                    {event.context}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pitch count warning */}
      {(finalState?.pitch_count ?? 0) > 0 && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: 14, padding: '16px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <AlertTriangle size={18} color="#D69E2E" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', fontFamily: fonts.body }}>
              {finalState!.pitch_count} pitch {finalState!.pitch_count === 1 ? 'attempt' : 'attempts'} detected
            </div>
            <div style={{ fontSize: 12, color: '#92400E', fontFamily: fonts.body, opacity: 0.8 }}>
              Each pitch reduced trust and triggered defensive responses. Focus on diagnostic questions.
            </div>
          </div>
        </div>
      )}

      {/* AI coaching notes */}
      {finalState?.notes && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 14, padding: '20px 24px', marginBottom: 16,
        }}>
          <SectionLabel text="AI Coaching Notes" />
          <p style={{
            fontSize: 13, color: '#4A5568', lineHeight: 1.7,
            margin: 0, fontFamily: fonts.body,
          }}>
            {finalState.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 12, justifyContent: 'center',
        marginTop: 24,
      }}>
        <button onClick={onTryAgain} style={secondaryButtonStyle}>
          <RotateCcw size={14} />
          Try Again
        </button>
        <button onClick={onBackToJourney} style={primaryButtonStyle(accentDark)}>
          Back to Journey
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function ScoreCard({ icon, label, value, color, detail }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  detail: string;
}) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8F0',
      borderRadius: 12, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#718096',
          fontFamily: fonts.body,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 24, fontWeight: 800, color: '#1A202C',
        fontFamily: fonts.heading, marginBottom: 2,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#A0AEC0', fontFamily: fonts.body }}>
        {detail}
      </div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: '#718096',
      textTransform: 'uppercase' as const, letterSpacing: '0.06em',
      marginBottom: 12,
    }}>
      {text}
    </div>
  );
}

// ─── Helpers ───

function formatGateName(gateId: string): string {
  return gateId
    .replace('gate_', '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function computeEIScore(timeline: EmotionDataPoint[], stateHistory: ConversationState[]): number {
  if (timeline.length === 0 || stateHistory.length === 0) return 5;

  // Score based on: emotional stability, confidence growth, avoiding frustration
  let score = 5;
  const confidenceLevels = stateHistory
    .map((s) => s.user_confidence_level)
    .filter((c): c is number => c !== undefined);

  if (confidenceLevels.length >= 2) {
    const trend = confidenceLevels[confidenceLevels.length - 1] - confidenceLevels[0];
    if (trend > 0) score += Math.min(trend, 3);
    if (trend < 0) score += Math.max(trend, -3);
  }

  const frustratedCount = timeline.filter((p) => p.emotion === 'frustrated').length;
  const confidentCount = timeline.filter((p) => p.emotion === 'confident' || p.emotion === 'engaged').length;

  score -= Math.min(frustratedCount * 0.5, 2);
  score += Math.min(confidentCount * 0.3, 2);

  return Math.max(1, Math.min(10, Math.round(score)));
}

function computeSilenceScore(events: SilenceEvent[]): number {
  if (events.length === 0) return 5;
  const waited = events.filter((e) => e.caller_waited).length;
  return Math.round((waited / events.length) * 10);
}

// ─── Styles ───

function primaryButtonStyle(accentDark: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 6,
    background: accentDark, color: '#FFFFFF', border: 'none',
    borderRadius: 10, padding: '12px 24px',
    fontFamily: fonts.body, fontWeight: 600, fontSize: 14,
    cursor: 'pointer',
  };
}

const secondaryButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: '#FFFFFF', color: '#4A5568',
  border: '1px solid #E2E8F0',
  borderRadius: 10, padding: '12px 24px',
  fontFamily: fonts.body, fontWeight: 600, fontSize: 14,
  cursor: 'pointer',
};
