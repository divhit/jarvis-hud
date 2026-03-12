'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import HolographicPanel from './HolographicPanel';
import ParticleField from './ParticleField';
import ClockPanel from '../panels/ClockPanel';
import WeatherPanel from '../panels/WeatherPanel';
import MarketsPanel from '../panels/MarketsPanel';
import SystemPanel from '../panels/SystemPanel';
import InboxPanel from '../panels/InboxPanel';
import { useJarvisStore } from '@/stores/jarvisStore';

interface FocusablePanelProps {
  panelId: string;
  basePosition: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
  children: React.ReactNode;
}

function FocusablePanel({
  panelId,
  basePosition,
  rotation = [0, 0, 0],
  width,
  height,
  color,
  children,
}: FocusablePanelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const focusedPanel = useJarvisStore((s) => s.focusedPanel);
  const isFocused = focusedPanel === panelId;

  // Animated values
  const currentPos = useRef(new THREE.Vector3(...basePosition));
  const currentScale = useRef(1);
  const currentOpacity = useRef(0.12);

  // When focused: fly to center-front of camera
  const focusedPos = new THREE.Vector3(0, 0.5, 3);
  const basePos = new THREE.Vector3(...basePosition);

  useFrame(() => {
    if (!groupRef.current) return;

    const targetPos = isFocused ? focusedPos : basePos;
    const targetScale = isFocused ? 1.4 : 1;
    const targetOpacity = isFocused ? 0.25 : 0.12;
    const lerpSpeed = 0.08;

    currentPos.current.lerp(targetPos, lerpSpeed);
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, lerpSpeed);
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, lerpSpeed);

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.scale.setScalar(currentScale.current);
  });

  // Dim unfocused panels when something is focused
  const somethingFocused = focusedPanel !== null;
  const dimmed = somethingFocused && !isFocused;

  return (
    <group
      ref={groupRef}
      position={[basePosition[0], basePosition[1], basePosition[2]]}
    >
      <HolographicPanel
        position={[0, 0, 0]}
        rotation={isFocused ? [0, 0, 0] : rotation}
        width={width}
        height={height}
        color={isFocused ? '#00FFFF' : dimmed ? '#003344' : color}
        opacity={dimmed ? 0.04 : isFocused ? 0.25 : 0.12}
        glitchIntensity={isFocused ? 1.0 : 0.5}
      >
        {children}
      </HolographicPanel>
    </group>
  );
}

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
      <FocusablePanel
        panelId="clock"
        basePosition={[-3.8, 1.6, -1]}
        rotation={[0, 0.2, 0]}
        width={2.8}
        height={2.2}
      >
        <ClockPanel />
      </FocusablePanel>

      <FocusablePanel
        panelId="system"
        basePosition={[0, 2, -2]}
        rotation={[0, 0, 0]}
        width={3.2}
        height={2.2}
        color="#0088FF"
      >
        <SystemPanel />
      </FocusablePanel>

      <FocusablePanel
        panelId="weather"
        basePosition={[3.8, 1.6, -1]}
        rotation={[0, -0.2, 0]}
        width={2.8}
        height={2.2}
      >
        <WeatherPanel />
      </FocusablePanel>

      {/* Bottom row: 2 panels */}
      <FocusablePanel
        panelId="markets"
        basePosition={[-2.5, -1.2, -0.5]}
        rotation={[0, 0.15, 0]}
        width={3.5}
        height={2.4}
        color="#00DDFF"
      >
        <MarketsPanel />
      </FocusablePanel>

      <FocusablePanel
        panelId="inbox"
        basePosition={[2.5, -1.2, -0.5]}
        rotation={[0, -0.15, 0]}
        width={3.5}
        height={2.4}
        color="#0099FF"
      >
        <InboxPanel />
      </FocusablePanel>
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
