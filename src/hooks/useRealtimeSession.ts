import { useRef, useCallback, useState, useMemo } from 'react';
import type { ConversationState } from '../types/voiceSimulation';
import { updateSessionState } from '../lib/voiceSimulationApi';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface RealtimeSessionOptions {
  sessionId: string;
  ephemeralToken: string;
  onAiTurnComplete: (text: string) => void;
  onUserTurnComplete: (text: string) => void;
  /** Live AI transcript delta — text so far for the current AI turn. */
  onAiInterim: (text: string) => void;
  /** Live user transcript delta — interim text from Web Speech API. */
  onUserInterim: (text: string) => void;
  onAiSpeakingChange: (speaking: boolean) => void;
  onStateUpdate: (state: ConversationState) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onError: (message: string) => void;
}

/**
 * Manages the WebRTC peer connection to OpenAI's Realtime API.
 * Audio streams directly between the browser and OpenAI — no backend hop.
 *
 * This hook mirrors the exact pattern from the working bare-HTML test page.
 * All event handling uses closure-captured variables (dc, pc, audioEl)
 * rather than React refs to avoid stale reference issues.
 */
// TypeScript declaration for Web Speech API (not in all type libs)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export function useRealtimeSession() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);

  const connect = useCallback(async (options: RealtimeSessionOptions) => {
    options.onStatusChange('connecting');

    // ─── 1. Get microphone ───
    let localStream: MediaStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      options.onError(
        'Microphone access is required for the voice simulation. ' +
        'Please allow microphone access in your browser settings and try again.'
      );
      options.onStatusChange('error');
      return;
    }
    localStreamRef.current = localStream;

    // ─── 2. Create peer connection ───
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // ─── 3. Set up remote audio playback ───
    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    document.body.appendChild(audioEl);
    audioElRef.current = audioEl;

    pc.ontrack = (event) => {
      console.log('[Realtime] Remote audio track received');
      audioEl.srcObject = event.streams[0];
      audioEl.play().catch((err) =>
        console.warn('[Realtime] Audio play blocked:', err)
      );
    };

    // ─── 4. Add local audio track ───
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // ─── 5. Create data channel and set up ALL event handling ───
    // CRITICAL: all handlers use the closure-captured `dc` variable directly,
    // NOT dcRef.current. This avoids stale ref issues in React.
    const dc = pc.createDataChannel('oai-events');
    dcRef.current = dc;

    // Mutable state for the message handler (closure-local, not React state)
    let aiTranscriptBuffer = '';
    let userSpokeThisCycle = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingFnCalls: { callId: string; args: string }[] = [];

    dc.onopen = () => {
      console.log('[Realtime] Data channel OPEN');
      options.onStatusChange('connected');
      // Don't send response.create here — wait for session.created
    };

    dc.onerror = () => {
      options.onError('Voice connection data channel error.');
      options.onStatusChange('error');
    };

    dc.onmessage = (msgEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let evt: any;
      try {
        evt = JSON.parse(msgEvent.data);
      } catch {
        return;
      }

      const type = evt.type as string;

      // Log non-delta events
      if (!type.includes('.delta')) {
        console.log('[Realtime]', type);
      }

      // ─── Session ready → trigger opening line ───
      if (type === 'session.created') {
        console.log('[Realtime] Session ready — sending response.create');
        dc.send(JSON.stringify({ type: 'response.create' }));
        return;
      }

      // ─── User speech detected by VAD ───
      if (type === 'input_audio_buffer.speech_started') {
        console.log('[Realtime] User speech detected');
        userSpokeThisCycle = true;
        return;
      }

      // ─── AI audio transcript (live streaming) ───
      if (type === 'response.audio_transcript.delta') {
        aiTranscriptBuffer += (evt.delta ?? '');
        // Emit live interim transcript so UI can show it as AI speaks
        options.onAiInterim(aiTranscriptBuffer);
        return;
      }

      if (type === 'response.audio_transcript.done') {
        const text = ((evt.transcript as string) ?? aiTranscriptBuffer).trim();
        console.log('[Realtime] >>> AI said:', text.substring(0, 100));
        if (text) {
          options.onAiTurnComplete(text);
        }
        aiTranscriptBuffer = '';
        options.onAiInterim(''); // Clear the interim display
        return;
      }

      // ─── User transcript (final from Whisper — replaces interim) ───
      if (type === 'conversation.item.input_audio_transcription.completed') {
        const text = ((evt.transcript as string) ?? '').trim();
        console.log('[Realtime] >>> User said:', text.substring(0, 100));
        if (text) {
          options.onUserInterim(''); // Clear interim — final is authoritative
          options.onUserTurnComplete(text);
        }
        return;
      }

      // ─── Speaking indicators ───
      if (type === 'response.created' || type === 'output_audio_buffer.started') {
        options.onAiSpeakingChange(true);
        return;
      }
      if (type === 'output_audio_buffer.stopped') {
        options.onAiSpeakingChange(false);
        return;
      }

      // ─── Function calls: queue until response.done ───
      if (type === 'response.function_call_arguments.done') {
        const name = evt.name as string;
        console.log('[Realtime] Function call queued:', name);
        if (name === 'update_conversation_state') {
          pendingFnCalls.push({ callId: evt.call_id, args: evt.arguments });
        }
        return;
      }

      // ─── Response done ───
      if (type === 'response.done') {
        console.log('[Realtime] >>> Response DONE');

        // Flush any remaining buffered transcript
        if (aiTranscriptBuffer.trim()) {
          console.log('[Realtime] Flushing buffered transcript');
          options.onAiTurnComplete(aiTranscriptBuffer.trim());
          aiTranscriptBuffer = '';
        }
        options.onAiSpeakingChange(false);

        // Process queued function calls NOW (after response is fully done)
        while (pendingFnCalls.length > 0) {
          const call = pendingFnCalls.shift()!;
          try {
            const state = JSON.parse(call.args) as ConversationState;
            console.log('[Realtime] State:', state.conversation_phase, 'trust:', state.trust_level);
            options.onStateUpdate(state);
            updateSessionState(options.sessionId, state).catch(console.error);

            // Send function output via dc directly (not through ref)
            dc.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: call.callId,
                output: '{"ok":true}',
              },
            }));
          } catch (err) {
            console.error('[Realtime] Failed to process function call:', err);
          }
        }

        // Only send response.create if the user actually spoke this cycle
        if (userSpokeThisCycle) {
          console.log('[Realtime] User spoke — sending response.create');
          userSpokeThisCycle = false;
          dc.send(JSON.stringify({ type: 'response.create' }));
        }
        return;
      }

      // ─── Errors ───
      if (type === 'error') {
        console.error('[Realtime] API error:', evt.error);
        return;
      }
    };

    // ─── 6. Start Web Speech API for live user transcription ───
    // This runs alongside the WebRTC connection. It provides real-time
    // interim transcripts while the user speaks. The final authoritative
    // transcript comes from Whisper via the Realtime API.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (!result.isFinal) {
              interim += result[0].transcript;
            }
          }
          if (interim) {
            options.onUserInterim(interim);
          }
        };

        recognition.onend = () => {
          // Restart if the connection is still active (Speech API auto-stops)
          if (pcRef.current && pcRef.current.connectionState === 'connected') {
            try { recognition.start(); } catch { /* already started */ }
          }
        };

        recognition.onerror = (event: Event & { error?: string }) => {
          // 'no-speech' and 'aborted' are normal — just restart
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('[SpeechRec] Error:', event.error);
          }
        };

        recognition.start();
        speechRecRef.current = recognition;
        console.log('[SpeechRec] Web Speech API started for live user transcription');
      } else {
        console.warn('[SpeechRec] Web Speech API not available in this browser');
      }
    } catch (err) {
      console.warn('[SpeechRec] Failed to start:', err);
    }

    // ─── 7. SDP exchange ───
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${options.ephemeralToken}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text();
        throw new Error(`SDP exchange failed: ${sdpResponse.status} ${errText}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      console.log('[Realtime] WebRTC connection established');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to establish voice connection';
      options.onError(message);
      options.onStatusChange('error');
    }
  }, []);

  /** Toggle microphone mute (FR19, AC10). */
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  }, []);

  /** Toggle speaker (FR20, AC11). */
  const toggleSpeaker = useCallback(() => {
    const audioEl = audioElRef.current;
    if (audioEl) {
      audioEl.muted = !audioEl.muted;
      setIsSpeakerOff(audioEl.muted);
    }
  }, []);

  /** Trigger a natural AI goodbye before disconnecting (FR18). */
  const requestGoodbye = useCallback(() => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') return;
    dc.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: '[The caller has indicated they need to end the call. Deliver a brief, natural goodbye — one or two sentences maximum.]'
        }],
      },
    }));
    dc.send(JSON.stringify({ type: 'response.create' }));
  }, []);

  /** Immediately disconnect and clean up. */
  const disconnect = useCallback(() => {
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.srcObject = null;
      audioElRef.current.remove();
      audioElRef.current = null;
    }
    // Stop Web Speech API
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch { /* already stopped */ }
      speechRecRef.current = null;
    }
  }, []);

  // Return a STABLE object reference. Without useMemo, a new object is created
  // every render, which causes useEffect cleanup deps to fire and disconnect.
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
