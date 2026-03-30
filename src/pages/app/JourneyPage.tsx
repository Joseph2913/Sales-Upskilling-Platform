import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, ChevronDown, ArrowRight, Lock, MoveDown,
  Play, Mic, FileText,
} from 'lucide-react';
import { fonts } from '../../constants/designTokens';
import { LEARNING_OBJECTIVES, OBJECTIVE_META } from '../../constants/learningObjectives';
import type { LearningObjective, FormatPhase } from '../../constants/learningObjectives';

// ─── Animations ───
const journeyStyles = `
@keyframes journeyPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
@keyframes journeyFadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
`;

// ─── Format phase icons ───
const FORMAT_ICON: Record<string, React.ReactNode> = {
  A: <Play size={11} />,
  B: <Mic size={11} />,
  C: <FileText size={11} />,
};

// ─── Phase stepper with tooltips (inside level card) ───
function PhaseChips({
  formats,
  accent,
  accentDark,
  objectiveId,
}: {
  formats: FormatPhase[];
  accent: string;
  accentDark: string;
  objectiveId: number;
}) {
  const navigate = useNavigate();
  const isFirstObj = objectiveId === 1;

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginTop: 10 }}>
      {formats.map((fmt, i) => {
        const isFormatAvailable = isFirstObj && (fmt.format === 'A' || fmt.format === 'B');
        const isDone = false; // placeholder for progress tracking
        return (
          <React.Fragment key={fmt.format}>
            {i > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, flexShrink: 0, color: '#CBD5E0',
              }}>
                »
              </div>
            )}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (!isFormatAvailable) return;
                if (fmt.format === 'A') {
                  navigate(`/app/objective/${objectiveId}/format-a`);
                } else if (fmt.format === 'B') {
                  navigate(`/app/objective/${objectiveId}/format-b`);
                } else if (fmt.format === 'C') {
                  navigate(`/app/objective/${objectiveId}/format-c`);
                }
              }}
              style={{
                flex: 1,
                background: isDone ? `${accent}12` : '#FFFFFF',
                border: `1px solid ${isDone ? accent + '44' : '#E2E8F0'}`,
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: isFormatAvailable ? 'pointer' : 'default',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                if (isFormatAvailable) {
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.boxShadow = `0 1px 4px ${accent}15`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDone ? accent + '44' : '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: isDone ? accent : '#F7FAFC',
                border: isDone ? 'none' : '1.5px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isDone ? accentDark : '#A0AEC0',
              }}>
                {isDone ? <Check size={12} strokeWidth={3} /> : FORMAT_ICON[fmt.format]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A202C' }}>{fmt.label}</span>
                  {isDone && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#276749', background: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: 8, padding: '1px 6px' }}>Done</span>
                  )}
                  {!isDone && isFormatAvailable && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: accentDark, background: `${accent}20`, border: `1px solid ${accent}44`, borderRadius: 8, padding: '1px 6px' }}>Available</span>
                  )}
                  {!isDone && !isFormatAvailable && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#A0AEC0' }}>To do</span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: '#718096' }}>{fmt.title}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#A0AEC0', whiteSpace: 'nowrap' }}>
                {isFormatAvailable ? 'Open →' : ''}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Objective Level Card ───
function ObjectiveCard({
  objective,
  index,
  isCurrent,
}: {
  objective: LearningObjective;
  index: number;
  isCurrent: boolean;
}) {
  const navigate = useNavigate();
  const meta = OBJECTIVE_META.find((m) => m.id === objective.id)!;
  const isActive = objective.id === 1;

  // Two-tier expansion: showPhases = level 1, expanded = level 2 (deep dive)
  const [showPhases, setShowPhases] = useState(isCurrent);
  const [expanded, setExpanded] = useState(false);

  const accent = meta.accentColor;
  const accentDark = meta.accentDark;

  const statusLabel = isActive ? 'Active' : 'Not started';
  const statusColor = isActive ? accentDark : '#A0AEC0';
  const statusBg = isActive ? `${accent}20` : '#F7FAFC';
  const statusBorder = isActive ? `${accent}66` : '#E2E8F0';

  return (
    <div
      style={{
        borderRadius: 14,
        border: isCurrent ? `1px solid ${accent}88` : '1px solid #E2E8F0',
        borderLeft: `4px solid ${accent}`,
        background: '#FFFFFF',
        overflow: 'hidden',
        animation: `journeyFadeSlideUp 0.3s ease ${60 + index * 60}ms both`,
      }}
    >
      {/* ─── Header row (always visible, click to toggle phases) ─── */}
      <div
        onClick={() => {
          if (showPhases && expanded) {
            setExpanded(false);
            setShowPhases(false);
          } else if (showPhases) {
            setShowPhases(false);
          } else {
            setShowPhases(true);
          }
        }}
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: 'pointer',
        }}
      >
        {/* Level circle */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: isActive ? `${accent}20` : '#F7FAFC',
          border: isActive ? `2px solid ${accent}` : '1.5px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isActive ? accentDark : '#A0AEC0',
          fontSize: 14, fontWeight: 800,
          fontFamily: fonts.heading,
        }}>
          {isActive ? objective.id : <Lock size={13} />}
        </div>

        {/* Title block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: accentDark,
            textTransform: 'uppercase' as const, letterSpacing: '0.06em',
            marginBottom: 2,
          }}>
            Objective {objective.id}
          </div>
          <div style={{
            fontSize: 15, fontWeight: 700, color: '#1A202C',
            marginBottom: 2,
          }}>
            {objective.title}
          </div>
          <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>
            {objective.subtitle}
          </div>
          {/* Project preview when showPhases */}
          {showPhases && objective.breakdown.frameworks.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {objective.breakdown.frameworks.map((fw) => (
                <span key={fw} style={{
                  fontSize: 9, fontWeight: 600,
                  color: accentDark,
                  background: `${accent}15`,
                  border: `1px solid ${accent}33`,
                  borderRadius: 6, padding: '2px 8px',
                }}>
                  {fw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status badge + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: statusColor,
            background: statusBg,
            border: `1px solid ${statusBorder}`,
            borderRadius: 8, padding: '3px 10px',
          }}>
            {statusLabel}
          </span>
          <ChevronDown
            size={16}
            color="#A0AEC0"
            style={{
              transition: 'transform 0.25s ease',
              transform: showPhases ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>

      {/* ─── Phase chips (expansion level 1) ─── */}
      <div style={{
        maxHeight: showPhases ? 300 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{ padding: '0 20px 0', paddingLeft: 68 }}>
          <PhaseChips
            formats={objective.formats}
            accent={accent}
            accentDark={accentDark}
            objectiveId={objective.id}
          />
        </div>

        {/* Bottom row: Learn more + Start */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px 14px',
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
              color: accentDark, marginLeft: 50,
              padding: 0,
            }}
          >
            {expanded ? 'Show less' : 'Learn more'}
            <ChevronDown size={12} style={{
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }} />
          </button>
          {isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/app/objective/${objective.id}/format-a`);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: accentDark, color: '#FFFFFF', border: 'none',
                borderRadius: 20, padding: '8px 18px',
                fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Start <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ─── Expanded detail view (expansion level 2) ─── */}
      <div style={{
        maxHeight: showPhases && expanded ? 1200 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{
          padding: '0 20px 20px',
          paddingLeft: 68,
          borderTop: '1px solid #EDF2F7',
        }}>
          {/* Sub-activities for each format */}
          {objective.formats.map((fmt, i) => (
            <div key={fmt.format} style={{
              padding: '16px 0',
              borderBottom: i < objective.formats.length - 1 ? '1px solid #F7FAFC' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: `${accent}15`, border: `1px solid ${accent}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: accentDark, fontSize: 11, fontWeight: 700,
                }}>
                  {i + 1}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: accentDark,
                  textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                }}>
                  {fmt.label}
                </span>
              </div>
              <div style={{ marginLeft: 34 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: '#1A202C', marginBottom: 4,
                }}>
                  {fmt.icon} {fmt.title}
                </div>
                <p style={{
                  fontSize: 12, color: '#4A5568', lineHeight: 1.65, margin: '0 0 8px',
                }}>
                  {fmt.description}
                </p>
                <span style={{ fontSize: 11, color: '#A0AEC0' }}>
                  ~{fmt.estimatedMinutes} minutes
                </span>
              </div>
            </div>
          ))}

          {/* What you'll learn */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: '#718096',
              textTransform: 'uppercase' as const, letterSpacing: '0.06em',
              marginBottom: 8,
            }}>
              What You Will Learn
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {objective.breakdown.whatYouWillLearn.map((item, i) => (
                <li key={i} style={{
                  fontSize: 12, color: '#4A5568', lineHeight: 1.7, marginBottom: 2,
                }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pharma context */}
          <div style={{
            marginTop: 16,
            background: `${accent}08`,
            border: `1px solid ${accent}22`,
            borderRadius: 8,
            padding: '12px 14px',
          }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: accentDark,
              textTransform: 'uppercase' as const, letterSpacing: '0.06em',
              marginBottom: 6,
            }}>
              Pharma Context
            </div>
            <p style={{
              fontSize: 12, color: '#4A5568', lineHeight: 1.65, margin: 0,
              fontStyle: 'italic',
            }}>
              {objective.deepDive.pharmaContext}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function JourneyPage() {
  const navigate = useNavigate();
  const levelRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Current active objective (hardcoded to 1 for now)
  const currentObjective = LEARNING_OBJECTIVES[0];
  const currentMeta = OBJECTIVE_META[0];
  const overallPct = 0; // placeholder

  const scrollToObjective = (id: number) => {
    const el = levelRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ fontFamily: `${fonts.heading}, sans-serif` }}>
      <style>{journeyStyles}</style>

      {/* ─── Page Header ─── */}
      <div style={{
        marginBottom: 20,
        animation: 'journeyFadeSlideUp 0.3s ease 0ms both',
      }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: '#1A202C',
          letterSpacing: '-0.4px', margin: '0 0 6px',
        }}>
          My Journey
        </h1>
        <p style={{
          fontSize: 14, color: '#718096', lineHeight: 1.6, margin: 0,
        }}>
          Your path through the six pharma sales capability objectives.
        </p>
      </div>

      {/* ─── Overall Progress Card ─── */}
      <div style={{
        marginBottom: 28,
        animation: 'journeyFadeSlideUp 0.3s ease 0ms both',
      }}>
        <div style={{
          background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0',
          padding: '20px 24px',
        }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#718096',
              textTransform: 'uppercase' as const, letterSpacing: '0.07em',
              whiteSpace: 'nowrap',
            }}>
              Overall Progress
            </div>
            <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${overallPct}%`,
                background: currentMeta.accentDark,
                borderRadius: 6, transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C', minWidth: 36, textAlign: 'right' as const }}>
              {overallPct}%
            </div>
          </div>

          {/* Objective step indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 18 }}>
            {OBJECTIVE_META.map((meta, i) => {
              const isCurrent = meta.id === 1;
              const isDone = false;
              const prevDone = false;
              return (
                <React.Fragment key={meta.id}>
                  {i > 0 && (
                    <div style={{
                      flex: 1, height: 2,
                      background: prevDone ? OBJECTIVE_META[i - 1].accentDark : '#E2E8F0',
                    }} />
                  )}
                  <div
                    onClick={() => scrollToObjective(meta.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: isCurrent ? 30 : 24, height: isCurrent ? 30 : 24,
                      borderRadius: '50%', flexShrink: 0,
                      background: isDone ? meta.accentColor : isCurrent ? meta.accentColor : '#F7FAFC',
                      border: isDone ? `2px solid ${meta.accentDark}` : isCurrent ? `2.5px solid ${meta.accentDark}` : '1.5px solid #E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isCurrent ? 12 : 10, fontWeight: 800,
                      color: isDone ? meta.accentDark : isCurrent ? meta.accentDark : '#A0AEC0',
                      transition: 'all 0.2s ease',
                    }}>
                      {isDone ? <Check size={12} strokeWidth={3} color={meta.accentDark} /> : meta.id}
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: isCurrent || isDone ? 700 : 500,
                      color: isDone ? meta.accentDark : isCurrent ? meta.accentDark : '#A0AEC0',
                      whiteSpace: 'nowrap',
                    }}>
                      {meta.shortTitle}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Current objective detail card */}
          <div style={{
            background: `${currentMeta.accentColor}15`,
            border: `1px solid ${currentMeta.accentColor}55`,
            borderRadius: 10, padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: currentMeta.accentDark,
                  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                }}>
                  Currently On
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 600, color: '#718096',
                  background: '#F7FAFC', borderRadius: 8, padding: '1px 7px',
                  border: '1px solid #E2E8F0',
                }}>
                  Not started
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A202C', marginBottom: 3 }}>
                Objective {currentObjective.id}: {currentObjective.title}
              </div>
              <div style={{ fontSize: 11.5, color: '#4A5568', lineHeight: 1.5 }}>
                {currentObjective.subtitle}
              </div>
            </div>
            <button
              onClick={() => navigate(`/app/objective/${currentObjective.id}/format-a`)}
              style={{
                background: currentMeta.accentDark, color: '#FFFFFF', border: 'none',
                borderRadius: 20, padding: '8px 18px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                whiteSpace: 'nowrap', flexShrink: 0,
                fontFamily: fonts.body,
              }}
            >
              Continue <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Objective Cards ─── */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
        {LEARNING_OBJECTIVES.map((obj, idx) => {
          const isCurrent = obj.id === 1;
          const meta = OBJECTIVE_META.find((m) => m.id === obj.id)!;
          const nextObj = idx < LEARNING_OBJECTIVES.length - 1 ? LEARNING_OBJECTIVES[idx + 1] : null;

          return (
            <div key={obj.id}>
              <div ref={(el) => { levelRefs.current[obj.id] = el; }}>
                <ObjectiveCard
                  objective={obj}
                  index={idx}
                  isCurrent={isCurrent}
                />
              </div>
              {/* Vertical connector */}
              {nextObj && (
                <div style={{
                  display: 'flex', justifyContent: 'center', padding: '4px 0',
                }}>
                  <MoveDown
                    size={20}
                    strokeWidth={2.5}
                    color={meta.accentDark}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
