import { useNavigate } from 'react-router-dom';
import { colors, fonts, buttonPrimary } from '../../constants/designTokens';

export function MarketingSite() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.white,
        fontFamily: fonts.body,
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 40px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <span
          style={{
            fontFamily: fonts.heading,
            fontWeight: 800,
            fontSize: 20,
            color: colors.navy,
          }}
        >
          Sales Academy
        </span>
        <button
          onClick={() => navigate('/login')}
          style={buttonPrimary}
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: '80px 40px',
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: fonts.heading,
            fontWeight: 800,
            fontSize: 48,
            color: colors.navy,
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Master{' '}
          <span style={{ borderBottom: `2px solid ${colors.teal}`, paddingBottom: 2 }}>
            Sales
          </span>{' '}
          with AI
        </h1>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 18,
            color: colors.body,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          A personalised learning platform that builds your sales capability
          through decision simulations, AI-powered customer conversations, and
          real-world project work.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{ ...buttonPrimary, fontSize: 16, padding: '14px 32px' }}
        >
          Get Started
        </button>
      </section>
    </div>
  );
}
