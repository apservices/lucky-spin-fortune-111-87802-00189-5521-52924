/**
 * Particle Background Component
 * Creates a beautiful floating coin background with parallax layers
 */

import React, { useRef, useEffect, useState } from 'react';
import { PremiumParticleCanvas, PremiumParticleCanvasRef } from '@/components/PremiumParticleCanvas';
import { cn } from '@/lib/utils';
import { fastPerformanceMonitor } from '@/utils/performance/FastPerformanceMonitor';

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
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Monitor performance and disable particles if FPS is too low
    const unsubscribe = fastPerformanceMonitor.subscribe((metrics) => {
      if (metrics.fps < 25) {
        setIsLowPerformance(true);
        if (particleRef.current) {
          particleRef.current.stop();
        }
      } else if (metrics.fps > 40 && isLowPerformance) {
        setIsLowPerformance(false);
        if (particleRef.current) {
          particleRef.current.start();
        }
      }
    });

    // Start the background particle system
    if (particleRef.current && !isLowPerformance) {
      particleRef.current.start();
    }

    return () => {
      unsubscribe();
    };
  }, [isLowPerformance]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background Particle Layer - Only render if performance is acceptable */}
      {!isLowPerformance && (
        <PremiumParticleCanvas
          ref={particleRef}
          className="absolute inset-0 opacity-20"
          autoStart={false}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-transparent to-background/60 pointer-events-none z-5" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};