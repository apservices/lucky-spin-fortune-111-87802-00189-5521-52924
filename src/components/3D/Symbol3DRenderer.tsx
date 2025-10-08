import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface Symbol3DRendererProps {
  symbol: string;
  position?: [number, number, number];
  scale?: number;
  isWinning?: boolean;
  color?: string;
}

export const Symbol3DRenderer: React.FC<Symbol3DRendererProps> = ({
  symbol,
  position = [0, 0, 0],
  scale = 1,
  isWinning = false,
  color = '#FFD700'
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Gentle idle rotation
    if (!isWinning) {
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    } else {
      // Winning animation: spin and pulse
      meshRef.current.rotation.y += 0.05;
      const pulseScale = 1 + Math.sin(time * 5) * 0.1;
      meshRef.current.scale.setScalar(scale * pulseScale);
      
      // Glow pulse
      glowRef.current.scale.setScalar(1.2 + Math.sin(time * 3) * 0.2);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 4) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Glow ring */}
      <mesh ref={glowRef} position={[0, 0, -0.1]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isWinning ? 0.5 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main symbol mesh */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 1.5, 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isWinning ? 0.8 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Symbol text */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.8}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {symbol}
      </Text>

      {/* Sparkle particles for winning symbols */}
      {isWinning && (
        <>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 1.5;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle) * radius,
                  0
                ]}
              >
                <sphereGeometry args={[0.05]} />
                <meshBasicMaterial color="#FFD700" />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};
