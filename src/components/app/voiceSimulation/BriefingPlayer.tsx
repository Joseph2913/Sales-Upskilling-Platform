import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, Phone, Maximize2, Minimize2,
  Building2, Target, AlertTriangle, User,
} from 'lucide-react';
import type { ScenarioBriefing as ScenarioBriefingType, SessionMode } from '../../../types/voiceSimulation';
import { fonts } from '../../../constants/designTokens';

interface BriefingPlayerProps {
  scenario: ScenarioBriefingType;
  accentColor: string;
  accentDark: string;
  sessionMode: SessionMode;
  onSessionModeChange: (mode: SessionMode) => void;
  onStartCall: () => void;
}

const TOTAL_SLIDES = 3;

/**
 * E-Learning-style briefing player for voice simulation scenarios.
 * Presents the scenario context across 3 slides before the call:
 *   1. Meet Your Contact — who, role, company
 *   2. The Situation — business context & challenge
 *   3. Your Mission — call parameters, constraint, start button
 */
export function BriefingPlayer({
  scenario,
  accentColor,
  accentDark,
  sessionMode,
  onSessionModeChange,
  onStartCall,
}: BriefingPlayerProps) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callCountdown, setCallCountdown] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFirst = currentSlide === 1;
  const isLast = currentSlide === TOTAL_SLIDES;
  const progressPct = (currentSlide / TOTAL_SLIDES) * 100;

  const firstName = scenario.contact_name.split(' ')[0];

  // Countdown on the final slide so user reads the briefing
  useEffect(() => {
    if (currentSlide !== TOTAL_SLIDES) {
      setCallCountdown(5);
      return;
    }
    if (callCountdown <= 0) return;
    const timer = setInterval(() => {
      setCallCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSlide, callCountdown]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLast) goNext();
      if (e.key === 'ArrowLeft' && !isFirst) goPrev();
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const goNext = () => { if (!isLast) setCurrentSlide((s) => s + 1); };
  const goPrev = () => { if (!isFirst) setCurrentSlide((s) => s - 1); };

  return (
    <div
      ref={containerRef}
      style={{
        background: '#FFFFFF',
        border: isFullscreen ? 'none' : '1.5px solid #CBD5E0',
        borderRadius: isFullscreen ? 0 : 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '100vh' : 'calc(100vh - 260px)',
        minHeight: isFullscreen ? undefined : 440,
        maxHeight: isFullscreen ? undefined : 740,
        position: 'relative',
      }}
    >
      {/* ─── Top progress bar ─── */}
      <div style={{ height: 3, background: '#E2E8F0', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: accentColor,
          borderRadius: '0 3px 3px 0',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* ─── Slide content ─── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {currentSlide === 1 && (
          <SlideContact scenario={scenario} accentColor={accentColor} accentDark={accentDark} />
        )}
        {currentSlide === 2 && (
          <SlideSituation scenario={scenario} accentColor={accentColor} accentDark={accentDark} />
        )}
        {currentSlide === 3 && (
          <SlideMission
            scenario={scenario}
            accentColor={accentColor}
            accentDark={accentDark}
            callEnabled={callCountdown <= 0}
            callCountdown={callCountdown}
            onStartCall={onStartCall}
            firstName={firstName}
            sessionMode={sessionMode}
            onSessionModeChange={onSessionModeChange}
          />
        )}
      </div>

      {/* ─── Bottom navigation bar ─── */}
      <div style={{
        borderTop: '1px solid #E2E8F0',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: '#FAFBFC',
      }}>
        {/* Previous */}
        <button
          onClick={goPrev}
          disabled={isFirst}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#FFFFFF',
            border: `1px solid ${isFirst ? '#E2E8F0' : '#CBD5E0'}`,
            borderRadius: 20,
            fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
            color: isFirst ? '#CBD5E0' : '#4A5568',
            cursor: isFirst ? 'default' : 'pointer',
            padding: '8px 18px',
            transition: 'all 0.15s ease',
            minWidth: 110,
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            if (!isFirst) {
              e.currentTarget.style.borderColor = '#A0AEC0';
              e.currentTarget.style.background = '#F7FAFC';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isFirst ? '#E2E8F0' : '#CBD5E0';
            e.currentTarget.style.background = '#FFFFFF';
          }}
        >
          <ArrowLeft size={14} />
          Previous
        </button>

        {/* Center: slide counter + fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#F7FAFC', border: '1px solid #E2E8F0',
            borderRadius: 20, padding: '6px 14px',
          }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: '#718096',
              fontFamily: fonts.body,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {currentSlide} / {TOTAL_SLIDES}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#F7FAFC', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EDF2F7';
              e.currentTarget.style.borderColor = '#CBD5E0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F7FAFC';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen
              ? <Minimize2 size={14} color="#4A5568" />
              : <Maximize2 size={14} color="#4A5568" />
            }
          </button>
        </div>

        {/* Next / Start Call */}
        {isLast ? (
          <button
            onClick={onStartCall}
            disabled={callCountdown > 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: callCountdown > 0 ? '#A0AEC0' : '#38A169',
              border: 'none',
              borderRadius: 20,
              fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
              color: '#FFFFFF',
              cursor: callCountdown > 0 ? 'default' : 'pointer',
              padding: '8px 18px',
              minWidth: 110,
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <Phone size={14} />
            {callCountdown > 0 ? `Wait (${callCountdown}s)` : `Call ${firstName}`}
          </button>
        ) : (
          <button
            onClick={goNext}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#FEFCE8',
              border: '1px solid #FDE68A',
              borderRadius: 20,
              fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
              color: '#92400E',
              cursor: 'pointer',
              padding: '8px 18px',
              minWidth: 110,
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Next
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Slide 1: Meet Your Contact ───

function SlideContact({
  scenario,
  accentColor,
  accentDark,
}: {
  scenario: ScenarioBriefingType;
  accentColor: string;
  accentDark: string;
}) {
  const initials = scenario.contact_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ padding: '36px 40px' }}>
      <span style={sectionBadgeStyle(accentDark)}>Your Contact</span>

      <h2 style={headingStyle}>
        Meet <span style={{ borderBottom: '2px solid #38B2AC', paddingBottom: 2 }}>
          {scenario.contact_name}
        </span>
      </h2>

      {/* Contact card */}
      <div style={{
        display: 'flex', gap: 20, alignItems: 'flex-start',
        background: `${accentColor}08`, border: `1px solid ${accentColor}25`,
        borderRadius: 12, padding: '24px 28px', marginBottom: 24,
      }}>
        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: `${accentColor}20`, border: `2px solid ${accentColor}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: fonts.heading, fontSize: 22, fontWeight: 700,
            color: accentDark,
          }}>
            {initials}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: fonts.heading, fontSize: 20, fontWeight: 700,
            color: '#1A202C', marginBottom: 4,
          }}>
            {scenario.contact_name}
          </div>
          <div style={{
            fontFamily: fonts.body, fontSize: 14, color: '#718096',
            marginBottom: 12,
          }}>
            {scenario.contact_title}
          </div>

          {/* Info chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <InfoChip icon={<Building2 size={12} />} label={scenario.company_name} />
            <InfoChip icon={<User size={12} />} label={scenario.contact_title} />
          </div>
        </div>
      </div>

      {/* Company overview */}
      <div style={{
        fontSize: 10, fontWeight: 700, color: '#718096',
        textTransform: 'uppercase' as const, letterSpacing: '0.06em',
        marginBottom: 10,
      }}>
        Company Background
      </div>
      <p style={{
        fontSize: 14, color: '#4A5568', lineHeight: 1.75,
        margin: 0, fontFamily: fonts.body,
      }}>
        {scenario.company_description}
      </p>
    </div>
  );
}

// ─── Slide 2: The Situation ───

function SlideSituation({
  scenario,
  accentColor,
  accentDark,
}: {
  scenario: ScenarioBriefingType;
  accentColor: string;
  accentDark: string;
}) {
  return (
    <div style={{ padding: '36px 40px' }}>
      <span style={sectionBadgeStyle(accentDark)}>The Situation</span>

      <h2 style={headingStyle}>
        What <span style={{ borderBottom: '2px solid #38B2AC', paddingBottom: 2 }}>
          {scenario.company_name}
        </span> Is Facing
      </h2>

      {/* Challenge card */}
      <div style={{
        background: `${accentColor}08`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: '0 10px 10px 0',
        padding: '20px 24px',
        marginBottom: 24,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          <Target size={16} color={accentDark} />
          <span style={{
            fontSize: 11, fontWeight: 700, color: accentDark,
            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          }}>
            Stated Challenge
          </span>
        </div>
        <p style={{
          fontSize: 14, color: '#1A202C', lineHeight: 1.75,
          margin: 0, fontFamily: fonts.body, fontWeight: 500,
        }}>
          {scenario.stated_challenge}
        </p>
      </div>

      {/* Call context */}
      <div style={{
        fontSize: 10, fontWeight: 700, color: '#718096',
        textTransform: 'uppercase' as const, letterSpacing: '0.06em',
        marginBottom: 10,
      }}>
        Call Context
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10, marginBottom: 20,
      }}>
        {parseCallContext(scenario.call_context).map((item, i) => (
          <div key={i} style={{
            background: '#F7FAFC', border: '1px solid #E2E8F0',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: '#1A202C',
              fontFamily: fonts.heading, marginBottom: 4,
            }}>
              {item.label}
            </div>
            <div style={{
              fontSize: 13, color: '#4A5568',
              fontFamily: fonts.body,
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Takeaway */}
      <div style={{
        background: '#F0FFF4', border: '1px solid #C6F6D5',
        borderRadius: 8, padding: '12px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: 12, color: '#276749', lineHeight: 1.6, margin: 0, fontFamily: fonts.body }}>
          Pay attention to what is said — and what isn&apos;t. The stated challenge may not be the full picture.
        </p>
      </div>
    </div>
  );
}

// ─── Slide 3: Your Mission ───

function SlideMission({
  scenario,
  accentColor,
  accentDark,
  callEnabled,
  callCountdown,
  onStartCall,
  firstName,
  sessionMode,
  onSessionModeChange,
}: {
  scenario: ScenarioBriefingType;
  accentColor: string;
  accentDark: string;
  callEnabled: boolean;
  callCountdown: number;
  onStartCall: () => void;
  firstName: string;
  sessionMode: SessionMode;
  onSessionModeChange: (mode: SessionMode) => void;
}) {
  return (
    <div style={{
      padding: '36px 40px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      minHeight: 300,
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#FFFFFF',
        background: accentDark, borderRadius: 6,
        padding: '4px 12px', display: 'inline-block', marginBottom: 16,
        textTransform: 'uppercase' as const, letterSpacing: '0.06em',
        alignSelf: 'flex-start',
      }}>
        Your Mission
      </span>

      <h2 style={{ ...headingStyle, fontSize: 22, lineHeight: 1.5 }}>
        Diagnose, Don&apos;t <span style={{ borderBottom: '2px solid #38B2AC', paddingBottom: 2 }}>Sell</span>
      </h2>

      <p style={{
        fontSize: 14, color: '#4A5568', lineHeight: 1.8,
        margin: '0 0 24px', maxWidth: 700, fontFamily: fonts.body,
      }}>
        You are about to call {scenario.contact_name}. Your goal is to understand their
        real situation through skilled questioning. Resist the urge to pitch — earn trust
        by being genuinely curious about their challenges.
      </p>

      {/* Constraint banner */}
      <div style={{
        background: '#FFFBEB', border: '1px solid #FDE68A',
        borderRadius: 10, padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 24,
      }}>
        <AlertTriangle size={18} color="#92400E" style={{ flexShrink: 0 }} />
        <span style={{
          fontFamily: fonts.body, fontSize: 14, fontWeight: 600,
          color: '#92400E',
        }}>
          {scenario.constraint_message}
        </span>
      </div>

      {/* Key rules */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10, marginBottom: 24,
      }}>
        {[
          { label: 'Ask open questions', desc: 'Let them talk. Resist filling silence.' },
          { label: 'Listen for signals', desc: 'What they emphasise — or avoid — matters.' },
          { label: 'Build trust first', desc: 'Information unlocks as trust grows.' },
        ].map((rule) => (
          <div key={rule.label} style={{
            background: `${accentColor}08`, border: `1px solid ${accentColor}20`,
            borderRadius: 8, padding: '12px 14px',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: accentDark,
              marginBottom: 4, fontFamily: fonts.heading,
            }}>
              {rule.label}
            </div>
            <p style={{
              fontSize: 11, color: '#4A5568', lineHeight: 1.6,
              margin: 0, fontFamily: fonts.body,
            }}>
              {rule.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Mode toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, marginBottom: 16,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#718096', fontFamily: fonts.body }}>
          Mode:
        </span>
        <div style={{
          display: 'flex', background: '#F7FAFC', borderRadius: 8,
          border: '1px solid #E2E8F0', overflow: 'hidden',
        }}>
          {(['scored', 'practice'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onSessionModeChange(mode)}
              style={{
                padding: '6px 16px', border: 'none',
                background: sessionMode === mode ? '#1A202C' : 'transparent',
                color: sessionMode === mode ? '#FFFFFF' : '#718096',
                fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', textTransform: 'capitalize' as const,
                transition: 'all 0.15s ease',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
        {sessionMode === 'practice' && (
          <span style={{ fontSize: 11, color: '#D69E2E', fontFamily: fonts.body }}>
            No scoring · Unlimited retries
          </span>
        )}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onStartCall}
          disabled={!callEnabled}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: callEnabled ? '#38A169' : '#A0AEC0',
            color: '#FFFFFF', border: 'none', borderRadius: 10,
            padding: '14px 32px',
            fontFamily: fonts.body, fontWeight: 600, fontSize: 16,
            cursor: callEnabled ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
        >
          <Phone size={18} />
          {callEnabled ? `Call ${firstName}` : `Read the briefing... (${callCountdown}s)`}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ───

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#F7FAFC', border: '1px solid #E2E8F0',
      borderRadius: 8, padding: '5px 12px',
      fontSize: 12, fontWeight: 600, color: '#4A5568',
      fontFamily: fonts.body,
    }}>
      {icon}
      {label}
    </div>
  );
}

/** Parse "First meeting · 20 minutes · No prior contact" into structured items */
function parseCallContext(context: string): { label: string; value: string }[] {
  const parts = context.split('·').map((s) => s.trim()).filter(Boolean);
  const labels = ['Meeting Type', 'Duration', 'Prior Relationship'];
  return parts.map((value, i) => ({
    label: labels[i] || `Detail ${i + 1}`,
    value,
  }));
}

// ─── Shared styles ───

function sectionBadgeStyle(accentDark: string): React.CSSProperties {
  return {
    fontSize: 9, fontWeight: 700, color: accentDark,
    textTransform: 'uppercase' as const, letterSpacing: '0.08em',
    background: `${accentDark}12`, border: `1px solid ${accentDark}25`,
    borderRadius: 6, padding: '3px 10px',
    display: 'inline-block', marginBottom: 16,
  };
}

const headingStyle: React.CSSProperties = {
  fontSize: 20, fontWeight: 800, color: '#1A202C',
  lineHeight: 1.4, margin: '0 0 12px',
  fontFamily: fonts.heading,
};
