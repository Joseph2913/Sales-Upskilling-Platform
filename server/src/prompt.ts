/**
 * Assembles the full system prompt from the scenario's four components.
 * This runs entirely server-side — the assembled prompt never reaches the frontend.
 */
export function assembleSystemPrompt(scenario: {
  persona: string;
  hidden_brief: string;
  response_rules: string;
  system_prompt_template: string;
}): string {
  const persona = JSON.parse(scenario.persona);
  const hiddenBrief = JSON.parse(scenario.hidden_brief);
  const responseRules = JSON.parse(scenario.response_rules);

  let prompt = scenario.system_prompt_template;

  // Replace persona placeholders
  prompt = prompt.replace('{{persona_name}}', persona.name);
  prompt = prompt.replace('{{persona_title}}', persona.title);
  prompt = prompt.replace('{{company_name}}', persona.company);
  prompt = prompt.replace('{{personality_traits}}', persona.personality_traits.join(', '));
  prompt = prompt.replace('{{communication_style}}', persona.communication_style);
  prompt = prompt.replace('{{busyness_level}}', String(persona.busyness_level));
  prompt = prompt.replace('{{emotional_tone}}', persona.default_emotional_tone);

  // Replace hidden brief — serialise the full object so the AI has access to all gates/signals
  prompt = prompt.replace('{{hidden_brief}}', JSON.stringify(hiddenBrief, null, 2));

  // Replace response rules
  prompt = prompt.replace('{{response_rules}}', JSON.stringify(responseRules, null, 2));

  return prompt;
}

/**
 * Returns the function definition for update_conversation_state,
 * configured for OpenAI Realtime API function calling.
 */
export function getConversationStateFunctionDef() {
  return {
    name: 'update_conversation_state',
    type: 'function' as const,
    description: 'Call this function after processing each user turn to track conversation dynamics. This helps maintain context about trust levels, information revealed, and the user\'s selling approach.',
    parameters: {
      type: 'object',
      properties: {
        trust_level: {
          type: 'integer',
          description: 'Current trust level from 1-10. Starts at 3. Increases with diagnostic questions and active listening, decreases with pitching or assumptions.',
          minimum: 1,
          maximum: 10
        },
        information_gates_unlocked: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of gate IDs that have been revealed (e.g., "gate_erp_replacement", "gate_acquisition", "gate_budget_blocker")'
        },
        pitch_count: {
          type: 'integer',
          description: 'Number of times the user has pitched rather than diagnosed',
          minimum: 0
        },
        signals_dropped: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of signal IDs the customer gave that the user missed or did not probe'
        },
        signals_picked_up: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of signal IDs the user correctly identified or probed further'
        },
        conversation_phase: {
          type: 'string',
          enum: ['opening', 'rapport_building', 'discovery', 'deepening', 'closing'],
          description: 'Current phase of the conversation'
        },
        notes: {
          type: 'string',
          description: 'Free text observations about the user\'s approach, technique, and areas of strength or weakness'
        }
      },
      required: [
        'trust_level',
        'information_gates_unlocked',
        'pitch_count',
        'signals_dropped',
        'signals_picked_up',
        'conversation_phase',
        'notes'
      ]
    }
  };
}

/**
 * Returns the function definition for update_conversation_state,
 * formatted for Google Gemini Live API function calling.
 * Gemini uses uppercase type names and no 'type: function' wrapper.
 */
export function getGeminiConversationStateFunctionDef() {
  return {
    name: 'update_conversation_state',
    description: 'Call this function after processing each user turn to track conversation dynamics. This helps maintain context about trust levels, information revealed, and the user\'s selling approach.',
    parameters: {
      type: 'OBJECT',
      properties: {
        trust_level: {
          type: 'INTEGER',
          description: 'Current trust level from 1-10. Starts at 3. Increases with diagnostic questions and active listening, decreases with pitching or assumptions.',
        },
        information_gates_unlocked: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Array of gate IDs that have been revealed (e.g., "gate_erp_replacement", "gate_acquisition", "gate_budget_blocker")',
        },
        pitch_count: {
          type: 'INTEGER',
          description: 'Number of times the user has pitched rather than diagnosed',
        },
        signals_dropped: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Array of signal IDs the customer gave that the user missed or did not probe',
        },
        signals_picked_up: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Array of signal IDs the user correctly identified or probed further',
        },
        conversation_phase: {
          type: 'STRING',
          enum: ['opening', 'rapport_building', 'discovery', 'deepening', 'closing'],
          description: 'Current phase of the conversation',
        },
        user_emotional_state: {
          type: 'STRING',
          enum: ['confident', 'hesitant', 'frustrated', 'engaged', 'nervous', 'relaxed'],
          description: 'Detected emotional state of the caller based on vocal tone, pace, and word choice',
        },
        user_confidence_level: {
          type: 'INTEGER',
          description: 'How confident the caller sounds from 1-10 (1=very uncertain, 10=very assertive)',
        },
        silence_events: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              timestamp_approx: { type: 'STRING', description: 'Approximate time in the conversation' },
              caller_waited: { type: 'BOOLEAN', description: 'Did the caller wait for you to continue, or did they fill the silence?' },
              context: { type: 'STRING', description: 'What was happening when the silence occurred' },
            },
          },
          description: 'Track moments of deliberate silence and whether the caller handled them well',
        },
        notes: {
          type: 'STRING',
          description: 'Free text observations about the user\'s approach, technique, and areas of strength or weakness',
        },
      },
      required: [
        'trust_level',
        'information_gates_unlocked',
        'pitch_count',
        'signals_dropped',
        'signals_picked_up',
        'conversation_phase',
        'user_emotional_state',
        'user_confidence_level',
        'notes',
      ],
    },
  };
}
