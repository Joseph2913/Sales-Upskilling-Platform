import { colors, fonts, cardStyle } from '../../constants/designTokens';

export default function JoinPage() {
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
          Join an Organisation
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.body }}>
          Enter a join code or use an invite link to join your organisation.
        </p>
      </div>
    </div>
  );
}
