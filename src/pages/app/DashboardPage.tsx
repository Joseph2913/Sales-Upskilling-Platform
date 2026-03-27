import { colors, fonts, cardStyle } from '../../constants/designTokens';

export default function DashboardPage() {
  return (
    <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      <h1
        style={{
          fontFamily: fonts.heading,
          fontWeight: 700,
          fontSize: 24,
          color: colors.navy,
          marginBottom: 24,
        }}
      >
        Dashboard
      </h1>
      <div style={cardStyle}>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.body }}>
          Welcome to your sales learning dashboard. Progress, leaderboard, and streaks will appear here.
        </p>
      </div>
    </div>
  );
}
