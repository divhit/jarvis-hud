'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  uniform float uGlitch;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    vec3 pos = position;

    // Subtle glitch displacement
    float glitchStrength = uGlitch * step(0.97, fract(sin(uTime * 43.0) * 4375.5453));
    pos.x += glitchStrength * sin(pos.y * 50.0 + uTime * 10.0) * 0.02;
    pos.y += glitchStrength * cos(pos.x * 50.0 + uTime * 8.0) * 0.01;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Base color
    vec3 color = uColor;

    // Scanline effect
    float scanline = sin(vUv.y * 120.0 + uTime * 2.0) * 0.5 + 0.5;
    scanline = smoothstep(0.3, 0.7, scanline) * 0.15 + 0.85;

    // Fresnel edge glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
    fresnel = pow(fresnel, 2.5);

    // Edge glow intensifies on hover
    float edgeGlow = fresnel * (0.6 + uHover * 0.8);

    // Horizontal scan bar (slow moving bright line)
    float scanBar = smoothstep(0.0, 0.02, abs(vUv.y - fract(uTime * 0.08))) ;
    scanBar = 1.0 - (1.0 - scanBar) * 0.3;

    // Combine effects
    float alpha = uOpacity * scanline * scanBar;
    alpha += edgeGlow * 0.4;
    alpha *= (0.85 + uHover * 0.15);

    // Add subtle grid pattern
    float gridX = smoothstep(0.98, 1.0, abs(sin(vUv.x * 40.0)));
    float gridY = smoothstep(0.98, 1.0, abs(sin(vUv.y * 40.0)));
    float grid = max(gridX, gridY) * 0.1;

    color += vec3(0.0, 1.0, 1.0) * edgeGlow * 0.5;
    color += vec3(0.0, 1.0, 1.0) * grid;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface HolographicPanelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  children?: React.ReactNode;
  color?: string;
  opacity?: number;
  glitchIntensity?: number;
}

export default function HolographicPanel({
  position,
  rotation = [0, 0, 0],
  width = 2.5,
  height = 2,
  children,
  color = '#00FFFF',
  opacity = 0.12,
  glitchIntensity = 0.5,
}: HolographicPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const hoverRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uGlitch: { value: glitchIntensity },
    }),
    [color, opacity, glitchIntensity]
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Smooth hover transition
      hoverRef.current = THREE.MathUtils.lerp(
        hoverRef.current,
        hovered ? 1 : 0,
        0.08
      );
      material.uniforms.uHover.value = hoverRef.current;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[width, height, 32, 32]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Border lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, height)]} />
        <lineBasicMaterial color={color} transparent opacity={0.3 + hoverRef.current * 0.3} />
      </lineSegments>

      {/* HTML content overlay */}
      <Html
        transform
        occlude={false}
        position={[0, 0, 0.01]}
        style={{
          width: `${width * 120}px`,
          height: `${height * 120}px`,
          pointerEvents: 'none',
        }}
        distanceFactor={1.5}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            color: '#00FFFF',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            padding: '12px',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}
