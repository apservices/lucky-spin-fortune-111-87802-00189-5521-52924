/**
 * Premium Particle System with Canvas/WebGL
 * High-performance particle effects with object pooling and adaptive quality
 */

interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  maxSize: number;
  color: string;
  type: ParticleType;
  gravity: number;
  friction: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  glowIntensity: number;
}

type ParticleType = 'coin' | 'sparkle' | 'star' | 'glow' | 'trail' | 'burst';

interface EffectConfig {
  intensity: number;
  duration: number;
  centerX: number;
  centerY: number;
  type: 'win' | 'jackpot' | 'coin_burst' | 'background';
}

class Particle implements ParticleConfig {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  life = 1;
  maxLife = 60;
  size = 1;
  maxSize = 1;
  color = '#FFD700';
  type: ParticleType = 'coin';
  gravity = 0.1;
  friction = 0.99;
  rotation = 0;
  rotationSpeed = 0;
  opacity = 1;
  glowIntensity = 0;
  active = false;

  reset(config: Partial<ParticleConfig>) {
    Object.assign(this, config);
    this.active = true;
    this.life = 1;
    this.rotation = 0;
    this.opacity = 1;
  }

  update() {
    if (!this.active) return false;

    // Physics
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    // Life cycle
    this.life -= 1 / this.maxLife;
    this.opacity = Math.max(0, this.life);
    this.size = this.maxSize * (0.5 + 0.5 * this.life);

    if (this.life <= 0) {
      this.active = false;
      return false;
    }

    return true;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.active || this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    switch (this.type) {
      case 'coin':
        this.renderCoin(ctx);
        break;
      case 'sparkle':
        this.renderSparkle(ctx);
        break;
      case 'star':
        this.renderStar(ctx);
        break;
      case 'glow':
        this.renderGlow(ctx);
        break;
      case 'trail':
        this.renderTrail(ctx);
        break;
      case 'burst':
        this.renderBurst(ctx);
        break;
    }

    ctx.restore();
  }

  private renderCoin(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, '#FFE55C');
    gradient.addColorStop(0.3, '#FFD700');
    gradient.addColorStop(0.7, '#B8860B');
    gradient.addColorStop(1, '#8B6914');

    // Shadow for 3D effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.shadowBlur = 0;
    const highlightGrad = ctx.createRadialGradient(-this.size * 0.3, -this.size * 0.3, 0, 0, 0, this.size * 0.5);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.fill();
  }

  private renderSparkle(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const arms = 4;
    for (let i = 0; i < arms; i++) {
      const angle = (i / arms) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(cos * this.size * 0.3, sin * this.size * 0.3);
      ctx.lineTo(cos * this.size, sin * this.size);
      ctx.stroke();
    }
  }

  private renderStar(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    const spikes = 5;
    const outerRadius = this.size;
    const innerRadius = this.size * 0.4;

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fill();
  }

  private renderGlow(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, `rgba(255, 215, 0, ${this.glowIntensity})`);
    gradient.addColorStop(0.5, `rgba(255, 215, 0, ${this.glowIntensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderTrail(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(-this.size, 0, this.size, 0);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.size * 0.1;
    ctx.beginPath();
    ctx.moveTo(-this.size, 0);
    ctx.lineTo(this.size, 0);
    ctx.stroke();
  }

  private renderBurst(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;

  constructor(createFn: () => T, initialSize = 100) {
    this.createFn = createFn;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  get(): T {
    return this.pool.pop() || this.createFn();
  }

  release(object: T) {
    this.pool.push(object);
  }

  getPoolSize() {
    return this.pool.length;
  }
}

export class PremiumParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private particlePool: ObjectPool<Particle>;
  private animationId: number = 0;
  private isRunning = false;
  private lastTime = 0;
  private fps = 60;
  private targetFPS = 60;
  private performanceMode: 'high' | 'medium' | 'low' = 'high';
  
  // Performance monitoring
  private frameCount = 0;
  private fpsCounter = 0;
  private lastFpsTime = 0;

  // Background layers for parallax
  private backgroundLayers: Array<{
    particles: Particle[];
    speed: number;
    blur: number;
  }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;

    // Initialize object pool
    this.particlePool = new ObjectPool(() => new Particle(), 200);

    // Setup canvas
    this.setupCanvas();
    this.initializeBackgroundLayers();

    // Performance monitoring
    this.monitorPerformance();
  }

  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.ctx.scale(dpr, dpr);
  }

  private initializeBackgroundLayers() {
    // Create 3 parallax layers
    for (let layer = 0; layer < 3; layer++) {
      const layerData = {
        particles: [],
        speed: 0.2 + layer * 0.3, // Different speeds for depth
        blur: layer * 2 // Progressive blur
      };

      // Add floating coins to each layer
      for (let i = 0; i < 5; i++) {
        const particle = this.particlePool.get();
        particle.reset({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * layerData.speed,
          vy: (Math.random() - 0.5) * layerData.speed * 0.5,
          size: 8 + layer * 4,
          maxSize: 8 + layer * 4,
          type: 'coin',
          gravity: 0,
          friction: 1,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          maxLife: Infinity,
          opacity: 0.3 - layer * 0.1
        });
        layerData.particles.push(particle);
      }

      this.backgroundLayers.push(layerData);
    }
  }

  private monitorPerformance() {
    setInterval(() => {
      // Adjust performance mode based on FPS
      if (this.fpsCounter < 45) {
        this.performanceMode = 'low';
        this.targetFPS = 30;
      } else if (this.fpsCounter < 55) {
        this.performanceMode = 'medium';
        this.targetFPS = 50;
      } else {
        this.performanceMode = 'high';
        this.targetFPS = 60;
      }

      this.frameCount = 0;
      this.fpsCounter = 0;
    }, 1000);
  }

  emitEffect(config: EffectConfig) {
    const particleCount = this.getParticleCount(config);
    
    switch (config.type) {
      case 'coin_burst':
        this.emitCoinBurst(config, particleCount);
        break;
      case 'win':
        this.emitWinEffect(config, particleCount);
        break;
      case 'jackpot':
        this.emitJackpotEffect(config, particleCount);
        break;
    }
  }

  private getParticleCount(config: EffectConfig): number {
    const baseCount = Math.floor(config.intensity * 10);
    
    switch (this.performanceMode) {
      case 'low': return Math.min(baseCount * 0.3, 15);
      case 'medium': return Math.min(baseCount * 0.7, 40);
      case 'high': return Math.min(baseCount, 80);
    }
  }

  private emitCoinBurst(config: EffectConfig, count: number) {
    for (let i = 0; i < count; i++) {
      const particle = this.particlePool.get();
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      
      particle.reset({
        x: config.centerX,
        y: config.centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 6 + Math.random() * 8,
        maxSize: 6 + Math.random() * 8,
        type: 'coin',
        color: '#FFD700',
        gravity: 0.15,
        friction: 0.98,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        maxLife: 90 + Math.random() * 60
      });
      
      this.particles.push(particle);
    }
  }

  private emitWinEffect(config: EffectConfig, count: number) {
    // Golden spiral particles
    for (let i = 0; i < count; i++) {
      const particle = this.particlePool.get();
      const spiralAngle = (i / count) * Math.PI * 4;
      const spiralRadius = i * 2;
      
      particle.reset({
        x: config.centerX + Math.cos(spiralAngle) * spiralRadius,
        y: config.centerY + Math.sin(spiralAngle) * spiralRadius,
        vx: Math.cos(spiralAngle + Math.PI/2) * 1,
        vy: -2 - Math.random(),
        size: 4 + Math.random() * 6,
        maxSize: 4 + Math.random() * 6,
        type: Math.random() > 0.5 ? 'sparkle' : 'star',
        color: '#FFD700',
        gravity: -0.05,
        friction: 0.99,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        maxLife: 120 + Math.random() * 60,
        glowIntensity: 0.8
      });
      
      this.particles.push(particle);
    }
  }

  private emitJackpotEffect(config: EffectConfig, count: number) {
    // Massive explosion with multiple particle types
    for (let i = 0; i < count; i++) {
      const particle = this.particlePool.get();
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      const types: ParticleType[] = ['coin', 'star', 'sparkle', 'glow', 'burst'];
      
      particle.reset({
        x: config.centerX,
        y: config.centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 8 + Math.random() * 12,
        maxSize: 8 + Math.random() * 12,
        type: types[Math.floor(Math.random() * types.length)],
        color: Math.random() > 0.3 ? '#FFD700' : '#FF6B47',
        gravity: 0.1,
        friction: 0.97,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        maxLife: 150 + Math.random() * 100,
        glowIntensity: 1.0
      });
      
      this.particles.push(particle);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private animate = (currentTime: number = performance.now()) => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    const targetFrameTime = 1000 / this.targetFPS;

    // FPS monitoring
    this.frameCount++;
    if (currentTime - this.lastFpsTime >= 1000) {
      this.fpsCounter = this.frameCount;
      this.lastFpsTime = currentTime;
    }

    if (deltaTime >= targetFrameTime) {
      this.update();
      this.render();
      this.lastTime = currentTime;
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  private update() {
    // Update main particles
    this.particles = this.particles.filter(particle => {
      const alive = particle.update();
      if (!alive) {
        this.particlePool.release(particle);
      }
      return alive;
    });

    // Update background layers
    this.backgroundLayers.forEach(layer => {
      layer.particles.forEach(particle => {
        particle.update();
        
        // Wrap around screen for infinite loop
        if (particle.x > this.canvas.width + 50) particle.x = -50;
        if (particle.x < -50) particle.x = this.canvas.width + 50;
        if (particle.y > this.canvas.height + 50) particle.y = -50;
        if (particle.y < -50) particle.y = this.canvas.height + 50;
      });
    });
  }

  private render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render background layers (back to front)
    this.backgroundLayers.forEach((layer, index) => {
      this.ctx.save();
      this.ctx.filter = `blur(${layer.blur}px)`;
      this.ctx.globalAlpha = 0.3 - index * 0.1;
      
      layer.particles.forEach(particle => {
        particle.render(this.ctx);
      });
      
      this.ctx.restore();
    });

    // Render main particles
    this.particles.forEach(particle => {
      particle.render(this.ctx);
    });

    // Debug info in development
    if (process.env.NODE_ENV === 'development') {
      this.renderDebugInfo();
    }
  }

  private renderDebugInfo() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 200, 80);
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${this.fpsCounter}`, 15, 25);
    this.ctx.fillText(`Particles: ${this.particles.length}`, 15, 40);
    this.ctx.fillText(`Mode: ${this.performanceMode}`, 15, 55);
    this.ctx.fillText(`Pool: ${this.particlePool.getPoolSize()}`, 15, 70);
    this.ctx.restore();
  }

  resize() {
    this.setupCanvas();
    // Reinitialize background layers for new dimensions
    this.backgroundLayers = [];
    this.initializeBackgroundLayers();
  }

  getStats() {
    return {
      fps: this.fpsCounter,
      particleCount: this.particles.length,
      performanceMode: this.performanceMode,
      poolSize: this.particlePool.getPoolSize()
    };
  }

  dispose() {
    this.stop();
    this.particles = [];
    this.backgroundLayers = [];
  }
}