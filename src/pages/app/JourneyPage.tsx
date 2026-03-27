import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Lock, Check, BookOpen, ArrowRight } from 'lucide-react';
import { colors, fonts } from '../../constants/designTokens';
import { LEARNING_OBJECTIVES, OBJECTIVE_META } from '../../constants/learningObjectives';
import type { LearningObjective } from '../../constants/learningObjectives';

// ─── Expansion levels: 0 = collapsed, 1 = overview, 2 = breakdown, 3 = deep dive ───
type ExpansionLevel = 0 | 1 | 2 | 3;

function ObjectiveCard({ objective, index }: { objective: LearningObjective; index: number }) {
  const navigate = useNavigate();
  const [expansion, setExpansion] = useState<ExpansionLevel>(0);
  const meta = OBJECTIVE_META.find((m) => m.id === objective.id)!;
  const isActive = objective.id === 1;
  const isLocked = !isActive;

  const cycleExpansion = () => {
    if (expansion === 0) setExpansion(1);
    else if (expansion === 1) setExpansion(2);
    else setExpansion(0);
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 14,
        border: `1px solid ${expansion > 0 ? meta.accentColor + '66' : '#E2E8F0'}`,
        overflow: 'hidden',
        animation: `fadeSlideUp 0.3s ease ${index * 60}ms both`,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: expansion > 0 ? `0 2px 12px ${meta.accentColor}15` : 'none',
      }}
    >
      {/* ─── Header (always visible) ─── */}
      <div
        onClick={cycleExpansion}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {/* Accent bar */}
        <div style={{ width: 4, alignSelf: 'stretch', background: meta.accentColor, flexShrink: 0 }} />

        {/* Number badge */}
        <div style={{
          width: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: `${meta.accentColor}15`,
          alignSelf: 'stretch',
        }}>
          {isActive ? (
            <span style={{ fontSize: 16, fontWeight: 800, color: meta.accentDark }}>{objective.id}</span>
          ) : (
            <Lock size={14} color="#A0AEC0" />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px 20px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{objective.icon}</span>
            <h3 style={{
              fontFamily: fonts.heading,
              fontSize: 15,
              fontWeight: 700,
              color: isLocked ? '#A0AEC0' : colors.navy,
              margin: 0,
            }}>
              {objective.title}
            </h3>
            {isActive && (
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: meta.accentDark,
                background: `${meta.accentColor}30`,
                border: `1px solid ${meta.accentColor}66`,
                borderRadius: 6,
                padding: '2px 8px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.04em',
              }}>
                Active
              </span>
            )}
            {isLocked && (
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#A0AEC0',
                background: '#F7FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 6,
                padding: '2px 8px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.04em',
              }}>
                Coming Soon
              </span>
            )}
          </div>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: isLocked ? '#CBD5E0' : colors.light,
            margin: 0,
            lineHeight: 1.5,
          }}>
            {objective.subtitle}
          </p>
        </div>

        {/* Expand indicator + time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingRight: 20,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#A0AEC0',
          }}>
            ~{objective.estimatedMinutes} min
          </span>
          <ChevronDown
            size={16}
            color="#A0AEC0"
            style={{
              transition: 'transform 0.25s ease',
              transform: expansion > 0 ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>

      {/* ─── Level 1: Overview ─── */}
      <div style={{
        maxHeight: expansion >= 1 ? 600 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{ padding: '0 24px 0 72px', borderTop: '1px solid #EDF2F7' }}>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.body,
            lineHeight: 1.7,
            padding: '16px 0',
            margin: 0,
          }}>
            {objective.overview}
          </p>

          {/* Expand to breakdown */}
          <button
            onClick={(e) => { e.stopPropagation(); setExpansion(expansion >= 2 ? 1 : 2); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: fonts.body,
              fontSize: 12,
              fontWeight: 600,
              color: meta.accentDark,
              padding: '0 0 16px',
            }}
          >
            {expansion >= 2 ? 'Show less' : 'See breakdown'}
            <ChevronRight size={12} style={{
              transition: 'transform 0.2s ease',
              transform: expansion >= 2 ? 'rotate(90deg)' : 'rotate(0deg)',
            }} />
          </button>
        </div>
      </div>

      {/* ─── Level 2: Breakdown ─── */}
      <div style={{
        maxHeight: expansion >= 2 ? 800 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{ padding: '0 24px 0 72px', borderTop: '1px solid #EDF2F7' }}>
          <div style={{ padding: '16px 0' }}>
            {/* What you'll learn */}
            <SectionLabel>What You Will Learn</SectionLabel>
            <ul style={{ margin: '0 0 16px', paddingLeft: 16 }}>
              {objective.breakdown.whatYouWillLearn.map((item, i) => (
                <li key={i} style={listItemStyle}>{item}</li>
              ))}
            </ul>

            {/* Frameworks */}
            <SectionLabel>Frameworks & Models</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {objective.breakdown.frameworks.map((fw) => (
                <span key={fw} style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: meta.accentDark,
                  background: `${meta.accentColor}20`,
                  border: `1px solid ${meta.accentColor}44`,
                  borderRadius: 6,
                  padding: '3px 10px',
                }}>
                  {fw}
                </span>
              ))}
            </div>

            {/* Real-world application */}
            <SectionLabel>Real-World Application</SectionLabel>
            <p style={{ ...bodyTextStyle, marginBottom: 16 }}>
              {objective.breakdown.realWorldApplication}
            </p>

            {/* Learn more button */}
            <button
              onClick={(e) => { e.stopPropagation(); setExpansion(expansion >= 3 ? 2 : 3); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: fonts.body,
                fontSize: 12,
                fontWeight: 600,
                color: meta.accentDark,
                padding: '0 0 16px',
              }}
            >
              <BookOpen size={12} />
              {expansion >= 3 ? 'Show less' : 'Learn more'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Level 3: Deep Dive ─── */}
      <div style={{
        maxHeight: expansion >= 3 ? 1200 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{ padding: '0 24px 20px 72px', borderTop: '1px solid #EDF2F7' }}>
          <div style={{ padding: '16px 0 0' }}>
            <SectionLabel>Why This Matters in Pharma</SectionLabel>
            <p style={{ ...bodyTextStyle, marginBottom: 16 }}>
              {objective.deepDive.whyThisMatters}
            </p>

            <SectionLabel>Common Mistakes</SectionLabel>
            <ul style={{ margin: '0 0 16px', paddingLeft: 16 }}>
              {objective.deepDive.commonMistakes.map((item, i) => (
                <li key={i} style={{ ...listItemStyle, color: '#C53030' }}>{item}</li>
              ))}
            </ul>

            <SectionLabel>Success Indicators</SectionLabel>
            <ul style={{ margin: '0 0 16px', paddingLeft: 16 }}>
              {objective.deepDive.successIndicators.map((item, i) => (
                <li key={i} style={listItemStyle}>
                  <Check size={10} color="#38A169" style={{ marginRight: 6, flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>

            <SectionLabel>Pharma Context</SectionLabel>
            <p style={{ ...bodyTextStyle, fontStyle: 'italic', marginBottom: 0 }}>
              {objective.deepDive.pharmaContext}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Action bar (visible when expanded and active) ─── */}
      {expansion >= 1 && isActive && (
        <div style={{
          padding: '12px 24px 16px 72px',
          borderTop: '1px solid #EDF2F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {objective.formats.map((fmt) => (
              <span key={fmt.format} style={{
                fontSize: 10,
                fontWeight: 600,
                color: colors.body,
                background: '#F7FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 6,
                padding: '3px 10px',
              }}>
                {fmt.icon} {fmt.label}
              </span>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/app/objective/${objective.id}`);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: meta.accentDark,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Start Learning
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Shared small components ───

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9,
      fontWeight: 700,
      color: '#718096',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

const bodyTextStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 13,
  color: colors.body,
  lineHeight: 1.7,
  margin: 0,
};

const listItemStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 12,
  color: colors.body,
  lineHeight: 1.7,
  marginBottom: 4,
};

// ─── Page ───

export default function JourneyPage() {
  return (
    <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: fonts.heading,
          fontWeight: 700,
          fontSize: 24,
          color: colors.navy,
          margin: '0 0 6px',
        }}>
          My <span style={{ borderBottom: '2px solid #38B2AC', paddingBottom: 2 }}>Journey</span>
        </h1>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: colors.light,
          margin: 0,
          lineHeight: 1.6,
        }}>
          Your personalised pharma sales capability programme. Master diagnostic selling,
          trust-building, and value articulation through realistic simulations and applied projects.
        </p>
      </div>

      {/* Objective cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LEARNING_OBJECTIVES.map((obj, i) => (
          <ObjectiveCard key={obj.id} objective={obj} index={i} />
        ))}
      </div>
    </div>
  );
}
