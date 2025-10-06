/**
 * Zodiac Wheel 3D - Rotating Fortune Wheel
 * 8 zodiac sectors with multipliers
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface ZodiacWheel3DProps {
  isSpinning: boolean;
  onSpinComplete?: (sector: number) => void;
  targetSector?: number;
}

const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏'];
const multipliers = ['x1', 'x2', 'x5', 'x10', 'x20', 'x50', 'x75', 'x100'];
const colors = ['#FF6B47', '#FFD700', '#8A2BE2', '#00FF00', '#FF1493', '#00CED1', '#FF8C00', '#FF0000'];

export const ZodiacWheel3D: React.FC<ZodiacWheel3DProps> = ({
  isSpinning,
  onSpinComplete,
  targetSector = 0
}) => {
  const wheelRef = useRef<THREE.Group>(null);
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useFrame((_, delta) => {
    if (!wheelRef.current) return;

    if (isSpinning && !spinning) {
      // Start spinning
      setSpinning(true);
      const targetRotation = (targetSector / 8) * Math.PI * 2 + Math.PI * 10; // 5 full rotations
      setVelocity(15);
    }

    if (spinning) {
      // Apply velocity with deceleration
      const newRotation = rotation + velocity * delta;
      setRotation(newRotation);
      wheelRef.current.rotation.z = newRotation;

      // Decelerate
      const deceleration = 0.95;
      const newVelocity = velocity * deceleration;
      setVelocity(newVelocity);

      // Stop when slow enough
      if (newVelocity < 0.01) {
        setSpinning(false);
        setVelocity(0);
        // Snap to target sector
        const targetRot = (targetSector / 8) * Math.PI * 2;
        setRotation(targetRot);
        wheelRef.current.rotation.z = targetRot;
        onSpinComplete?.(targetSector);
      }
    } else if (!isSpinning) {
      // Idle gentle rotation
      wheelRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group ref={wheelRef}>
      {/* Wheel sectors */}
      {zodiacSymbols.map((symbol, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const nextAngle = ((i + 1) / 8) * Math.PI * 2;
        const midAngle = (angle + nextAngle) / 2;

        // Create sector geometry
        const sectorShape = new THREE.Shape();
        sectorShape.moveTo(0, 0);
        sectorShape.arc(0, 0, 2, angle, nextAngle, false);
        sectorShape.lineTo(0, 0);

        return (
          <group key={i}>
            {/* Sector mesh */}
            <mesh rotation={[0, 0, 0]}>
              <extrudeGeometry
                args={[
                  sectorShape,
                  {
                    depth: 0.2,
                    bevelEnabled: true,
                    bevelThickness: 0.05,
                    bevelSize: 0.05,
                    bevelSegments: 3
                  }
                ]}
              />
              <meshStandardMaterial
                color={colors[i]}
                metalness={0.5}
                roughness={0.3}
                emissive={colors[i]}
                emissiveIntensity={spinning ? 0.3 : 0.1}
              />
            </mesh>

            {/* Zodiac symbol text */}
            <Text
              position={[
                Math.cos(midAngle) * 1.3,
                Math.sin(midAngle) * 1.3,
                0.3
              ]}
              rotation={[0, 0, midAngle + Math.PI / 2]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {symbol}
            </Text>

            {/* Multiplier text */}
            <Text
              position={[
                Math.cos(midAngle) * 0.8,
                Math.sin(midAngle) * 0.8,
                0.3
              ]}
              rotation={[0, 0, midAngle + Math.PI / 2]}
              fontSize={0.25}
              color="#FFD700"
              anchorX="center"
              anchorY="middle"
            >
              {multipliers[i]}
            </Text>
          </group>
        );
      })}

      {/* Center hub */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[2.1, 0.1, 16, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Indicator arrow (fixed in space) */}
      <mesh position={[0, 2.5, 0.3]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>
    </group>
  );
};
