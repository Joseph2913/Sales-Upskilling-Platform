import React, { useState } from 'react';
import type {
  SlideData,
  SimulationState,
  SimulationCallbacks,
  StakeholderPlacement,
} from '../../../constants/elearningContent';
import { fonts } from '../../../constants/designTokens';

// ─── Shared helpers ───

function SimHeading({ text, tealWord, fontSize = 22 }: { text: string; tealWord?: string; fontSize?: number }) {
  const style: React.CSSProperties = { fontSize, fontWeight: 800, color: '#1A202C', margin: '0 0 12px', lineHeight: 1.3, fontFamily: fonts.heading };
  if (!tealWord) return <h2 style={style}>{text}</h2>;
  const idx = text.indexOf(tealWord);
  if (idx === -1) return <h2 style={style}>{text}</h2>;
  return (
    <h2 style={style}>
      {text.slice(0, idx)}
      <span style={{ borderBottom: '3px solid #38B2AC', paddingBottom: 2 }}>{tealWord}</span>
      {text.slice(idx + tealWord.length)}
    </h2>
  );
}

function SimSectionBadge({ section }: { section: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: '#2C9A94',
      textTransform: 'uppercase' as const, letterSpacing: '0.1em',
      marginBottom: 8, display: 'inline-block',
    }}>
      {section}
    </span>
  );
}

// ─── 1. SceneSet ───

export function SceneSetSlide({ slide }: { slide: SlideData; accentColor: string; accentDark: string }) {
  const accentLight = '#E6FFFA';
  const accentDark = '#2C9A94';
  return (
    <div style={{
      padding: '32px 36px',
      background: 'linear-gradient(160deg, #E6FFFA 0%, #EBF8FF 60%, #F7FAFC 100%)',
      height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <SimSectionBadge section={slide.section} />
      {slide.sceneRole && (
        <span style={{
          background: accentLight, color: accentDark,
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
          letterSpacing: '0.08em', borderRadius: 20, padding: '4px 14px',
          display: 'inline-block', marginBottom: 16, alignSelf: 'flex-start',
        }}>
          {slide.sceneRole}
        </span>
      )}
      <SimHeading text={slide.heading} tealWord={slide.tealWord} fontSize={28} />
      {slide.sceneNarrative && (
        <p style={{ fontSize: 16, color: '#4A5568', lineHeight: 1.75, maxWidth: 560, margin: '0 0 16px', fontFamily: fonts.body }}>
          {slide.sceneNarrative}
        </p>
      )}
      {slide.sceneContext && (
        <p style={{ fontSize: 14, color: '#718096', fontStyle: 'italic', lineHeight: 1.6, maxWidth: 560, margin: 0, fontFamily: fonts.body }}>
          {slide.sceneContext}
        </p>
      )}
    </div>
  );
}

// ─── 2. CriteriaIntro ───

export function CriteriaIntroSlide({ slide, criteriaRevealed }: { slide: SlideData; accentColor: string; accentDark: string; criteriaRevealed: number }) {
  const items = slide.criteriaItems || [];
  const allRevealed = criteriaRevealed >= items.length;

  return (
    <div style={{ padding: '28px 32px', display: 'flex', gap: 28, height: '100%' }}>
      {/* Left column 40% */}
      <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <SimSectionBadge section={slide.section} />
        <SimHeading text={slide.heading} tealWord={slide.tealWord} />
        {slide.body && (
          <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.7, margin: 0, fontFamily: fonts.body }}>
            {slide.body}
          </p>
        )}
      </div>
      {/* Right column 60% */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            opacity: i < criteriaRevealed ? 1 : 0,
            transition: 'opacity 0.3s ease',
            background: '#F7FAFC',
            borderLeft: '3px solid #38B2AC',
            borderRadius: '0 8px 8px 0',
            padding: '12px 16px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>{item.label}</div>
            <div style={{ fontSize: 13, color: '#4A5568', fontFamily: fonts.body, marginTop: 2 }}>{item.description}</div>
          </div>
        ))}
        <div style={{
          fontSize: 12, color: '#718096', fontStyle: 'italic', marginTop: 8, fontFamily: fonts.body,
        }}>
          {allRevealed
            ? 'All criteria loaded — tap Next to explore your accounts →'
            : 'Tap Next to reveal each criterion →'}
        </div>
      </div>
    </div>
  );
}

// ─── 3. AccountGrid ───

export function AccountGridSlide({ slide, state, callbacks }: {
  slide: SlideData; accentColor: string; accentDark: string; state: SimulationState; callbacks: SimulationCallbacks;
}) {
  const accounts = slide.accounts || [];
  const stage = callbacks.accountGridStage;
  const probedCount = state.accountsProbed.length;

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SimSectionBadge section={slide.section} />
      <SimHeading text={slide.heading} tealWord={slide.tealWord} />

      {stage === 'explore' ? (
        <>
          <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6, margin: '0 0 12px', fontFamily: fonts.body }}>
            Tap any account to investigate. You can explore all four before making your decision.
          </p>
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#38B2AC', marginBottom: 12, display: 'inline-block',
            fontFamily: fonts.body,
          }}>
            {probedCount} of {accounts.length} investigated
          </span>
          {/* 2x2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
            {accounts.map((acc) => {
              const probed = state.accountsProbed.includes(acc.key);
              return (
                <button
                  key={acc.key}
                  onClick={() => {
                    callbacks.onProbeAccount(acc.key);
                    // Navigate to the dossier slide for this account
                    callbacks.onNavigateToSlide(`sim-1-dossier-${acc.key}`);
                  }}
                  style={{
                    background: '#FFFFFF', border: `1px solid ${probed ? '#38B2AC' : '#E2E8F0'}`,
                    borderRadius: 12, padding: '16px 18px', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38B2AC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = probed ? '#38B2AC' : '#E2E8F0'; }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>{acc.name}</div>
                  <div style={{ fontSize: 12, color: '#718096', fontFamily: fonts.body }}>{acc.type}</div>
                  <div style={{ fontSize: 13, color: '#4A5568', fontFamily: fonts.body, lineHeight: 1.5 }}>{acc.tagline}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#38B2AC', marginTop: 'auto', fontFamily: fonts.body }}>
                    {probed ? '✓ Investigated' : 'Investigate →'}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => { if (probedCount >= 1) callbacks.onSetAccountGridStage('decide'); }}
            disabled={probedCount < 1}
            style={{
              marginTop: 14, padding: '10px 24px', borderRadius: 24, border: 'none',
              background: probedCount >= 1 ? '#38B2AC' : '#CBD5E0',
              color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: probedCount >= 1 ? 'pointer' : 'default',
              fontFamily: fonts.body, alignSelf: 'flex-start',
            }}
          >
            Make my decision →
          </button>
        </>
      ) : (
        /* Stage 2: Decision */
        <>
          <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6, margin: '0 0 12px', fontFamily: fonts.body }}>
            Select the account you want to prioritise.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {accounts.map((acc) => {
              const selected = state.selectedAccount === acc.key;
              return (
                <button
                  key={acc.key}
                  onClick={() => callbacks.onSelectAccount(acc.key)}
                  style={{
                    background: selected ? '#E6FFFA' : '#FFFFFF',
                    border: `2px solid ${selected ? '#38B2AC' : '#E2E8F0'}`,
                    borderRadius: 12, padding: '14px 16px', textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>{acc.name}</div>
                  <div style={{ fontSize: 11, color: '#718096', fontFamily: fonts.body }}>{acc.type}</div>
                </button>
              );
            })}
          </div>
          {state.selectedAccount && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13, color: '#1A202C', fontWeight: 600, display: 'block', marginBottom: 8, fontFamily: fonts.body }}>
                In 2–3 sentences, why this account now? What signals made the difference?
              </label>
              <textarea
                value={state.accountJustification}
                onChange={(e) => callbacks.onSetAccountJustification(e.target.value)}
                placeholder="Type your reasoning..."
                style={{
                  width: '100%', minHeight: 70, padding: '10px 14px',
                  border: '1.5px solid #E2E8F0', borderRadius: 8,
                  fontFamily: fonts.body, fontSize: 13, color: '#1A202C',
                  lineHeight: 1.6, resize: 'none', outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#38B2AC'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
              />
              <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4, fontFamily: fonts.body }}>
                {state.accountJustification.length} / 20 characters minimum
              </div>
            </div>
          )}
          <button
            onClick={() => {
              if (state.selectedAccount && state.accountJustification.length >= 20) {
                callbacks.onSubmitAccountDecision();
              }
            }}
            disabled={!state.selectedAccount || state.accountJustification.length < 20}
            style={{
              marginTop: 12, padding: '10px 24px', borderRadius: 24, border: 'none',
              background: state.selectedAccount && state.accountJustification.length >= 20 ? '#38B2AC' : '#CBD5E0',
              color: '#FFFFFF', fontSize: 13, fontWeight: 700,
              cursor: state.selectedAccount && state.accountJustification.length >= 20 ? 'pointer' : 'default',
              fontFamily: fonts.body, alignSelf: 'flex-start',
            }}
          >
            Submit my decision →
          </button>
        </>
      )}
    </div>
  );
}

// ─── 4. AccountDossier ───

export function AccountDossierSlide({ slide, callbacks }: {
  slide: SlideData; accentColor: string; accentDark: string; state: SimulationState; callbacks: SimulationCallbacks;
}) {
  const key = slide.accountKey || '';
  const l1 = slide.accountLayer1;
  const l2 = slide.accountLayer2;
  const layer2Visible = callbacks.revealedLayer2.has(key);

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SimSectionBadge section={slide.section} />
      <SimHeading text={slide.heading} tealWord={slide.tealWord} />

      {/* Layer 1 — always visible */}
      {l1 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Patient Volume', value: l1.patientVolume },
            { label: 'Relationship', value: l1.relationshipStatus },
            { label: 'Account Type', value: l1.accountType },
          ].map((chip) => (
            <div key={chip.label} style={{
              background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 8,
              padding: '8px 14px', flex: '1 1 auto', minWidth: 140,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2, fontFamily: fonts.heading }}>
                {chip.label}
              </div>
              <div style={{ fontSize: 13, color: '#1A202C', fontFamily: fonts.body }}>{chip.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Dig deeper button */}
      {!layer2Visible && (
        <button
          onClick={() => callbacks.onRevealLayer2(key)}
          style={{
            background: 'transparent', border: '1px solid #38B2AC', borderRadius: 8,
            padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#38B2AC',
            cursor: 'pointer', fontFamily: fonts.body, alignSelf: 'flex-start', marginBottom: 14,
          }}
        >
          Dig deeper →
        </button>
      )}

      {/* Layer 2 — opacity controlled */}
      {l2 && (
        <div style={{ opacity: layer2Visible ? 1 : 0, transition: 'opacity 0.4s ease', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Formulary Status', value: l2.formularyStatus },
            { label: 'Buying Cycle', value: l2.buyingCycleStage },
            { label: 'Competitive Position', value: l2.competitivePosition },
            { label: 'Internal Champion', value: l2.internalChampion },
          ].map((card) => (
            <div key={card.label} style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8,
              padding: '10px 14px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2, fontFamily: fonts.heading }}>
                {card.label}
              </div>
              <div style={{ fontSize: 13, color: '#1A202C', fontFamily: fonts.body, lineHeight: 1.5 }}>{card.value}</div>
            </div>
          ))}

          {/* Trap callout */}
          {layer2Visible && (
            <div style={{
              background: '#FFFBEB', border: '1px solid #F6AD55', borderRadius: 10,
              padding: '12px 16px', marginTop: 4,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', fontFamily: fonts.heading, marginBottom: 4 }}>
                {l2.trapLabel}
              </div>
              <div style={{ fontSize: 12, color: '#92400E', fontFamily: fonts.body }}>
                {l2.loTaught}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back link */}
      <button
        onClick={() => callbacks.onNavigateToSlide('sim-1-accounts')}
        style={{
          marginTop: 'auto', background: 'none', border: 'none', padding: '8px 0',
          fontSize: 13, fontWeight: 600, color: '#718096', cursor: 'pointer',
          fontFamily: fonts.body, textAlign: 'left',
        }}
      >
        ← Back to accounts
      </button>
    </div>
  );
}

// ─── 5. AccountConsequence ───

export function AccountConsequenceSlide({ slide, callbacks }: {
  slide: SlideData; accentColor?: string; callbacks: SimulationCallbacks;
}) {
  return (
    <div style={{
      padding: '32px 36px', height: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A202C', margin: '0 0 16px', fontFamily: fonts.heading }}>
        {slide.consequenceTitle}
      </h2>
      <p style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.75, maxWidth: 520, margin: '0 0 20px', fontFamily: fonts.body }}>
        {slide.consequenceNarrative}
      </p>
      {slide.consequenceMissedSignal && (
        <div style={{
          background: '#EBF8FF', border: '1.5px solid #38B2AC', borderLeft: '3px solid #38B2AC',
          borderRadius: 8, padding: '12px 16px', maxWidth: 520, textAlign: 'left', marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#2C9A94', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4, fontFamily: fonts.heading }}>
            What to look for instead
          </div>
          <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6, margin: 0, fontFamily: fonts.body }}>
            {slide.consequenceMissedSignal}
          </p>
        </div>
      )}
      {slide.consequenceRedirect && (
        <p style={{ fontSize: 14, fontStyle: 'italic', color: '#718096', margin: '0 0 20px', fontFamily: fonts.body }}>
          {slide.consequenceRedirect}
        </p>
      )}
      <button
        onClick={() => {
          // Reset selection and go back to accountGrid stage 2
          callbacks.onSelectAccount('');
          callbacks.onSetAccountJustification('');
          callbacks.onSetAccountGridStage('decide');
          callbacks.onNavigateToSlide('sim-1-accounts');
        }}
        style={{
          padding: '10px 24px', borderRadius: 24, border: 'none',
          background: '#38B2AC', color: '#FFFFFF', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: fonts.body,
        }}
      >
        Try again →
      </button>
    </div>
  );
}

// ─── 6. StakeholderGrid ───

export function StakeholderGridSlide({ slide, state, callbacks }: {
  slide: SlideData; accentColor: string; accentDark: string; state: SimulationState; callbacks: SimulationCallbacks;
}) {
  const stakeholders = (slide.stakeholders || []).filter(s => !s.isHidden);
  const probedCount = state.stakeholdersProbed.length;
  const canProceed = probedCount >= 3;

  const initialsColors = ['#38B2AC', '#4299E1', '#ED8936', '#9F7AEA'];

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SimSectionBadge section={slide.section} />
      <SimHeading text={slide.heading} tealWord={slide.tealWord} />
      {slide.body && (
        <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6, margin: '0 0 12px', fontFamily: fonts.body }}>
          {slide.body}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
        {stakeholders.map((sh, i) => {
          const probed = state.stakeholdersProbed.includes(sh.key);
          const initials = sh.name.split(' ').map(n => n[0]).join('').slice(0, 2);
          return (
            <button
              key={sh.key}
              onClick={() => {
                callbacks.onProbeStakeholder(sh.key);
                callbacks.onNavigateToSlide(`sim-1-dossier-${sh.key}`);
              }}
              style={{
                background: '#FFFFFF', border: `1px solid ${probed ? '#38B2AC' : '#E2E8F0'}`,
                borderRadius: 12, padding: '14px 16px', textAlign: 'left',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: initialsColors[i % initialsColors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#FFFFFF', flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>{sh.name}</div>
                  <div style={{ fontSize: 11, color: '#718096', fontFamily: fonts.body }}>{sh.role}</div>
                </div>
              </div>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#718096', lineHeight: 1.5, margin: 0, fontFamily: fonts.body }}>
                {sh.behaviouralSignal}
              </p>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#38B2AC', marginTop: 'auto', fontFamily: fonts.body }}>
                {probed ? '✓ Investigated' : 'Learn more →'}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <span style={{ fontSize: 11, color: '#718096', fontFamily: fonts.body }}>
          {probedCount} of {stakeholders.length} investigated
        </span>
        {canProceed && (
          <span style={{ fontSize: 11, color: '#38B2AC', fontWeight: 600, marginLeft: 12, fontFamily: fonts.body }}>
            Ready to proceed — tap Next →
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 7. StakeholderDossier ───

export function StakeholderDossierSlide({ slide, callbacks }: {
  slide: SlideData; accentColor: string; accentDark: string; state: SimulationState; callbacks: SimulationCallbacks;
}) {
  const key = slide.stakeholderKey || '';
  const l1 = slide.stakeholderLayer1;
  const l2 = slide.stakeholderLayer2;
  const layer2Visible = callbacks.revealedLayer2.has(key);

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SimSectionBadge section={slide.section} />
      <SimHeading text={slide.heading} tealWord={slide.tealWord} />

      {/* Layer 1 */}
      {l1 && (
        <div style={{
          background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
          padding: '14px 18px', marginBottom: 14,
        }}>
          <p style={{ fontSize: 14, fontStyle: 'italic', color: '#4A5568', lineHeight: 1.6, margin: 0, fontFamily: fonts.body }}>
            "{l1.behaviouralSignal}"
          </p>
        </div>
      )}

      {!layer2Visible && (
        <button
          onClick={() => callbacks.onRevealLayer2(key)}
          style={{
            background: 'transparent', border: '1px solid #38B2AC', borderRadius: 8,
            padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#38B2AC',
            cursor: 'pointer', fontFamily: fonts.body, alignSelf: 'flex-start', marginBottom: 14,
          }}
        >
          Dig deeper →
        </button>
      )}

      {/* Layer 2 — opacity controlled */}
      {l2 && (
        <div style={{ opacity: layer2Visible ? 1 : 0, transition: 'opacity 0.4s ease', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Role Reality', value: l2.roleReality },
            { label: 'Explicit Need', value: l2.explicitNeed },
            { label: 'Emerging Need', value: l2.emergingNeed },
            { label: 'Relationship Dynamic', value: l2.relationshipDynamic },
          ].map((card) => (
            <div key={card.label} style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8,
              padding: '10px 14px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2, fontFamily: fonts.heading }}>
                {card.label}
              </div>
              <div style={{ fontSize: 13, color: '#1A202C', fontFamily: fonts.body, lineHeight: 1.5 }}>{card.value}</div>
            </div>
          ))}

          {/* Wu's hidden signal */}
          {l2.hiddenSignal && layer2Visible && (
            <div style={{
              background: '#FAF5FF', border: '1.5px solid #9F7AEA', borderLeft: '4px solid #9F7AEA',
              borderRadius: 10, padding: '12px 16px', marginTop: 4,
            }}>
              <span style={{ fontSize: 14, marginRight: 6 }}>💬</span>
              <span style={{ fontSize: 13, color: '#553C9A', fontFamily: fonts.body, lineHeight: 1.6 }}>
                {l2.hiddenSignal}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Back link */}
      <button
        onClick={() => callbacks.onNavigateToSlide('sim-1-stakeholders')}
        style={{
          marginTop: 'auto', background: 'none', border: 'none', padding: '8px 0',
          fontSize: 13, fontWeight: 600, color: '#718096', cursor: 'pointer',
          fontFamily: fonts.body, textAlign: 'left',
        }}
      >
        ← Back to stakeholders
      </button>
    </div>
  );
}

// ─── 8. HiddenReveal ───

export function HiddenRevealSlide({ slide, callbacks }: {
  slide: SlideData; accentColor: string; accentDark: string; state: SimulationState; callbacks: SimulationCallbacks;
}) {
  const l1 = slide.stakeholderLayer1;
  const l2 = slide.stakeholderLayer2;
  const key = slide.stakeholderKey || 'marsh';
  const layer2Visible = callbacks.revealedLayer2.has(key);

  return (
    <div style={{ padding: '32px 36px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <p style={{
        fontSize: 16, fontStyle: 'italic', color: '#718096', lineHeight: 1.6,
        textAlign: 'center', margin: '0 0 24px', fontFamily: fonts.body,
        animation: 'fadeInUp 0.6s ease',
      }}>
        {slide.heading} {slide.body}
      </p>

      {/* Helen's card */}
      <div style={{
        background: '#FAF5FF', border: '1.5px solid #9F7AEA', borderRadius: 12,
        padding: '18px 22px', maxWidth: 500, margin: '0 auto',
        animation: 'fadeInUp 0.4s ease 0.3s both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#9F7AEA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#FFFFFF',
          }}>
            HM
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>Helen Marsh</div>
            <div style={{ fontSize: 12, color: '#718096', fontFamily: fonts.body }}>Senior Nursing Lead</div>
          </div>
        </div>

        {l1 && (
          <p style={{ fontSize: 13, fontStyle: 'italic', color: '#553C9A', lineHeight: 1.6, margin: '0 0 12px', fontFamily: fonts.body }}>
            "{l1.behaviouralSignal}"
          </p>
        )}

        {!layer2Visible && (
          <button
            onClick={() => callbacks.onRevealLayer2(key)}
            style={{
              background: 'transparent', border: '1px solid #9F7AEA', borderRadius: 8,
              padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#9F7AEA',
              cursor: 'pointer', fontFamily: fonts.body,
            }}
          >
            Dig deeper →
          </button>
        )}

        {l2 && (
          <div style={{ opacity: layer2Visible ? 1 : 0, transition: 'opacity 0.4s ease', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {[
              { label: 'Role Reality', value: l2.roleReality },
              { label: 'Explicit Need', value: l2.explicitNeed },
              { label: 'Emerging Need', value: l2.emergingNeed },
              { label: 'Relationship Dynamic', value: l2.relationshipDynamic },
            ].map((card) => (
              <div key={card.label} style={{ padding: '6px 0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#805AD5', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontFamily: fonts.heading }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 12, color: '#1A202C', fontFamily: fonts.body, lineHeight: 1.5 }}>{card.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 9. ClassificationTask ───

export function ClassificationTaskSlide({ slide, state, callbacks }: {
  slide: SlideData; accentColor: string; accentDark: string; state: SimulationState; callbacks: SimulationCallbacks;
}) {
  const allStakeholders = state.helenUnlocked
    ? ['okafor', 'dillon', 'bates', 'wu', 'marsh']
    : ['okafor', 'dillon', 'bates', 'wu'];
  const nameMap: Record<string, string> = { okafor: 'Okafor', dillon: 'Dillon', bates: 'Bates', wu: 'Wu', marsh: 'Marsh' };

  // Track which stakeholder is being placed on which matrix
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const placements = state.stakeholderPlacements;
  const allPlaced = allStakeholders.every(id => placements[id]);

  const handleMatrixClick = (matrix: 'power' | 'priority', x: number, y: number) => {
    if (!activeChip) return;
    const existing = placements[activeChip] || { formalAuthority: 50, realInfluence: 50, impact: 50, attitude: 50, annotation: '' };
    const updated: StakeholderPlacement = matrix === 'power'
      ? { ...existing, formalAuthority: x, realInfluence: y }
      : { ...existing, impact: y, attitude: x };
    callbacks.onPlaceStakeholder(activeChip, updated);
    setActiveChip(null);
  };

  return (
    <div style={{ padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SimSectionBadge section={slide.section} />
      <SimHeading text={slide.heading} tealWord={slide.tealWord} fontSize={18} />
      <p style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5, margin: '0 0 10px', fontFamily: fonts.body }}>
        {slide.classificationInstructions}
      </p>

      {/* Stakeholder chip bank */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {allStakeholders.map((id) => {
          const placed = !!placements[id];
          const active = activeChip === id;
          return (
            <button
              key={id}
              onClick={() => { setActiveChip(active ? null : id); }}
              style={{
                padding: '4px 12px', borderRadius: 16,
                background: active ? '#38B2AC' : placed ? '#E6FFFA' : '#F7FAFC',
                border: `1px solid ${active ? '#2C9A94' : placed ? '#38B2AC' : '#E2E8F0'}`,
                color: active ? '#FFFFFF' : '#1A202C',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.body,
              }}
            >
              {nameMap[id]} {placed ? '✓' : ''}
            </button>
          );
        })}
      </div>

      {/* Two matrices side by side */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Power Matrix */}
        <MatrixCanvas
          title="Power Matrix"
          xLabel="Formal Authority"
          yLabel="Real Influence"
          stakeholders={allStakeholders}
          nameMap={nameMap}
          placements={placements}
          getX={(p) => p.formalAuthority}
          getY={(p) => p.realInfluence}
          active={activeChip}
          onPlot={(x, y) => handleMatrixClick('power', x, y)}
        />
        {/* Prioritisation Matrix */}
        <MatrixCanvas
          title="Prioritisation Matrix"
          xLabel="Attitude (Sceptical → Positive)"
          yLabel="Impact"
          stakeholders={allStakeholders}
          nameMap={nameMap}
          placements={placements}
          getX={(p) => p.attitude}
          getY={(p) => p.impact}
          active={activeChip}
          onPlot={(x, y) => handleMatrixClick('priority', x, y)}
        />
      </div>

      {/* Annotations */}
      {allPlaced && (
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#1A202C', display: 'block', marginBottom: 4, fontFamily: fonts.body }}>
              Power matrix — why this placement?
            </label>
            <textarea
              value={callbacks.powerAnnotation}
              onChange={(e) => callbacks.onSetPowerAnnotation(e.target.value)}
              placeholder="Min 20 characters..."
              style={{
                width: '100%', minHeight: 50, padding: '8px 10px',
                border: '1.5px solid #E2E8F0', borderRadius: 6,
                fontFamily: fonts.body, fontSize: 12, resize: 'none', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#38B2AC'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#1A202C', display: 'block', marginBottom: 4, fontFamily: fonts.body }}>
              Prioritisation matrix — why this placement?
            </label>
            <textarea
              value={callbacks.priorityAnnotation}
              onChange={(e) => callbacks.onSetPriorityAnnotation(e.target.value)}
              placeholder="Min 20 characters..."
              style={{
                width: '100%', minHeight: 50, padding: '8px 10px',
                border: '1.5px solid #E2E8F0', borderRadius: 6,
                fontFamily: fonts.body, fontSize: 12, resize: 'none', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#38B2AC'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Matrix canvas sub-component
function MatrixCanvas({ title, xLabel, yLabel, stakeholders, nameMap, placements, getX, getY, active, onPlot }: {
  title: string;
  xLabel: string;
  yLabel: string;
  stakeholders: string[];
  nameMap: Record<string, string>;
  placements: SimulationState['stakeholderPlacements'];
  getX: (p: StakeholderPlacement) => number;
  getY: (p: StakeholderPlacement) => number;
  active: string | null;
  onPlot: (x: number, y: number) => void;
}) {
  const chipColors: Record<string, string> = { okafor: '#38B2AC', dillon: '#4299E1', bates: '#ED8936', wu: '#9F7AEA', marsh: '#E53E3E' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A202C', marginBottom: 4, fontFamily: fonts.heading }}>{title}</div>
      <div
        style={{
          flex: 1, position: 'relative', background: '#FAFBFC',
          border: '1px solid #E2E8F0', borderRadius: 8,
          cursor: active ? 'crosshair' : 'default',
          minHeight: 120,
        }}
        onClick={(e) => {
          if (!active) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
          const y = Math.round((1 - (e.clientY - rect.top) / rect.height) * 100);
          onPlot(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
        }}
      >
        {/* Grid lines */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#E2E8F0' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#E2E8F0' }} />

        {/* Placed chips */}
        {stakeholders.map((id) => {
          const p = placements[id];
          if (!p) return null;
          const xPct = getX(p);
          const yPct = getY(p);
          return (
            <div
              key={id}
              style={{
                position: 'absolute',
                left: `${xPct}%`, bottom: `${yPct}%`,
                transform: 'translate(-50%, 50%)',
                width: 24, height: 24, borderRadius: '50%',
                background: chipColors[id] || '#38B2AC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 700, color: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                zIndex: 2,
              }}
              title={nameMap[id]}
            >
              {nameMap[id]?.slice(0, 2)}
            </div>
          );
        })}

        {/* Axis labels */}
        <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#A0AEC0', fontFamily: fonts.body }}>
          {xLabel}
        </div>
        <div style={{
          position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
          fontSize: 9, color: '#A0AEC0', fontFamily: fonts.body, whiteSpace: 'nowrap',
          transformOrigin: 'center center',
        }}>
          {yLabel}
        </div>
      </div>
    </div>
  );
}

// ─── 10. EngagementSequence ───

export function EngagementSequenceSlide({ slide, state, callbacks }: {
  slide: SlideData; accentColor: string; accentDark: string; state: SimulationState; callbacks: SimulationCallbacks;
}) {
  const availableStakeholders = state.helenUnlocked
    ? ['okafor', 'dillon', 'bates', 'wu', 'marsh']
    : ['okafor', 'dillon', 'bates', 'wu'];
  const nameMap: Record<string, string> = {
    okafor: 'Dr. Sarah Okafor', dillon: 'Mark Dillon', bates: 'Claire Bates', wu: 'Dr. James Wu', marsh: 'Helen Marsh',
  };
  const ranks = [1, 2, 3];
  const seq = state.engagementSequence;

  const updateSlot = (rank: number, field: 'stakeholderId' | 'justification', value: string) => {
    const updated = [...seq];
    const existingIdx = updated.findIndex(e => e.rank === rank);
    if (existingIdx >= 0) {
      updated[existingIdx] = { ...updated[existingIdx], [field]: value };
    } else {
      updated.push({ rank, stakeholderId: field === 'stakeholderId' ? value : '', justification: field === 'justification' ? value : '' });
    }
    callbacks.onSetEngagementSequence(updated);
  };

  const usedIds = seq.map(e => e.stakeholderId).filter(Boolean);

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SimSectionBadge section={slide.section} />
      <SimHeading text={slide.heading} tealWord={slide.tealWord} />
      <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6, margin: '0 0 16px', fontFamily: fonts.body }}>
        {slide.engagementInstructions}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {ranks.map((rank) => {
          const entry = seq.find(e => e.rank === rank);
          const selectedId = entry?.stakeholderId || '';
          const justification = entry?.justification || '';
          const ordinal = rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd';

          return (
            <div key={rank} style={{
              background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
              padding: '14px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#38B2AC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#FFFFFF', flexShrink: 0,
                }}>
                  {ordinal}
                </span>
                <select
                  value={selectedId}
                  onChange={(e) => updateSlot(rank, 'stakeholderId', e.target.value)}
                  style={{
                    flex: 1, padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
                    fontFamily: fonts.body, fontSize: 13, color: '#1A202C',
                    background: '#FFFFFF', outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Select a contact...</option>
                  {availableStakeholders
                    .filter(id => id === selectedId || !usedIds.includes(id))
                    .map(id => (
                      <option key={id} value={id}>{nameMap[id]}</option>
                    ))}
                </select>
              </div>
              {selectedId && (
                <>
                  <label style={{ fontSize: 12, color: '#718096', display: 'block', marginBottom: 4, fontFamily: fonts.body }}>
                    I'm approaching {nameMap[selectedId]} {ordinal} because...
                  </label>
                  <textarea
                    value={justification}
                    onChange={(e) => updateSlot(rank, 'justification', e.target.value)}
                    placeholder="Min 20 characters..."
                    style={{
                      width: '100%', minHeight: 50, padding: '8px 10px',
                      border: '1.5px solid #E2E8F0', borderRadius: 6,
                      fontFamily: fonts.body, fontSize: 12, color: '#1A202C',
                      resize: 'none', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#38B2AC'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                  />
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2, fontFamily: fonts.body }}>
                    {justification.length} / 20 min
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 11. ExpertReveal ───

export function ExpertRevealSlide({ slide, state, callbacks }: {
  slide: SlideData; accentColor: string; accentDark: string; state: SimulationState; callbacks: SimulationCallbacks;
}) {
  const panel = callbacks.expertPanel;
  const nameMap: Record<string, string> = {
    okafor: 'Dr. Okafor', dillon: 'Dillon', bates: 'Bates', wu: 'Wu', marsh: 'Marsh',
  };

  return (
    <div style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SimSectionBadge section={slide.section} />
      <SimHeading text={slide.heading} tealWord={slide.tealWord} fontSize={20} />

      {/* Panel 1: Power Matrix overlay */}
      <div style={{ opacity: panel >= 0 ? 1 : 0, transition: 'opacity 0.3s ease', flex: panel === 0 ? 1 : 0, overflow: 'hidden' }}>
        {panel === 0 && slide.expertPowerMatrix && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 4, fontFamily: fonts.heading }}>
              Expert Stakeholder Placements
            </div>
            {slide.expertPowerMatrix.map((ep) => {
              const learner = state.stakeholderPlacements[ep.stakeholderId];
              const hasDiff = learner && (
                Math.abs(learner.formalAuthority - ep.formalAuthority) > 20 ||
                Math.abs(learner.realInfluence - ep.realInfluence) > 20
              );
              return (
                <div key={ep.stakeholderId} style={{
                  background: hasDiff ? '#FFFBEB' : '#F7FAFC',
                  border: `1px solid ${hasDiff ? '#F6AD55' : '#E2E8F0'}`,
                  borderRadius: 8, padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>
                    {nameMap[ep.stakeholderId] || ep.stakeholderId}
                  </div>
                  <div style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.5, marginTop: 4, fontFamily: fonts.body }}>
                    {ep.expertAnnotation}
                  </div>
                  {ep.commonMisplacement && (
                    <div style={{ fontSize: 11, color: '#92400E', fontStyle: 'italic', marginTop: 4, fontFamily: fonts.body }}>
                      Common error: {ep.commonMisplacement}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: '#718096', fontFamily: fonts.body }}>Auth: {ep.formalAuthority}</span>
                    <span style={{ fontSize: 10, color: '#718096', fontFamily: fonts.body }}>Influence: {ep.realInfluence}</span>
                    <span style={{ fontSize: 10, color: '#718096', fontFamily: fonts.body }}>Impact: {ep.impact}</span>
                    <span style={{ fontSize: 10, color: '#718096', fontFamily: fonts.body }}>Attitude: {ep.attitude}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel 2: Engagement sequence comparison */}
      <div style={{ opacity: panel >= 1 ? 1 : 0, transition: 'opacity 0.3s ease', flex: panel === 1 ? 1 : 0, overflow: 'hidden' }}>
        {panel === 1 && slide.expertSequence && (
          <div style={{ display: 'flex', gap: 20 }}>
            {/* Learner's sequence */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8, fontFamily: fonts.heading }}>
                Your Sequence
              </div>
              {state.engagementSequence.map((entry) => {
                const expertMatch = slide.expertSequence?.find(e => e.rank === entry.rank);
                const differs = expertMatch?.stakeholderId !== entry.stakeholderId;
                return (
                  <div key={entry.rank} style={{
                    background: differs ? '#FFFBEB' : '#F7FAFC',
                    border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>
                      #{entry.rank}: {nameMap[entry.stakeholderId] || entry.stakeholderId}
                    </span>
                    <p style={{ fontSize: 11, color: '#4A5568', margin: '4px 0 0', fontFamily: fonts.body }}>
                      {entry.justification}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* Expert sequence */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#38B2AC', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8, fontFamily: fonts.heading }}>
                Expert Sequence
              </div>
              {slide.expertSequence.map((entry) => (
                <div key={entry.rank} style={{
                  background: '#E6FFFA', border: '1px solid #38B2AC',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 6,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A202C', fontFamily: fonts.heading }}>
                    #{entry.rank}: {nameMap[entry.stakeholderId] || entry.stakeholderId}
                  </span>
                  <p style={{ fontSize: 11, color: '#2C9A94', margin: '4px 0 0', fontFamily: fonts.body }}>
                    {entry.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel 3: Personalised debrief */}
      <div style={{ opacity: panel >= 2 ? 1 : 0, transition: 'opacity 0.3s ease', flex: panel === 2 ? 1 : 0, overflow: 'hidden' }}>
        {panel === 2 && (
          <div>
            <div style={{
              background: state.helenUnlocked ? '#F0FFF4' : '#FFFBEB',
              border: `1px solid ${state.helenUnlocked ? '#C6F6D5' : '#F6AD55'}`,
              borderRadius: 10, padding: '18px 22px', marginBottom: 16,
            }}>
              <p style={{ fontSize: 14, color: '#1A202C', lineHeight: 1.7, margin: 0, fontFamily: fonts.body }}>
                {state.helenUnlocked ? slide.expertDebriefFoundHelen : slide.expertDebriefMissedHelen}
              </p>
            </div>

            {/* Key takeaways */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                'Org chart ≠ influence map',
                'Low-authority contacts are intelligence sources',
                'Explicit needs and emerging needs require different responses',
              ].map((pill) => (
                <span key={pill} style={{
                  background: '#E6FFFA', border: '1px solid #38B2AC', borderRadius: 20,
                  padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#2C9A94',
                  fontFamily: fonts.body,
                }}>
                  {pill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
