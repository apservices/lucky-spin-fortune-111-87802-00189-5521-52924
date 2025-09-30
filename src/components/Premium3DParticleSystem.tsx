import React, { useRef, useEffect, useState, useCallback } from 'react';
import { usePremiumTheme } from './PremiumThemeProvider';

interface Premium3DParticleSystemProps {
  trigger: number;
  type: 'win' | 'jackpot' | 'coin_burst' | 'level_up' | 'multiplier';
  intensity?: number;
  centerX?: number;
  centerY?: number;
  className?: string;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  type: 'coin' | 'star' | 'sparkle' | 'ember' | 'lightning';
  opacity: number;
}

export const Premium3DParticleSystem: React.FC<Premium3DParticleSystemProps> = ({
  trigger,
  type,
  intensity = 1,
  centerX = 50,
  centerY = 50,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<Particle3D[]>([]);
  const { visualQuality } = usePremiumTheme();

  // Get particle count based on visual quality
  const getMaxParticles = useCallback(() => {
    const baseCount = intensity * 12;
    switch (visualQuality) {
      case 'low': return Math.min(baseCount * 0.3, 15);
      case 'medium': return Math.min(baseCount * 0.6, 30);
      case 'high': return Math.min(baseCount * 1, 50);
      case 'ultra': return Math.min(baseCount * 1.5, 75);
      default: return Math.min(baseCount, 50);
    }
  }, [intensity, visualQuality]);

  // Create particles based on effect type
  const createParticles = useCallback(() => {
    const count = getMaxParticles();
    const newParticles: Particle3D[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      const particleType = getParticleType();
      
      newParticles.push({
        x: centerX + (Math.random() - 0.5) * 10,
        y: centerY + (Math.random() - 0.5) * 10,
        z: Math.random() * 100,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        life: 1,
        maxLife: 60 + Math.random() * 90,
        size: getParticleSize(particleType),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        color: getParticleColor(particleType),
        type: particleType,
        opacity: 1
      });
    }

    setParticles(newParticles);
  }, [centerX, centerY, getMaxParticles, type]);

  const getParticleType = (): Particle3D['type'] => {
    const typeMap: Record<typeof type, Particle3D['type'][]> = {
      win: ['coin', 'star', 'sparkle'],
      jackpot: ['coin', 'star', 'lightning'],
      coin_burst: ['coin', 'sparkle'],
      level_up: ['star', 'sparkle', 'ember'],
      multiplier: ['lightning', 'star', 'ember']
    };
    
    const options = typeMap[type] || ['sparkle'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getParticleSize = (particleType: Particle3D['type']): number => {
    const baseSize = {
      coin: 8,
      star: 6,
      sparkle: 4,
      ember: 5,
      lightning: 3
    }[particleType];
    
    return baseSize + Math.random() * 4;
  };

  const getParticleColor = (particleType: Particle3D['type']): string => {
    const colorMap = {
      coin: ['#FFD700', '#FFA500', '#FFAA1D'],
      star: ['#FFFFFF', '#F0F8FF', '#E6E6FA'],
      sparkle: ['#00FFFF', '#FF1493', '#32CD32'],
      ember: ['#FF4500', '#FF6347', '#DC143C'],
      lightning: ['#9370DB', '#4169E1', '#00BFFF']
    };
    
    const colors = colorMap[particleType];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Canvas rendering with 3D transformations
  const renderParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort particles by z-depth for proper 3D rendering
    const sortedParticles = [...particles].sort((a, b) => b.z - a.z);

    sortedParticles.forEach(particle => {
      const scale = Math.max(0.1, 1 - particle.z / 200);
      const alpha = particle.opacity * particle.life;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      // Calculate 3D position
      const x = (particle.x / 100) * canvas.width;
      const y = (particle.y / 100) * canvas.height;
      const size = particle.size * scale;
      
      ctx.translate(x, y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      
      // Render based on particle type
      switch (particle.type) {
        case 'coin':
          renderCoin(ctx, size, particle.color);
          break;
        case 'star':
          renderStar(ctx, size, particle.color);
          break;
        case 'sparkle':
          renderSparkle(ctx, size, particle.color);
          break;
        case 'ember':
          renderEmber(ctx, size, particle.color);
          break;
        case 'lightning':
          renderLightning(ctx, size, particle.color);
          break;
      }
      
      ctx.restore();
    });
  }, [particles]);

  const renderCoin = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.7, color + '80');
    gradient.addColorStop(1, color + '20');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.3, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderStar = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = size;
    ctx.fill();
  };

  const renderSparkle = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size / 4);
    ctx.lineCap = 'round';
    
    // Cross pattern
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    
    // Diagonal lines
    ctx.moveTo(-size * 0.7, -size * 0.7);
    ctx.lineTo(size * 0.7, size * 0.7);
    ctx.moveTo(-size * 0.7, size * 0.7);
    ctx.lineTo(size * 0.7, -size * 0.7);
    
    ctx.stroke();
  };

  const renderEmber = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color + 'CC');
    gradient.addColorStop(1, color + '00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderLightning = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size / 6);
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size * 0.3, -size * 0.3);
    ctx.lineTo(size * 0.2, 0);
    ctx.lineTo(-size * 0.2, size * 0.3);
    ctx.lineTo(0, size);
    ctx.stroke();
    
    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 0.5;
    ctx.stroke();
  };

  // Update particle physics
  const updateParticles = useCallback(() => {
    setParticles(prev => {
      const updated = prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        z: particle.z + particle.vz,
        vy: particle.vy + 0.05, // gravity
        vz: particle.vz * 0.99, // z-drag
        rotation: particle.rotation + particle.rotationSpeed,
        life: particle.life - (1 / particle.maxLife),
        opacity: Math.max(0, particle.life)
      })).filter(particle => particle.life > 0 && particle.y < 120);

      return updated;
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      updateParticles();
      renderParticles();
      
      if (particles.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length, updateParticles, renderParticles]);

  // Trigger new particle burst
  useEffect(() => {
    if (trigger > 0) {
      createParticles();
    }
  }, [trigger, createParticles]);

  // Canvas resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};