'use client';

import React, { useEffect, useState } from 'react';

function CornerBracket({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const size = 30;
  const thickness = 1;
  const color = 'rgba(0,255,255,0.25)';

  const styles: React.CSSProperties = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    ...(position.includes('top') ? { top: '15px' } : { bottom: '15px' }),
    ...(position.includes('left') ? { left: '15px' } : { right: '15px' }),
  };

  const borderStyle = `${thickness}px solid ${color}`;

  const innerStyles: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ...(position.includes('top') ? { borderTop: borderStyle } : { borderBottom: borderStyle }),
    ...(position.includes('left') ? { borderLeft: borderStyle } : { borderRight: borderStyle }),
  };

  return (
    <div style={styles}>
      <div style={innerStyles} />
    </div>
  );
}

export default function HudOverlay() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 50,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Corner brackets */}
      <CornerBracket position="top-left" />
      <CornerBracket position="top-right" />
      <CornerBracket position="bottom-left" />
      <CornerBracket position="bottom-right" />

      {/* Top-left: JARVIS label */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '55px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#00FFFF',
          letterSpacing: '6px',
          textShadow: '0 0 15px rgba(0,255,255,0.5), 0 0 30px rgba(0,255,255,0.2)',
        }}>
          JARVIS
        </div>
        <div style={{
          fontSize: '8px',
          color: '#006688',
          letterSpacing: '2px',
        }}>
          v1.0 // STARK INDUSTRIES
        </div>
        <div style={{
          fontSize: '7px',
          color: '#004455',
          letterSpacing: '1px',
          marginTop: '2px',
        }}>
          HOLOGRAPHIC USER INTERFACE
        </div>
      </div>

      {/* Top-right: status indicators */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '55px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '7px', color: '#006688', letterSpacing: '1px' }}>SYSTEM TIME</span>
          <span style={{
            fontSize: '10px',
            color: '#00AAAA',
            fontWeight: 500,
          }}>
            {time}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Mic status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#FFAA00',
              boxShadow: '0 0 6px #FFAA00',
            }} />
            <span style={{ fontSize: '7px', color: '#887700', letterSpacing: '0.5px' }}>MIC STANDBY</span>
          </div>

          {/* Connection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#00FF88',
              boxShadow: '0 0 6px #00FF88',
            }} />
            <span style={{ fontSize: '7px', color: '#00AA66', letterSpacing: '0.5px' }}>CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Bottom-left: coordinates */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '55px',
        fontSize: '7px',
        color: '#004455',
        letterSpacing: '1px',
      }}>
        49.2827°N 123.1207°W // VANCOUVER
      </div>

      {/* Bottom-right: build info */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '55px',
        fontSize: '7px',
        color: '#004455',
        letterSpacing: '1px',
        textAlign: 'right',
      }}>
        BUILD 2024.03.11 // ARC-7
      </div>

      {/* Center top thin line */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.2), transparent)',
      }} />

      {/* Center bottom thin line */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.2), transparent)',
      }} />
    </div>
  );
}
