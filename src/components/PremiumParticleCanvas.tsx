/**
 * Premium Particle Canvas Component
 * React wrapper for the PremiumParticleSystem
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { PremiumParticleSystem } from '@/systems/PremiumParticleSystem';
import { cn } from '@/lib/utils';

interface PremiumParticleCanvasProps {
  className?: string;
  width?: number;
  height?: number;
  autoStart?: boolean;
}

export interface PremiumParticleCanvasRef {
  emitWinEffect: (centerX: number, centerY: number, intensity?: number) => void;
  emitJackpotEffect: (centerX: number, centerY: number, intensity?: number) => void;
  emitCoinBurst: (centerX: number, centerY: number, intensity?: number) => void;
  start: () => void;
  stop: () => void;
  getStats: () => any;
}

export const PremiumParticleCanvas = forwardRef<
  PremiumParticleCanvasRef,
  PremiumParticleCanvasProps
>(({ className, width = 800, height = 600, autoStart = true }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<PremiumParticleSystem | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      particleSystemRef.current = new PremiumParticleSystem(canvasRef.current);
      
      if (autoStart) {
        particleSystemRef.current.start();
      }

      // Handle resize
      const handleResize = () => {
        particleSystemRef.current?.resize();
      };
      
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        particleSystemRef.current?.dispose();
      };
    } catch (error) {
      console.error('Failed to initialize particle system:', error);
    }
  }, [autoStart]);

  useImperativeHandle(ref, () => ({
    emitWinEffect: (centerX: number, centerY: number, intensity = 1) => {
      particleSystemRef.current?.emitEffect({
        type: 'win',
        centerX,
        centerY,
        intensity,
        duration: 2000
      });
    },
    
    emitJackpotEffect: (centerX: number, centerY: number, intensity = 2) => {
      particleSystemRef.current?.emitEffect({
        type: 'jackpot',
        centerX,
        centerY,
        intensity,
        duration: 4000
      });
    },
    
    emitCoinBurst: (centerX: number, centerY: number, intensity = 1.5) => {
      particleSystemRef.current?.emitEffect({
        type: 'coin_burst',
        centerX,
        centerY,
        intensity,
        duration: 3000
      });
    },
    
    start: () => {
      particleSystemRef.current?.start();
    },
    
    stop: () => {
      particleSystemRef.current?.stop();
    },
    
    getStats: () => {
      return particleSystemRef.current?.getStats() || {};
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-10",
        className
      )}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
});

PremiumParticleCanvas.displayName = 'PremiumParticleCanvas';