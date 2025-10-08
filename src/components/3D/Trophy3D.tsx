import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Trophy3DProps {
  position?: [number, number, number];
  rank: 1 | 2 | 3;
  scale?: number;
}

export const Trophy3D: React.FC<Trophy3DProps> = ({
  position = [0, 0, 0],
  rank,
  scale = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Material colors based on rank
  const materials = {
    1: { color: '#FFD700', emissive: '#FFD700', emissiveIntensity: 0.8 }, // Gold
    2: { color: '#C0C0C0', emissive: '#C0C0C0', emissiveIntensity: 0.6 }, // Silver
    3: { color: '#CD7F32', emissive: '#CD7F32', emissiveIntensity: 0.4 }  // Bronze
  };

  const material = materials[rank];

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Gentle rotation
    groupRef.current.rotation.y = time * 0.5;

    // Floating animation
    groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;

    // Particle trail rotation
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time;
    }
  });

  // Create particle positions
  const particleCount = 20;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 1.5;
    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
    particlePositions[i * 3 + 2] = 0;
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Base */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.3, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Stem */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
        <meshStandardMaterial
          color={material.color}
          metalness={1}
          roughness={0.1}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity * 0.5}
        />
      </mesh>

      {/* Cup body */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.8, 16]} />
        <meshStandardMaterial
          color={material.color}
          metalness={1}
          roughness={0.1}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
        />
      </mesh>

      {/* Handles */}
      <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.25, 0.05, 8, 16]} />
        <meshStandardMaterial
          color={material.color}
          metalness={1}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <torusGeometry args={[0.25, 0.05, 8, 16]} />
        <meshStandardMaterial
          color={material.color}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* Top rim */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.4, 0.05, 8, 32]} />
        <meshStandardMaterial
          color={material.color}
          metalness={1}
          roughness={0}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
        />
      </mesh>

      {/* Glow effect */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial
          color={material.color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Particle trail */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={material.color}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  );
};
