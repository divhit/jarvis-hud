'use client';

import React from 'react';
import { useJarvisStore } from '@/stores/jarvisStore';

const LEVEL_COLORS = {
  info: '#00FFFF',
  success: '#00FF88',
  warning: '#FFAA00',
  error: '#FF4444',
};

export default function NotificationToast() {
  const notification = useJarvisStore((s) => s.notification);

  if (!notification) return null;

  const color = LEVEL_COLORS[notification.level];

  return (
    <div
      style={{
        position: 'fixed',
        top: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: 'rgba(0,10,20,0.92)',
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '4px',
        padding: '10px 20px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        color,
        letterSpacing: '0.5px',
        boxShadow: `0 0 20px ${color}20, 0 4px 12px rgba(0,0,0,0.5)`,
        animation: 'notification-in 0.3s ease-out',
        maxWidth: '500px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '8px', opacity: 0.6, textTransform: 'uppercase' }}>
          {notification.level}
        </span>
        <span style={{ width: '1px', height: '12px', background: `${color}30` }} />
        <span>{notification.message}</span>
      </div>
      <style>{`
        @keyframes notification-in {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
