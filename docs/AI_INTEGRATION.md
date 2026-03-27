# AI Integration

## Architecture Pattern

Every AI-powered feature follows the same modular pattern:

```
hooks/useXxxApi.ts              — React hook managing API calls, loading, error, cooldown
constants/xxxSystemPrompt.ts    — System prompt for the AI model
```

The hook handles: request construction, rate limiting (client-side cooldown), timeout management, response parsing, error states. The system prompt is a pure string export, kept separate so it can be iterated on independently.

## AI Features

### 1. Sales Coach (AI Customer Conversation — Format B)

**Hook:** `useSalesCoachApi.ts`
**System Prompt:** `constants/salesCoachSystemPrompt.ts`
**Endpoint:** `POST /api/sales-coach`
**Purpose:** Simulates a customer conversation. The AI plays a realistic buyer persona based on the objective's context (industry, role, buying stage, personality type). The user practises their sales approach in real-time dialogue.

**Input:**
```ts
{
  objectiveId: number
  scenarioId: string          // Which scenario template
  conversationHistory: Message[]
  userMessage: string
  userProfile: { role, industry, seniority }
}
```

**Output:**
```ts
{
  response: string            // AI's in-character reply
  internalNotes?: string      // Hidden coaching notes (shown post-conversation)
}
```

**Post-Conversation Feedback:**
```ts
{
  overallScore: 'S' | 'A' | 'B' | 'C' | 'R'
  strengths: string[]
  missedOpportunities: string[]
  recommendations: string[]
  frameworksUsed: string[]    // Which sales frameworks the user applied
  frameworksMissed: string[]  // Which they could have applied
}
```

**Rate Limit:** 5s cooldown between messages. 90s timeout per response.

### 2. Decision Simulation (Format A)

**Hook:** `useDecisionSimulationApi.ts`
**System Prompt:** `constants/decisionSimulationSystemPrompt.ts`
**Endpoint:** `POST /api/decision-simulation`
**Purpose:** Generates structured sales scenarios with decision points. Unlike Format B (live conversation), this is a branching narrative with pre-generated paths. AI generates the scenario; the user navigates choices.

**Input:**
```ts
{
  objectiveId: number
  difficulty: 'foundation' | 'intermediate' | 'advanced'
  userProfile: { role, industry, seniority }
  context?: string            // Optional: specific situation to simulate
}
```

**Output:**
```ts
{
  scenario: {
    title: string
    clientProfile: { name, company, role, industry, challenge }
    situation: string
    stages: Stage[]           // Each stage has a prompt + 3-4 choices + consequences
  }
  debrief: {
    optimalPath: string[]
    frameworksRelevant: string[]
    keyInsight: string
  }
}
```

**Rate Limit:** 8s cooldown. 60s timeout.

### 3. Pathway Generator

**Hook:** `usePathwayApi.ts`
**System Prompt:** `constants/pathwaySystemPrompt.ts`
**Endpoint:** `POST /api/generate-pathway`
**Purpose:** Creates personalised learning plan from onboarding survey responses. Determines which objectives to assign, at what depth, with custom project briefs.

**Input:**
```ts
{
  profile: {
    role: string
    function: string
    seniority: string
    industry: string
    salesExperience: string
    primaryChallenge: string
    goalDescription: string
    availability: string
  }
}
```

**Output:**
```ts
{
  pathwaySummary: string
  totalEstimatedWeeks: number
  assignedObjectives: number[]     // e.g., [1, 2, 3, 5]
  objectives: {
    [id: number]: {
      depth: 'full' | 'fast-track' | 'awareness' | 'skip'
      title: string
      description: string
      projectBrief: string
      deliverable: string
      challengeConnection: string  // How this connects to their stated challenge
      resources: string[]
    }
  }
}
```

**Rate Limit:** 8s cooldown. 60s timeout.

### 4. Project Evaluator

**Hook:** `useProjectEvaluatorApi.ts`
**System Prompt:** `constants/projectEvaluatorSystemPrompt.ts`
**Endpoint:** `POST /api/evaluate-project`
**Purpose:** AI review of Format C project submissions. Scores the submission and provides structured feedback.

**Input:**
```ts
{
  objectiveId: number
  projectBrief: string          // From learning plan
  userResponse: string          // User's submission text
  screenshotUrls?: string[]     // Optional evidence
}
```

**Output:**
```ts
{
  score: 'S' | 'A' | 'B' | 'C' | 'R'
  summary: string
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  frameworkApplication: string  // How well they applied relevant frameworks
}
```

**Rate Limit:** 8s cooldown. 90s timeout.

### 5. Artefact Generator

**Hook:** `useArtefactGeneratorApi.ts`
**System Prompt:** `constants/artefactGeneratorSystemPrompt.ts`
**Endpoint:** `POST /api/generate-artefact`
**Purpose:** Helps users build sales artefacts (COBA analysis, power matrix, objection guide, account plan, stakeholder map). AI scaffolds the structure; user fills in their specific context.

**Input:**
```ts
{
  artefactType: string          // 'coba_analysis', 'power_matrix', etc.
  objectiveId: number
  userInput: string             // Description of their account/situation
  existingContent?: any         // If refining an existing artefact
}
```

**Output:**
```ts
{
  content: any                  // Type-specific structured content
  suggestions: string[]         // How to strengthen it
  refinementQuestions: string[] // Follow-up questions to improve quality
}
```

**Rate Limit:** 8s cooldown. 60s timeout.

## System Prompt Design Principles

1. **Role clarity** — Every prompt starts with a clear role definition: "You are a [specific role] helping a sales professional..."
2. **Framework grounding** — Reference specific sales frameworks from the knowledge base (TRICIS, COBA, Power Matrix, Five Selling Strategies) in the prompt so the AI applies them naturally
3. **Output structure** — Always specify exact JSON output schema in the prompt
4. **Guardrails** — Include: what NOT to do (don't break character in Format B, don't give scores above B for superficial submissions), length limits, tone guidelines
5. **Context injection** — User profile data (role, industry, seniority) injected into prompts to personalise responses
6. **Difficulty scaling** — Prompts include difficulty modifiers based on user's progress and seniority

## Error Handling Pattern

Every hook follows this state machine:

```
idle → loading → success | error
                    ↓         ↓
                  (data)  (retry available after cooldown)
```

```ts
interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  cooldownRemaining: number  // seconds until next request allowed
}
```

Client shows:
- **Loading:** Skeleton pulse animation in the output area
- **Error:** User-friendly message + retry button (enabled after cooldown)
- **Timeout:** "This is taking longer than expected. You can wait or try again."
- **Rate limited:** "Please wait X seconds before trying again."
