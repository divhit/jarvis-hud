'use client';

import React, { useEffect } from 'react';
import { useJarvisStore } from '@/stores/jarvisStore';

export default function WeatherPanel() {
  const weather = useJarvisStore((s) => s.weather);
  const weatherLoading = useJarvisStore((s) => s.weatherLoading);
  const weatherError = useJarvisStore((s) => s.weatherError);
  const fetchWeather = useJarvisStore((s) => s.fetchWeather);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '8px', letterSpacing: '3px', color: '#0088FF', marginBottom: '6px', opacity: 0.7, textAlign: 'center' }}>
        WEATHER // VANCOUVER {weatherLoading ? '// UPDATING...' : ''}
      </div>

      {weatherError && (
        <div style={{ fontSize: '7px', color: '#FF4444', textAlign: 'center', marginBottom: '4px' }}>
          {weatherError} // SHOWING LAST KNOWN
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
        <span style={{ fontSize: '32px' }}>{weather.icon}</span>
        <div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#00FFFF',
            textShadow: '0 0 15px rgba(0,255,255,0.5)',
          }}>
            {weather.temp}°C
          </div>
          <div style={{ fontSize: '9px', color: '#00AAAA', letterSpacing: '1px' }}>
            {weather.condition.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
        fontSize: '8px',
      }}>
        <div style={{
          padding: '4px 6px',
          border: '1px solid rgba(0,255,255,0.1)',
          borderRadius: '2px',
        }}>
          <div style={{ color: '#006688', marginBottom: '2px' }}>HUMIDITY</div>
          <div style={{ color: '#00CCCC', fontWeight: 500 }}>{weather.humidity}%</div>
        </div>
        <div style={{
          padding: '4px 6px',
          border: '1px solid rgba(0,255,255,0.1)',
          borderRadius: '2px',
        }}>
          <div style={{ color: '#006688', marginBottom: '2px' }}>WIND</div>
          <div style={{ color: '#00CCCC', fontWeight: 500 }}>{weather.wind} km/h</div>
        </div>
        <div style={{
          padding: '4px 6px',
          border: '1px solid rgba(0,255,255,0.1)',
          borderRadius: '2px',
        }}>
          <div style={{ color: '#006688', marginBottom: '2px' }}>FEELS LIKE</div>
          <div style={{ color: '#00CCCC', fontWeight: 500 }}>{weather.feelsLike}°C</div>
        </div>
        <div style={{
          padding: '4px 6px',
          border: '1px solid rgba(0,255,255,0.1)',
          borderRadius: '2px',
        }}>
          <div style={{ color: '#006688', marginBottom: '2px' }}>UV INDEX</div>
          <div style={{ color: '#00CCCC', fontWeight: 500 }}>{weather.uvIndex} {weather.uvIndex <= 2 ? 'LOW' : weather.uvIndex <= 5 ? 'MOD' : 'HIGH'}</div>
        </div>
      </div>
    </div>
  );
}
