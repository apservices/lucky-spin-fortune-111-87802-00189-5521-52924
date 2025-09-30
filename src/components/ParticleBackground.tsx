/**
 * Particle Background Component
 * Creates a beautiful floating coin background with parallax layers
 */

import React, { useRef, useEffect } from 'react';
import { PremiumParticleCanvas, PremiumParticleCanvasRef } from '@/components/PremiumParticleCanvas';
import { cn } from '@/lib/utils';

interface ParticleBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  children,
  className,
  intensity = 0.5
}) => {
  const particleRef = useRef<PremiumParticleCanvasRef>(null);

  useEffect(() => {
    // Start the background particle system
    if (particleRef.current) {
      particleRef.current.start();
    }
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background Particle Layer */}
      <PremiumParticleCanvas
        ref={particleRef}
        className="absolute inset-0 opacity-30"
        autoStart={true}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-transparent to-background/60 pointer-events-none z-5" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};