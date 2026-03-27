import { useParams } from 'react-router-dom';
import { colors, fonts, cardStyle } from '../../constants/designTokens';

export default function AIConversationPlayer() {
  const { id } = useParams<{ id: string }>();

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
        AI Customer Conversation — Objective {id}
      </h1>
      <div style={cardStyle}>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.body }}>
          Format B: Live generative dialogue with an AI buyer persona will appear here.
        </p>
      </div>
    </div>
  );
}
