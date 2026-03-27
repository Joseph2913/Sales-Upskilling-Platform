# API Design

## Edge Functions
Supabase Edge Functions (Deno) for AI endpoints. Vercel Edge Functions as fallback for high-performance routes.

## Endpoint Naming
```
POST /api/sales-coach         — AI customer conversation
POST /api/decision-simulation — Generate simulation scenario
POST /api/generate-pathway    — Create personalised learning plan from survey
POST /api/evaluate-project    — AI review of project submission
POST /api/generate-artefact   — Generate sales artefact (COBA, power matrix, etc.)
```

## Request Shape
```ts
{
  userId: string
  orgId: string
  input: { ... }         // Feature-specific payload
  context?: { ... }      // Optional: objective, format, prior conversation
}
```

## Response Shape
```ts
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { code: string, message: string } }
```

## Error Handling
- Always return structured errors, never raw exception messages
- Common codes: `RATE_LIMITED`, `INVALID_INPUT`, `AI_TIMEOUT`, `UNAUTHORIZED`, `NOT_FOUND`
- Client-side: every API hook must handle loading, error, and success states
- Show user-friendly error messages — never expose AI model errors or stack traces

## Rate Limiting
- Per-tool cooldowns: 5s for lightweight endpoints, 8s for AI generation
- Timeouts: 45s for simple AI calls, 90s for complex generation (pathway, evaluation)
- Client enforces cooldown via hook state; server enforces via rate limit middleware

## AI Calls
- System prompt loaded from `constants/xxxSystemPrompt.ts`
- User input validated before sending to AI
- Response parsed and validated against expected schema before returning to client
- Temperature, max_tokens, and model specified per endpoint — never use defaults
