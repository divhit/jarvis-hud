'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import HolographicPanel from './HolographicPanel';
import ParticleField from './ParticleField';
import ClockPanel from '../panels/ClockPanel';
import WeatherPanel from '../panels/WeatherPanel';
import MarketsPanel from '../panels/MarketsPanel';
import SystemPanel from '../panels/SystemPanel';
import InboxPanel from '../panels/InboxPanel';

function SceneContent() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#ffffff" />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#00FFFF" distance={20} />
      <pointLight position={[-5, 3, 3]} intensity={0.4} color="#0088FF" distance={15} />
      <pointLight position={[5, -2, 4]} intensity={0.3} color="#00FFFF" distance={15} />

      {/* Background particles */}
      <ParticleField count={600} />

      {/* Panel layout in an arc */}
      {/* Top row: 3 panels */}
      <HolographicPanel
        position={[-3.8, 1.6, -1]}
        rotation={[0, 0.2, 0]}
        width={2.8}
        height={2.2}
      >
        <ClockPanel />
      </HolographicPanel>

      <HolographicPanel
        position={[0, 2, -2]}
        rotation={[0, 0, 0]}
        width={3.2}
        height={2.2}
        color="#0088FF"
      >
        <SystemPanel />
      </HolographicPanel>

      <HolographicPanel
        position={[3.8, 1.6, -1]}
        rotation={[0, -0.2, 0]}
        width={2.8}
        height={2.2}
      >
        <WeatherPanel />
      </HolographicPanel>

      {/* Bottom row: 2 panels */}
      <HolographicPanel
        position={[-2.5, -1.2, -0.5]}
        rotation={[0, 0.15, 0]}
        width={3.5}
        height={2.4}
        color="#00DDFF"
      >
        <MarketsPanel />
      </HolographicPanel>

      <HolographicPanel
        position={[2.5, -1.2, -0.5]}
        rotation={[0, -0.15, 0]}
        width={3.5}
        height={2.4}
        color="#0099FF"
      >
        <InboxPanel />
      </HolographicPanel>
    </>
  );
}

export default function JarvisScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 6], fov: 55 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000',
      }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 8, 25]} />
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
