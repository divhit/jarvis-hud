'use client';

import React, { useCallback, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useJarvisStore } from '@/stores/jarvisStore';
import { useWakeWord } from '@/hooks/useWakeWord';

export default function VoiceAgent() {
  const addTranscript = useJarvisStore((s) => s.addTranscript);
  const focusPanel = useJarvisStore((s) => s.focusPanel);
  const fetchWeather = useJarvisStore((s) => s.fetchWeather);
  const fetchMarkets = useJarvisStore((s) => s.fetchMarkets);
  const fetchSystem = useJarvisStore((s) => s.fetchSystem);
  const fetchInbox = useJarvisStore((s) => s.fetchInbox);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);

  const conversation = useConversation({
    onConnect: () => {
      addTranscript('jarvis', 'Voice link established. How may I assist you, sir?');
    },
    onDisconnect: () => {
      addTranscript('jarvis', 'Voice link terminated.');
      setWakeWordEnabled(true);
    },
    onMessage: (message) => {
      const speaker = message.source === 'user' ? 'user' : 'jarvis';
      addTranscript(speaker, message.message);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      addTranscript('jarvis', 'Voice interface error. Reconnecting...');
      setWakeWordEnabled(true);
    },
    onUnhandledClientToolCall: (params) => {
      console.warn('[JARVIS] Unhandled client tool call:', params);
    },
    clientTools: {
      show_panel: (parameters: { panel_id: string }) => {
        const { panel_id } = parameters;
        console.log('[JARVIS] Client tool: show_panel', panel_id);

        // Focus the panel in the 3D HUD
        focusPanel(panel_id);

        // Fire-and-forget data refresh — do NOT await (ElevenLabs times out on slow tools)
        switch (panel_id) {
          case 'weather': fetchWeather().catch(() => {}); break;
          case 'markets': fetchMarkets().catch(() => {}); break;
          case 'system': fetchSystem().catch(() => {}); break;
          case 'inbox': fetchInbox().catch(() => {}); break;
        }

        // Return immediately so ElevenLabs doesn't timeout
        return `Panel ${panel_id} is now highlighted on the HUD display with fresh data.`;
      },
    },
  });

  const startConversation = useCallback(async () => {
    try {
      // Request mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        addTranscript('jarvis', 'Agent configuration missing. Cannot establish voice link.');
        return;
      }

      setWakeWordEnabled(false);
      await conversation.startSession({ agentId, connectionType: 'websocket' });
    } catch (err) {
      console.error('Failed to start conversation:', err);
      addTranscript('jarvis', 'Failed to initialize voice interface. Check microphone permissions.');
      setWakeWordEnabled(true);
    }
  }, [conversation, addTranscript]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleClick = useCallback(() => {
    if (conversation.status === 'connected') {
      endConversation();
    } else if (conversation.status === 'disconnected') {
      startConversation();
    }
  }, [conversation.status, startConversation, endConversation]);

  // Wake word detection
  const { isListening: wakeWordActive, isSupported: wakeWordSupported } = useWakeWord({
    onWake: () => {
      addTranscript('user', 'JARVIS');
      startConversation();
    },
    enabled: wakeWordEnabled && conversation.status === 'disconnected',
  });

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';
  const isSpeaking = conversation.isSpeaking;

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
            {conversation.status.toUpperCase()}
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
