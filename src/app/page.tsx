'use client';

import dynamic from 'next/dynamic';
import HudOverlay from '@/components/HudOverlay';
import VoiceAgent from '@/components/VoiceAgent';
import NotificationToast from '@/components/NotificationToast';
import TranscriptPanel from '@/components/panels/TranscriptPanel';

const JarvisScene = dynamic(() => import('@/components/three/JarvisScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#00FFFF',
          letterSpacing: '8px',
          textShadow: '0 0 20px rgba(0,255,255,0.6), 0 0 40px rgba(0,255,255,0.3)',
          marginBottom: '16px',
        }}>
          J.A.R.V.I.S
        </div>
        <div style={{
          fontSize: '10px',
          color: '#006688',
          letterSpacing: '4px',
        }}>
          INITIALIZING SYSTEMS...
        </div>
        <div style={{
          marginTop: '20px',
          width: '200px',
          height: '2px',
          background: 'rgba(0,255,255,0.1)',
          borderRadius: '1px',
          overflow: 'hidden',
          margin: '20px auto 0',
        }}>
          <div style={{
            width: '40%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
            animation: 'loading-bar 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  ),
});

export default function Home() {
  return (
    <main style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000000',
      position: 'relative',
    }}>
      {/* Three.js Canvas */}
      <JarvisScene />

      {/* 2D HUD Overlay */}
      <HudOverlay />

      {/* Voice Agent (ElevenLabs Conversational AI) */}
      <VoiceAgent />

      {/* Notification Toast (from JARVIS client tools) */}
      <NotificationToast />

      {/* Transcript at bottom */}
      <TranscriptPanel />
    </main>
  );
}
