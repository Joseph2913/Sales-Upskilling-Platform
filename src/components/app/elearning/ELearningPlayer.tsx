import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Play, Pause, Maximize2, Minimize2, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { SlideRenderer } from './SlideRenderer';
import type {
  ObjectiveContent,
  SimulationState,
  SimulationCallbacks,
  StakeholderPlacement,
  EngagementEntry,
} from '../../../constants/elearningContent';
import { fonts } from '../../../constants/designTokens';

interface ELearningPlayerProps {
  content: ObjectiveContent;
  accentColor: string;
  accentDark: string;
  onComplete?: () => void;
  onSlideChange?: (slide: number) => void;
  startSlide?: number;
  /** Enable simulation mode — activates simulation state management */
  isSimulation?: boolean;
  /** Initial simulation state (for resume from persistence) */
  initialSimState?: SimulationState;
  /** Called when simulation state changes (for persistence) */
  onSimStateChange?: (state: SimulationState) => void;
  /** Called when simulation is completed */
  onSimulationComplete?: () => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

const DEFAULT_SIM_STATE: SimulationState = {
  selectedAccount: null,
  accountJustification: '',
  accountsProbed: [],
  helenUnlocked: false,
  stakeholdersProbed: [],
  stakeholderPlacements: {},
  engagementSequence: [],
};

/**
 * E-Learning Player with progress bar, narration controls,
 * fullscreen toggle, and Previous/Next navigation.
 * When isSimulation=true, manages simulation-specific state and navigation.
 */
export function ELearningPlayer({
  content,
  accentColor,
  accentDark,
  onComplete,
  onSlideChange,
  startSlide = 1,
  isSimulation = false,
  initialSimState,
  onSimStateChange,
  onSimulationComplete,
}: ELearningPlayerProps) {
  const [currentSlide, setCurrentSlide] = useState(startSlide);
  const [, setVisitedSlides] = useState<Set<number>>(new Set([startSlide]));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNarrationPopover, setShowNarrationPopover] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoNarrate, setAutoNarrate] = useState(() => {
    try { return localStorage.getItem('elearn_auto_narrate') !== 'false'; } catch { return true; }
  });

  // ── Simulation state ──
  const [simState, setSimState] = useState<SimulationState>(initialSimState || DEFAULT_SIM_STATE);
  const [accountGridStage, setAccountGridStage] = useState<'explore' | 'decide'>('explore');
  const [criteriaRevealed, setCriteriaRevealed] = useState(0);
  const [expertPanel, setExpertPanel] = useState(0);
  const [powerAnnotation, setPowerAnnotation] = useState('');
  const [priorityAnnotation, setPriorityAnnotation] = useState('');
  const [revealedLayer2, setRevealedLayer2] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Debounced persistence
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isSimulation || !onSimStateChange) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSimStateChange(simState), 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [simState, isSimulation, onSimStateChange]);

  // Compute effective slides (filter hiddenReveal if helen not unlocked)
  const effectiveSlides = useMemo(() => {
    if (!isSimulation) return content.slides;
    return content.slides.filter((s) => {
      if (s.type === 'hiddenReveal' && !simState.helenUnlocked) return false;
      return true;
    });
  }, [content.slides, isSimulation, simState.helenUnlocked]);

  const totalSlides = effectiveSlides.length;
  const slide = effectiveSlides[currentSlide - 1];
  const isFirst = currentSlide === 1;
  const isLast = currentSlide === totalSlides;
  const progressPct = (currentSlide / totalSlides) * 100;

  // Find slide index by ID
  const findSlideIndex = useCallback((slideId: string): number => {
    const idx = effectiveSlides.findIndex(s => s.id === slideId);
    return idx >= 0 ? idx + 1 : -1;
  }, [effectiveSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLast) handleNext();
      if (e.key === 'ArrowLeft' && !isFirst) goPrev();
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Close popover on outside click
  useEffect(() => {
    if (!showNarrationPopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowNarrationPopover(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNarrationPopover]);

  // Persist auto-narrate preference
  useEffect(() => {
    try { localStorage.setItem('elearn_auto_narrate', String(autoNarrate)); } catch { /* noop */ }
  }, [autoNarrate]);

  // Fullscreen API
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => { /* noop */ });
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => { /* noop */ });
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const goTo = useCallback((n: number) => {
    const clamped = Math.max(1, Math.min(n, totalSlides));
    setCurrentSlide(clamped);
    setVisitedSlides((prev) => new Set(prev).add(clamped));
    onSlideChange?.(clamped);
  }, [totalSlides, onSlideChange]);

  // ── Simulation-aware handleNext ──
  const handleNext = useCallback(() => {
    if (!slide) return;

    if (isSimulation) {
      // criteriaIntro: reveal one criterion at a time
      if (slide.type === 'criteriaIntro') {
        const total = slide.criteriaItems?.length || 0;
        if (criteriaRevealed < total) {
          setCriteriaRevealed(prev => prev + 1);
          return;
        }
      }

      // accountGrid: block if stage 2 not completed
      if (slide.type === 'accountGrid') {
        // Cannot advance from accountGrid — user must use Submit button
        return;
      }

      // accountConsequence: block — user must use Try Again
      if (slide.type === 'accountConsequence') {
        return;
      }

      // stakeholderGrid: block until >= 3 probed
      if (slide.type === 'stakeholderGrid') {
        if (simState.stakeholdersProbed.length < 3) return;
      }

      // classificationTask: block until all placed + annotated
      if (slide.type === 'classificationTask') {
        const neededStakeholders = simState.helenUnlocked ? 5 : 4;
        const placedCount = Object.keys(simState.stakeholderPlacements).length;
        if (placedCount < neededStakeholders || powerAnnotation.length < 20 || priorityAnnotation.length < 20) return;
      }

      // engagementSequence: block until all 3 ranked + justified
      if (slide.type === 'engagementSequence') {
        const seq = simState.engagementSequence;
        if (seq.length < 3 || seq.some(e => !e.stakeholderId || e.justification.length < 20)) return;
      }

      // expertReveal: step through panels
      if (slide.type === 'expertReveal') {
        if (expertPanel < 2) {
          setExpertPanel(prev => prev + 1);
          return;
        }
        // At panel 2 (last), this is "Complete Simulation"
        onSimulationComplete?.();
        return;
      }
    }

    // Default: advance
    if (isLast) {
      onComplete?.();
    } else {
      goTo(currentSlide + 1);
    }
  }, [slide, isSimulation, currentSlide, isLast, criteriaRevealed, simState, expertPanel,
      powerAnnotation, priorityAnnotation, goTo, onComplete, onSimulationComplete]);

  const goPrev = () => {
    if (!isFirst) goTo(currentSlide - 1);
  };

  // ── Simulation callbacks ──
  const simulationCallbacks = useMemo((): SimulationCallbacks | undefined => {
    if (!isSimulation) return undefined;
    return {
      onProbeAccount: (key: string) => {
        setSimState(prev => ({
          ...prev,
          accountsProbed: prev.accountsProbed.includes(key) ? prev.accountsProbed : [...prev.accountsProbed, key],
        }));
      },
      onSelectAccount: (key: string) => {
        setSimState(prev => ({ ...prev, selectedAccount: key || null }));
      },
      onSetAccountJustification: (text: string) => {
        setSimState(prev => ({ ...prev, accountJustification: text }));
      },
      onSubmitAccountDecision: () => {
        const selected = simState.selectedAccount;
        if (!selected) return;
        const accounts = content.slides.find(s => s.type === 'accountGrid')?.accounts || [];
        const account = accounts.find(a => a.key === selected);
        if (!account) return;
        if (account.isCorrect) {
          // Navigate to the confirmed scene-set slide
          const confirmIdx = findSlideIndex('sim-1-confirmed');
          if (confirmIdx > 0) goTo(confirmIdx);
        } else {
          // Navigate to consequence slide
          const consequenceIdx = findSlideIndex(`sim-1-consequence-${selected}`);
          if (consequenceIdx > 0) goTo(consequenceIdx);
        }
      },
      onProbeStakeholder: (key: string) => {
        setSimState(prev => {
          const probed = prev.stakeholdersProbed.includes(key) ? prev.stakeholdersProbed : [...prev.stakeholdersProbed, key];
          // Check if Wu was probed — unlock Helen
          const helenUnlocked = prev.helenUnlocked || key === 'wu';
          return { ...prev, stakeholdersProbed: probed, helenUnlocked };
        });
      },
      onUnlockHelen: () => {
        setSimState(prev => ({ ...prev, helenUnlocked: true }));
      },
      onPlaceStakeholder: (id: string, placement: StakeholderPlacement) => {
        setSimState(prev => ({
          ...prev,
          stakeholderPlacements: { ...prev.stakeholderPlacements, [id]: placement },
        }));
      },
      onSetEngagementSequence: (seq: EngagementEntry[]) => {
        setSimState(prev => ({ ...prev, engagementSequence: seq }));
      },
      onNavigateToSlide: (slideId: string) => {
        const idx = findSlideIndex(slideId);
        if (idx > 0) goTo(idx);
      },
      onCompleteSimulation: () => {
        onSimulationComplete?.();
      },
      accountGridStage,
      onSetAccountGridStage: setAccountGridStage,
      criteriaRevealed,
      expertPanel,
      powerAnnotation,
      onSetPowerAnnotation: setPowerAnnotation,
      priorityAnnotation,
      onSetPriorityAnnotation: setPriorityAnnotation,
      revealedLayer2,
      onRevealLayer2: (key: string) => {
        setRevealedLayer2(prev => new Set(prev).add(key));
      },
      allSlides: effectiveSlides,
    };
  }, [isSimulation, simState, accountGridStage, criteriaRevealed, expertPanel,
      powerAnnotation, priorityAnnotation, revealedLayer2, effectiveSlides,
      content.slides, findSlideIndex, goTo, onSimulationComplete]);

  // Determine next button label
  const getNextLabel = (): string => {
    if (isSimulation && slide?.type === 'expertReveal' && expertPanel >= 2) {
      return 'Complete Simulation →';
    }
    if (isLast) return 'Complete';
    return 'Next';
  };

  // Reset criteria step when leaving criteriaIntro
  useEffect(() => {
    if (slide?.type !== 'criteriaIntro') {
      setCriteriaRevealed(0);
    }
    if (slide?.type !== 'expertReveal') {
      setExpertPanel(0);
    }
  }, [slide?.type]);

  if (!slide) return null;

  const nextLabel = getNextLabel();

  return (
    <div
      ref={containerRef}
      style={{
        background: '#FFFFFF',
        border: isFullscreen ? 'none' : '1.5px solid #CBD5E0',
        borderRadius: isFullscreen ? 0 : 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '100vh' : 'calc(100vh - 260px)',
        minHeight: isFullscreen ? undefined : 440,
        maxHeight: isFullscreen ? undefined : 740,
        position: 'relative',
      }}
    >
      {/* ─── Top progress bar ─── */}
      <div style={{ height: 3, background: '#E2E8F0', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: accentColor,
          borderRadius: '0 3px 3px 0',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* ─── Slide content ─── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <SlideRenderer
          slide={slide}
          accentColor={accentColor}
          accentDark={accentDark}
          simulationState={isSimulation ? simState : undefined}
          simulationCallbacks={simulationCallbacks}
        />
      </div>

      {/* ─── Bottom navigation bar ─── */}
      <div style={{
        borderTop: '1px solid #E2E8F0',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: '#FAFBFC',
      }}>
        {/* ── Previous button ── */}
        <button
          onClick={goPrev}
          disabled={isFirst}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#FFFFFF',
            border: `1px solid ${isFirst ? '#E2E8F0' : '#CBD5E0'}`,
            borderRadius: 20,
            fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
            color: isFirst ? '#CBD5E0' : '#4A5568',
            cursor: isFirst ? 'default' : 'pointer',
            padding: '8px 18px',
            transition: 'all 0.15s ease',
            minWidth: 110,
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            if (!isFirst) {
              e.currentTarget.style.borderColor = '#A0AEC0';
              e.currentTarget.style.background = '#F7FAFC';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isFirst ? '#E2E8F0' : '#CBD5E0';
            e.currentTarget.style.background = '#FFFFFF';
          }}
        >
          <ArrowLeft size={14} />
          Previous
        </button>

        {/* ── Center: Play + Narration pill + Slide counter + Fullscreen ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          position: 'relative',
        }}>
          {/* Play/Pause button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#1A202C', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            title={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying
              ? <Pause size={14} color="#FFFFFF" fill="#FFFFFF" />
              : <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 1 }} />
            }
          </button>

          {/* Narration toggle pill */}
          <div style={{ position: 'relative' }} ref={popoverRef}>
            <button
              onClick={() => setShowNarrationPopover(!showNarrationPopover)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: showNarrationPopover ? '#1A202C' : '#F7FAFC',
                border: showNarrationPopover ? 'none' : '1px solid #E2E8F0',
                borderRadius: 20, padding: '6px 14px',
                fontFamily: fonts.body, fontSize: 12, fontWeight: 700,
                color: showNarrationPopover ? '#FFFFFF' : '#4A5568',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.03em',
              }}
            >
              Narration
              {showNarrationPopover
                ? <ChevronUp size={12} />
                : <ChevronDown size={12} />
              }
            </button>

            {/* ── Narration popover ── */}
            {showNarrationPopover && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 10px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '18px 22px',
                width: 280,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 50,
              }}>
                {/* Speed selector */}
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#718096',
                  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                  marginBottom: 10,
                }}>
                  Speed
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      style={{
                        flex: 1, padding: '6px 0',
                        borderRadius: 8,
                        background: playbackSpeed === speed ? '#1A202C' : '#F7FAFC',
                        border: playbackSpeed === speed ? 'none' : '1px solid #E2E8F0',
                        color: playbackSpeed === speed ? '#FFFFFF' : '#4A5568',
                        fontSize: 12, fontWeight: 600,
                        fontFamily: fonts.body,
                        cursor: 'pointer',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {speed}×
                    </button>
                  ))}
                </div>

                {/* Mute toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderTop: '1px solid #EDF2F7',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A202C', fontFamily: fonts.body }}>
                    Mute
                  </span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: isMuted ? '#E53E3E' : '#38B2AC',
                      fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
                    }}
                  >
                    {isMuted
                      ? <><VolumeX size={16} /> Off</>
                      : <><Volume2 size={16} /> On</>
                    }
                  </button>
                </div>

                {/* Auto-narrate toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderTop: '1px solid #EDF2F7',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A202C', fontFamily: fonts.body }}>
                      Auto-narrate
                    </div>
                    <div style={{ fontSize: 11, color: '#A0AEC0', fontFamily: fonts.body, marginTop: 2 }}>
                      Play audio on each slide
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoNarrate(!autoNarrate)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: autoNarrate ? '#38B2AC' : '#CBD5E0',
                      border: 'none', cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#FFFFFF',
                      position: 'absolute', top: 3,
                      left: autoNarrate ? 23 : 3,
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }} />
                  </button>
                </div>

                {/* Popover arrow */}
                <div style={{
                  position: 'absolute', bottom: -6, left: '50%',
                  width: 12, height: 12, background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderTop: 'none', borderLeft: 'none',
                  transform: 'translateX(-50%) rotate(45deg)',
                }} />
              </div>
            )}
          </div>

          {/* Slide counter */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#F7FAFC', border: '1px solid #E2E8F0',
            borderRadius: 20, padding: '6px 14px',
          }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: '#718096',
              fontFamily: fonts.body,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {currentSlide} / {totalSlides}
            </span>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#F7FAFC', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EDF2F7';
              e.currentTarget.style.borderColor = '#CBD5E0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F7FAFC';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen
              ? <Minimize2 size={14} color="#4A5568" />
              : <Maximize2 size={14} color="#4A5568" />
            }
          </button>
        </div>

        {/* ── Next / Complete button ── */}
        <button
          onClick={handleNext}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: isLast || nextLabel.includes('Complete') ? accentDark : '#38B2AC',
            border: 'none',
            borderRadius: 20,
            fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '8px 18px',
            minWidth: 110,
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {nextLabel}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
