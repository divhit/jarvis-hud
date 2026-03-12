'use client';

import React, { useEffect, useState } from 'react';
import { useJarvisStore } from '@/stores/jarvisStore';

function StatusBar({ label, value, color = '#00FFFF' }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: '7px', color: '#006688', letterSpacing: '1px' }}>{label}</span>
        <span style={{ fontSize: '8px', color, fontWeight: 500 }}>{value}%</span>
      </div>
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(0,255,255,0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: '2px',
          boxShadow: `0 0 8px ${color}66`,
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  );
}

function StatusDot({ label, online = true }: { label: string; online?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '7px' }}>
      <div style={{
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: online ? '#00FF88' : '#FF4444',
        boxShadow: `0 0 6px ${online ? '#00FF88' : '#FF4444'}`,
      }} />
      <span style={{ color: online ? '#00AA66' : '#AA3333', letterSpacing: '0.5px' }}>{label}</span>
    </div>
  );
}

export default function SystemPanel() {
  const system = useJarvisStore((s) => s.system);
  const [cpuAnim, setCpuAnim] = useState(system.cpu);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuAnim(system.cpu + Math.floor(Math.random() * 8 - 4));
    }, 2000);
    return () => clearInterval(interval);
  }, [system.cpu]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '8px', letterSpacing: '3px', color: '#0088FF', opacity: 0.7, marginBottom: '2px' }}>
          SYSTEM STATUS
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#00FFFF',
          textShadow: '0 0 15px rgba(0,255,255,0.6), 0 0 30px rgba(0,255,255,0.3)',
          letterSpacing: '4px',
        }}>
          J.A.R.V.I.S
        </div>
        <div style={{
          fontSize: '7px',
          color: '#00FF88',
          letterSpacing: '2px',
          marginTop: '2px',
          textShadow: '0 0 8px rgba(0,255,136,0.5)',
        }}>
          {system.status}
        </div>
      </div>

      <StatusBar label="CPU UTILIZATION" value={Math.max(0, Math.min(100, cpuAnim))} />
      <StatusBar label="MEMORY ALLOCATION" value={system.memory} color="#0088FF" />
      <StatusBar label="NETWORK BANDWIDTH" value={system.network} color="#00FF88" />

      <div style={{
        marginTop: '6px',
        padding: '4px 6px',
        border: '1px solid rgba(0,255,255,0.08)',
        borderRadius: '2px',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <StatusDot label="ARC REACTOR" />
          <StatusDot label="COMM LINK" />
          <StatusDot label="AI CORE" />
          <StatusDot label="SENSORS" />
          <StatusDot label="DEFENSE" online={true} />
        </div>
      </div>

      <div style={{ fontSize: '6px', color: '#004466', marginTop: 'auto', textAlign: 'center' }}>
        UPTIME: {system.uptime}
      </div>
    </div>
  );
}
