import { useState, useEffect } from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import type { ScenarioBriefing as ScenarioBriefingType } from '../../../types/voiceSimulation';
import { colors, fonts } from '../../../constants/designTokens';

interface ScenarioBriefingProps {
  scenario: ScenarioBriefingType;
  onStartCall: () => void;
}

/**
 * Screen 1: Scenario Briefing (FR1-5, AC1-2).
 * Displays briefing-safe fields only. The "Call" button is disabled
 * for the first 5 seconds to ensure the user reads the brief.
 */
export function ScenarioBriefing({ scenario, onStartCall }: ScenarioBriefingProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const callEnabled = secondsElapsed >= 5;

  useEffect(() => {
    if (secondsElapsed >= 5) return;
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsElapsed]);

  const firstName = scenario.contact_name.split(' ')[0];

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Contact name and title */}
        <h1 style={nameStyle}>{scenario.contact_name}</h1>
        <p style={titleLineStyle}>
          {scenario.contact_title} · {scenario.company_name}
        </p>

        <div style={dividerStyle} />

        {/* Company description */}
        <p style={descriptionStyle}>{scenario.company_description}</p>

        <div style={dividerStyle} />

        {/* Stated challenge */}
        <p style={challengeStyle}>{scenario.stated_challenge}</p>

        {/* Call context */}
        <p style={contextStyle}>{scenario.call_context}</p>
      </div>

      {/* Amber constraint banner (FR3) */}
      <div style={bannerStyle}>
        <AlertTriangle size={18} color="#92400E" style={{ flexShrink: 0 }} />
        <span style={bannerTextStyle}>{scenario.constraint_message}</span>
      </div>

      {/* Call button (FR4) — disabled first 5 seconds */}
      <button
        onClick={onStartCall}
        disabled={!callEnabled}
        style={{
          ...callButtonStyle,
          opacity: callEnabled ? 1 : 0.5,
          cursor: callEnabled ? 'pointer' : 'not-allowed',
        }}
      >
        <Phone size={18} />
        <span>Call {firstName}</span>
      </button>

      {!callEnabled && (
        <p style={countdownStyle}>
          Please read the briefing... ({5 - secondsElapsed}s)
        </p>
      )}
    </div>
  );
}

// ─── Styles ───

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 500,
  padding: '40px 0',
};

const cardStyle: React.CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 32,
  maxWidth: 560,
  width: '100%',
};

const nameStyle: React.CSSProperties = {
  fontFamily: fonts.heading,
  fontSize: 28,
  fontWeight: 700,
  color: colors.navy,
  margin: 0,
  marginBottom: 4,
};

const titleLineStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 15,
  color: colors.light,
  margin: 0,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: colors.border,
  margin: '20px 0',
};

const descriptionStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 14,
  lineHeight: 1.6,
  color: colors.body,
  margin: 0,
};

const challengeStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 14,
  lineHeight: 1.6,
  color: colors.navy,
  fontWeight: 500,
  margin: 0,
  marginBottom: 12,
};

const contextStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 13,
  color: colors.light,
  margin: 0,
};

const bannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: '#FFFBEB',
  border: '1px solid #FDE68A',
  borderRadius: 10,
  padding: '12px 20px',
  maxWidth: 560,
  width: '100%',
  marginTop: 16,
};

const bannerTextStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 14,
  fontWeight: 600,
  color: '#92400E',
};

const callButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: '#38A169', // green
  color: colors.white,
  border: 'none',
  borderRadius: 10,
  padding: '14px 32px',
  fontFamily: fonts.body,
  fontWeight: 600,
  fontSize: 16,
  marginTop: 24,
  transition: 'opacity 0.2s',
};

const countdownStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 12,
  color: colors.muted,
  marginTop: 8,
};
