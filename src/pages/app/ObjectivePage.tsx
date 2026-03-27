import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, Play, Mic, FileText } from 'lucide-react';
import { colors, fonts } from '../../constants/designTokens';
import { LEARNING_OBJECTIVES, OBJECTIVE_META } from '../../constants/learningObjectives';
import type { FormatPhase } from '../../constants/learningObjectives';

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  A: <Play size={20} />,
  B: <Mic size={20} />,
  C: <FileText size={20} />,
};

const FORMAT_STATUS: Record<string, { label: string; available: boolean }> = {
  A: { label: 'Coming Soon', available: false },
  B: { label: 'Available', available: true },
  C: { label: 'Coming Soon', available: false },
};

function FormatCard({
  phase,
  meta,
  objectiveId,
  index,
}: {
  phase: FormatPhase;
  meta: typeof OBJECTIVE_META[0];
  objectiveId: number;
  index: number;
}) {
  const navigate = useNavigate();
  const status = FORMAT_STATUS[phase.format];
  const scenarioId = LEARNING_OBJECTIVES.find((o) => o.id === objectiveId)?.scenarioId;

  const handleClick = () => {
    if (phase.format === 'B' && scenarioId) {
      navigate(`/app/voice-simulation/${scenarioId}`);
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 14,
        border: `1px solid ${status.available ? meta.accentColor + '66' : '#E2E8F0'}`,
        overflow: 'hidden',
        animation: `fadeSlideUp 0.3s ease ${index * 80}ms both`,
        opacity: status.available ? 1 : 0.7,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (status.available) {
          e.currentTarget.style.borderColor = meta.accentColor;
          e.currentTarget.style.boxShadow = `0 4px 16px ${meta.accentColor}22`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = status.available ? meta.accentColor + '66' : '#E2E8F0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Accent top bar */}
      <div style={{
        height: 3,
        background: status.available ? meta.accentColor : '#E2E8F0',
      }} />

      <div style={{ padding: 24 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Format icon circle */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: status.available ? `${meta.accentColor}20` : '#F7FAFC',
              border: `1.5px solid ${status.available ? meta.accentColor + '44' : '#E2E8F0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: status.available ? meta.accentDark : '#A0AEC0',
            }}>
              {status.available ? FORMAT_ICONS[phase.format] : <Lock size={18} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: fonts.heading,
                  fontSize: 11,
                  fontWeight: 700,
                  color: meta.accentDark,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  Format {phase.format}
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: status.available ? '#276749' : '#A0AEC0',
                  background: status.available ? '#F0FFF4' : '#F7FAFC',
                  border: `1px solid ${status.available ? '#C6F6D5' : '#E2E8F0'}`,
                  borderRadius: 6,
                  padding: '2px 8px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                }}>
                  {status.label}
                </span>
              </div>
              <h3 style={{
                fontFamily: fonts.heading,
                fontSize: 16,
                fontWeight: 700,
                color: status.available ? colors.navy : '#A0AEC0',
                margin: '4px 0 0',
              }}>
                {phase.label}
              </h3>
            </div>
          </div>

          <span style={{
            fontFamily: fonts.body,
            fontSize: 11,
            fontWeight: 600,
            color: '#A0AEC0',
          }}>
            ~{phase.estimatedMinutes} min
          </span>
        </div>

        {/* Title */}
        <h4 style={{
          fontFamily: fonts.heading,
          fontSize: 14,
          fontWeight: 600,
          color: status.available ? colors.navy : '#CBD5E0',
          margin: '0 0 8px',
        }}>
          {phase.icon} {phase.title}
        </h4>

        {/* Description */}
        <p style={{
          fontFamily: fonts.body,
          fontSize: 13,
          color: status.available ? colors.body : '#CBD5E0',
          lineHeight: 1.65,
          margin: '0 0 20px',
        }}>
          {phase.description}
        </p>

        {/* CTA */}
        {status.available ? (
          <button
            onClick={handleClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: meta.accentDark,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 22px',
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {phase.format === 'B' ? 'Start Voice Simulation' : `Start ${phase.label}`}
            <ArrowRight size={14} />
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#F7FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '10px 22px',
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 13,
            color: '#A0AEC0',
          }}>
            <Lock size={13} />
            Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Phase stepper (visual A → B → C progression) ───

function PhaseStepper({ meta }: { meta: typeof OBJECTIVE_META[0] }) {
  const steps = [
    { format: 'A', label: 'Decision Sim', available: false },
    { format: 'B', label: 'Voice Sim', available: true },
    { format: 'C', label: 'Build & Apply', available: false },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((step, i) => (
        <div key={step.format} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && (
            <div style={{
              width: 40,
              height: 2,
              background: step.available ? meta.accentColor : '#E2E8F0',
            }} />
          )}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: step.available ? meta.accentColor : '#F7FAFC',
              border: step.available ? 'none' : '1.5px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: step.available ? meta.accentDark : '#A0AEC0',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: fonts.heading,
            }}>
              {step.available ? step.format : <Lock size={11} />}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: step.available ? 700 : 500,
              color: step.available ? meta.accentDark : '#A0AEC0',
              whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ───

export default function ObjectivePage() {
  const { id } = useParams<{ id: string }>();
  const objectiveId = parseInt(id || '1', 10);

  const objective = LEARNING_OBJECTIVES.find((o) => o.id === objectiveId);
  const meta = OBJECTIVE_META.find((m) => m.id === objectiveId);

  if (!objective || !meta) {
    return (
      <div style={{ padding: 40, fontFamily: fonts.body, color: colors.light }}>
        Objective not found.
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      {/* Breadcrumb */}
      <Link
        to="/app/journey"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: fonts.body,
          fontSize: 12,
          fontWeight: 600,
          color: colors.light,
          textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} />
        Back to My Journey
      </Link>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 8,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${meta.accentColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
        }}>
          {objective.icon}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: meta.accentDark,
              background: `${meta.accentColor}30`,
              border: `1px solid ${meta.accentColor}66`,
              borderRadius: 6,
              padding: '2px 8px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
            }}>
              Objective {objective.id}
            </span>
          </div>
          <h1 style={{
            fontFamily: fonts.heading,
            fontSize: 22,
            fontWeight: 700,
            color: colors.navy,
            margin: '0 0 6px',
          }}>
            {objective.title}
          </h1>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.light,
            margin: 0,
            lineHeight: 1.6,
          }}>
            {objective.description}
          </p>
        </div>
      </div>

      {/* Phase stepper */}
      <div style={{ margin: '28px 0' }}>
        <PhaseStepper meta={meta} />
      </div>

      {/* Format cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {objective.formats.map((phase, i) => (
          <FormatCard
            key={phase.format}
            phase={phase}
            meta={meta}
            objectiveId={objectiveId}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
