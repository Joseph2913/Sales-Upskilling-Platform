import { useEffect, useRef, useState } from 'react';
import { PhoneOff } from 'lucide-react';
import { colors, fonts } from '../../../constants/designTokens';

interface DiallingScreenProps {
  contactName: string;
  /** Called when the user presses the hang-up button to cancel. */
  onCancel: () => void;
}

/**
 * Screen 2: Dialling State (FR6-10, AC3-5, AC23).
 * Shows a pulsing ring animation and plays a ringing tone.
 * The user can cancel via the red hang-up button.
 */
export function DiallingScreen({ contactName, onCancel }: DiallingScreenProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [styleInjected, setStyleInjected] = useState(false);

  // Extract initials for avatar
  const initials = contactName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Play ringing audio (FR7)
  useEffect(() => {
    const audio = new Audio('/ring.wav');
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(() => {
      // Browser may block autoplay — graceful degradation
    });
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Inject keyframe animation styles
  useEffect(() => {
    if (styleInjected) return;
    const styleId = 'dialling-keyframes';
    if (document.getElementById(styleId)) {
      setStyleInjected(true);
      return;
    }
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes pulseRing1 {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes pulseRing2 {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(2.6); opacity: 0; }
      }
      @keyframes pulseRing3 {
        0% { transform: scale(1); opacity: 0.25; }
        100% { transform: scale(3); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    setStyleInjected(true);
  }, [styleInjected]);

  return (
    <div style={containerStyle}>
      {/* Pulsing rings (FR6) */}
      <div style={avatarContainerStyle}>
        <div style={{ ...ringStyle, animation: 'pulseRing1 2s ease-out infinite' }} />
        <div style={{ ...ringStyle, animation: 'pulseRing2 2s ease-out infinite 0.4s' }} />
        <div style={{ ...ringStyle, animation: 'pulseRing3 2s ease-out infinite 0.8s' }} />
        <div style={avatarStyle}>
          <span style={initialsStyle}>{initials}</span>
        </div>
      </div>

      {/* Contact name */}
      <p style={callingTextStyle}>Calling {contactName}...</p>

      {/* Hang-up button (FR9, AC23) */}
      <button onClick={onCancel} style={hangUpButtonStyle}>
        <PhoneOff size={22} />
      </button>
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
  background: '#1A1A2E',
  borderRadius: 16,
};

const avatarContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: 120,
  height: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ringStyle: React.CSSProperties = {
  position: 'absolute',
  width: 120,
  height: 120,
  borderRadius: '50%',
  border: '2px solid rgba(56, 178, 172, 0.5)',
};

const avatarStyle: React.CSSProperties = {
  width: 100,
  height: 100,
  borderRadius: '50%',
  background: '#2D3748',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
};

const initialsStyle: React.CSSProperties = {
  fontFamily: fonts.heading,
  fontSize: 32,
  fontWeight: 700,
  color: colors.white,
};

const callingTextStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 18,
  color: 'rgba(255,255,255,0.8)',
  marginTop: 32,
};

const hangUpButtonStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: '50%',
  background: colors.error,
  color: colors.white,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  marginTop: 48,
};
