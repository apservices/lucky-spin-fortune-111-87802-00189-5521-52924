/**
 * Performance-Optimized Particle System
 * Advanced particle effects with object pooling and Canvas API
 */

import { gameEvents, GameEventType } from './EventSystem';

// Particle types
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: ParticleType;
  alpha: number;
  rotation?: number;
  rotationSpeed?: number;
  scale?: number;
  scaleSpeed?: number;
}

export enum ParticleType {
  COIN = 'coin',
  SPARK = 'spark',
  CONFETTI = 'confetti',
  GLOW = 'glow',
  SMOKE = 'smoke',
  FIRE = 'fire',
  STAR = 'star',
  HEART = 'heart'
}

// Particle emitter configuration
export interface EmitterConfig {
  x: number;
  y: number;
  particleCount: number;
  particleType: ParticleType;
  duration: number;
  spread: number;
  speed: { min: number; max: number };
  size: { min: number; max: number };
  colors: string[];
  gravity?: number;
  fadeOut?: boolean;
  burst?: boolean;
}

/**
 * Object Pool for particle management
 */
class ParticlePool {
  private available: Particle[] = [];
  private active: Particle[] = [];
  private poolSize: number;

  constructor(poolSize = 1000) {
    this.poolSize = poolSize;
    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.available.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 1,
      color: '#ffffff',
      life: 1,
      maxLife: 1,
      type: ParticleType.SPARK,
      alpha: 1,
      rotation: 0,
      rotationSpeed: 0,
      scale: 1,
      scaleSpeed: 0
    };
  }

  acquire(): Particle | null {
    if (this.available.length === 0) {
      console.warn('Particle pool exhausted');
      return null;
    }

    const particle = this.available.pop()!;
    this.active.push(particle);
    return particle;
  }

  release(particle: Particle): void {
    const index = this.active.indexOf(particle);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.available.push(particle);
    }
  }

  getActive(): Particle[] {
    return this.active;
  }

  clear(): void {
    this.available.push(...this.active);
    this.active = [];
  }

  getStats() {
    return {
      total: this.poolSize,
      active: this.active.length,
      available: this.available.length
    };
  }
}

/**
 * Main Particle System Class
 */
export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pool: ParticlePool;
  private emitters: Map<string, EmitterConfig> = new Map();
  private animationId: number | null = null;
  private enabled = true;
  private lastTime = 0;
  private gravity = 0.1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.pool = new ParticlePool();
    
    this.setupEventListeners();
    this.resize();
    this.start();
  }

  /**
   * Setup game event listeners for automatic particles
   */
  private setupEventListeners(): void {
    gameEvents.on(GameEventType.WIN, (data) => {
      this.createCoinBurst(
        this.canvas.width / 2,
        this.canvas.height / 2,
        Math.min(data.amount / 10, 50)
      );
    });

    gameEvents.on(GameEventType.BIG_WIN, (data) => {
      this.createBigWinEffect(
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    });

    gameEvents.on(GameEventType.JACKPOT, () => {
      this.createJackpotEffect();
    });

    gameEvents.on(GameEventType.LEVEL_UP, () => {
      this.createLevelUpEffect();
    });
  }

  /**
   * Resize canvas to fit container
   */
  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  /**
   * Start the particle system animation loop
   */
  start(): void {
    if (this.animationId === null) {
      this.animate(0);
    }
  }

  /**
   * Stop the particle system
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Main animation loop
   */
  private animate(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.enabled) {
      this.update(deltaTime);
      this.render();
    }

    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Update all particles
   */
  private update(deltaTime: number): void {
    const particles = this.pool.getActive();
    const toRemove: Particle[] = [];

    particles.forEach(particle => {
      // Update position
      particle.x += particle.vx * deltaTime * 0.01;
      particle.y += particle.vy * deltaTime * 0.01;
      
      // Apply gravity for certain types
      if (particle.type === ParticleType.COIN || particle.type === ParticleType.CONFETTI) {
        particle.vy += this.gravity;
      }

      // Update rotation
      if (particle.rotation !== undefined && particle.rotationSpeed) {
        particle.rotation += particle.rotationSpeed * deltaTime * 0.01;
      }

      // Update scale
      if (particle.scale !== undefined && particle.scaleSpeed) {
        particle.scale += particle.scaleSpeed * deltaTime * 0.01;
        particle.scale = Math.max(0, particle.scale);
      }

      // Update life
      particle.life -= deltaTime * 0.001;
      particle.alpha = particle.life / particle.maxLife;

      // Mark for removal if dead
      if (particle.life <= 0) {
        toRemove.push(particle);
      }
    });

    // Remove dead particles
    toRemove.forEach(particle => this.pool.release(particle));
  }

  /**
   * Render all particles
   */
  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const particles = this.pool.getActive();
    
    particles.forEach(particle => {
      this.ctx.save();
      
      // Set alpha
      this.ctx.globalAlpha = particle.alpha;
      
      // Translate to particle position
      this.ctx.translate(particle.x, particle.y);
      
      // Apply rotation
      if (particle.rotation) {
        this.ctx.rotate(particle.rotation);
      }
      
      // Apply scale
      if (particle.scale && particle.scale !== 1) {
        this.ctx.scale(particle.scale, particle.scale);
      }
      
      // Render based on type
      this.renderParticle(particle);
      
      this.ctx.restore();
    });
  }

  /**
   * Render individual particle based on type
   */
  private renderParticle(particle: Particle): void {
    this.ctx.fillStyle = particle.color;
    
    switch (particle.type) {
      case ParticleType.COIN:
        this.renderCoin(particle);
        break;
      case ParticleType.SPARK:
        this.renderSpark(particle);
        break;
      case ParticleType.CONFETTI:
        this.renderConfetti(particle);
        break;
      case ParticleType.GLOW:
        this.renderGlow(particle);
        break;
      case ParticleType.STAR:
        this.renderStar(particle);
        break;
      default:
        // Default circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
  }

  private renderCoin(particle: Particle): void {
    // Draw coin as golden circle with shine effect
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(0.7, '#ffb347');
    gradient.addColorStop(1, '#ff8c00');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add shine
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(-particle.size * 0.3, -particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderSpark(particle: Particle): void {
    // Draw spark as bright line
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-particle.size, 0);
    this.ctx.lineTo(particle.size, 0);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(0, -particle.size);
    this.ctx.lineTo(0, particle.size);
    this.ctx.stroke();
  }

  private renderConfetti(particle: Particle): void {
    // Draw confetti as rotated rectangle
    this.ctx.fillRect(-particle.size * 0.5, -particle.size * 0.1, particle.size, particle.size * 0.2);
  }

  private renderGlow(particle: Particle): void {
    // Draw glow with gradient
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderStar(particle: Particle): void {
    // Draw 5-pointed star
    const spikes = 5;
    const outerRadius = particle.size;
    const innerRadius = particle.size * 0.5;
    
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Create a coin burst effect
   */
  createCoinBurst(x: number, y: number, count = 20): void {
    for (let i = 0; i < count; i++) {
      const particle = this.pool.acquire();
      if (!particle) break;

      const angle = (Math.PI * 2 * i) / count;
      const speed = 100 + Math.random() * 100;

      Object.assign(particle, {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 8 + Math.random() * 6,
        color: '#ffd700',
        life: 2 + Math.random(),
        maxLife: 2 + Math.random(),
        type: ParticleType.COIN,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 5,
        scale: 1,
        scaleSpeed: 0
      });
    }
  }

  /**
   * Create big win effect
   */
  createBigWinEffect(x: number, y: number): void {
    // Coin burst
    this.createCoinBurst(x, y, 30);
    
    // Sparkles
    for (let i = 0; i < 50; i++) {
      const particle = this.pool.acquire();
      if (!particle) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      Object.assign(particle, {
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: ['#ffd700', '#ff6b35', '#f7931e', '#ffb347'][Math.floor(Math.random() * 4)],
        life: 1.5 + Math.random(),
        maxLife: 1.5 + Math.random(),
        type: ParticleType.SPARK,
        alpha: 1
      });
    }
  }

  /**
   * Create jackpot effect
   */
  createJackpotEffect(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Multiple coin bursts
    for (let j = 0; j < 5; j++) {
      setTimeout(() => {
        this.createCoinBurst(
          centerX + (Math.random() - 0.5) * 200,
          centerY + (Math.random() - 0.5) * 200,
          40
        );
      }, j * 200);
    }

    // Confetti rain
    for (let i = 0; i < 100; i++) {
      const particle = this.pool.acquire();
      if (!particle) break;

      Object.assign(particle, {
        x: Math.random() * this.canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 50,
        vy: 100 + Math.random() * 100,
        size: 4 + Math.random() * 6,
        color: ['#ff6b35', '#f7931e', '#ffb347', '#ffd700', '#ff1744'][Math.floor(Math.random() * 5)],
        life: 3 + Math.random() * 2,
        maxLife: 3 + Math.random() * 2,
        type: ParticleType.CONFETTI,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
        scale: 1,
        scaleSpeed: 0
      });
    }
  }

  /**
   * Create level up effect
   */
  createLevelUpEffect(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Star burst
    for (let i = 0; i < 20; i++) {
      const particle = this.pool.acquire();
      if (!particle) break;

      const angle = (Math.PI * 2 * i) / 20;
      const speed = 80 + Math.random() * 60;

      Object.assign(particle, {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 4,
        color: '#ffb347',
        life: 2 + Math.random(),
        maxLife: 2 + Math.random(),
        type: ParticleType.STAR,
        alpha: 1,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 3,
        scale: 0.5,
        scaleSpeed: 0.3
      });
    }
  }

  /**
   * Enable/disable particle system
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.pool.clear();
    }
  }

  /**
   * Get system stats
   */
  getStats() {
    return {
      enabled: this.enabled,
      particles: this.pool.getStats()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stop();
    this.pool.clear();
  }
}

// React hook for using particle system
import { useEffect, useRef } from 'react';

export const useParticleSystem = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const systemRef = useRef<ParticleSystem | null>(null);

  useEffect(() => {
    if (canvasRef.current && !systemRef.current) {
      systemRef.current = new ParticleSystem(canvasRef.current);
      
      // Handle window resize
      const handleResize = () => {
        systemRef.current?.resize();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        systemRef.current?.destroy();
      };
    }
  }, [canvasRef]);

  return systemRef.current;
};