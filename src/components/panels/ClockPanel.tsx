'use client';

import React, { useEffect, useState } from 'react';

export default function ClockPanel() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const dayName = days[time.getDay()];
  const monthName = months[time.getMonth()];
  const date = time.getDate();
  const year = time.getFullYear();

  return (
    <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '8px', letterSpacing: '3px', color: '#0088FF', marginBottom: '4px', opacity: 0.7 }}>
        CHRONOMETER
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '2px' }}>
        <span style={{
          fontSize: '36px',
          fontWeight: 700,
          color: '#00FFFF',
          textShadow: '0 0 15px rgba(0,255,255,0.6), 0 0 30px rgba(0,255,255,0.3)',
          letterSpacing: '2px',
        }}>
          {hours}:{minutes}
        </span>
        <span style={{
          fontSize: '18px',
          fontWeight: 300,
          color: '#00AAAA',
          textShadow: '0 0 10px rgba(0,255,255,0.4)',
        }}>
          :{seconds}
        </span>
      </div>
      <div style={{
        fontSize: '10px',
        color: '#00AAAA',
        marginTop: '8px',
        letterSpacing: '2px',
      }}>
        {dayName}
      </div>
      <div style={{
        fontSize: '9px',
        color: '#006688',
        marginTop: '2px',
        letterSpacing: '1px',
      }}>
        {monthName} {date}, {year}
      </div>
      <div style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '7px',
        color: '#004466',
      }}>
        <span>UTC{time.getTimezoneOffset() <= 0 ? '+' : '-'}{Math.abs(time.getTimezoneOffset() / 60)}</span>
        <span>|</span>
        <span>PST</span>
      </div>
    </div>
  );
}
