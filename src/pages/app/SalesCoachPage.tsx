import { colors, fonts, cardStyle } from '../../constants/designTokens';

export default function SalesCoachPage() {
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
        My Sales Coach
      </h1>
      <div style={cardStyle}>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.body }}>
          Aggregated AI customer conversations across all objectives will appear here.
        </p>
      </div>
    </div>
  );
}
