// ─── Pharma Sales Learning Objectives ───
// 6 objectives focused on pharmaceutical/life sciences sales capability.
// Each has 3 formats: A (Decision Simulation), B (Voice Simulation), C (Build & Apply).

export interface FormatPhase {
  format: 'A' | 'B' | 'C';
  label: string;
  icon: string;
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface LearningObjective {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  /** Shown at the first expansion level */
  overview: string;
  /** Shown at the second expansion level */
  breakdown: {
    whatYouWillLearn: string[];
    frameworks: string[];
    realWorldApplication: string;
  };
  /** Shown at the third expansion level ("Learn more") */
  deepDive: {
    whyThisMatters: string;
    commonMistakes: string[];
    successIndicators: string[];
    pharmaContext: string;
  };
  estimatedMinutes: number;
  icon: string;
  formats: FormatPhase[];
  scenarioId: string | null; // Links to voice simulation scenario for Format B
}

export interface ObjectiveMeta {
  id: number;
  title: string;
  shortTitle: string;
  tagline: string;
  accentColor: string;
  accentDark: string;
  accentLight: string;
}

export const OBJECTIVE_META: ObjectiveMeta[] = [
  {
    id: 1,
    title: 'Diagnose Before You Sell',
    shortTitle: 'Diagnostic Selling',
    tagline: 'Master the art of understanding before prescribing — the foundation of consultative pharma sales.',
    accentColor: '#38B2AC',
    accentDark: '#2C9A94',
    accentLight: '#E6FFFA',
  },
  {
    id: 2,
    title: 'Build Trust in Low-Touch Environments',
    shortTitle: 'Trust Building',
    tagline: 'Earn credibility with time-poor HCPs and procurement teams who have heard every pitch.',
    accentColor: '#4299E1',
    accentDark: '#3182CE',
    accentLight: '#EBF8FF',
  },
  {
    id: 3,
    title: 'Navigate the Buying Committee',
    shortTitle: 'Stakeholder Navigation',
    tagline: 'Map, influence, and align the complex web of decision-makers in pharma purchasing.',
    accentColor: '#9F7AEA',
    accentDark: '#805AD5',
    accentLight: '#FAF5FF',
  },
  {
    id: 4,
    title: 'Sell on Value, Not Features',
    shortTitle: 'Value Selling',
    tagline: 'Shift from product specs to patient outcomes and economic impact that resonates with healthcare buyers.',
    accentColor: '#ED8936',
    accentDark: '#DD6B20',
    accentLight: '#FFFAF0',
  },
  {
    id: 5,
    title: 'Navigate Complexity and Resistance',
    shortTitle: 'Objection Handling',
    tagline: 'Handle formulary objections, budget freezes, and clinical skepticism with confidence and evidence.',
    accentColor: '#48BB78',
    accentDark: '#38A169',
    accentLight: '#F0FFF4',
  },
  {
    id: 6,
    title: 'Drive Adoption Post-Sale',
    shortTitle: 'Adoption & Growth',
    tagline: 'Ensure your solution is actually used, expanded, and renewed — the real measure of pharma sales success.',
    accentColor: '#FC8181',
    accentDark: '#E53E3E',
    accentLight: '#FFF5F5',
  },
];

export const LEARNING_OBJECTIVES: LearningObjective[] = [
  {
    id: 1,
    title: 'Diagnose Before You Sell',
    subtitle: 'Discovery calls that uncover the real need, not just the stated one',
    description: 'Learn to run diagnostic discovery conversations with HCPs, procurement leads, and hospital administrators. Move beyond surface-level needs to uncover the clinical, operational, and political drivers behind purchasing decisions.',
    overview: 'Most pharma reps lose deals not because their product is wrong, but because they never understood the real problem. This objective teaches you to diagnose before you prescribe — asking the questions that reveal what a hospital, clinic, or health system actually needs versus what they say they need. You will learn the TRICIS trust model, the art of open diagnostic questioning, and how to identify the gap between stated and hidden needs in healthcare settings.',
    breakdown: {
      whatYouWillLearn: [
        'The TRICIS trust-building model adapted for healthcare stakeholders',
        'Open vs. closed questioning techniques for clinical and commercial buyers',
        'How to identify planted traps — stated needs that mask real drivers',
        'Information gate theory — how trust unlocks progressively deeper information',
        'Reading verbal and non-verbal signals during discovery calls',
        'Managing call time and natural closing in healthcare settings',
      ],
      frameworks: [
        'TRICIS Trust Model',
        'Diagnostic Questioning Ladder',
        'Information Gate Framework',
        'Signal Detection Matrix',
      ],
      realWorldApplication: 'Practice running a 15-20 minute discovery call with an AI-powered hospital VP of Operations who has hidden needs, internal politics, and a budget blocker you need to uncover through skilled questioning.',
    },
    deepDive: {
      whyThisMatters: 'In pharma, the average rep gets 3-5 minutes with an HCP and one shot at a procurement meeting. Reps who diagnose first close 2.3x more often than those who lead with product features (Sibelco research, 2024). Healthcare buyers are uniquely resistant to being "sold to" — they respond to people who understand their clinical and operational reality.',
      commonMistakes: [
        'Pitching within the first 2 minutes instead of asking questions',
        'Asking only closed questions that confirm assumptions',
        'Ignoring signals — verbal cues that indicate hidden information',
        'Treating procurement and clinical stakeholders the same way',
        'Not adjusting approach based on the buyer\'s trust level',
      ],
      successIndicators: [
        'Customer volunteers information you did not ask for directly',
        'Trust level increases consistently throughout the conversation',
        'You uncover at least one hidden need the customer did not state upfront',
        'The customer agrees to a follow-up without being pushed',
        'You can articulate the customer\'s real problem in their own language',
      ],
      pharmaContext: 'Pharma buyers — especially hospital procurement committees and formulary boards — operate under intense regulatory and budget pressure. They are skeptical of vendor claims because they have been burned before. The diagnostic approach works because it respects their expertise and positions you as a partner, not a vendor. This is especially critical in markets where KOL influence and clinical evidence drive purchasing decisions.',
    },
    estimatedMinutes: 90,
    icon: '🔍',
    scenarioId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    formats: [
      {
        format: 'A',
        label: 'Decision Simulation',
        icon: '🎯',
        title: 'Hospital Discovery Scenario',
        description: 'Navigate a branching scenario where you make diagnostic decisions during a hospital procurement meeting. Each choice reveals how your approach affects trust and information access.',
        estimatedMinutes: 25,
      },
      {
        format: 'B',
        label: 'Voice Simulation',
        icon: '🎙️',
        title: 'Live Discovery Call',
        description: 'Have a real-time voice conversation with Sarah Chen, VP of Operations at NovaTech Solutions. She has hidden needs, internal politics, and information she will only share if you earn her trust through skilled questioning.',
        estimatedMinutes: 20,
      },
      {
        format: 'C',
        label: 'Build & Apply',
        icon: '📋',
        title: 'Discovery Call Playbook',
        description: 'Create a personalised discovery call playbook for your territory. Map your key accounts\' likely hidden needs, design your questioning strategy, and build a pre-call preparation template.',
        estimatedMinutes: 45,
      },
    ],
  },
  {
    id: 2,
    title: 'Build Trust in Low-Touch Environments',
    subtitle: 'Earning credibility when you only get 5 minutes',
    description: 'Master the techniques for building trust rapidly with time-poor healthcare professionals, procurement officers, and clinical leaders who have limited availability and high skepticism toward pharma reps.',
    overview: 'Healthcare professionals are busier than ever. The average pharma rep gets less than 5 minutes of face time with a prescriber, and procurement teams often limit vendor interactions to formal RFP processes. This objective teaches you how to build genuine trust in compressed timeframes — through preparation, relevance, and clinical credibility rather than charm.',
    breakdown: {
      whatYouWillLearn: [
        'Pre-call intelligence gathering for healthcare accounts',
        'The 90-second credibility opener — leading with clinical relevance',
        'Building trust through clinical evidence, not product claims',
        'Digital-first trust building via email, LinkedIn, and medical portals',
        'Navigating the access hierarchy: MSL, KOL, formulary committee',
        'Following up without being a nuisance',
      ],
      frameworks: [
        'Clinical Relevance Opener',
        'Trust Velocity Model',
        'HCP Access Hierarchy',
        'Digital Engagement Playbook',
      ],
      realWorldApplication: 'Practice crafting a 90-second credibility opener for a skeptical chief pharmacist, then handle the follow-up sequence across multiple channels.',
    },
    deepDive: {
      whyThisMatters: 'Access to HCPs has decreased by 40% since 2019 (IQVIA). Reps who can build trust in fewer interactions outperform those who rely on relationship frequency. In pharma, trust = clinical credibility + genuine understanding of patient outcomes.',
      commonMistakes: [
        'Leading with product information instead of clinical context',
        'Not researching the HCP\'s publication history or clinical interests',
        'Over-contacting without adding value',
        'Treating every HCP interaction as a selling opportunity',
        'Ignoring the digital channel as a trust-building tool',
      ],
      successIndicators: [
        'HCP requests additional clinical data after your first interaction',
        'You receive a response to digital outreach within one week',
        'The HCP introduces you to a colleague or refers you internally',
        'You are invited back for a longer discussion',
      ],
      pharmaContext: 'In markets like oncology and rare disease, KOL relationships can make or break a product launch. Trust in these contexts is built through scientific exchange, not sales pressure. The most effective reps are those who can engage as peer-level scientific partners.',
    },
    estimatedMinutes: 75,
    icon: '🤝',
    scenarioId: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    formats: [
      {
        format: 'A', label: 'Decision Simulation', icon: '🎯',
        title: 'Chief Pharmacist Encounter',
        description: 'Navigate a 5-minute interaction with a skeptical chief pharmacist during a hospital corridor encounter. Every word counts.',
        estimatedMinutes: 20,
      },
      {
        format: 'B', label: 'Voice Simulation', icon: '🎙️',
        title: 'KOL First Meeting',
        description: 'Voice conversation with a key opinion leader who is evaluating whether you are worth their time.',
        estimatedMinutes: 15,
      },
      {
        format: 'C', label: 'Build & Apply', icon: '📋',
        title: 'Trust-Building Sequence',
        description: 'Design a multi-touch trust-building sequence for a priority HCP in your territory.',
        estimatedMinutes: 40,
      },
    ],
  },
  {
    id: 3,
    title: 'Navigate the Buying Committee',
    subtitle: 'Mapping power, influence, and decision dynamics in healthcare',
    description: 'Learn to identify, map, and influence the complex stakeholder networks that drive pharmaceutical purchasing decisions — from formulary committees to P&T boards to hospital C-suite.',
    overview: 'Pharma deals are rarely won by convincing a single person. A hospital formulary decision might involve clinical pharmacists, physicians, administrators, procurement officers, and finance. This objective teaches you to map the full decision landscape, understand each stakeholder\'s priorities, and build aligned support across the committee.',
    breakdown: {
      whatYouWillLearn: [
        'Stakeholder mapping for pharma buying committees',
        'The Power Matrix — influence vs. authority in healthcare',
        'Identifying champions, blockers, and hidden influencers',
        'Aligning clinical and commercial value propositions',
        'Managing the P&T (Pharmacy & Therapeutics) committee process',
        'Coalition building across departments',
      ],
      frameworks: [
        'Power Matrix',
        'Stakeholder Influence Map',
        'COBA Competitive Analysis',
        'P&T Committee Playbook',
      ],
      realWorldApplication: 'Map a real or simulated hospital buying committee, identify the hidden blocker, and design an influence strategy that builds support from the inside.',
    },
    deepDive: {
      whyThisMatters: 'In pharma, the average deal involves 6-8 decision-makers. Reps who map the full committee win 3x more formulary additions than those who rely on a single champion. Understanding the P&T process is essential for any pharma seller.',
      commonMistakes: [
        'Relying on a single champion without building broader support',
        'Ignoring the finance/procurement perspective',
        'Not understanding the P&T committee\'s evaluation criteria',
        'Failing to identify the hidden blocker until it is too late',
        'Treating all stakeholders with the same messaging',
      ],
      successIndicators: [
        'You can name every committee member and their role in the decision',
        'Your champion actively advocates for your solution in internal meetings',
        'You have addressed the blocker\'s concerns before the formal vote',
        'Your value proposition is tailored per stakeholder type',
      ],
      pharmaContext: 'Hospital formulary decisions in the EU and US follow structured P&T processes with clinical evidence requirements, cost-effectiveness thresholds, and therapeutic equivalence reviews. Understanding this process is non-negotiable for pharma sales professionals.',
    },
    estimatedMinutes: 85,
    icon: '🗺️',
    scenarioId: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
    formats: [
      {
        format: 'A', label: 'Decision Simulation', icon: '🎯',
        title: 'Formulary Committee Challenge',
        description: 'Navigate a multi-stakeholder scenario where you must build support across a hospital\'s P&T committee.',
        estimatedMinutes: 30,
      },
      {
        format: 'B', label: 'Voice Simulation', icon: '🎙️',
        title: 'The Hidden Blocker',
        description: 'Voice call with a procurement director who is quietly blocking your formulary submission.',
        estimatedMinutes: 20,
      },
      {
        format: 'C', label: 'Build & Apply', icon: '📋',
        title: 'Stakeholder Map & Strategy',
        description: 'Build a complete stakeholder map and influence strategy for a priority account.',
        estimatedMinutes: 35,
      },
    ],
  },
  {
    id: 4,
    title: 'Sell on Value, Not Features',
    subtitle: 'Translating clinical evidence into business and patient impact',
    description: 'Learn to move beyond product features and clinical data points to articulate the full value story — connecting therapeutic outcomes to operational efficiency, patient quality of life, and health economic impact.',
    overview: 'Healthcare buyers don\'t buy products. They buy outcomes — better patient results, reduced readmissions, lower total cost of care, improved clinical workflow. This objective teaches you to translate your product\'s clinical profile into a compelling value narrative that resonates with each stakeholder type.',
    breakdown: {
      whatYouWillLearn: [
        'Health economics and outcomes research (HEOR) basics for sales reps',
        'Translating clinical trial data into real-world impact stories',
        'Building value propositions for clinical, operational, and financial buyers',
        'The value story framework: Patient → Provider → Payer → System',
        'Using real-world evidence (RWE) in sales conversations',
        'Handling "your competitor is cheaper" with value framing',
      ],
      frameworks: [
        'Value Story Framework',
        'Patient-Provider-Payer-System Model',
        'HEOR Translation Toolkit',
        'Competitive Value Differentiation',
      ],
      realWorldApplication: 'Build a complete value proposition for your product that connects clinical evidence to patient outcomes, provider efficiency, payer economics, and health system impact.',
    },
    deepDive: {
      whyThisMatters: 'Pharma pricing pressure is intensifying globally. NICE, HAS, and IQWiG are demanding stronger economic evidence. Reps who can articulate value beyond clinical efficacy are essential for market access and formulary retention.',
      commonMistakes: [
        'Leading with clinical data without connecting it to outcomes',
        'Using the same value proposition for clinicians and procurement',
        'Ignoring the health economic angle',
        'Competing on price instead of reframing the value discussion',
        'Not leveraging real-world evidence and post-market data',
      ],
      successIndicators: [
        'Stakeholders describe your product using value language, not features',
        'You win formulary inclusion despite higher unit cost',
        'Your value proposition is referenced in internal business cases',
        'You can articulate ROI in the buyer\'s own metrics',
      ],
      pharmaContext: 'With the rise of value-based contracts and outcomes-based pricing in pharma, the ability to sell on value is no longer optional. HTA bodies and payer negotiators expect reps to speak their language — QALYs, ICERs, and budget impact models.',
    },
    estimatedMinutes: 80,
    icon: '💎',
    scenarioId: 'd4e5f6a7-b8c9-0123-defa-456789012345',
    formats: [
      {
        format: 'A', label: 'Decision Simulation', icon: '🎯',
        title: 'The Price Objection',
        description: 'Navigate a scenario where a payer challenges your pricing with competitor comparisons.',
        estimatedMinutes: 25,
      },
      {
        format: 'B', label: 'Voice Simulation', icon: '🎙️',
        title: 'Health Economics Conversation',
        description: 'Voice call with a hospital finance director who only cares about budget impact.',
        estimatedMinutes: 20,
      },
      {
        format: 'C', label: 'Build & Apply', icon: '📋',
        title: 'Value Proposition Builder',
        description: 'Create a multi-stakeholder value proposition document for your primary product.',
        estimatedMinutes: 35,
      },
    ],
  },
  {
    id: 5,
    title: 'Navigate Complexity and Resistance',
    subtitle: 'Handling objections, budget freezes, and clinical skepticism',
    description: 'Develop the resilience and technique to handle the toughest pharma sales objections — from formulary rejections and budget constraints to clinical skepticism and competitive displacement.',
    overview: 'Resistance is part of pharma sales. Formulary committees say no. Budgets get frozen. Clinicians question your evidence. Competitors undercut your price. This objective teaches you to anticipate, prepare for, and navigate these challenges with confidence, evidence, and strategic patience.',
    breakdown: {
      whatYouWillLearn: [
        'The objection taxonomy — clinical, financial, operational, political',
        'Reframing techniques for budget and pricing objections',
        'Handling clinical skepticism with evidence-based responses',
        'The "losing well" strategy — maintaining relationships after a rejection',
        'Competitive displacement defence techniques',
        'Managing formulary appeal processes',
      ],
      frameworks: [
        'Objection Taxonomy Matrix',
        'Evidence-Based Reframing',
        'Competitive Defence Playbook',
        'Formulary Appeal Process',
      ],
      realWorldApplication: 'Handle a simulated formulary rejection and build an appeal strategy that addresses clinical, economic, and political objections.',
    },
    deepDive: {
      whyThisMatters: 'The average pharma product faces 2-3 formulary rejections before acceptance. Reps who handle rejection strategically (rather than emotionally) are 4x more likely to achieve eventual formulary inclusion.',
      commonMistakes: [
        'Taking objections personally instead of analytically',
        'Responding to price objections with discounts instead of value',
        'Arguing with clinical skepticism instead of acknowledging it',
        'Giving up after the first rejection',
        'Not preparing for competitive counter-arguments',
      ],
      successIndicators: [
        'You can categorise any objection within 10 seconds',
        'Rejected proposals lead to a clear next step rather than a dead end',
        'Clinical skeptics agree to review additional evidence',
        'You maintain relationships through rejection cycles',
      ],
      pharmaContext: 'In markets with biosimilar competition and increasing generic pressure, the ability to defend your position on value rather than price is critical. Formulary committees appreciate reps who respond to rejection with data and professionalism.',
    },
    estimatedMinutes: 85,
    icon: '🛡️',
    scenarioId: 'e5f6a7b8-c9d0-1234-efab-567890123456',
    formats: [
      {
        format: 'A', label: 'Decision Simulation', icon: '🎯',
        title: 'The Formulary Rejection',
        description: 'Your product was rejected from the formulary. Navigate the appeal process.',
        estimatedMinutes: 30,
      },
      {
        format: 'B', label: 'Voice Simulation', icon: '🎙️',
        title: 'The Skeptical Clinician',
        description: 'Voice call with a physician who doesn\'t believe your clinical evidence is strong enough.',
        estimatedMinutes: 20,
      },
      {
        format: 'C', label: 'Build & Apply', icon: '📋',
        title: 'Objection Handling Playbook',
        description: 'Build a comprehensive objection handling playbook for your product\'s top 10 objections.',
        estimatedMinutes: 35,
      },
    ],
  },
  {
    id: 6,
    title: 'Drive Adoption Post-Sale',
    subtitle: 'Ensuring your solution is used, expanded, and renewed',
    description: 'Learn the account management skills that turn a formulary win into sustained usage, expanded indications, and long-term partnership — the true measure of pharma sales success.',
    overview: 'Getting on the formulary is only half the battle. The real challenge is driving adoption among prescribers, ensuring clinical uptake, managing supply and access issues, and expanding into new indications or patient populations. This objective teaches you to think like an account manager, not just a seller.',
    breakdown: {
      whatYouWillLearn: [
        'Post-formulary adoption planning and execution',
        'Prescriber activation strategies and clinical inertia management',
        'Share of voice and share of wallet analytics',
        'Managing supply chain and access barriers',
        'Expanding into new indications and patient populations',
        'Building the case for contract renewal and price defence',
      ],
      frameworks: [
        'Adoption Acceleration Model',
        'Prescriber Activation Ladder',
        'Account Growth Matrix',
        'Renewal Defence Playbook',
      ],
      realWorldApplication: 'Design a 90-day post-formulary adoption plan for a real or simulated hospital account, including prescriber activation, clinical education, and usage monitoring.',
    },
    deepDive: {
      whyThisMatters: 'Industry data shows that 35% of formulary wins result in less than 20% of expected prescribing volume. The gap between formulary inclusion and actual adoption is where most pharma revenue is lost.',
      commonMistakes: [
        'Celebrating the formulary win and moving on to new accounts',
        'Not tracking adoption metrics post-listing',
        'Ignoring clinical inertia — doctors defaulting to habitual prescribing',
        'Failing to train hospital pharmacy and nursing staff',
        'Not building the renewal case from day one',
      ],
      successIndicators: [
        'Prescribing volume reaches >60% of target within 90 days',
        'Hospital staff can explain your product\'s value without your help',
        'The account proactively requests additional stock or expanded access',
        'Contract renewal discussions start positively',
      ],
      pharmaContext: 'In specialty pharma and hospital markets, adoption is driven by clinical champions, pharmacy workflow integration, and ongoing medical education. The most successful reps treat adoption as a structured project, not an afterthought.',
    },
    estimatedMinutes: 80,
    icon: '📈',
    scenarioId: 'f6a7b8c9-d0e1-2345-fabc-678901234567',
    formats: [
      {
        format: 'A', label: 'Decision Simulation', icon: '🎯',
        title: 'The Adoption Gap',
        description: 'Your product is on the formulary but barely being prescribed. Diagnose and fix the adoption gap.',
        estimatedMinutes: 25,
      },
      {
        format: 'B', label: 'Voice Simulation', icon: '🎙️',
        title: 'The Disengaged Champion',
        description: 'Voice call with a previously supportive physician who has stopped prescribing your product.',
        estimatedMinutes: 20,
      },
      {
        format: 'C', label: 'Build & Apply', icon: '📋',
        title: '90-Day Adoption Plan',
        description: 'Create a detailed post-formulary adoption plan for your priority hospital account.',
        estimatedMinutes: 35,
      },
    ],
  },
];
