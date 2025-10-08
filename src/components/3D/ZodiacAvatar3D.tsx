/**
 * Zodiac Avatar 3D - User Personalization
 * Simplified 3D zodiac symbols for user profiles
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

interface ZodiacAvatar3DProps {
  sign: ZodiacSign;
  scale?: number;
  animate?: boolean;
}

const zodiacSymbols: Record<ZodiacSign, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓'
};

const zodiacColors: Record<ZodiacSign, string> = {
  aries: '#FF6B47',
  taurus: '#4CAF50',
  gemini: '#FFD700',
  cancer: '#00BCD4',
  leo: '#FF9800',
  virgo: '#8BC34A',
  libra: '#E91E63',
  scorpio: '#9C27B0',
  sagittarius: '#3F51B5',
  capricorn: '#795548',
  aquarius: '#00BCD4',
  pisces: '#9C27B0'
};

export const ZodiacAvatar3D: React.FC<ZodiacAvatar3DProps> = ({
  sign,
  scale = 1,
  animate = true
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || !animate) return;
    
    // Gentle floating animation
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.2;
    groupRef.current.rotation.y += delta * 0.5;
  });

  const symbol = zodiacSymbols[sign];
  const color = zodiacColors[sign];

  return (
    <group ref={groupRef} scale={scale}>
      {/* Background disc */}
      <mesh>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Symbol text */}
      <Text
        position={[0, 0, 0.15]}
        fontSize={0.8}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {symbol}
      </Text>

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[1.1, 1.3, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sparkle particles */}
      {animate && [...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle + Date.now() * 0.001) * radius,
              Math.sin(Date.now() * 0.002 + i) * 0.3,
              Math.sin(angle + Date.now() * 0.001) * radius
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
};
