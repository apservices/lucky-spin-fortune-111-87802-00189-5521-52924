import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Particle3DSystem, ParticleType3D } from '@/systems/Particle3DSystem';
import * as THREE from 'three';

interface Particle3DCanvasProps {
  enabled?: boolean;
}

export const Particle3DCanvas: React.FC<Particle3DCanvasProps> = ({ enabled = true }) => {
  const { scene } = useThree();
  const systemRef = useRef<Particle3DSystem | null>(null);

  useEffect(() => {
    if (!enabled) return;

    systemRef.current = new Particle3DSystem(scene);

    return () => {
      systemRef.current?.dispose();
    };
  }, [scene, enabled]);

  useFrame((state, delta) => {
    if (systemRef.current && enabled) {
      systemRef.current.update(delta);
    }
  });

  return null;
};

// Utility hook for emitting particles
export const useParticleEmitter = () => {
  const { scene } = useThree();
  const systemRef = useRef<Particle3DSystem | null>(null);

  useEffect(() => {
    systemRef.current = new Particle3DSystem(scene);
    return () => {
      systemRef.current?.dispose();
    };
  }, [scene]);

  const emitCoinExplosion = (position: THREE.Vector3, count: number = 20) => {
    systemRef.current?.emitCoinExplosion(position, count);
  };

  const emitWinEffect = (position: THREE.Vector3) => {
    systemRef.current?.emitWinEffect(position, 50);
  };

  const emitJackpot = (position: THREE.Vector3) => {
    systemRef.current?.emitJackpotExplosion(position, 100);
  };

  return {
    emitCoinExplosion,
    emitWinEffect,
    emitJackpot
  };
};
