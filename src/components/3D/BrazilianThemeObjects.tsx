import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BrazilianThemeObjectsProps {
  showCarnival?: boolean;
  showCristoRedentor?: boolean;
  showBandeira?: boolean;
}

export const BrazilianThemeObjects: React.FC<BrazilianThemeObjectsProps> = ({
  showCarnival = false,
  showCristoRedentor = true,
  showBandeira = false
}) => {
  const bandeiraRef = useRef<THREE.Mesh>(null);
  const chapeuRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Bandeira ondulando (cloth simulation simplificada)
    if (bandeiraRef.current) {
      const geometry = bandeiraRef.current.geometry as THREE.PlaneGeometry;
      const positions = geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const wave = Math.sin(x * 3 + time * 2) * 0.1;
        positions.setZ(i, wave);
      }
      positions.needsUpdate = true;
    }

    // Chapéu de carnaval girando suavemente
    if (chapeuRef.current && showCarnival) {
      chapeuRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group>
      {/* Cristo Redentor em parallax distante */}
      {showCristoRedentor && (
        <group position={[0, 5, -20]} scale={0.5}>
          {/* Base */}
          <mesh position={[0, -2, 0]}>
            <cylinderGeometry args={[1, 1.5, 4, 8]} />
            <meshStandardMaterial color="#CCCCCC" />
          </mesh>

          {/* Corpo */}
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.1} />
          </mesh>

          {/* Braços estendidos */}
          <mesh position={[2, 1, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-2, 1, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          {/* Cabeça */}
          <mesh position={[0, 3, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} />
          </mesh>

          {/* Halo dourado */}
          <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.05, 8, 32]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.8}
              metalness={1}
            />
          </mesh>
        </group>
      )}

      {/* Chapéu de carnaval com plumas */}
      {showCarnival && (
        <group ref={chapeuRef} position={[3, 2, 0]}>
          {/* Base do chapéu */}
          <mesh>
            <cylinderGeometry args={[0.8, 1, 0.5, 16]} />
            <meshStandardMaterial color="#FF1493" metalness={0.5} roughness={0.3} />
          </mesh>

          {/* Plumas */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i / 5) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.6, 0.5 + i * 0.2, Math.sin(angle) * 0.6]}
                rotation={[0, angle, Math.PI / 6]}
              >
                <coneGeometry args={[0.1, 1.5, 8]} />
                <meshStandardMaterial
                  color={['#FF1493', '#00FF00', '#FFD700', '#00BFFF', '#FF4500'][i]}
                  emissive={['#FF1493', '#00FF00', '#FFD700', '#00BFFF', '#FF4500'][i]}
                  emissiveIntensity={0.3}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Bandeira brasileira ondulando */}
      {showBandeira && (
        <mesh ref={bandeiraRef} position={[-4, 2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <planeGeometry args={[3, 2, 16, 16]} />
          <meshStandardMaterial
            color="#00A859"
            side={THREE.DoubleSide}
            wireframe={false}
          />
        </mesh>
      )}

      {/* Moedas com R$ extrudado */}
      {[...Array(3)].map((_, i) => (
        <group key={i} position={[i * 2 - 2, -3, 2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
            <meshStandardMaterial
              color="#FFD700"
              metalness={1}
              roughness={0.2}
              emissive="#FFD700"
              emissiveIntensity={0.3}
            />
          </mesh>
          <Text
            position={[0, 0, 0.06]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.3}
            color="#228B22"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Bold.ttf"
          >
            R$
          </Text>
        </group>
      ))}
    </group>
  );
};
