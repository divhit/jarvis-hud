'use client';

import React, { useRef, useEffect } from 'react';
import { useJarvisStore } from '@/stores/jarvisStore';

export default function TranscriptPanel() {
  const transcript = useJarvisStore((s) => s.transcript);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(700px, 90vw)',
        maxHeight: '140px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,10,20,0.85) 100%)',
        border: '1px solid rgba(0,255,255,0.12)',
        borderRadius: '4px',
        backdropFilter: 'blur(10px)',
        fontFamily: "'JetBrains Mono', monospace",
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '6px 12px',
        borderBottom: '1px solid rgba(0,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#00FF88',
            boxShadow: '0 0 8px #00FF88',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '8px', letterSpacing: '2px', color: '#006688' }}>
            VOICE INTERFACE ACTIVE
          </span>
        </div>
        <span style={{ fontSize: '7px', color: '#004466' }}>
          CHANNEL OPEN
        </span>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        style={{
          padding: '8px 12px',
          maxHeight: '100px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {transcript.map((entry, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
            <span style={{
              color: entry.speaker === 'user' ? '#0088FF' : '#00FFFF',
              fontWeight: 700,
              minWidth: '50px',
              textShadow: entry.speaker === 'jarvis'
                ? '0 0 8px rgba(0,255,255,0.4)'
                : '0 0 8px rgba(0,136,255,0.4)',
            }}>
              {entry.speaker === 'user' ? 'YOU' : 'JARVIS'}:
            </span>
            <span style={{ color: '#aaaaaa' }}>{entry.text}</span>
          </div>
        ))}
        <div style={{
          display: 'flex',
          gap: '8px',
          fontSize: '10px',
        }}>
          <span style={{ color: '#00FFFF', fontWeight: 700, minWidth: '50px' }}>JARVIS:</span>
          <span style={{
            display: 'inline-block',
            width: '7px',
            height: '14px',
            background: '#00FFFF',
            animation: 'typing-cursor 1s step-end infinite',
          }} />
        </div>
      </div>
    </div>
  );
}
