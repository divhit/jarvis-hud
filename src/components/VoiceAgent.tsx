'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Conversation } from '@elevenlabs/client';
import { useJarvisStore } from '@/stores/jarvisStore';
import { useWakeWord } from '@/hooks/useWakeWord';

type ConversationStatus = 'disconnected' | 'connecting' | 'connected';

/**
 * Intercept WebSocket to handle client_tool_call messages directly.
 *
 * VoiceConversation in @elevenlabs/client has a bug where clientTools
 * handlers never fire in the browser (works in Node.js with TextConversation).
 * This interceptor catches tool calls at the WebSocket level and responds
 * before the SDK's broken handler can timeout.
 */
function installToolInterceptor(
  clientTools: Record<string, (params: Record<string, unknown>) => string | Promise<string>>
) {
  const OriginalWebSocket = window.WebSocket;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PatchedWebSocket = function (this: WebSocket, url: string | URL, protocols?: string | string[]) {
    const ws = new OriginalWebSocket(url, protocols);
    const urlStr = typeof url === 'string' ? url : url.toString();

    // Only intercept ElevenLabs ConvAI WebSocket
    if (urlStr.includes('elevenlabs.io') && urlStr.includes('convai')) {
      const origSend = ws.send.bind(ws);

      ws.addEventListener('message', async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'client_tool_call' && data.client_tool_call) {
            const { tool_name, tool_call_id, parameters } = data.client_tool_call;
            console.log('[JARVIS] Intercepted tool call:', tool_name, parameters);

            if (clientTools[tool_name]) {
              try {
                const result = await Promise.resolve(clientTools[tool_name](parameters || {}));
                const resultStr = typeof result === 'object' ? JSON.stringify(result) : String(result);

                origSend(JSON.stringify({
                  type: 'client_tool_result',
                  tool_call_id,
                  result: resultStr,
                  is_error: false,
                }));
                console.log('[JARVIS] Tool result sent:', resultStr.substring(0, 100));
              } catch (err) {
                origSend(JSON.stringify({
                  type: 'client_tool_result',
                  tool_call_id,
                  result: `Error: ${err instanceof Error ? err.message : String(err)}`,
                  is_error: true,
                }));
              }
            }
          }
        } catch {
          // Not JSON or not a tool call — ignore
        }
      });
    }

    return ws;
  } as unknown as typeof WebSocket;

  // Copy prototype so instanceof checks work
  Object.setPrototypeOf(PatchedWebSocket, OriginalWebSocket);
  PatchedWebSocket.prototype = OriginalWebSocket.prototype;

  window.WebSocket = PatchedWebSocket;

  // Return cleanup function
  return () => {
    window.WebSocket = OriginalWebSocket;
  };
}

export default function VoiceAgent() {
  const addTranscript = useJarvisStore((s) => s.addTranscript);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [status, setStatus] = useState<ConversationStatus>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const conversationRef = useRef<Conversation | null>(null);
  const cleanupInterceptorRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      conversationRef.current?.endSession();
      cleanupInterceptorRef.current?.();
    };
  }, []);

  // Keyboard shortcuts for testing panel focus (1-5 keys)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = { '1': 'clock', '2': 'system', '3': 'weather', '4': 'markets', '5': 'inbox' };
      const panel = map[e.key];
      if (panel) {
        console.log('[JARVIS] Keyboard focus:', panel);
        useJarvisStore.getState().focusPanel(panel);
        addTranscript('jarvis', `[DEBUG] Panel focused: ${panel}`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addTranscript]);

  // Client tool handlers — these execute in-browser when the ElevenLabs agent calls them
  const clientToolHandlers: Record<string, (params: Record<string, unknown>) => string> = {
    show_panel: (parameters) => {
      const panelId = String(parameters?.panel_id || 'system');
      console.log('[JARVIS] show_panel executed:', panelId);

      useJarvisStore.getState().addTranscript('jarvis', `[HUD] Focusing panel: ${panelId.toUpperCase()}`);
      useJarvisStore.getState().focusPanel(panelId);

      // Fire-and-forget data refresh
      const store = useJarvisStore.getState();
      const refreshMap: Record<string, () => Promise<void>> = {
        weather: store.fetchWeather,
        markets: store.fetchMarkets,
        system: store.fetchSystem,
        inbox: store.fetchInbox,
      };
      refreshMap[panelId]?.().catch(() => {});

      return `Panel ${panelId} is now displayed on the holographic HUD with live data.`;
    },

    show_notification: (parameters) => {
      const message = String(parameters?.message || '');
      const level = String(parameters?.level || 'info') as 'info' | 'success' | 'warning' | 'error';
      console.log('[JARVIS] show_notification:', level, message);

      useJarvisStore.getState().showNotification(message, level);

      return `Notification displayed: ${message}`;
    },
  };

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        addTranscript('jarvis', 'Agent configuration missing. Cannot establish voice link.');
        return;
      }

      setWakeWordEnabled(false);
      setStatus('connecting');

      // Install WebSocket interceptor BEFORE creating the conversation
      // This catches client_tool_call messages that VoiceConversation fails to handle
      cleanupInterceptorRef.current?.();
      cleanupInterceptorRef.current = installToolInterceptor(clientToolHandlers);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        agentId,
        // Still pass clientTools so the SDK knows about them (even though our interceptor handles them)
        clientTools: {
          show_panel: (parameters: { panel_id?: string }) => {
            console.log('[JARVIS] SDK clientTools handler fired (backup):', parameters?.panel_id);
            return clientToolHandlers.show_panel(parameters as Record<string, unknown>);
          },
          show_notification: (parameters: { message?: string; level?: string }) => {
            console.log('[JARVIS] SDK show_notification fired (backup):', parameters?.message);
            return clientToolHandlers.show_notification(parameters as Record<string, unknown>);
          },
        },
        onConnect: () => {
          setStatus('connected');
          addTranscript('jarvis', 'Voice link established. How may I assist you, sir?');
        },
        onDisconnect: () => {
          setStatus('disconnected');
          setIsSpeaking(false);
          conversationRef.current = null;
          addTranscript('jarvis', 'Voice link terminated.');
          setWakeWordEnabled(true);
          // Cleanup interceptor
          cleanupInterceptorRef.current?.();
          cleanupInterceptorRef.current = null;
        },
        onMessage: (message: { source: string; message: string }) => {
          const speaker = message.source === 'user' ? 'user' : 'jarvis';
          addTranscript(speaker, message.message);
        },
        onError: (error: string, context: unknown) => {
          const errorMsg = typeof error === 'string' ? error : String(error);
          console.error('[JARVIS] ElevenLabs error:', errorMsg, 'context:', JSON.stringify(context));
          // Don't show tool-related errors to user — they're handled by interceptor
          if (errorMsg.includes('client tool') || errorMsg.includes('Client tool')) {
            console.warn('[JARVIS] Tool error (handled by interceptor):', errorMsg);
            return;
          }
          addTranscript('jarvis', `Voice interface error. Reconnecting...`);
        },
        onModeChange: ({ mode }: { mode: string }) => {
          setIsSpeaking(mode === 'speaking');
        },
        onUnhandledClientToolCall: (toolCall: { tool_name?: string; parameters?: Record<string, unknown>; tool_call_id?: string }) => {
          // This fires when SDK can't find the tool — but our interceptor already handled it
          console.log('[JARVIS] SDK unhandled (interceptor handled it):', toolCall.tool_name);
        },
      };

      const conversation = await Conversation.startSession(options);
      conversationRef.current = conversation;
    } catch (err) {
      console.error('Failed to start conversation:', err);
      addTranscript('jarvis', 'Failed to initialize voice interface. Check microphone permissions.');
      setStatus('disconnected');
      setWakeWordEnabled(true);
      cleanupInterceptorRef.current?.();
      cleanupInterceptorRef.current = null;
    }
  }, [addTranscript]);

  const endConversation = useCallback(async () => {
    await conversationRef.current?.endSession();
  }, []);

  const handleClick = useCallback(() => {
    if (status === 'connected') {
      endConversation();
    } else if (status === 'disconnected') {
      startConversation();
    }
  }, [status, startConversation, endConversation]);

  // Wake word detection
  const { isListening: wakeWordActive, isSupported: wakeWordSupported } = useWakeWord({
    onWake: () => {
      addTranscript('user', 'JARVIS');
      startConversation();
    },
    enabled: wakeWordEnabled && status === 'disconnected',
  });

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // Status text
  let statusText = 'CLICK TO ACTIVATE';
  let statusColor = '#006688';
  if (isConnecting) {
    statusText = 'CONNECTING...';
    statusColor = '#FFAA00';
  } else if (isSpeaking) {
    statusText = 'JARVIS SPEAKING...';
    statusColor = '#00FFFF';
  } else if (isConnected) {
    statusText = 'LISTENING...';
    statusColor = '#00FF88';
  }

  return (
    <>
      {/* Wake Word Indicator — top-right area */}
      {wakeWordSupported && (
        <div
          style={{
            position: 'fixed',
            top: '58px',
            right: '55px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontFamily: "'JetBrains Mono', monospace",
            zIndex: 110,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: wakeWordActive ? '#00FF88' : '#444444',
              boxShadow: wakeWordActive ? '0 0 6px #00FF88' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          <span
            style={{
              fontSize: '7px',
              color: wakeWordActive ? '#00AA66' : '#444444',
              letterSpacing: '0.5px',
              transition: 'color 0.3s ease',
            }}
          >
            WAKE WORD: {wakeWordActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      )}

      {/* Voice Button Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '180px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 110,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Mic Button */}
        <button
          onClick={handleClick}
          disabled={isConnecting}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: `2px solid ${isConnected ? '#00FFFF' : 'rgba(0,255,255,0.3)'}`,
            background: isConnected
              ? 'rgba(0,255,255,0.12)'
              : 'rgba(0,10,20,0.8)',
            cursor: isConnecting ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.3s ease',
            boxShadow: isConnected
              ? '0 0 20px rgba(0,255,255,0.3), 0 0 40px rgba(0,255,255,0.1), inset 0 0 15px rgba(0,255,255,0.1)'
              : '0 0 10px rgba(0,255,255,0.1)',
            outline: 'none',
          }}
        >
          {/* Pulsing ring when active */}
          {isConnected && (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  border: '1px solid rgba(0,255,255,0.4)',
                  animation: 'voice-pulse 2s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '-12px',
                  borderRadius: '50%',
                  border: '1px solid rgba(0,255,255,0.2)',
                  animation: 'voice-pulse 2s ease-in-out infinite 0.5s',
                }}
              />
            </>
          )}

          {/* Audio visualization bars when speaking */}
          {isSpeaking ? (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '20px' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    background: '#00FFFF',
                    borderRadius: '1px',
                    animation: `voice-bar 0.8s ease-in-out infinite ${i * 0.1}s`,
                    boxShadow: '0 0 4px rgba(0,255,255,0.6)',
                  }}
                />
              ))}
            </div>
          ) : (
            /* Mic Icon SVG */
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isConnected ? '#00FFFF' : 'rgba(0,255,255,0.5)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: isConnected ? 'drop-shadow(0 0 6px rgba(0,255,255,0.6))' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {/* Status Text */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '8px',
            letterSpacing: '2px',
            color: statusColor,
            textShadow: isConnected ? `0 0 8px ${statusColor}40` : 'none',
            transition: 'all 0.3s ease',
            textAlign: 'center',
          }}
        >
          {statusText}
        </div>

        {/* Connection status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: isConnected ? '#00FF88' : isConnecting ? '#FFAA00' : '#FF4444',
              boxShadow: `0 0 4px ${isConnected ? '#00FF88' : isConnecting ? '#FFAA00' : '#FF4444'}`,
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '6px',
              letterSpacing: '1px',
              color: '#004466',
            }}
          >
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes voice-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.4; }
        }
        @keyframes voice-bar {
          0%, 100% { height: 4px; }
          50% { height: 18px; }
        }
      `}</style>
    </>
  );
}
