import WebSocket from 'ws';

/**
 * Session config stored in memory when voice-config is requested,
 * consumed when the browser WebSocket connects.
 */
export interface PendingSession {
  sessionId: string;
  systemPrompt: string;
  tools: GeminiFunctionDeclaration[];
  voiceId: string;
  createdAt: number;
}

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

// In-memory store for pending sessions (consumed on WebSocket connect)
const pendingSessions = new Map<string, PendingSession>();
// TTL: 60 seconds — if browser doesn't connect within 60s, session config is dropped
const SESSION_TTL_MS = 60_000;

export function storePendingSession(session: PendingSession): void {
  pendingSessions.set(session.sessionId, session);
  // Auto-cleanup after TTL
  setTimeout(() => {
    pendingSessions.delete(session.sessionId);
  }, SESSION_TTL_MS);
}

/**
 * Custom protocol between browser and this server.
 *
 * Browser → Server:
 *   { type: "audio_input", data: "<base64 PCM 16kHz 16bit>" }
 *   { type: "tool_response", id: "<call_id>", result: {...} }
 *   { type: "request_goodbye" }
 *
 * Server → Browser:
 *   { type: "setup_complete" }
 *   { type: "audio_output", data: "<base64 PCM 24kHz 16bit>" }
 *   { type: "transcript_input", text: "...", is_final: boolean }
 *   { type: "transcript_output", text: "...", is_final: boolean }
 *   { type: "tool_call", id: "<call_id>", name: "...", args: {...} }
 *   { type: "turn_complete" }
 *   { type: "interrupted" }
 *   { type: "ai_speaking", speaking: boolean }
 *   { type: "error", message: "..." }
 */

const GEMINI_WS_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const GEMINI_MODEL = 'gemini-3.1-flash-live-preview';

/**
 * Handles an incoming browser WebSocket by creating and managing
 * a corresponding Gemini Live API WebSocket connection.
 */
export function handleVoiceWebSocket(browserWs: WebSocket, sessionId: string): void {
  const session = pendingSessions.get(sessionId);
  if (!session) {
    browserWs.send(JSON.stringify({ type: 'error', message: 'Session not found or expired. Please try again.' }));
    browserWs.close();
    return;
  }
  pendingSessions.delete(sessionId);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    browserWs.send(JSON.stringify({ type: 'error', message: 'Gemini API key not configured on server.' }));
    browserWs.close();
    return;
  }

  // ─── Open WebSocket to Gemini Live API ───
  const geminiUrl = `${GEMINI_WS_BASE}?key=${apiKey}`;
  const geminiWs = new WebSocket(geminiUrl);

  let setupComplete = false;
  let aiTranscriptBuffer = '';

  geminiWs.on('open', () => {
    console.log(`[GeminiLive] Connected to Gemini for session ${sessionId}`);

    // Send setup message with model config, system instruction, tools, and voice
    const setupMessage = {
      setup: {
        model: `models/${GEMINI_MODEL}`,
        systemInstruction: {
          parts: [{ text: session.systemPrompt }],
        },
        tools: session.tools.length > 0 ? [{
          functionDeclarations: session.tools,
        }] : undefined,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: session.voiceId,
              },
            },
          },
        },
        // VAD is enabled by default — Gemini handles turn-taking automatically
      },
    };

    geminiWs.send(JSON.stringify(setupMessage));
  });

  geminiWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // ─── Setup complete ───
      if (msg.setupComplete) {
        setupComplete = true;
        console.log(`[GeminiLive] Setup complete for session ${sessionId}`);
        sendToBrowser({ type: 'setup_complete' });

        // Trigger the AI's opening line
        geminiWs.send(JSON.stringify({
          realtimeInput: {
            text: '[Call connected. Begin with your opening line.]',
          },
        }));
        return;
      }

      // ─── Server content (audio + transcription) ───
      if (msg.serverContent) {
        const content = msg.serverContent;

        // Model turn complete (turnComplete or generationComplete)
        if (content.turnComplete || content.generationComplete) {
          // Flush any buffered transcript
          if (aiTranscriptBuffer.trim()) {
            sendToBrowser({ type: 'transcript_output', text: aiTranscriptBuffer.trim(), is_final: true });
            aiTranscriptBuffer = '';
          }
          sendToBrowser({ type: 'turn_complete' });
          sendToBrowser({ type: 'ai_speaking', speaking: false });
          return;
        }

        // Interrupted
        if (content.interrupted) {
          aiTranscriptBuffer = '';
          sendToBrowser({ type: 'interrupted' });
          sendToBrowser({ type: 'ai_speaking', speaking: false });
          return;
        }

        // Process parts
        if (content.modelTurn?.parts) {
          for (const part of content.modelTurn.parts) {
            // Audio output
            if (part.inlineData?.mimeType?.startsWith('audio/')) {
              sendToBrowser({ type: 'ai_speaking', speaking: true });
              sendToBrowser({ type: 'audio_output', data: part.inlineData.data });
            }

            // Text transcript from model (output transcription)
            if (part.text) {
              aiTranscriptBuffer += part.text;
              sendToBrowser({ type: 'transcript_output', text: aiTranscriptBuffer, is_final: false });
            }
          }
        }

        // Input transcription (what the user said)
        if (content.inputTranscription?.text) {
          sendToBrowser({
            type: 'transcript_input',
            text: content.inputTranscription.text,
            is_final: content.inputTranscription.isFinal ?? false,
          });
        }

        // Output transcription (what the AI said — from Gemini's transcription service)
        if (content.outputTranscription?.text) {
          sendToBrowser({
            type: 'transcript_output',
            text: content.outputTranscription.text,
            is_final: content.outputTranscription.isFinal ?? false,
          });
        }

        return;
      }

      // ─── Tool call ───
      if (msg.toolCall) {
        for (const fc of msg.toolCall.functionCalls || []) {
          console.log(`[GeminiLive] Tool call: ${fc.name}`);
          sendToBrowser({
            type: 'tool_call',
            id: fc.id,
            name: fc.name,
            args: fc.args || {},
          });
        }
        return;
      }

      // ─── Tool call cancellation ───
      if (msg.toolCallCancellation) {
        console.log(`[GeminiLive] Tool call cancelled`);
        return;
      }

    } catch (err) {
      console.error('[GeminiLive] Failed to parse Gemini message:', err);
    }
  });

  geminiWs.on('error', (err) => {
    console.error(`[GeminiLive] Gemini WebSocket error:`, err.message);
    sendToBrowser({ type: 'error', message: 'Voice service connection error.' });
  });

  geminiWs.on('close', (code, reason) => {
    console.log(`[GeminiLive] Gemini WebSocket closed: ${code} ${reason.toString()}`);
    if (browserWs.readyState === WebSocket.OPEN) {
      browserWs.close();
    }
  });

  // ─── Handle messages from browser ───
  browserWs.on('message', (data) => {
    if (!setupComplete) return;

    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'audio_input': {
          // Forward audio to Gemini as realtime input
          geminiWs.send(JSON.stringify({
            realtimeInput: {
              audio: {
                mimeType: 'audio/pcm;rate=16000',
                data: msg.data,
              },
            },
          }));
          break;
        }

        case 'tool_response': {
          // Forward function call result to Gemini
          geminiWs.send(JSON.stringify({
            toolResponse: {
              functionResponses: [{
                id: msg.id,
                name: msg.name,
                response: msg.result,
              }],
            },
          }));
          break;
        }

        case 'request_goodbye': {
          // Send a text message asking the AI to wrap up naturally
          geminiWs.send(JSON.stringify({
            realtimeInput: {
              text: '[The caller has indicated they need to end the call. Deliver a brief, natural goodbye — one or two sentences maximum.]',
            },
          }));
          break;
        }

        default:
          console.warn(`[GeminiLive] Unknown browser message type: ${msg.type}`);
      }
    } catch (err) {
      console.error('[GeminiLive] Failed to parse browser message:', err);
    }
  });

  browserWs.on('close', () => {
    console.log(`[GeminiLive] Browser disconnected for session ${sessionId}`);
    if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
      geminiWs.close();
    }
  });

  browserWs.on('error', (err) => {
    console.error(`[GeminiLive] Browser WebSocket error:`, err.message);
    if (geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.close();
    }
  });

  // ─── Helper ───
  function sendToBrowser(msg: Record<string, unknown>): void {
    if (browserWs.readyState === WebSocket.OPEN) {
      browserWs.send(JSON.stringify(msg));
    }
  }
}
