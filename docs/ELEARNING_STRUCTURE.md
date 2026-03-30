# E-Learning Content Structure

## Content Architecture

This document defines how e-learning content is structured, authored, and rendered across the platform. It adapts the proven AI Upskilling platform's content framework for pharma sales capability development.

## Three-Phase Completion Model

Every learning objective uses a sequential three-phase model. Each phase must be completed before the next unlocks.

| Phase | Label | Format | Description |
|-------|-------|--------|-------------|
| A | Decision Simulation | Interactive branching scenario | Navigate pharma sales situations by making choices at key decision points. AI-generated scenarios based on the objective's frameworks. |
| B | Voice Simulation | Live AI conversation | Real-time voice conversation with an AI customer persona. Fully dynamic — no pre-scripted paths. Uses OpenAI Realtime API via WebRTC. |
| C | Build & Apply | Artefact creation + project | Create a real sales artefact (playbook, stakeholder map, value proposition) and submit for AI review. |

## Slide-Based E-Learning (Phase A — Decision Simulation)

Phase A content is structured as a sequence of slides rendered in a fixed-height player. Each slide has a type that determines its visual layout and interaction model.

### Content Registry

Content is stored in `src/constants/elearningContent.ts` and keyed by objective ID:

```typescript
const ELEARNING_CONTENT: Record<number, ObjectiveContent> = {
  1: { ... }, // Objective 1: Diagnose Before You Sell
  2: { ... }, // Objective 2: Build Trust in Low-Touch Environments
  ...
};
```

### Slide Data Structure

```typescript
interface SlideData {
  id: string;                    // Unique slide ID (e.g., "1-intro")
  section: string;               // Section name: "THE REALITY", "THE GAP", "THE TECHNIQUE", "IN PRACTICE", "WRAP UP"
  type: SlideType;               // Determines rendering component
  heading: string;               // Main heading text
  tealWord?: string;             // Word in heading to underline in teal
  subheading?: string;           // Secondary heading
  body?: string;                 // Body copy (max 3 sentences)
  stats?: StatData;              // Evidence data with visual type
  scenario?: ScenarioData;       // Interactive scenario with options
  personas?: PersonaData[];      // Predict-first persona cards
  frameworks?: FrameworkItem[];  // Framework component cards
  takeaway?: string;             // Single-sentence takeaway
  objectives?: string[];         // Learning objectives (intro slide only)
}
```

### Slide Types

| Type | Purpose | Section | Pharma Adaptation |
|------|---------|---------|-------------------|
| `courseIntro` | Hook + objectives | — | "In pharma, the average rep gets 3-5 minutes with an HCP..." |
| `evidenceHero` | Hero statistic | THE REALITY | Industry stats from IQVIA, Veeva, ZS Associates |
| `chart` | Data visualisation | THE REALITY | Pharma-specific metrics (formulary success rates, HCP access trends) |
| `tensionStatement` | Knowledge gap framing | THE GAP | "Here's what most reps haven't been shown about diagnostic selling..." |
| `concept` | Framework introduction | THE TECHNIQUE | TRICIS model, Power Matrix, HEOR Translation adapted for pharma |
| `contextBar` | Multi-component framework | THE TECHNIQUE | Framework components as cards with pharma examples |
| `scenarioComparison` | Before/after contrast | THE TECHNIQUE | Same HCP interaction with and without the technique |
| `situationalJudgment` | 3-option scenario | IN PRACTICE | Realistic pharma scenarios (P&T committee, KOL meeting, formulary appeal) |
| `buildAPrompt` | Interactive assembly | IN PRACTICE | Build a diagnostic questioning sequence |
| `flipcard` | Predict-first reveal | THE TECHNIQUE | Predict HCP response before seeing the outcome |
| `moduleSummary` | Framework recap | WRAP UP | Component grid + approach comparison |
| `reflection` | Open-ended questions | WRAP UP | Application to learner's own territory/accounts |

### Five-Beat Narrative Arc (Mandatory)

Every objective's Phase A content follows this narrative structure:

```
Beat 1: SITUATION (Evidence-Led Opening)
  "75% of HCPs report vendor fatigue from feature-led pitches" (IQVIA, 2024)
  → Establish relevance with pharma-specific evidence

Beat 2: TENSION (Knowledge Gap)
  "Here's what most reps haven't been shown about..."
  → Name what's missing, not what's broken

Beat 3: CONCEPT (Framework)
  Introduce the objective's core framework
  → Always include alternative approaches & situational judgment

Beat 4: CONTRAST (Technique in Action)
  Show same pharma scenario with vs. without technique
  → Both states represent genuine first attempts

Beat 5: BRIDGE (Theory to Practice)
  Templates, decision aids for real pharma work
  → Transition to Voice Simulation (Phase B) and Build & Apply (Phase C)
```

### Pharma Content Rules

1. **Always pharma-specific**: Every scenario, example, and framework must reflect pharma/life sciences sales contexts
2. **HCP-centered**: Scenarios involve real healthcare stakeholders: physicians, pharmacists, procurement officers, P&T committees, hospital administrators
3. **Evidence-based**: Statistics from IQVIA, Veeva, ZS Associates, McKinsey Healthcare, Deloitte Life Sciences
4. **Regulatory awareness**: Content respects compliance boundaries — no off-label promotion scenarios
5. **Multi-market**: Examples should work across US, EU, and APAC pharma markets
6. **Clinical credibility**: Scenarios test clinical evidence articulation, not just sales technique

### Content Quality Checklist

- [ ] Every slide has a clear learning purpose (no filler)
- [ ] Evidence slides cite named, reputable pharma industry sources
- [ ] Scenarios involve realistic pharma stakeholders and situations
- [ ] Frameworks are presented as tools, not rules
- [ ] Before/after comparisons use genuine first attempts (not strawmen)
- [ ] Interactive elements test application, not recall
- [ ] Tone is confident but not prescriptive
- [ ] No function-specific jargon without context
- [ ] Reflection questions connect to the learner's actual accounts/territory

## Voice Simulation (Phase B)

See @docs/VOICE_SIMULATION.md for the full framework specification, including scenario schema, browser protocol, conversation state tracking, and content authoring rules.

Phase B is a framework-based system powered by Gemini 3.1 Flash Live. Adding a new voice scenario requires only a database row — no new components or code. Each scenario is defined by:
- Persona definition (personality, communication style, busyness level, Gemini HD voice)
- Hidden brief (buying stage, stakeholder map, information gates, planted traps, signals)
- Response rules (trust dynamics, adaptive difficulty, strategic silence, pitching deflection, call time management)
- Conversation state tracking via Gemini function calling (trust level, signals, emotional intelligence)

## Build & Apply (Phase C)

Phase C content is defined by project briefs stored in the learning plan:
- Personalised brief connecting the objective to the learner's stated challenge
- AI-assisted artefact builder (scaffolds structure, learner fills context)
- Submission for AI review (S/A/B/C/R scoring)
- Artefact types: stakeholder maps, objection playbooks, value propositions, account plans

## Content by Objective

### Objective 1: Diagnose Before You Sell
- **Phase A**: 12 slides covering TRICIS trust model, diagnostic questioning, information gates, signal detection
- **Phase B**: Sarah Chen scenario (VP Operations, NovaTech Solutions) — trust-gated discovery call
- **Phase C**: Discovery call playbook for learner's territory

### Objective 2: Build Trust in Low-Touch Environments
- **Phase A**: 10 slides covering clinical relevance openers, trust velocity, HCP access hierarchy
- **Phase B**: Skeptical chief pharmacist encounter
- **Phase C**: Multi-touch trust-building sequence design

### Objective 3: Navigate the Buying Committee
- **Phase A**: 12 slides covering Power Matrix, stakeholder influence mapping, P&T committee process
- **Phase B**: Hidden blocker procurement director call
- **Phase C**: Complete stakeholder map and influence strategy

### Objective 4: Sell on Value, Not Features
- **Phase A**: 10 slides covering HEOR basics, value story framework, Patient-Provider-Payer-System model
- **Phase B**: Hospital finance director focused on budget impact
- **Phase C**: Multi-stakeholder value proposition document

### Objective 5: Navigate Complexity and Resistance
- **Phase A**: 12 slides covering objection taxonomy, evidence-based reframing, competitive defence
- **Phase B**: Skeptical clinician questioning clinical evidence
- **Phase C**: Top 10 objection handling playbook

### Objective 6: Drive Adoption Post-Sale
- **Phase A**: 10 slides covering adoption acceleration, prescriber activation, account growth
- **Phase B**: Disengaged champion physician call
- **Phase C**: 90-day post-formulary adoption plan
