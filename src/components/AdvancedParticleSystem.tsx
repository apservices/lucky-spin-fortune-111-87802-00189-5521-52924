import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Particle3D {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  life: number;
  maxLife: number;
  type: 'coin' | 'star' | 'sparkle' | 'ember';
  color: string;
  alpha: number;
  gravity: number;
  bounce: number;
  inUse: boolean;
}

interface ParallaxLayer {
  particles: Particle3D[];
  speed: number;
  depth: number;
  blur: number;
}

interface AdvancedParticleSystemProps {
  trigger: number;
  type: 'coin_burst' | 'victory_stars' | 'jackpot_explosion' | 'dragon_fire';
  intensity?: number;
  centerX?: number;
  centerY?: number;
  width?: number;
  height?: number;
}

// Object Pool para reutilização de partículas
class ParticlePool {
  private pool: Particle3D[] = [];
  private nextId = 0;

  constructor(initialSize: number = 100) {
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createParticle());
    }
  }

  private createParticle(): Particle3D {
    return {
      id: this.nextId++,
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      rotation: 0, rotationSpeed: 0,
      size: 1, life: 0, maxLife: 100,
      type: 'coin', color: '#FFD700',
      alpha: 1, gravity: 0.2, bounce: 0.7,
      inUse: false
    };
  }

  getParticle(): Particle3D | null {
    const particle = this.pool.find(p => !p.inUse);
    if (particle) {
      particle.inUse = true;
      return particle;
    }
    // Pool exhausted, create new particle
    const newParticle = this.createParticle();
    this.pool.push(newParticle);
    newParticle.inUse = true;
    return newParticle;
  }

  releaseParticle(particle: Particle3D): void {
    particle.inUse = false;
  }
}

export const AdvancedParticleSystem: React.FC<AdvancedParticleSystemProps> = ({
  trigger,
  type,
  intensity = 1,
  centerX = 50,
  centerY = 50,
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle3D[]>([]);
  const [parallaxLayers] = useState<ParallaxLayer[]>(() => [
    { particles: [], speed: 0.2, depth: 0.3, blur: 2 },
    { particles: [], speed: 0.5, depth: 0.6, blur: 1 },
    { particles: [], speed: 1.0, depth: 1.0, blur: 0 },
  ]);
  const animationRef = useRef<number>();
  const poolRef = useRef(new ParticlePool(150));
  const lastTimeRef = useRef(0);

  const createCoinBurst = useCallback((centerX: number, centerY: number, count: number) => {
    const newParticles: Particle3D[] = [];
    
    for (let i = 0; i < count; i++) {
      const particle = poolRef.current.getParticle();
      if (!particle) continue;

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = Math.random() * 8 + 4;
      const elevation = Math.random() * Math.PI * 0.3 + Math.PI * 0.1;
      
      Object.assign(particle, {
        x: centerX + (Math.random() - 0.5) * 40,
        y: centerY + (Math.random() - 0.5) * 40,
        z: Math.random() * 50,
        vx: Math.cos(angle) * Math.cos(elevation) * speed,
        vy: Math.sin(elevation) * speed * -1.5,
        vz: Math.sin(angle) * Math.cos(elevation) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 12 + 8,
        life: 180 + Math.random() * 60,
        maxLife: 180 + Math.random() * 60,
        type: 'coin' as const,
        color: '#FFD700',
        alpha: 1,
        gravity: 0.15,
        bounce: 0.6 + Math.random() * 0.3
      });
      
      newParticles.push(particle);
    }
    
    return newParticles;
  }, []);

  const createVictoryStars = useCallback((centerX: number, centerY: number, count: number) => {
    const newParticles: Particle3D[] = [];
    
    for (let i = 0; i < count; i++) {
      const particle = poolRef.current.getParticle();
      if (!particle) continue;

      const spiralAngle = (i / count) * Math.PI * 4;
      const radius = (i / count) * 100 + 20;
      
      Object.assign(particle, {
        x: centerX + Math.cos(spiralAngle) * radius,
        y: centerY + Math.sin(spiralAngle) * radius,
        z: Math.random() * 30,
        vx: Math.cos(spiralAngle + Math.PI/2) * 2,
        vy: -Math.random() * 3 - 1,
        vz: (Math.random() - 0.5) * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 8 + 4,
        life: 120 + Math.random() * 80,
        maxLife: 120 + Math.random() * 80,
        type: 'star' as const,
        color: ['#FFD700', '#FFA500', '#FF6347'][Math.floor(Math.random() * 3)],
        alpha: 0.9,
        gravity: 0.05,
        bounce: 0
      });
      
      newParticles.push(particle);
    }
    
    return newParticles;
  }, []);

  const createParticles = useCallback(() => {
    let newParticles: Particle3D[] = [];
    
    switch (type) {
      case 'coin_burst':
        newParticles = createCoinBurst(centerX, centerY, Math.floor(25 * intensity));
        break;
      case 'victory_stars':
        newParticles = createVictoryStars(centerX, centerY, Math.floor(20 * intensity));
        break;
      case 'jackpot_explosion':
        newParticles = [
          ...createCoinBurst(centerX, centerY, Math.floor(30 * intensity)),
          ...createVictoryStars(centerX, centerY, Math.floor(15 * intensity))
        ];
        break;
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, [type, intensity, centerX, centerY, createCoinBurst, createVictoryStars]);

  const updateParticles = useCallback((deltaTime: number) => {
    setParticles(prevParticles => {
      const updatedParticles: Particle3D[] = [];
      
      prevParticles.forEach(particle => {
        // Physics update
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        particle.z += particle.vz * deltaTime;
        
        particle.vy += particle.gravity * deltaTime;
        particle.rotation += particle.rotationSpeed * deltaTime;
        
        // Bounce off ground
        if (particle.y > height - 50 && particle.vy > 0) {
          particle.vy *= -particle.bounce;
          particle.vx *= 0.8; // Friction
          particle.rotationSpeed *= 0.8;
        }
        
        // Update life and alpha
        particle.life -= deltaTime;
        particle.alpha = Math.max(0, particle.life / particle.maxLife);
        
        if (particle.life > 0 && particle.x > -100 && particle.x < width + 100) {
          updatedParticles.push(particle);
        } else {
          poolRef.current.releaseParticle(particle);
        }
      });
      
      return updatedParticles;
    });
  }, [width, height]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle3D) => {
    ctx.save();
    
    // 3D perspective transformation
    const perspective = 800;
    const scale = perspective / (perspective + particle.z);
    const screenX = particle.x * scale;
    const screenY = particle.y * scale;
    
    ctx.translate(screenX, screenY);
    ctx.rotate(particle.rotation);
    ctx.scale(scale, scale);
    ctx.globalAlpha = particle.alpha;
    
    switch (particle.type) {
      case 'coin':
        // Draw 3D coin with lighting
        const gradient = ctx.createRadialGradient(
          -particle.size * 0.3, -particle.size * 0.3, 0,
          0, 0, particle.size
        );
        gradient.addColorStop(0, '#FFFF80');
        gradient.addColorStop(0.3, particle.color);
        gradient.addColorStop(1, '#CC9900');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size, particle.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(particle.size * 0.2, particle.size * 0.2, particle.size * 0.6, particle.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(-particle.size * 0.3, -particle.size * 0.3, particle.size * 0.3, particle.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'star':
        ctx.fillStyle = particle.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        
        // Draw 5-pointed star
        const spikes = 5;
        const outerRadius = particle.size;
        const innerRadius = particle.size * 0.4;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 0.5;
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }, []);

  const animate = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    if (deltaTime > 0) {
      updateParticles(Math.min(deltaTime / 16, 2)); // Cap delta time
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles sorted by depth (z-index)
    const sortedParticles = [...particles].sort((a, b) => b.z - a.z);
    sortedParticles.forEach(particle => drawParticle(ctx, particle));
  }, [particles, drawParticle]);

  // Initialize parallax background
  useEffect(() => {
    parallaxLayers.forEach((layer, index) => {
      const count = 8 - index * 2;
      for (let i = 0; i < count; i++) {
        const particle = poolRef.current.getParticle();
        if (particle) {
          Object.assign(particle, {
            x: Math.random() * width,
            y: Math.random() * height,
            z: layer.depth * 100,
            vx: (Math.random() - 0.5) * layer.speed,
            vy: layer.speed * 0.5,
            size: Math.random() * 6 + 2 + (2 - index) * 2,
            life: Infinity,
            maxLife: Infinity,
            type: 'coin' as const,
            color: '#FFD700',
            alpha: 0.1 + layer.depth * 0.2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            gravity: 0,
            bounce: 0
          });
          layer.particles.push(particle);
        }
      }
    });
  }, [width, height, parallaxLayers]);

  useEffect(() => {
    if (trigger > 0) {
      createParticles();
    }
  }, [trigger, createParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = width * 2; // High DPI
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
    }
    
    if (particles.length > 0 || parallaxLayers.some(layer => layer.particles.length > 0)) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length, animate, width, height, parallaxLayers]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{
        filter: 'blur(0px)', // Can be adjusted per layer
      }}
    />
  );
};