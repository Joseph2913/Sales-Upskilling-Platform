// ─── E-Learning Content Registry ───
// Pharma sales e-learning content structured as slide sequences.
// Each objective has a set of slides following the 5-beat narrative arc.
// See docs/ELEARNING_STRUCTURE.md for the full content framework.

// ─── Types ───

export type SlideType =
  | 'courseIntro'
  | 'evidenceHero'
  | 'chart'
  | 'tensionStatement'
  | 'concept'
  | 'contextBar'
  | 'scenarioComparison'
  | 'situationalJudgment'
  | 'flipcard'
  | 'moduleSummary'
  | 'reflection'
  // Simulation slide types (Format A)
  | 'sceneSet'
  | 'criteriaIntro'
  | 'accountGrid'
  | 'accountDossier'
  | 'accountConsequence'
  | 'stakeholderGrid'
  | 'stakeholderDossier'
  | 'hiddenReveal'
  | 'classificationTask'
  | 'engagementSequence'
  | 'expertReveal';

export type SectionName =
  | 'THE REALITY'
  | 'THE GAP'
  | 'THE TECHNIQUE'
  | 'IN PRACTICE'
  | 'WRAP UP'
  // Simulation sections
  | 'THE SETUP'
  | 'ACCOUNT SELECTION'
  | 'STAKEHOLDER DIAGNOSIS'
  | 'THE DEBRIEF';

export interface StatData {
  value: string;
  label: string;
  source: string;
  sourceYear: number;
  visualType: 'dotGrid' | 'barComparison' | 'adoptionGap' | 'percentRing';
  context?: string;
}

export interface ScenarioOption {
  id: string;
  label: string;
  response: string;
  isCorrect: boolean;
  feedback: string;
}

export interface ScenarioData {
  situation: string;
  options: ScenarioOption[];
  debrief: string;
}

export interface PersonaData {
  name: string;
  role: string;
  icon: string;
  situation: string;
  approach: string;
  outcome: string;
}

export interface FrameworkItem {
  key: string;
  label: string;
  description: string;
  example: string;
  color: string;
}

export interface ComparisonTab {
  label: string;
  content: string;
  isImproved: boolean;
}

// ─── Simulation Types ───

export interface AccountCard {
  key: string;
  name: string;
  type: string;
  tagline: string;
  isCorrect: boolean;
}

export interface AccountLayer1 {
  patientVolume: string;
  relationshipStatus: string;
  accountType: string;
}

export interface AccountLayer2 {
  formularyStatus: string;
  buyingCycleStage: string;
  competitivePosition: string;
  internalChampion: string;
  trapLabel: string;
  loTaught: string;
}

export interface StakeholderCard {
  key: string;
  name: string;
  role: string;
  behaviouralSignal: string;
  isHidden: boolean;
}

export interface StakeholderLayer1 {
  behaviouralSignal: string;
}

export interface StakeholderLayer2 {
  roleReality: string;
  explicitNeed: string;
  emergingNeed: string;
  relationshipDynamic: string;
  hiddenSignal?: string;
}

export interface ExpertStakeholderPlacement {
  stakeholderId: string;
  formalAuthority: number;
  realInfluence: number;
  impact: number;
  attitude: number;
  expertAnnotation: string;
  commonMisplacement?: string;
}

export interface ExpertSequenceItem {
  rank: number;
  stakeholderId: string;
  reasoning: string;
}

export interface StakeholderPlacement {
  formalAuthority: number;
  realInfluence: number;
  impact: number;
  attitude: number;
  annotation: string;
}

export interface EngagementEntry {
  rank: number;
  stakeholderId: string;
  justification: string;
}

export interface SimulationState {
  selectedAccount: string | null;
  accountJustification: string;
  accountsProbed: string[];
  helenUnlocked: boolean;
  stakeholdersProbed: string[];
  stakeholderPlacements: Record<string, StakeholderPlacement>;
  engagementSequence: EngagementEntry[];
}

export interface SimulationCallbacks {
  onProbeAccount: (key: string) => void;
  onSelectAccount: (key: string) => void;
  onSetAccountJustification: (text: string) => void;
  onSubmitAccountDecision: () => void;
  onProbeStakeholder: (key: string) => void;
  onUnlockHelen: () => void;
  onPlaceStakeholder: (id: string, placement: StakeholderPlacement) => void;
  onSetEngagementSequence: (seq: EngagementEntry[]) => void;
  onNavigateToSlide: (slideId: string) => void;
  onCompleteSimulation: () => void;
  /** For accountGrid: tracks which stage (explore vs decide) */
  accountGridStage: 'explore' | 'decide';
  onSetAccountGridStage: (stage: 'explore' | 'decide') => void;
  /** For criteriaIntro: number of revealed criteria */
  criteriaRevealed: number;
  /** For expertReveal: which panel is showing */
  expertPanel: number;
  /** For classification: annotation texts for the two matrices */
  powerAnnotation: string;
  onSetPowerAnnotation: (text: string) => void;
  priorityAnnotation: string;
  onSetPriorityAnnotation: (text: string) => void;
  /** For stakeholderDossier / accountDossier: tracks which have layer2 revealed */
  revealedLayer2: Set<string>;
  onRevealLayer2: (key: string) => void;
  /** All slides in the simulation (for dossier navigation) */
  allSlides: SlideData[];
}

export interface SlideData {
  id: string;
  section: SectionName;
  type: SlideType;
  heading: string;
  tealWord?: string;
  subheading?: string;
  body?: string;
  stats?: StatData;
  scenario?: ScenarioData;
  personas?: PersonaData[];
  frameworks?: FrameworkItem[];
  comparisonTabs?: ComparisonTab[];
  takeaway?: string;
  objectives?: string[];
  reflectionQuestions?: string[];
  summaryGrid?: { label: string; description: string }[];
  approachCards?: { title: string; useWhen: string; description: string }[];

  // ── sceneSet fields ──
  sceneNarrative?: string;
  sceneRole?: string;
  sceneContext?: string;

  // ── criteriaIntro fields ──
  criteriaItems?: Array<{ label: string; description: string }>;

  // ── accountGrid fields ──
  accounts?: AccountCard[];

  // ── accountDossier fields ──
  accountKey?: string;
  accountLayer1?: AccountLayer1;
  accountLayer2?: AccountLayer2;

  // ── accountConsequence fields ──
  consequenceAccountKey?: string;
  consequenceTitle?: string;
  consequenceNarrative?: string;
  consequenceMissedSignal?: string;
  consequenceRedirect?: string;

  // ── stakeholderGrid / stakeholderDossier fields ──
  stakeholders?: StakeholderCard[];
  stakeholderKey?: string;
  stakeholderLayer1?: StakeholderLayer1;
  stakeholderLayer2?: StakeholderLayer2;
  isHiddenStakeholder?: boolean;

  // ── classificationTask fields ──
  classificationInstructions?: string;

  // ── engagementSequence fields ──
  engagementInstructions?: string;

  // ── expertReveal fields ──
  expertPowerMatrix?: ExpertStakeholderPlacement[];
  expertSequence?: ExpertSequenceItem[];
  expertDebriefFoundHelen?: string;
  expertDebriefMissedHelen?: string;
}

export interface ObjectiveContent {
  objectiveId: number;
  title: string;
  totalSlides: number;
  estimatedMinutes: number;
  slides: SlideData[];
}

// ─── Objective 1: Diagnose Before You Sell ───

const OBJECTIVE_1_CONTENT: ObjectiveContent = {
  objectiveId: 1,
  title: 'Diagnose Before You Sell',
  totalSlides: 12,
  estimatedMinutes: 25,
  slides: [
    // ═══ SLIDE 1: Course Intro ═══
    {
      id: '1-intro',
      section: 'THE REALITY',
      type: 'courseIntro',
      heading: 'Diagnose Before You Sell',
      tealWord: 'Diagnose',
      subheading: 'Discovery calls that uncover the real need, not just the stated one',
      body: 'In pharma, the best reps don\'t pitch — they diagnose. This module teaches you to run discovery conversations that reveal what healthcare buyers actually need, not just what they say they need.',
      objectives: [
        'Apply the TRICIS trust-building model to healthcare stakeholder conversations',
        'Use open diagnostic questioning to move beyond surface-level needs',
        'Identify planted traps — stated needs that mask real decision drivers',
        'Read verbal signals that indicate hidden information worth probing',
      ],
    },

    // ═══ SLIDE 2: Evidence Hero ═══
    {
      id: '1-evidence-1',
      section: 'THE REALITY',
      type: 'evidenceHero',
      heading: 'Reps who diagnose first close 2.3× more deals',
      tealWord: '2.3×',
      body: 'Yet 68% of pharma sales calls still lead with product features within the first two minutes.',
      stats: {
        value: '2.3×',
        label: 'higher close rate for diagnostic-first reps vs. feature-first reps',
        source: 'ZS Associates Pharma Sales Effectiveness Study',
        sourceYear: 2024,
        visualType: 'barComparison',
        context: 'Based on analysis of 12,000+ recorded pharma sales calls across 8 therapeutic areas',
      },
      takeaway: 'The data is clear: understanding before prescribing outperforms pitching every time.',
    },

    // ═══ SLIDE 3: Chart ═══
    {
      id: '1-evidence-2',
      section: 'THE REALITY',
      type: 'chart',
      heading: 'HCP access is declining — every interaction counts',
      tealWord: 'every',
      body: 'Average face-to-face time with prescribers has dropped 40% since 2019. The reps who win are those who make each minute diagnostic, not transactional.',
      stats: {
        value: '-40%',
        label: 'decrease in average HCP face-to-face time since 2019',
        source: 'IQVIA Channel Dynamics Report',
        sourceYear: 2024,
        visualType: 'adoptionGap',
        context: 'Measured across US and EU5 markets for primary care and specialty pharma',
      },
      takeaway: 'With less time per interaction, the quality of your questions matters more than the quantity of your claims.',
    },

    // ═══ SLIDE 4: Tension Statement ═══
    {
      id: '1-tension',
      section: 'THE GAP',
      type: 'tensionStatement',
      heading: 'Most reps know they should ask questions. Few know how to ask the right ones.',
      tealWord: 'right',
      body: 'The gap isn\'t effort — it\'s technique. Open questions get you started. Diagnostic questions get you the truth. The difference is understanding what healthcare buyers are protecting, and why.',
      takeaway: 'Diagnostic questioning is a skill, not a personality trait. It can be learned and practised.',
    },

    // ═══ SLIDE 5: Concept — TRICIS Framework ═══
    {
      id: '1-framework-tricis',
      section: 'THE TECHNIQUE',
      type: 'contextBar',
      heading: 'The TRICIS Trust Model',
      tealWord: 'TRICIS',
      subheading: 'Six components of trust in healthcare sales relationships',
      body: 'Trust in pharma isn\'t built by being likeable — it\'s built by being credible, reliable, and genuinely curious about the buyer\'s world. TRICIS maps the six dimensions that healthcare professionals evaluate, consciously or not.',
      frameworks: [
        {
          key: 'T',
          label: 'Transparency',
          description: 'Being honest about what your product can and cannot do',
          example: '"I want to be upfront — our data is strongest in the mild-to-moderate population"',
          color: 'rgba(56,178,172,0.15)',
        },
        {
          key: 'R',
          label: 'Reliability',
          description: 'Following through on commitments consistently',
          example: 'Sending the clinical data you promised within 24 hours, every time',
          color: 'rgba(66,153,225,0.15)',
        },
        {
          key: 'I',
          label: 'Integrity',
          description: 'Aligning actions with stated values',
          example: 'Recommending a competitor when your product isn\'t the best fit',
          color: 'rgba(159,122,234,0.15)',
        },
        {
          key: 'C',
          label: 'Competence',
          description: 'Demonstrating clinical and commercial knowledge',
          example: 'Discussing the latest meta-analysis without being prompted',
          color: 'rgba(237,137,54,0.15)',
        },
        {
          key: 'I2',
          label: 'Intimacy',
          description: 'Creating psychological safety for candid conversation',
          example: '"This stays between us — what\'s really driving the urgency here?"',
          color: 'rgba(72,187,120,0.15)',
        },
        {
          key: 'S',
          label: 'Self-Orientation',
          description: 'Low self-orientation = high trust. Are you here for them or for your quota?',
          example: 'Asking about their patients before mentioning your product',
          color: 'rgba(252,129,129,0.15)',
        },
      ],
      takeaway: 'Trust = (Transparency + Reliability + Intimacy + Competence + Integrity) ÷ Self-Orientation. The denominator kills more deals than any competitor.',
    },

    // ═══ SLIDE 6: Concept — Information Gates ═══
    {
      id: '1-framework-gates',
      section: 'THE TECHNIQUE',
      type: 'concept',
      heading: 'Information Gates',
      tealWord: 'Gates',
      subheading: 'Why healthcare buyers reveal information in layers',
      body: 'Healthcare buyers don\'t withhold information to be difficult. They have regulatory constraints, internal politics, and vendor fatigue that make them protective. Information gates are trust thresholds — specific conditions that must be met before a buyer will share deeper context. Your job is to earn each gate, not force it open.',
      takeaway: 'Every buyer has 3-5 information gates. The reps who find them uncover the real deal. The reps who don\'t get a polite "we\'ll get back to you."',
    },

    // ═══ SLIDE 7: Scenario Comparison ═══
    {
      id: '1-contrast',
      section: 'THE TECHNIQUE',
      type: 'scenarioComparison',
      heading: 'Same buyer, different approach',
      tealWord: 'different',
      subheading: 'A hospital VP of Operations with a "cost reduction" mandate',
      comparisonTabs: [
        {
          label: 'Feature-First Approach',
          content: 'Rep: "Thanks for meeting with me. I\'d love to tell you about our operational efficiency platform. We help hospitals reduce costs by 15-20% through automated workflow management. Our clients include three of the top ten hospital systems in the country..."\n\nVP: "That sounds interesting. Can you send me some materials? I\'ll share them with the team."\n\n→ Result: Polite brush-off. VP shared nothing about her real situation. No follow-up meeting scheduled.',
          isImproved: false,
        },
        {
          label: 'Diagnostic Approach',
          content: 'Rep: "Thanks for making time. Before I talk about anything on our side — I\'d love to understand what\'s driving the cost reduction focus right now. Is this a board-level mandate, or is it coming from somewhere specific?"\n\nVP: "Well... honestly, there\'s a lot happening internally. The board is pushing hard on operational metrics, and we have a deadline that\'s — let\'s just say it\'s not flexible."\n\n→ Result: VP revealed urgency, internal pressure, and a hard deadline. Trust gate opened. Three follow-up questions naturally emerge.',
          isImproved: true,
        },
      ],
      takeaway: 'The diagnostic rep didn\'t pitch. They didn\'t need to. By diagnosing first, they earned information the feature-first rep will never get.',
    },

    // ═══ SLIDE 8: Situational Judgment ═══
    {
      id: '1-practice-1',
      section: 'IN PRACTICE',
      type: 'situationalJudgment',
      heading: 'The P&T committee chair drops a signal',
      tealWord: 'signal',
      body: 'You\'re 8 minutes into a call with Dr. Patel, chair of the hospital\'s P&T committee. She says: "We tried something similar last year and it didn\'t quite work out."',
      scenario: {
        situation: 'Dr. Patel has just mentioned a failed past initiative. This is a signal — a verbal cue indicating important hidden information. How do you respond?',
        options: [
          {
            id: 'a',
            label: 'Differentiate your product',
            response: '"I understand, but our solution is quite different from what you\'ve tried before. Let me explain how..."',
            isCorrect: false,
            feedback: 'This immediately shifts to pitching. Dr. Patel mentioned the failure for a reason — she\'s testing whether you\'ll listen or sell. By jumping to differentiation, you\'ve failed the test and decreased trust.',
          },
          {
            id: 'b',
            label: 'Probe the signal',
            response: '"That sounds frustrating. Would you be comfortable telling me a bit about what happened? I want to make sure we don\'t repeat the same mistakes."',
            isCorrect: true,
            feedback: 'Excellent. You acknowledged the emotion (frustrating), asked permission to probe (comfortable telling me), and positioned yourself as a partner (we don\'t repeat). This opens the information gate — Dr. Patel is likely to share what went wrong, who was involved, and what she needs to see differently.',
          },
          {
            id: 'c',
            label: 'Acknowledge and move on',
            response: '"I appreciate you sharing that. So, moving forward, what would success look like for you this time around?"',
            isCorrect: false,
            feedback: 'Not bad, but a missed opportunity. "Moving forward" skips past the signal without exploring it. The past failure contains critical intelligence — who failed, why, who got burned, and what Dr. Patel now requires. Jumping to "success criteria" before understanding the failure context gives you a surface-level answer.',
          },
        ],
        debrief: 'Signals are invitations to go deeper. When a healthcare buyer mentions a past failure, a previous vendor, or an internal challenge, they\'re testing whether you\'ll listen or pitch. The diagnostic rep probes every signal.',
      },
    },

    // ═══ SLIDE 9: Flipcard — Persona Predictions ═══
    {
      id: '1-practice-2',
      section: 'IN PRACTICE',
      type: 'flipcard',
      heading: 'Predict the buyer\'s response',
      tealWord: 'Predict',
      subheading: 'Three healthcare buyers, three different trust dynamics. What happens next?',
      personas: [
        {
          name: 'Dr. Sarah Okafor',
          role: 'Chief Pharmacist, Regional Hospital',
          icon: '💊',
          situation: 'You\'ve asked: "What\'s your biggest challenge with formulary management right now?"',
          approach: 'Open diagnostic question to a clinical decision-maker',
          outcome: 'She pauses, then says: "Honestly? The biggest challenge isn\'t the formulary itself — it\'s getting physicians to actually follow it. We add drugs, we remove drugs, but prescribing behaviour barely changes." → She\'s revealed the real pain: clinical inertia, not formulary management. A diagnostic rep would probe this further.',
        },
        {
          name: 'Marcus Wei',
          role: 'VP Procurement, Hospital Group',
          icon: '📊',
          situation: 'You\'ve asked: "Can you walk me through your evaluation process for new vendors?"',
          approach: 'Process-focused question to a commercial buyer',
          outcome: 'He gives a textbook answer: "We have a standard RFP process. Clinical review, then commercial review, then finance sign-off." → Surface-level response. Trust is low. A diagnostic rep would ask: "And in your experience, where do proposals typically get stuck in that process?" to probe the real dynamics.',
        },
        {
          name: 'Dr. Elena Vasquez',
          role: 'Medical Director, Oncology',
          icon: '🔬',
          situation: 'You\'ve asked: "What clinical evidence would you need to see to consider a formulary change?"',
          approach: 'Evidence-focused question to a KOL',
          outcome: 'She leans forward: "Show me a head-to-head trial, not just vs. placebo. And real-world data from a comparable patient population. I\'m tired of seeing cherry-picked subgroup analyses." → High clinical credibility creates trust. She\'s told you exactly what she needs. A diagnostic rep would ask: "Which comparators would be most meaningful for your patient mix?"',
        },
      ],
      takeaway: 'Each buyer revealed information proportional to the quality of the question. Better questions unlock better intelligence.',
    },

    // ═══ SLIDE 10: Situational Judgment 2 ═══
    {
      id: '1-practice-3',
      section: 'IN PRACTICE',
      type: 'situationalJudgment',
      heading: 'The buyer mentions a hidden stakeholder',
      tealWord: 'hidden',
      body: 'During a discovery call, the buyer says: "David in IT has been looking at some options on his side." This is a signal about a hidden stakeholder running a parallel evaluation.',
      scenario: {
        situation: 'The buyer has just revealed that someone else is evaluating solutions independently. How do you handle this?',
        options: [
          {
            id: 'a',
            label: 'Position against the competitor',
            response: '"We\'d love the chance to compare directly with whatever David is considering. Our platform typically outperforms in head-to-head evaluations."',
            isCorrect: false,
            feedback: 'This treats David as a competitor rather than a potential ally. In pharma buying committees, alienating a stakeholder — even one you haven\'t met — can kill the deal. David\'s evaluation is an opportunity for alignment, not competition.',
          },
          {
            id: 'b',
            label: 'Explore the alignment opportunity',
            response: '"That\'s really helpful to know. It sounds like there might be some natural overlap between what you\'re looking at and what David\'s exploring. Would it make sense for us to connect the dots, or is it too early for that?"',
            isCorrect: true,
            feedback: 'Perfect. You acknowledged the information, framed it as an opportunity for alignment (not competition), and asked permission before suggesting next steps. This shows political intelligence — you understand that buying committees work better when stakeholders are aligned.',
          },
          {
            id: 'c',
            label: 'Ask to meet David directly',
            response: '"Would it be possible to set up a meeting with David? I\'d love to show him what we can do on the IT side."',
            isCorrect: false,
            feedback: 'Too aggressive. Asking to meet David directly bypasses the buyer\'s authority and suggests you want to sell to David rather than help the buyer. Let the buyer decide when and how to bring David in. Going around them would damage trust.',
          },
        ],
        debrief: 'Hidden stakeholders are one of the most important signals in pharma sales. They indicate that the decision is more complex than it appears, and that alignment across the buying committee is essential.',
      },
    },

    // ═══ SLIDE 11: Module Summary ═══
    {
      id: '1-summary',
      section: 'WRAP UP',
      type: 'moduleSummary',
      heading: 'Diagnostic Selling: Your Framework',
      tealWord: 'Framework',
      summaryGrid: [
        { label: 'TRICIS Trust Model', description: 'Six dimensions of trust that healthcare buyers evaluate in every interaction' },
        { label: 'Information Gates', description: 'Trust thresholds that control what buyers will and won\'t share' },
        { label: 'Signal Detection', description: 'Verbal cues that indicate hidden information worth probing' },
        { label: 'Diagnostic Questions', description: 'Open questions that uncover needs beyond the surface level' },
        { label: 'Planted Traps', description: 'Stated needs that mask different real drivers' },
        { label: 'Trust Arithmetic', description: 'Trust = (T+R+I+C+I) ÷ Self-Orientation' },
      ],
      approachCards: [
        {
          title: 'Diagnostic-First',
          useWhen: 'First meetings, discovery calls, any situation where you don\'t yet understand the buyer\'s real needs',
          description: 'Lead with open questions. Listen for signals. Earn information gates. Never pitch until you can articulate the buyer\'s problem in their own language.',
        },
        {
          title: 'Evidence-Led',
          useWhen: 'Engaging clinical stakeholders (KOLs, medical directors) who value data over relationship',
          description: 'Lead with relevant clinical evidence. Ask about their patient population. Position yourself as a scientific partner, not a sales rep.',
        },
        {
          title: 'Process-Aligned',
          useWhen: 'Engaging procurement and P&T committees who follow structured evaluation processes',
          description: 'Understand their evaluation criteria before presenting. Ask about past vendor experiences. Align your approach to their process, not the other way around.',
        },
      ],
      takeaway: 'Diagnose before you sell. The best pharma reps don\'t have better products — they have better questions.',
    },

    // ═══ SLIDE 12: Reflection ═══
    {
      id: '1-reflection',
      section: 'WRAP UP',
      type: 'reflection',
      heading: 'Apply This to Your Territory',
      tealWord: 'Your',
      reflectionQuestions: [
        'Think about your most important account right now. What information gates might exist that you haven\'t yet earned? What questions could you ask to open them?',
        'Reflect on a recent sales call. Were there signals — verbal cues from the buyer — that you missed or didn\'t probe? What would you do differently next time?',
      ],
      takeaway: 'Next step: Practice these techniques in a live Voice Simulation with an AI customer persona who responds dynamically to your approach.',
    },
  ],
};

// ─── LO1 Simulation A: Decision Simulation ───

export const LO1_SIMULATION_A_SLIDES: SlideData[] = [
  // ── SCREEN 1: Scene-setter ──
  {
    id: 'sim-1-scene',
    section: 'THE SETUP',
    type: 'sceneSet',
    heading: 'Your territory. Your launch. Your call.',
    tealWord: 'call',
    sceneRole: 'Specialty Care Field Rep',
    sceneNarrative: 'You\'re launching a new biologic therapy for moderate-to-severe rheumatoid arthritis across a territory in the North West of England. Four accounts are on your radar. You have capacity to pursue one seriously right now.',
    sceneContext: 'Choose wrong and you burn three months. Choose right and you have a shot at your first formulary listing. Where do you start?',
  },

  // ── SCREEN 2: Evaluation criteria ──
  {
    id: 'sim-1-criteria',
    section: 'THE SETUP',
    type: 'criteriaIntro',
    heading: 'What separates a priority account from a distraction?',
    tealWord: 'priority',
    body: 'Experienced reps don\'t chase the biggest accounts. Before committing time to any account, they assess five things.',
    criteriaItems: [
      { label: 'Need fit', description: 'Does this account treat the right patients?' },
      { label: 'Buying process activity', description: 'Is something actively happening that creates a decision window?' },
      { label: 'Timing', description: 'When is the realistic decision point?' },
      { label: 'Competitive position', description: 'Is there room to win, or is the incumbent locked in?' },
      { label: 'Decision accessibility', description: 'Can you actually influence the outcome, or is the gate closed?' },
    ],
  },

  // ── SCREEN 3: Account overview grid ──
  {
    id: 'sim-1-accounts',
    section: 'ACCOUNT SELECTION',
    type: 'accountGrid',
    heading: 'Four accounts. One priority. Where do you start?',
    tealWord: 'priority',
    body: 'Tap any account to investigate. You can explore all four before making your decision.',
    accounts: [
      {
        key: 'northgate',
        name: 'Northgate University Hospital Trust',
        type: 'Large teaching hospital',
        tagline: '850+ rheumatology patients. Academic centre of excellence.',
        isCorrect: false,
      },
      {
        key: 'redwell',
        name: 'Redwell Regional Hospital Group',
        type: 'Mid-size regional group · 3 sites',
        tagline: '420 patients. Active formulary review underway.',
        isCorrect: true,
      },
      {
        key: 'halcyon',
        name: 'The Halcyon Clinic',
        type: 'Private specialist clinic',
        tagline: '95 patients. Strong existing relationship.',
        isCorrect: false,
      },
      {
        key: 'mossbrook',
        name: 'Mossbrook Community Health Trust',
        type: 'Large public health trust',
        tagline: '600+ patients. No dominant incumbent.',
        isCorrect: false,
      },
    ],
  },

  // ── SCREEN 4a–4d: Account dossiers ──
  {
    id: 'sim-1-dossier-northgate',
    section: 'ACCOUNT SELECTION',
    type: 'accountDossier',
    accountKey: 'northgate',
    heading: 'Northgate University Hospital Trust',
    tealWord: 'Trust',
    accountLayer1: {
      patientVolume: '850+ active rheumatology patients',
      relationshipStatus: 'Junior registrar contact from recent symposium',
      accountType: 'Large teaching hospital — academic centre of excellence',
    },
    accountLayer2: {
      formularyStatus: 'Biologic not listed. No active review scheduled.',
      buyingCycleStage: 'Next formulary submission window: 11 months away',
      competitivePosition: 'Established competitor entrenched. Strong pharmacy committee relationship.',
      internalChampion: 'None identified',
      trapLabel: 'The trap: largest account + existing contact = looks like the obvious choice',
      loTaught: 'Volume ≠ priority. Access ≠ influence.',
    },
  },

  {
    id: 'sim-1-dossier-redwell',
    section: 'ACCOUNT SELECTION',
    type: 'accountDossier',
    accountKey: 'redwell',
    heading: 'Redwell Regional Hospital Group',
    tealWord: 'Group',
    accountLayer1: {
      patientVolume: '420 active rheumatology patients across 3 sites',
      relationshipStatus: 'No prior contact — cold entry',
      accountType: 'Mid-size regional group',
    },
    accountLayer2: {
      formularyStatus: 'Active formulary review underway. Biologic category under evaluation.',
      buyingCycleStage: 'Decision expected within 90 days',
      competitivePosition: 'Previous supplier had service failures. No preferred product currently.',
      internalChampion: 'Lead rheumatologist has been requesting a biologic option for 6 months',
      trapLabel: 'The challenge: no existing relationship — but every other signal is green',
      loTaught: 'Fit + timing + competitive vulnerability = right account, even without access.',
    },
  },

  {
    id: 'sim-1-dossier-halcyon',
    section: 'ACCOUNT SELECTION',
    type: 'accountDossier',
    accountKey: 'halcyon',
    heading: 'The Halcyon Clinic',
    tealWord: 'Clinic',
    accountLayer1: {
      patientVolume: '95 patients — high-value private payer mix',
      relationshipStatus: 'Strong. Trusted relationship with lead rheumatologist.',
      accountType: 'Private specialist clinic',
    },
    accountLayer2: {
      formularyStatus: 'No formal formulary. Prescribing decisions are individual and ad hoc.',
      buyingCycleStage: 'No structured decision process. Decisions made per patient.',
      competitivePosition: 'No dominant incumbent. Several products used interchangeably.',
      internalChampion: 'Rheumatologist enthusiastic but has no influence beyond clinic walls',
      trapLabel: 'The trap: warm relationship + fast access + no bureaucracy = feels easy',
      loTaught: 'Fit before access. Small footprint, no formulary leverage, no scalability.',
    },
  },

  {
    id: 'sim-1-dossier-mossbrook',
    section: 'ACCOUNT SELECTION',
    type: 'accountDossier',
    accountKey: 'mossbrook',
    heading: 'Mossbrook Community Health Trust',
    tealWord: 'Trust',
    accountLayer1: {
      patientVolume: '600+ patients across community care pathways',
      relationshipStatus: 'Moderate. Two prior meetings with business manager.',
      accountType: 'Large public health trust',
    },
    accountLayer2: {
      formularyStatus: 'Internal clinical review underway — no external submissions accepted until complete.',
      buyingCycleStage: 'Review began 4 months ago. Expected to conclude in 14–18 months.',
      competitivePosition: 'No dominant incumbent — emerging category for them.',
      internalChampion: 'Senior nurse consultant exists but has limited influence over review timeline',
      trapLabel: 'The trap: large patient base + no incumbent + a contact in place = looks greenfield',
      loTaught: 'Winnable ≠ needful. Real need, but the decision gate is too far out.',
    },
  },

  // ── SCREEN 5a–5c: Wrong-choice consequence slides ──
  {
    id: 'sim-1-consequence-northgate',
    section: 'ACCOUNT SELECTION',
    type: 'accountConsequence',
    consequenceAccountKey: 'northgate',
    consequenceTitle: 'Northgate would cost you three months',
    consequenceNarrative: 'You\'d find an interested registrar with no committee influence, a locked formulary cycle, and an incumbent who has been in place for four years. Three months of relationship-building before you can even submit.',
    consequenceMissedSignal: 'Formulary activity and decision timing. Volume means nothing if the submission window is closed.',
    consequenceRedirect: 'Look again — which account has an active process happening right now?',
    heading: 'Wrong Account',
    tealWord: 'Wrong',
  },

  {
    id: 'sim-1-consequence-halcyon',
    section: 'ACCOUNT SELECTION',
    type: 'accountConsequence',
    consequenceAccountKey: 'halcyon',
    consequenceTitle: 'Halcyon is a relationship, not an account',
    consequenceNarrative: 'Your rheumatologist contact is genuinely warm and prescribing would be straightforward. But 95 patients and no formulary process means this never scales. You\'d win one prescriber, not an account.',
    consequenceMissedSignal: 'Formulary influence and scalability. Accessibility is not the same as strategic fit.',
    consequenceRedirect: 'Look again — which account gives you a pathway to a formulary listing?',
    heading: 'Wrong Account',
    tealWord: 'Wrong',
  },

  {
    id: 'sim-1-consequence-mossbrook',
    section: 'ACCOUNT SELECTION',
    type: 'accountConsequence',
    consequenceAccountKey: 'mossbrook',
    consequenceTitle: 'Mossbrook is a 2027 opportunity, not a 2024 one',
    consequenceNarrative: 'The patient base is large and there\'s no entrenched competitor — genuinely attractive on paper. But the clinical review gate means no external submission is even possible for 14–18 months. You\'d be investing now for a return you can\'t accelerate.',
    consequenceMissedSignal: 'Buying cycle stage. An open need with a closed decision process is not an active opportunity.',
    consequenceRedirect: 'Look again — which account has a decision process that\'s open and moving right now?',
    heading: 'Wrong Account',
    tealWord: 'Wrong',
  },

  // ── SCREEN 6: Correct account confirmed ──
  {
    id: 'sim-1-confirmed',
    section: 'ACCOUNT SELECTION',
    type: 'sceneSet',
    heading: 'Redwell Regional is your priority account.',
    tealWord: 'priority',
    sceneNarrative: 'Active formulary review. Vulnerable incumbent. An internal champion already pushing for change. No existing relationship — but the door is open.',
    sceneContext: 'Now the real work begins: figuring out who actually makes this decision and how to reach them.',
  },

  // ── SCREEN 7: Stakeholder context reset ──
  {
    id: 'sim-1-stakeholder-intro',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'sceneSet',
    heading: 'You\'ve got 90 days. And you don\'t know anyone here.',
    tealWord: '90',
    sceneNarrative: 'Active formulary review. Vulnerable incumbent. An internal champion already on your side — in theory. But you have no existing relationships at Redwell.',
    sceneContext: 'A colleague covering an adjacent territory has given you four names. That\'s all you have.',
  },

  // ── SCREEN 8: Stakeholder overview grid ──
  {
    id: 'sim-1-stakeholders',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'stakeholderGrid',
    heading: 'Four contacts. Who actually matters?',
    tealWord: 'actually',
    body: 'Tap each person to learn more before making any decisions.',
    stakeholders: [
      {
        key: 'okafor',
        name: 'Dr. Sarah Okafor',
        role: 'Lead Rheumatologist',
        behaviouralSignal: 'Dr. Okafor has been pushing for a biologic option for her patients for over six months. She\'s running out of patience.',
        isHidden: false,
      },
      {
        key: 'dillon',
        name: 'Mark Dillon',
        role: 'Pharmacy Director',
        behaviouralSignal: 'Mark was brief on the phone. \'Send me something in writing\' was all he said.',
        isHidden: false,
      },
      {
        key: 'bates',
        name: 'Claire Bates',
        role: 'Business Manager',
        behaviouralSignal: 'Claire manages contracts across three sites. She\'s been here eight years and knows where every process bottleneck lives.',
        isHidden: false,
      },
      {
        key: 'wu',
        name: 'Dr. James Wu',
        role: 'Junior Consultant',
        behaviouralSignal: 'James is enthusiastic. He\'s already read your product monograph and has questions.',
        isHidden: false,
      },
    ],
  },

  // ── SCREEN 9a–9d: Stakeholder dossiers ──
  {
    id: 'sim-1-dossier-okafor',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'stakeholderDossier',
    stakeholderKey: 'okafor',
    heading: 'Dr. Sarah Okafor — Lead Rheumatologist',
    tealWord: 'Rheumatologist',
    stakeholderLayer1: {
      behaviouralSignal: 'Dr. Okafor has been pushing for a biologic option for her patients for over six months. She\'s running out of patience.',
    },
    stakeholderLayer2: {
      roleReality: 'Clinical lead. Shapes the clinical case for the formulary submission but doesn\'t control the submission process itself.',
      explicitNeed: 'A biologic therapy with strong efficacy data for moderate-to-severe RA.',
      emergingNeed: 'Credibility with her pharmacy director — she needs to bring him a business case, not just a clinical argument.',
      relationshipDynamic: 'Highly respected internally. Her recommendation carries weight — but only if Dillon backs it.',
    },
  },

  {
    id: 'sim-1-dossier-dillon',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'stakeholderDossier',
    stakeholderKey: 'dillon',
    heading: 'Mark Dillon — Pharmacy Director',
    tealWord: 'Director',
    stakeholderLayer1: {
      behaviouralSignal: 'Mark was brief on the phone. \'Send me something in writing\' was all he said.',
    },
    stakeholderLayer2: {
      roleReality: 'Controls the formulary submission process. Nothing gets to the committee without his sign-off.',
      explicitNeed: 'Cost-effectiveness data and a clean submission that won\'t slow down the review.',
      emergingNeed: 'Under pressure from trust finance to reduce formulary spend — he needs to justify any addition, not just approve it.',
      relationshipDynamic: 'Sceptical of reps. Responds to evidence, not relationships. A blocker if not engaged correctly.',
    },
  },

  {
    id: 'sim-1-dossier-bates',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'stakeholderDossier',
    stakeholderKey: 'bates',
    heading: 'Claire Bates — Business Manager',
    tealWord: 'Manager',
    stakeholderLayer1: {
      behaviouralSignal: 'Claire manages contracts across three sites. She\'s been here eight years and knows where every process bottleneck lives.',
    },
    stakeholderLayer2: {
      roleReality: 'Procurement gatekeeper. Manages supplier onboarding and contract terms — influential on timeline, not on clinical decision.',
      explicitNeed: 'A smooth procurement process with no compliance surprises.',
      emergingNeed: 'Recognition as a strategic contributor, not just an administrator.',
      relationshipDynamic: 'Neutral. Process-oriented. Won\'t block you if you respect the process.',
    },
  },

  {
    id: 'sim-1-dossier-wu',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'stakeholderDossier',
    stakeholderKey: 'wu',
    heading: 'Dr. James Wu — Junior Consultant',
    tealWord: 'Consultant',
    stakeholderLayer1: {
      behaviouralSignal: 'James is enthusiastic. He\'s already read your product monograph and has questions.',
    },
    stakeholderLayer2: {
      roleReality: 'No committee seat, no budget authority. High access, low impact.',
      explicitNeed: 'Clinical validation — wants to feel confident recommending the therapy to senior colleagues.',
      emergingNeed: 'Wants to be seen as a credible voice in the department.',
      relationshipDynamic: 'Positive and accessible — useful as an intelligence source, not an engagement target.',
      hiddenSignal: 'James mentioned he usually checks his thinking with Helen Marsh, the senior nursing lead, before raising anything with Dr. Okafor. \'She\'s been here longer than any of us,\' he said.',
    },
  },

  // ── SCREEN 10: Hidden stakeholder reveal (conditional) ──
  {
    id: 'sim-1-hidden-reveal',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'hiddenReveal',
    heading: 'James mentioned someone you weren\'t expecting.',
    tealWord: 'expecting',
    body: 'A fifth name appears in your list.',
    isHiddenStakeholder: true,
    stakeholderKey: 'marsh',
    stakeholderLayer1: {
      behaviouralSignal: 'Helen has worked alongside Dr. Okafor for eleven years. She\'s not on any committee — but she\'s in every important conversation.',
    },
    stakeholderLayer2: {
      roleReality: 'No formal authority. Enormous informal influence. Dr. Okafor trusts her clinical judgement above almost anyone.',
      explicitNeed: 'Evidence that the therapy is safe and manageable for nursing administration.',
      emergingNeed: 'Wants to be consulted, not informed after the fact — being overlooked by reps is a recurring frustration.',
      relationshipDynamic: 'Positive if approached respectfully. A powerful quiet ally if engaged early.',
    },
  },

  // ── SCREEN 11: Classification task ──
  {
    id: 'sim-1-classification',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'classificationTask',
    heading: 'Map who actually holds the power.',
    tealWord: 'power',
    classificationInstructions: 'Place each stakeholder on both matrices. Then add one line explaining why you placed them there. You cannot proceed until all stakeholders are placed and annotated.',
  },

  // ── SCREEN 12: Engagement sequence ──
  {
    id: 'sim-1-engagement',
    section: 'STAKEHOLDER DIAGNOSIS',
    type: 'engagementSequence',
    heading: 'You can\'t approach everyone at once. Who goes first?',
    tealWord: 'first',
    engagementInstructions: 'Rank your top three contacts in order. For each, complete the sentence: \'I\'m approaching [name] first / second / third because...\' You cannot proceed until all three are ranked and justified.',
  },

  // ── SCREEN 13: Expert reveal + debrief ──
  {
    id: 'sim-1-expert',
    section: 'THE DEBRIEF',
    type: 'expertReveal',
    heading: 'Here\'s how an expert reads this account.',
    tealWord: 'expert',
    expertPowerMatrix: [
      { stakeholderId: 'okafor', formalAuthority: 70, realInfluence: 75, impact: 80, attitude: 85, expertAnnotation: 'High formal authority AND high real influence. Your primary clinical ally — but she needs Dillon\'s backing to move.' },
      { stakeholderId: 'dillon', formalAuthority: 85, realInfluence: 90, impact: 90, attitude: 25, expertAnnotation: 'Highest formal authority in the process. Sceptical. The critical conversion target — without him nothing moves.', commonMisplacement: 'Often underestimated on real influence. His scepticism reads as low power, but he controls the gate.' },
      { stakeholderId: 'bates', formalAuthority: 50, realInfluence: 40, impact: 45, attitude: 60, expertAnnotation: 'Medium impact. Process-oriented. Won\'t block you — but can slow you on timeline if not kept informed.' },
      { stakeholderId: 'wu', formalAuthority: 20, realInfluence: 15, impact: 20, attitude: 90, expertAnnotation: 'Low formal authority, low real influence. Valuable intelligence source — not an engagement target.', commonMisplacement: 'Frequently over-invested in because of accessibility. High enthusiasm ≠ high impact.' },
      { stakeholderId: 'marsh', formalAuthority: 15, realInfluence: 80, impact: 75, attitude: 70, expertAnnotation: 'No formal authority — very high real influence. Okafor\'s primary sounding board. The non-obvious priority.', commonMisplacement: 'Invisible to learners who skip Wu. The most important person who isn\'t on any list.' },
    ],
    expertSequence: [
      { rank: 1, stakeholderId: 'marsh', reasoning: 'Reach Helen Marsh before Dr. Okafor. She shapes Okafor\'s thinking — if Helen is on your side, your first Okafor meeting starts with implicit endorsement.' },
      { rank: 2, stakeholderId: 'okafor', reasoning: 'With Marsh\'s informal backing, Dr. Okafor\'s enthusiasm becomes a strategic asset. Equip her with the business case she needs to bring Dillon.' },
      { rank: 3, stakeholderId: 'dillon', reasoning: 'Approach Dillon with evidence and a co-authored clinical case, not a cold call. He responds to data — not relationships. Arrive prepared.' },
    ],
    expertDebriefFoundHelen: 'You found Helen Marsh — most reps don\'t on first pass. That\'s the insight that changes your approach to Dr. Okafor entirely. Here\'s how the expert engagement sequence flows from here.',
    expertDebriefMissedHelen: 'Your map is missing one stakeholder. Helen Marsh, senior nursing lead, is Dr. Okafor\'s primary clinical sounding board. She wasn\'t on any list — but James Wu would have told you. Going back to probe low-authority contacts before making decisions is a habit worth building. Here\'s what the expert map looks like with Helen included.',
  },
];

const OBJECTIVE_1_SIMULATION: ObjectiveContent = {
  objectiveId: 1,
  title: 'LO1 Decision Simulation: Account Selection & Stakeholder Diagnosis',
  totalSlides: LO1_SIMULATION_A_SLIDES.length,
  estimatedMinutes: 30,
  slides: LO1_SIMULATION_A_SLIDES,
};

// ─── Content Registry ───

export const ELEARNING_CONTENT: Record<number, ObjectiveContent> = {
  1: OBJECTIVE_1_CONTENT,
  // Objectives 2-6 content will be added as they are developed
};

export const SIMULATION_CONTENT: Record<number, ObjectiveContent> = {
  1: OBJECTIVE_1_SIMULATION,
};
