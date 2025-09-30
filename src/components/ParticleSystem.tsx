import React, { useEffect, useRef, useState } from 'react';
import { AdvancedParticleSystem } from './AdvancedParticleSystem';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'coin' | 'sparkle' | 'star' | 'dragon';
}

interface ParticleSystemProps {
  trigger: number;
  type: 'win' | 'jackpot' | 'coin_burst' | 'dragon_fire';
  intensity?: number;
  centerX?: number;
  centerY?: number;
  width?: number;
  height?: number;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  trigger,
  type,
  intensity = 1,
  centerX = 50,
  centerY = 50,
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);

  const createParticles = () => {
    const newParticles: Particle[] = [];
    const count = getParticleCount(type, intensity);

    for (let i = 0; i < count; i++) {
      const particle = createParticle(type, centerX, centerY);
      newParticles.push(particle);
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  const getParticleCount = (type: string, intensity: number): number => {
    switch (type) {
      case 'win': return Math.floor(15 * intensity);
      case 'jackpot': return Math.floor(50 * intensity);
      case 'coin_burst': return Math.floor(25 * intensity);
      case 'dragon_fire': return Math.floor(30 * intensity);
      default: return 10;
    }
  };

  const createParticle = (type: string, centerX: number, centerY: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    
    let particleType: Particle['type'] = 'sparkle';
    let color = '#FFD700';
    let size = Math.random() * 4 + 2;
    let life = Math.random() * 60 + 40;

    switch (type) {
      case 'win':
        particleType = Math.random() > 0.5 ? 'coin' : 'sparkle';
        color = Math.random() > 0.5 ? '#FFD700' : '#FFA500';
        break;
      case 'jackpot':
        particleType = Math.random() > 0.3 ? 'coin' : 'star';
        color = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 4)];
        size = Math.random() * 8 + 4;
        life = Math.random() * 100 + 60;
        break;
      case 'coin_burst':
        particleType = 'coin';
        color = '#FFD700';
        size = Math.random() * 6 + 3;
        break;
      case 'dragon_fire':
        particleType = 'dragon';
        color = ['#FF4757', '#FF6B35', '#FFD23F'][Math.floor(Math.random() * 3)];
        size = Math.random() * 10 + 5;
        life = Math.random() * 80 + 40;
        break;
    }

    return {
      id: particleIdRef.current++,
      x: centerX + (Math.random() - 0.5) * 20,
      y: centerY + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size,
      color,
      type: particleType,
    };
  };

  const animate = () => {
    setParticles(prevParticles => {
      const updatedParticles = prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.2, // Gravity
          vx: particle.vx * 0.99, // Air resistance
          life: particle.life - 1,
        }))
        .filter(particle => particle.life > 0);

      return updatedParticles;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = particle.life / particle.maxLife;
    ctx.globalAlpha = alpha;

    switch (particle.type) {
      case 'coin':
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine effect
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'sparkle':
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.size, particle.y);
        ctx.lineTo(particle.x + particle.size, particle.y);
        ctx.moveTo(particle.x, particle.y - particle.size);
        ctx.lineTo(particle.x, particle.y + particle.size);
        ctx.stroke();
        break;
        
      case 'star':
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = particle.size;
        const innerRadius = particle.size * 0.5;
        
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = particle.x + Math.cos(angle) * radius;
          const y = particle.y + Math.sin(angle) * radius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'dragon':
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    if (trigger > 0) {
      createParticles();
    }
  }, [trigger]);

  useEffect(() => {
    if (particles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2; // High DPI
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    particles.forEach(particle => drawParticle(ctx, particle));
  }, [particles]);

  // Map legacy types to new system
  const advancedType = type === 'win' ? 'victory_stars' 
    : type === 'jackpot' ? 'jackpot_explosion'
    : type === 'coin_burst' ? 'coin_burst'
    : 'coin_burst';

  return (
    <>
      {/* Legacy fallback canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: 0.5, // Reduce opacity for blending
        }}
      />
      
      {/* New advanced particle system */}
      <AdvancedParticleSystem
        trigger={trigger}
        type={advancedType}
        intensity={intensity}
        centerX={(centerX / 100) * width}
        centerY={(centerY / 100) * height}
        width={width}
        height={height}
      />
    </>
  );
};