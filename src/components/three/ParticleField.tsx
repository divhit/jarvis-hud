'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleField({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

      velocities[i * 3] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }

    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const posArray = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap around
      if (Math.abs(posArray[i * 3]) > 15) velocities[i * 3] *= -1;
      if (Math.abs(posArray[i * 3 + 1]) > 10) velocities[i * 3 + 1] *= -1;
      if (Math.abs(posArray[i * 3 + 2]) > 10) velocities[i * 3 + 2] *= -1;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00FFFF"
        size={0.03}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
