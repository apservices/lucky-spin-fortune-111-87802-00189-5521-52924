import React, { useEffect, useRef, useState } from 'react';

interface OptimizedParticleSystemProps {
  trigger: number;
  type: 'win' | 'jackpot' | 'coin_burst';
  intensity?: number;
  centerX?: number;
  centerY?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const OptimizedParticleSystem: React.FC<OptimizedParticleSystemProps> = ({
  trigger,
  type,
  intensity = 1,
  centerX = 50,
  centerY = 50
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();

  const createParticles = () => {
    const count = Math.min(intensity * 8, 20); // Max 20 particles for performance
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      
      newParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 60 + Math.random() * 30, // 60-90 frames
        size: 2 + Math.random() * 3,
        color: type === 'jackpot' ? '#FFD700' : type === 'coin_burst' ? '#FFA500' : '#4ADE80'
      });
    }

    setParticles(newParticles);
  };

  const updateParticles = () => {
    setParticles(prev => {
      const updated = prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.1, // gravity
        life: particle.life - (1 / particle.maxLife)
      })).filter(particle => particle.life > 0);

      if (updated.length === 0 && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        return [];
      }

      if (updated.length > 0) {
        animationRef.current = requestAnimationFrame(updateParticles);
      }

      return updated;
    });
  };

  useEffect(() => {
    if (trigger > 0) {
      createParticles();
      animationRef.current = requestAnimationFrame(updateParticles);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: `translate(-50%, -50%)`,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};