'use client';

import React from 'react';
import { useJarvisStore } from '@/stores/jarvisStore';

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 18;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}

export default function MarketsPanel() {
  const markets = useJarvisStore((s) => s.markets);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '8px', letterSpacing: '3px', color: '#0088FF', marginBottom: '6px', opacity: 0.7 }}>
        MARKET DATA // LIVE FEED
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {markets.map((m) => {
          const isPositive = m.change >= 0;
          const changeColor = isPositive ? '#00FF88' : '#FF4444';

          return (
            <div
              key={m.symbol}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 6px',
                border: '1px solid rgba(0,255,255,0.08)',
                borderRadius: '2px',
                transition: 'border-color 0.3s',
              }}
            >
              <div style={{ minWidth: '45px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#00FFFF' }}>
                  {m.symbol}
                </div>
                <div style={{ fontSize: '6px', color: '#006688' }}>{m.name}</div>
              </div>

              <Sparkline data={m.history} color={changeColor} />

              <div style={{ textAlign: 'right', minWidth: '65px' }}>
                <div style={{ fontSize: '9px', color: '#ffffff', fontWeight: 500 }}>
                  {m.symbol === 'BTC'
                    ? `$${m.price.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                    : m.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '8px', color: changeColor, fontWeight: 500 }}>
                  {isPositive ? '+' : ''}{m.change.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '6px', color: '#004466', marginTop: '4px', textAlign: 'right' }}>
        DELAYED 15MIN // MOCK DATA
      </div>
    </div>
  );
}
