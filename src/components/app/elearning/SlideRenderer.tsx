import React, { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import type { SlideData, SimulationState, SimulationCallbacks } from '../../../constants/elearningContent';
import { fonts } from '../../../constants/designTokens';
import {
  SceneSetSlide,
  CriteriaIntroSlide,
  AccountGridSlide,
  AccountDossierSlide,
  AccountConsequenceSlide,
  StakeholderGridSlide,
  StakeholderDossierSlide,
  HiddenRevealSlide,
  ClassificationTaskSlide,
  EngagementSequenceSlide,
  ExpertRevealSlide,
} from './SimulationSlides';

export interface SlideRendererProps {
  slide: SlideData;
  accentColor: string;
  accentDark: string;
  simulationState?: SimulationState;
  simulationCallbacks?: SimulationCallbacks;
}

/**
 * Renders a single e-learning slide based on its type.
 * Each slide type has its own visual layout and interaction model.
 */
export function SlideRenderer({ slide, accentColor, accentDark, simulationState, simulationCallbacks }: SlideRendererProps) {
  switch (slide.type) {
    case 'courseIntro':
      return <CourseIntroSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'evidenceHero':
      return <EvidenceHeroSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'chart':
      return <ChartSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'tensionStatement':
      return <TensionSlide slide={slide} accentDark={accentDark} />;
    case 'concept':
      return <ConceptSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'contextBar':
      return <ContextBarSlide slide={slide} accentDark={accentDark} />;
    case 'scenarioComparison':
      return <ScenarioComparisonSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'situationalJudgment':
      return <SituationalJudgmentSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'flipcard':
      return <FlipcardSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'moduleSummary':
      return <ModuleSummarySlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'reflection':
      return <ReflectionSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    // ── Simulation slide types ──
    case 'sceneSet':
      return <SceneSetSlide slide={slide} accentColor={accentColor} accentDark={accentDark} />;
    case 'criteriaIntro':
      return <CriteriaIntroSlide slide={slide} accentColor={accentColor} accentDark={accentDark} criteriaRevealed={simulationCallbacks?.criteriaRevealed ?? 0} />;
    case 'accountGrid':
      return simulationState && simulationCallbacks
        ? <AccountGridSlide slide={slide} accentColor={accentColor} accentDark={accentDark} state={simulationState} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    case 'accountDossier':
      return simulationState && simulationCallbacks
        ? <AccountDossierSlide slide={slide} accentColor={accentColor} accentDark={accentDark} state={simulationState} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    case 'accountConsequence':
      return simulationCallbacks
        ? <AccountConsequenceSlide slide={slide} accentColor={accentColor} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    case 'stakeholderGrid':
      return simulationState && simulationCallbacks
        ? <StakeholderGridSlide slide={slide} accentColor={accentColor} accentDark={accentDark} state={simulationState} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    case 'stakeholderDossier':
      return simulationState && simulationCallbacks
        ? <StakeholderDossierSlide slide={slide} accentColor={accentColor} accentDark={accentDark} state={simulationState} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    case 'hiddenReveal':
      return simulationState && simulationCallbacks
        ? <HiddenRevealSlide slide={slide} accentColor={accentColor} accentDark={accentDark} state={simulationState} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    case 'classificationTask':
      return simulationState && simulationCallbacks
        ? <ClassificationTaskSlide slide={slide} accentColor={accentColor} accentDark={accentDark} state={simulationState} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    case 'engagementSequence':
      return simulationState && simulationCallbacks
        ? <EngagementSequenceSlide slide={slide} accentColor={accentColor} accentDark={accentDark} state={simulationState} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    case 'expertReveal':
      return simulationState && simulationCallbacks
        ? <ExpertRevealSlide slide={slide} accentColor={accentColor} accentDark={accentDark} state={simulationState} callbacks={simulationCallbacks} />
        : <DefaultSlide slide={slide} />;
    default:
      return <DefaultSlide slide={slide} />;
  }
}

// ─── Shared components ───

function Heading({ text, tealWord }: { text: string; tealWord?: string }) {
  if (!tealWord) return <h2 style={headingStyle}>{text}</h2>;
  const parts = text.split(tealWord);
  return (
    <h2 style={headingStyle}>
      {parts[0]}
      <span style={{ borderBottom: '2px solid #38B2AC', paddingBottom: 2 }}>{tealWord}</span>
      {parts.slice(1).join(tealWord)}
    </h2>
  );
}

function SectionBadge({ section, accentDark }: { section: string; accentDark: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, color: accentDark,
      textTransform: 'uppercase' as const, letterSpacing: '0.08em',
      background: `${accentDark}12`, border: `1px solid ${accentDark}25`,
      borderRadius: 6, padding: '3px 10px',
      display: 'inline-block', marginBottom: 16,
    }}>
      {section}
    </span>
  );
}

function TakeawayBox({ text }: { text: string }) {
  return (
    <div style={{
      background: '#F0FFF4', border: '1px solid #C6F6D5',
      borderRadius: 8, padding: '12px 16px', marginTop: 20,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
      <p style={{ fontSize: 12, color: '#276749', lineHeight: 1.6, margin: 0, fontFamily: fonts.body }}>
        {text}
      </p>
    </div>
  );
}

// ─── Slide types ───

function CourseIntroSlide({ slide, accentColor, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  return (
    <div style={{ padding: '32px 36px' }}>
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.subheading && (
        <p style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.7, margin: '0 0 24px', fontFamily: fonts.body }}>
          {slide.subheading}
        </p>
      )}
      {slide.body && (
        <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.7, margin: '0 0 24px', fontFamily: fonts.body }}>
          {slide.body}
        </p>
      )}
      {slide.objectives && (
        <div style={{
          background: `${accentColor}10`, border: `1px solid ${accentColor}30`,
          borderRadius: 10, padding: '18px 22px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: accentDark,
            textTransform: 'uppercase' as const, letterSpacing: '0.06em',
            marginBottom: 12,
          }}>
            Learning Objectives
          </div>
          {slide.objectives.map((obj, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: `${accentColor}25`, border: `1px solid ${accentColor}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: accentDark,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 13, color: '#1A202C', lineHeight: 1.6, fontFamily: fonts.body }}>
                {obj}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceHeroSlide({ slide, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  return (
    <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      {slide.stats && (
        <div style={{
          fontSize: 64, fontWeight: 800, color: accentDark,
          fontFamily: fonts.heading, lineHeight: 1, marginBottom: 8,
        }}>
          {slide.stats.value}
        </div>
      )}
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.body && (
        <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 8px', fontFamily: fonts.body }}>
          {slide.body}
        </p>
      )}
      {slide.stats && (
        <p style={{ fontSize: 11, color: '#A0AEC0', margin: '12px 0 0', fontFamily: fonts.body }}>
          Source: {slide.stats.source} ({slide.stats.sourceYear})
        </p>
      )}
      {slide.stats?.context && (
        <p style={{ fontSize: 11, color: '#CBD5E0', fontStyle: 'italic', margin: '4px 0 0', fontFamily: fonts.body }}>
          {slide.stats.context}
        </p>
      )}
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function ChartSlide({ slide, accentColor, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  return (
    <div style={{ padding: '32px 36px' }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.body && (
        <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, margin: '0 0 20px', fontFamily: fonts.body }}>
          {slide.body}
        </p>
      )}
      {slide.stats && (
        <div style={{
          background: `${accentColor}08`, border: `1px solid ${accentColor}25`,
          borderRadius: 12, padding: '24px 28px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: accentDark, fontFamily: fonts.heading }}>
            {slide.stats.value}
          </div>
          <div style={{ fontSize: 14, color: '#4A5568', marginTop: 8, fontFamily: fonts.body }}>
            {slide.stats.label}
          </div>
          <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 12, fontFamily: fonts.body }}>
            {slide.stats.source} ({slide.stats.sourceYear})
          </div>
        </div>
      )}
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function TensionSlide({ slide, accentDark }: { slide: SlideData; accentDark: string }) {
  return (
    <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 300 }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      <h2 style={{ ...headingStyle, fontSize: 22, lineHeight: 1.5 }}>
        {slide.heading}
      </h2>
      {slide.body && (
        <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.8, margin: '16px 0 0', maxWidth: 700, fontFamily: fonts.body }}>
          {slide.body}
        </p>
      )}
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function ConceptSlide({ slide, accentColor, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  return (
    <div style={{ padding: '32px 36px' }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.subheading && (
        <p style={{ fontSize: 14, color: '#718096', margin: '0 0 12px', fontFamily: fonts.body }}>
          {slide.subheading}
        </p>
      )}
      {slide.body && (
        <div style={{
          background: `${accentColor}08`, borderLeft: `3px solid ${accentColor}`,
          borderRadius: '0 8px 8px 0', padding: '16px 20px', margin: '0 0 16px',
        }}>
          <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, margin: 0, fontFamily: fonts.body }}>
            {slide.body}
          </p>
        </div>
      )}
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function ContextBarSlide({ slide, accentDark }: { slide: SlideData; accentDark: string }) {
  return (
    <div style={{ padding: '32px 36px' }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.subheading && (
        <p style={{ fontSize: 13, color: '#718096', margin: '0 0 20px', fontFamily: fonts.body }}>
          {slide.subheading}
        </p>
      )}
      {slide.body && (
        <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, margin: '0 0 20px', fontFamily: fonts.body }}>
          {slide.body}
        </p>
      )}
      {slide.frameworks && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {slide.frameworks.map((fw) => (
            <div key={fw.key} style={{
              background: fw.color || '#F7FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{
                fontSize: 18, fontWeight: 800, color: accentDark,
                fontFamily: fonts.heading, marginBottom: 4,
              }}>
                {fw.key}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 6, fontFamily: fonts.heading }}>
                {fw.label}
              </div>
              <p style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.6, margin: '0 0 8px', fontFamily: fonts.body }}>
                {fw.description}
              </p>
              <p style={{ fontSize: 11, color: '#718096', fontStyle: 'italic', margin: 0, fontFamily: fonts.body }}>
                {fw.example}
              </p>
            </div>
          ))}
        </div>
      )}
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function ScenarioComparisonSlide({ slide, accentColor, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = slide.comparisonTabs || [];

  return (
    <div style={{ padding: '32px 36px' }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.subheading && (
        <p style={{ fontSize: 13, color: '#718096', margin: '0 0 16px', fontFamily: fonts.body }}>
          {slide.subheading}
        </p>
      )}
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1, padding: '10px 16px', border: 'none',
              borderBottom: activeTab === i ? `2px solid ${tab.isImproved ? accentColor : '#E53E3E'}` : '2px solid transparent',
              background: 'none', cursor: 'pointer',
              fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
              color: activeTab === i ? '#1A202C' : '#A0AEC0',
            }}
          >
            {tab.isImproved ? '✓ ' : '✗ '}{tab.label}
          </button>
        ))}
      </div>
      {/* Content */}
      {tabs[activeTab] && (
        <div style={{
          background: tabs[activeTab].isImproved ? '#F0FFF4' : '#FFF5F5',
          border: `1px solid ${tabs[activeTab].isImproved ? '#C6F6D5' : '#FEB2B2'}`,
          borderRadius: 10, padding: '20px 22px',
          whiteSpace: 'pre-wrap',
          fontSize: 13, color: '#1A202C', lineHeight: 1.8,
          fontFamily: fonts.body,
        }}>
          {tabs[activeTab].content}
        </div>
      )}
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function SituationalJudgmentSlide({ slide, accentColor, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const scenario = slide.scenario;
  if (!scenario) return null;

  return (
    <div style={{ padding: '32px 36px' }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.body && (
        <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, margin: '0 0 16px', fontFamily: fonts.body }}>
          {slide.body}
        </p>
      )}
      {/* Situation box */}
      <div style={{
        background: '#FEFCE8', border: '1px solid #FDE68A',
        borderRadius: 8, padding: '12px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <AlertTriangle size={16} color="#D69E2E" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 12, color: '#744210', lineHeight: 1.6, margin: 0, fontFamily: fonts.body }}>
          {scenario.situation}
        </p>
      </div>
      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {scenario.options.map((opt) => {
          const isSelected = selected === opt.id;
          const showResult = selected !== null;
          const bgColor = showResult
            ? opt.isCorrect ? '#F0FFF4' : isSelected ? '#FFF5F5' : '#F7FAFC'
            : '#F7FAFC';
          const borderColor = showResult
            ? opt.isCorrect ? '#38A169' : isSelected ? '#E53E3E' : '#E2E8F0'
            : isSelected ? accentColor : '#E2E8F0';

          return (
            <button
              key={opt.id}
              onClick={() => { if (!selected) setSelected(opt.id); }}
              style={{
                background: bgColor, border: `1.5px solid ${borderColor}`,
                borderRadius: 10, padding: '14px 18px',
                textAlign: 'left', cursor: selected ? 'default' : 'pointer',
                fontFamily: fonts.body, transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: showResult && opt.isCorrect ? '#38A169' : showResult && isSelected ? '#E53E3E' : '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', fontSize: 10, fontWeight: 700,
                }}>
                  {showResult && opt.isCorrect ? <Check size={12} /> : opt.id.toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A202C' }}>
                  {opt.label}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.6, margin: '8px 0 0 32px' }}>
                "{opt.response}"
              </p>
              {/* Feedback (shown after selection) */}
              {showResult && isSelected && (
                <div style={{
                  marginTop: 12, marginLeft: 32, padding: '10px 14px',
                  background: opt.isCorrect ? '#F0FFF4' : '#FFF5F5',
                  border: `1px solid ${opt.isCorrect ? '#C6F6D5' : '#FEB2B2'}`,
                  borderRadius: 6,
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 700,
                    color: opt.isCorrect ? '#276749' : '#C53030',
                    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                    marginBottom: 4,
                  }}>
                    {opt.isCorrect ? 'Strongest Choice' : 'Not the Best Fit'}
                  </div>
                  <p style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.6, margin: 0 }}>
                    {opt.feedback}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selected && scenario.debrief && (
        <TakeawayBox text={scenario.debrief} />
      )}
    </div>
  );
}

function FlipcardSlide({ slide, accentColor, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const personas = slide.personas || [];

  return (
    <div style={{ padding: '32px 36px' }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.subheading && (
        <p style={{ fontSize: 13, color: '#718096', margin: '0 0 16px', fontFamily: fonts.body }}>
          {slide.subheading}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {personas.map((p, i) => (
          <div key={i} style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 10, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: '1px solid #EDF2F7',
            }}>
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#718096', fontFamily: fonts.body }}>{p.role}</div>
              </div>
            </div>
            {/* Situation */}
            <div style={{ padding: '14px 18px' }}>
              <p style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.6, margin: '0 0 12px', fontFamily: fonts.body }}>
                {p.situation}
              </p>
              {!revealed[i] ? (
                <button
                  onClick={() => setRevealed((prev) => ({ ...prev, [i]: true }))}
                  style={{
                    background: `${accentColor}15`, border: `1px solid ${accentColor}40`,
                    borderRadius: 8, padding: '8px 16px',
                    fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
                    color: accentDark, cursor: 'pointer',
                  }}
                >
                  Reveal Outcome →
                </button>
              ) : (
                <div style={{
                  background: `${accentColor}08`, borderLeft: `3px solid ${accentColor}`,
                  borderRadius: '0 8px 8px 0', padding: '12px 16px',
                  animation: 'fadeSlideUp 0.3s ease',
                }}>
                  <p style={{ fontSize: 12, color: '#1A202C', lineHeight: 1.7, margin: 0, fontFamily: fonts.body }}>
                    {p.outcome}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function ModuleSummarySlide({ slide, accentColor, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  return (
    <div style={{ padding: '32px 36px' }}>
      <SectionBadge section={slide.section} accentDark={accentDark} />
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {/* Framework grid */}
      {slide.summaryGrid && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 8, marginBottom: 24,
        }}>
          {slide.summaryGrid.map((item) => (
            <div key={item.label} style={{
              background: `${accentColor}08`, border: `1px solid ${accentColor}20`,
              borderRadius: 8, padding: '12px 14px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: accentDark, marginBottom: 4, fontFamily: fonts.heading }}>
                {item.label}
              </div>
              <p style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.6, margin: 0, fontFamily: fonts.body }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
      {/* Approach cards */}
      {slide.approachCards && (
        <>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#718096',
            textTransform: 'uppercase' as const, letterSpacing: '0.06em',
            marginBottom: 10,
          }}>
            Approaches
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {slide.approachCards.map((card) => (
              <div key={card.title} style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                borderRadius: 10, padding: '14px 18px',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C', marginBottom: 4, fontFamily: fonts.heading }}>
                  {card.title}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: accentDark,
                  background: `${accentColor}12`, borderRadius: 4,
                  padding: '2px 8px', display: 'inline-block', marginBottom: 8,
                }}>
                  Use when: {card.useWhen}
                </div>
                <p style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.6, margin: 0, fontFamily: fonts.body }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function ReflectionSlide({ slide, accentColor, accentDark }: { slide: SlideData; accentColor: string; accentDark: string }) {
  const [responses, setResponses] = useState<Record<number, string>>({});

  return (
    <div style={{ padding: '32px 36px' }}>
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#FFFFFF',
        background: accentDark, borderRadius: 6,
        padding: '4px 12px', display: 'inline-block', marginBottom: 16,
        textTransform: 'uppercase' as const, letterSpacing: '0.06em',
      }}>
        Reflect
      </span>
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.reflectionQuestions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
          {slide.reflectionQuestions.map((q, i) => (
            <div key={i}>
              <p style={{ fontSize: 13, color: '#1A202C', lineHeight: 1.6, margin: '0 0 10px', fontWeight: 500, fontFamily: fonts.body }}>
                {q}
              </p>
              <textarea
                value={responses[i] || ''}
                onChange={(e) => setResponses((prev) => ({ ...prev, [i]: e.target.value }))}
                placeholder="Type your thoughts here..."
                style={{
                  width: '100%', minHeight: 80, padding: '12px 14px',
                  border: '1.5px solid #E2E8F0', borderRadius: 8,
                  fontFamily: fonts.body, fontSize: 13, color: '#1A202C',
                  lineHeight: 1.6, resize: 'vertical', outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
              />
            </div>
          ))}
        </div>
      )}
      {slide.takeaway && <TakeawayBox text={slide.takeaway} />}
    </div>
  );
}

function DefaultSlide({ slide }: { slide: SlideData }) {
  return (
    <div style={{ padding: '32px 36px' }}>
      <Heading text={slide.heading} tealWord={slide.tealWord} />
      {slide.body && <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, fontFamily: fonts.body }}>{slide.body}</p>}
    </div>
  );
}

// ─── Shared styles ───
const headingStyle: React.CSSProperties = {
  fontSize: 20, fontWeight: 800, color: '#1A202C',
  lineHeight: 1.4, margin: '0 0 12px',
  fontFamily: fonts.heading,
};
