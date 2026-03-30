import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fonts } from '../../constants/designTokens';
import { SIMULATION_CONTENT } from '../../constants/elearningContent';
import { OBJECTIVE_META } from '../../constants/learningObjectives';
import { ELearningPlayer } from '../../components/app/elearning/ELearningPlayer';

export default function DecisionSimulationPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const objectiveId = parseInt(id || '1', 10);

  const content = SIMULATION_CONTENT[objectiveId];
  const meta = OBJECTIVE_META.find((m) => m.id === objectiveId);

  if (!content || !meta) {
    return (
      <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <Link
          to="/app/journey"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
            color: '#718096', textDecoration: 'none', marginBottom: 20,
          }}
        >
          <ArrowLeft size={14} /> Back to My Journey
        </Link>
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 14, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: '#1A202C', margin: '0 0 8px' }}>
            Content Coming Soon
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: '#718096' }}>
            The decision simulation for Objective {objectiveId} is currently being developed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      {/* Breadcrumb */}
      <Link
        to="/app/journey"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
          color: '#718096', textDecoration: 'none', marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} />
        Back to My Journey
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: meta.accentDark,
          background: `${meta.accentColor}20`, border: `1px solid ${meta.accentColor}50`,
          borderRadius: 6, padding: '3px 10px',
          textTransform: 'uppercase' as const, letterSpacing: '0.05em',
        }}>
          Format A · Decision Simulation
        </span>
        <span style={{
          fontFamily: fonts.body, fontSize: 11, color: '#A0AEC0',
        }}>
          ~{content.estimatedMinutes} min · {content.totalSlides} slides
        </span>
      </div>

      {/* Player */}
      <ELearningPlayer
        content={content}
        accentColor={meta.accentColor}
        accentDark={meta.accentDark}
        isSimulation
        onComplete={() => navigate('/app/journey')}
        onSimulationComplete={() => {
          // TODO: call completeSimulation() when persistence is wired
          navigate(`/app/objective/${objectiveId}/format-b`);
        }}
      />
    </div>
  );
}
