import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fonts, cardStyle, buttonPrimary, buttonSecondary, buttonGhost } from '../constants/designTokens';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithMicrosoft, dummySignIn } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

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
      <div style={{ ...cardStyle, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: fonts.heading,
            fontWeight: 700,
            fontSize: 24,
            color: colors.navy,
            marginBottom: 8,
          }}
        >
          Sign In
        </h1>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.light,
            marginBottom: 32,
          }}
        >
          Sign in to access your sales learning platform.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={signInWithGoogle}
            style={{ ...buttonPrimary, width: '100%' }}
          >
            Sign in with Google
          </button>
          <button
            onClick={signInWithMicrosoft}
            style={{ ...buttonSecondary, width: '100%' }}
          >
            Sign in with Microsoft
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '24px 0',
          }}
        >
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
            or try a demo
          </span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => dummySignIn('learner')}
            style={{
              ...buttonPrimary,
              width: '100%',
              background: colors.navy,
            }}
          >
            Demo Login (Learner)
          </button>
          <button
            onClick={() => dummySignIn('oxygy_admin')}
            style={{ ...buttonGhost, width: '100%' }}
          >
            Demo Login (Admin)
          </button>
        </div>
      </div>
    </div>
  );
}
