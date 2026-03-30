import { useRef, useCallback, useState, useMemo } from 'react';
import type { ConversationState } from '../types/voiceSimulation';
import { updateSessionState } from '../lib/voiceSimulationApi';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface GeminiSessionOptions {
  sessionId: string;
  wsUrl: string;
  onAiTurnComplete: (text: string) => void;
  onUserTurnComplete: (text: string) => void;
  onAiInterim: (text: string) => void;
  onUserInterim: (text: string) => void;
  onAiSpeakingChange: (speaking: boolean) => void;
  onStateUpdate: (state: ConversationState) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onError: (message: string) => void;
}

// Audio encoding constants
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const CHUNK_SIZE = 4096; // Samples per audio chunk sent to server

/**
 * Manages a WebSocket connection to the voice simulation server,
 * which relays audio to/from Google Gemini 3.1 Flash Live API.
 *
 * Replaces the previous WebRTC-based useRealtimeSession hook.
 * Audio is captured via AudioWorklet, encoded as base64 PCM Int16,
 * and sent over WebSocket. Received audio is decoded and played
 * through an AudioContext.
 */
export function useGeminiLiveSession() {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlaybackTime = useRef(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const speakerMutedRef = useRef(false);
  const gainNodeRef = useRef<GainNode | null>(null);

  const connect = useCallback(async (options: GeminiSessionOptions) => {
    options.onStatusChange('connecting');

    // ─── 1. Get microphone ───
    let localStream: MediaStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: INPUT_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } catch {
      options.onError(
        'Microphone access is required for the voice simulation. ' +
        'Please allow microphone access in your browser settings and try again.'
      );
      options.onStatusChange('error');
      return;
    }
    localStreamRef.current = localStream;

    // ─── 2. Set up audio capture (mic → PCM Int16 → base64 → WebSocket) ───
    const audioContext = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(localStream);

    // Use ScriptProcessorNode for broad compatibility (AudioWorklet preferred in production)
    const processor = audioContext.createScriptProcessor(CHUNK_SIZE, 1, 1);
    workletNodeRef.current = processor;

    let wsReady = false;

    processor.onaudioprocess = (event) => {
      if (!wsReady || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const inputData = event.inputBuffer.getChannelData(0);
      // Convert Float32 [-1, 1] to Int16 [-32768, 32767]
      const int16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Base64 encode
      const bytes = new Uint8Array(int16.buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      wsRef.current.send(JSON.stringify({ type: 'audio_input', data: base64 }));
    };

    source.connect(processor);
    processor.connect(audioContext.destination); // Required for ScriptProcessor to fire

    // ─── 3. Set up audio playback (WebSocket → base64 → PCM Float32 → speaker) ───
    const playbackContext = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
    playbackContextRef.current = playbackContext;
    nextPlaybackTime.current = 0;

    const gainNode = playbackContext.createGain();
    gainNode.gain.value = 1.0;
    gainNode.connect(playbackContext.destination);
    gainNodeRef.current = gainNode;

    // ─── 4. Open WebSocket to server ───
    const ws = new WebSocket(options.wsUrl);
    wsRef.current = ws;

    // Mutable state for message handling (closure-local)
    let aiTranscriptBuffer = '';

    ws.onopen = () => {
      console.log('[GeminiSession] WebSocket connected to server');
      // Don't set 'connected' yet — wait for setup_complete from Gemini
    };

    ws.onerror = () => {
      options.onError('Voice connection error. Please check your connection and try again.');
      options.onStatusChange('error');
    };

    ws.onclose = () => {
      console.log('[GeminiSession] WebSocket closed');
      options.onStatusChange('disconnected');
    };

    ws.onmessage = (event) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(event.data as string);
      } catch {
        return;
      }

      const type = msg.type as string;

      switch (type) {
        case 'setup_complete': {
          console.log('[GeminiSession] Gemini setup complete');
          wsReady = true;
          options.onStatusChange('connected');
          break;
        }

        case 'audio_output': {
          // Decode base64 PCM 24kHz Int16 and schedule playback
          if (speakerMutedRef.current) break;
          const base64Audio = msg.data as string;
          playAudioChunk(base64Audio, playbackContext, gainNode);
          break;
        }

        case 'transcript_input': {
          // User's speech transcribed by Gemini
          const text = msg.text as string;
          const isFinal = msg.is_final as boolean;
          if (isFinal && text.trim()) {
            options.onUserInterim('');
            options.onUserTurnComplete(text.trim());
          } else if (text) {
            options.onUserInterim(text);
          }
          break;
        }

        case 'transcript_output': {
          // AI's speech transcribed
          const text = msg.text as string;
          const isFinal = msg.is_final as boolean;
          if (isFinal && text.trim()) {
            options.onAiTurnComplete(text.trim());
            aiTranscriptBuffer = '';
            options.onAiInterim('');
          } else if (text) {
            aiTranscriptBuffer = text;
            options.onAiInterim(text);
          }
          break;
        }

        case 'ai_speaking': {
          options.onAiSpeakingChange(msg.speaking as boolean);
          break;
        }

        case 'tool_call': {
          const callId = msg.id as string;
          const name = msg.name as string;
          const args = msg.args as Record<string, unknown>;

          console.log('[GeminiSession] Tool call:', name);

          if (name === 'update_conversation_state') {
            const state = args as unknown as ConversationState;
            options.onStateUpdate(state);
            updateSessionState(options.sessionId, state).catch(console.error);

            // Send tool response back
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'tool_response',
                id: callId,
                name,
                result: { ok: true },
              }));
            }
          }
          break;
        }

        case 'turn_complete': {
          // AI finished its turn
          if (aiTranscriptBuffer.trim()) {
            options.onAiTurnComplete(aiTranscriptBuffer.trim());
            aiTranscriptBuffer = '';
            options.onAiInterim('');
          }
          options.onAiSpeakingChange(false);
          break;
        }

        case 'interrupted': {
          // User interrupted AI speech
          aiTranscriptBuffer = '';
          options.onAiInterim('');
          options.onAiSpeakingChange(false);
          break;
        }

        case 'error': {
          console.error('[GeminiSession] Server error:', msg.message);
          options.onError(msg.message as string);
          break;
        }
      }
    };
  }, []);

  /** Toggle microphone mute. */
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  }, []);

  /** Toggle speaker output. */
  const toggleSpeaker = useCallback(() => {
    const newMuted = !speakerMutedRef.current;
    speakerMutedRef.current = newMuted;
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newMuted ? 0 : 1;
    }
    setIsSpeakerOff(newMuted);
  }, []);

  /** Trigger a natural AI goodbye before disconnecting. */
  const requestGoodbye = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'request_goodbye' }));
  }, []);

  /** Immediately disconnect and clean up all resources. */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(() => {});
      playbackContextRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    gainNodeRef.current = null;
    nextPlaybackTime.current = 0;
  }, []);

  return useMemo(() => ({
    connect,
    disconnect,
    toggleMute,
    toggleSpeaker,
    requestGoodbye,
    isMuted,
    isSpeakerOff,
  }), [connect, disconnect, toggleMute, toggleSpeaker, requestGoodbye, isMuted, isSpeakerOff]);
}

// ─── Audio playback helper ───

/**
 * Decodes a base64-encoded PCM Int16 chunk and schedules it for
 * gapless playback through the AudioContext.
 */
function playAudioChunk(
  base64: string,
  context: AudioContext,
  destination: AudioNode,
): void {
  // Decode base64 → Uint8Array → Int16Array
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);

  // Convert Int16 to Float32
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }

  // Create AudioBuffer and schedule playback
  const buffer = context.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
  buffer.copyToChannel(float32, 0);

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(destination);
  source.start();
}
