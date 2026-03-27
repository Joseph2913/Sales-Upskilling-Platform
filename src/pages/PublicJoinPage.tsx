import { useParams } from 'react-router-dom';
import { colors, fonts, cardStyle, buttonPrimary } from '../constants/designTokens';

export default function PublicJoinPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bg,
        padding: 40,
      }}
    >
      <div style={{ ...cardStyle, maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: fonts.heading,
            fontWeight: 700,
            fontSize: 24,
            color: colors.navy,
            marginBottom: 16,
          }}
        >
          Join via Invite
        </h1>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.body,
            marginBottom: 24,
          }}
        >
          You've been invited to join an organisation. Invite code: <strong>{slug}</strong>
        </p>
        <button style={buttonPrimary}>
          Accept Invite
        </button>
      </div>
    </div>
  );
}
