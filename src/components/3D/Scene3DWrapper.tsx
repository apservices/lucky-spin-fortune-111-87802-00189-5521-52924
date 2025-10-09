/**
 * Scene3D Wrapper - Base R3F Canvas Setup
 * Optimized for mobile with adaptive quality
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { usePerformance3D } from '@/hooks/usePerformance3D';

interface Scene3DWrapperProps {
  children: React.ReactNode;
  enableControls?: boolean;
  cameraPosition?: [number, number, number];
  fallback?: React.ReactNode;
}

export const Scene3DWrapper: React.FC<Scene3DWrapperProps> = ({
  children,
  enableControls = false,
  cameraPosition = [0, 0, 5],
  fallback = <div className="w-full h-full bg-gradient-to-br from-black via-pgbet-dark to-black animate-pulse" />
}) => {
  const { qualitySettings, enable3D } = usePerformance3D();

  if (!enable3D) {
    return null;
  }

  return (
    <Suspense fallback={fallback}>
      <Canvas
        dpr={qualitySettings.pixelRatio}
        shadows={qualitySettings.shadowMapSize > 512}
        gl={{ 
          antialias: qualitySettings.antialias,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        performance={{ min: 0.5 }}
        className="w-full h-full"
      >
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={60}
          near={0.1}
          far={1000}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          color="#FFD700"
          castShadow={qualitySettings.shadowMapSize > 512}
        />
        <directionalLight
          position={[-5, 3, -5]}
          intensity={0.6}
          color="#FF6B47"
        />

        {/* Environment HDR for reflections */}
        {qualitySettings.antialias && (
          <Environment preset="sunset" background={false} />
        )}

        {/* Optional orbit controls */}
        {enableControls && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        )}

        {/* Children components */}
        {children}
      </Canvas>
    </Suspense>
  );
};
