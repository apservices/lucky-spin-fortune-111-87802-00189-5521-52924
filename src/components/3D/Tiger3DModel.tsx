/**
 * Tiger 3D Model - Animated Golden Tiger Mascot
 * States: idle, roar, dance, win, jackpot
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

type TigerState = 'idle' | 'roar' | 'dance' | 'win' | 'jackpot';

interface Tiger3DModelProps {
  state?: TigerState;
  scale?: number;
  position?: [number, number, number];
}

export const Tiger3DModel: React.FC<Tiger3DModelProps> = ({
  state = 'idle',
  scale = 1,
  position = [0, 0, 0]
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hue, setHue] = useState(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Animations based on state
    switch (state) {
      case 'idle':
        // Gentle breathing
        groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.1;
        groupRef.current.rotation.y += delta * 0.2;
        break;

      case 'roar':
        // Shake and scale up
        groupRef.current.scale.setScalar(scale * (1 + Math.sin(Date.now() * 0.01) * 0.1));
        groupRef.current.rotation.z = Math.sin(Date.now() * 0.02) * 0.1;
        break;

      case 'dance':
        // Samba animation
        const time = Date.now() * 0.003;
        groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.3;
        groupRef.current.position.x = position[0] + Math.sin(time) * 0.2;
        groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.3;
        groupRef.current.rotation.y += delta * 2;
        setHue((h) => (h + delta * 180) % 360);
        break;

      case 'win':
        // Jump animation
        const bounce = Math.abs(Math.sin(Date.now() * 0.005));
        groupRef.current.position.y = position[1] + bounce * 0.5;
        groupRef.current.rotation.y += delta * 1;
        break;

      case 'jackpot':
        // Explosive rotation
        groupRef.current.rotation.y += delta * 5;
        groupRef.current.rotation.x = Math.sin(Date.now() * 0.01) * 0.3;
        groupRef.current.scale.setScalar(scale * (1 + Math.sin(Date.now() * 0.008) * 0.3));
        setHue((h) => (h + delta * 360) % 360);
        break;
    }
  });

  // Tiger body (simplified 3D representation)
  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Tiger body */}
      <Center>
        <mesh castShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color={state === 'dance' || state === 'jackpot' ? `hsl(${hue}, 100%, 60%)` : '#FFD700'}
            metalness={0.6}
            roughness={0.2}
            emissive="#FF6B00"
            emissiveIntensity={state === 'roar' || state === 'jackpot' ? 0.5 : 0.1}
          />
        </mesh>
      </Center>

      {/* Tiger head */}
      <mesh position={[0, 0.6, 0.4]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={state === 'dance' || state === 'jackpot' ? `hsl(${(hue + 60) % 360}, 100%, 65%)` : '#FFEB3B'}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Tiger ears */}
      <mesh position={[-0.3, 1, 0.4]} castShadow>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#FF9800" />
      </mesh>
      <mesh position={[0.3, 1, 0.4]} castShadow>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#FF9800" />
      </mesh>

      {/* Eyes glow */}
      <mesh position={[-0.15, 0.7, 0.85]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={state === 'roar' ? '#FF0000' : '#FFF'} />
      </mesh>
      <mesh position={[0.15, 0.7, 0.85]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={state === 'roar' ? '#FF0000' : '#FFF'} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.2, -0.8]} rotation={[0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.05, 1, 8]} />
        <meshStandardMaterial color="#FF6B00" />
      </mesh>

      {/* Glow ring for special states */}
      {(state === 'win' || state === 'jackpot') && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Particle sparkles for jackpot */}
      {state === 'jackpot' && (
        <>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 1.5;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle + Date.now() * 0.003) * radius,
                  Math.sin(Date.now() * 0.005 + i) * 0.5,
                  Math.sin(angle + Date.now() * 0.003) * radius
                ]}
              >
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={`hsl(${(i * 45 + hue) % 360}, 100%, 60%)`} />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};
