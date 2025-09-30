interface PoolableObject {
  reset(): void;
  isActive(): boolean;
}

interface ParticlePoolObject extends PoolableObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
  element?: HTMLElement;
}

interface UIElementPoolObject extends PoolableObject {
  element: HTMLElement;
  type: string;
}

class ObjectPool<T extends PoolableObject> {
  private pool: T[] = [];
  private active: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;
  private created: number = 0;

  constructor(
    createFunction: () => T,
    resetFunction: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 100
  ) {
    this.createFn = createFunction;
    this.resetFn = resetFunction;
    this.maxSize = maxSize;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
      this.created++;
    }
  }

  public acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else if (this.created < this.maxSize) {
      obj = this.createFn();
      this.created++;
    } else {
      // Pool is full, reuse oldest active object
      obj = this.active.shift()!;
      this.resetFn(obj);
    }

    this.active.push(obj);
    return obj;
  }

  public release(obj: T): void {
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.resetFn(obj);
      
      // Only return to pool if we have space
      if (this.pool.length < this.maxSize / 2) {
        this.pool.push(obj);
      }
    }
  }

  public releaseAll(): void {
    this.active.forEach(obj => this.resetFn(obj));
    this.pool.push(...this.active);
    this.active.length = 0;

    // Trim pool if too large
    if (this.pool.length > this.maxSize / 2) {
      this.pool.length = Math.floor(this.maxSize / 2);
    }
  }

  public update(): void {
    // Remove inactive objects
    for (let i = this.active.length - 1; i >= 0; i--) {
      const obj = this.active[i];
      if (!obj.isActive()) {
        this.release(obj);
      }
    }
  }

  public getStats() {
    return {
      poolSize: this.pool.length,
      activeCount: this.active.length,
      totalCreated: this.created,
      maxSize: this.maxSize,
      utilization: (this.active.length / this.maxSize) * 100
    };
  }

  public clear(): void {
    this.pool.length = 0;
    this.active.length = 0;
    this.created = 0;
  }
}

// Particle pool implementation
class ParticlePool extends ObjectPool<ParticlePoolObject> {
  constructor(maxSize: number = 200) {
    super(
      () => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1000,
        size: 1,
        color: '#ffffff',
        opacity: 1,
        reset: function() {
          this.life = 0;
          this.opacity = 1;
          if (this.element) {
            this.element.style.display = 'none';
          }
        },
        isActive: function() {
          return this.life > 0;
        }
      }),
      (particle) => {
        particle.reset();
      },
      Math.floor(maxSize / 4),
      maxSize
    );
  }

  public createParticle(config: Partial<ParticlePoolObject>): ParticlePoolObject {
    const particle = this.acquire();
    
    Object.assign(particle, {
      x: config.x || 0,
      y: config.y || 0,
      vx: config.vx || (Math.random() - 0.5) * 4,
      vy: config.vy || (Math.random() - 0.5) * 4,
      life: config.maxLife || 1000,
      maxLife: config.maxLife || 1000,
      size: config.size || Math.random() * 4 + 2,
      color: config.color || '#ffffff',
      opacity: 1
    });

    return particle;
  }
}

// UI Element pool implementation
class UIElementPool extends ObjectPool<UIElementPoolObject> {
  private container: HTMLElement;

  constructor(container: HTMLElement, maxSize: number = 50) {
    super(
      () => ({
        element: document.createElement('div'),
        type: 'generic',
        reset: function() {
          this.element.className = '';
          this.element.style.cssText = '';
          this.element.textContent = '';
          this.element.style.display = 'none';
        },
        isActive: function() {
          return this.element.style.display !== 'none';
        }
      }),
      (uiElement) => {
        uiElement.reset();
      },
      Math.floor(maxSize / 4),
      maxSize
    );
    
    this.container = container;
  }

  public createElement(type: string, className?: string): UIElementPoolObject {
    const uiElement = this.acquire();
    
    uiElement.type = type;
    uiElement.element.className = className || '';
    uiElement.element.style.display = 'block';
    
    if (!uiElement.element.parentElement) {
      this.container.appendChild(uiElement.element);
    }
    
    return uiElement;
  }

  public override release(obj: UIElementPoolObject): void {
    if (obj.element.parentElement) {
      obj.element.style.display = 'none';
    }
    super.release(obj);
  }
}

// Performance-aware pool manager
class PoolManager {
  private pools = new Map<string, ObjectPool<any>>();
  private cleanupInterval: number;

  constructor() {
    // Cleanup unused objects every 30 seconds
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  public registerPool(name: string, pool: ObjectPool<any>): void {
    this.pools.set(name, pool);
  }

  public getPool(name: string): ObjectPool<any> | undefined {
    return this.pools.get(name);
  }

  public cleanup(): void {
    this.pools.forEach(pool => {
      pool.update();
    });
  }

  public getStats() {
    const stats: Record<string, any> = {};
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats();
    });
    return stats;
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.pools.forEach(pool => {
      pool.clear();
    });
    this.pools.clear();
  }
}

// Global pool manager instance
export const poolManager = new PoolManager();

// Export pool classes
export { ObjectPool, ParticlePool, UIElementPool };
export type { PoolableObject, ParticlePoolObject, UIElementPoolObject };