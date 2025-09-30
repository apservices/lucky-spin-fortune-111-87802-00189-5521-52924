interface DeviceCapabilities {
  tier: 'low' | 'medium' | 'high';
  maxParticles: number;
  animationQuality: number;
  enableAdvancedEffects: boolean;
  targetFPS: number;
  memoryLimit: number;
}

class DeviceCapabilitiesDetector {
  private capabilities: DeviceCapabilities;
  private performanceData: {
    frameCount: number;
    totalFrameTime: number;
    lastFrameTime: number;
    memoryUsage: number[];
  };

  constructor() {
    this.performanceData = {
      frameCount: 0,
      totalFrameTime: 0,
      lastFrameTime: performance.now(),
      memoryUsage: []
    };
    
    this.capabilities = this.detectCapabilities();
    this.startPerformanceMonitoring();
  }

  private detectCapabilities(): DeviceCapabilities {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    // Hardware detection
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // GPU detection (basic)
    let gpuTier = 'medium';
    if (gl && 'getExtension' in gl) {
      const webglContext = gl as WebGLRenderingContext;
      const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        if (renderer.includes('intel') || renderer.includes('integrated')) {
          gpuTier = 'low';
        } else if (renderer.includes('nvidia') || renderer.includes('amd') || renderer.includes('radeon')) {
          gpuTier = 'high';
        }
      }
    }

    // Calculate device tier based on multiple factors
    let score = 0;
    
    // CPU score
    if (hardwareConcurrency >= 8) score += 3;
    else if (hardwareConcurrency >= 4) score += 2;
    else score += 1;
    
    // Memory score
    if (deviceMemory >= 8) score += 3;
    else if (deviceMemory >= 4) score += 2;
    else score += 1;
    
    // GPU score
    if (gpuTier === 'high') score += 3;
    else if (gpuTier === 'medium') score += 2;
    else score += 1;
    
    // Mobile penalty
    if (isMobile) score -= 2;
    
    // Determine tier
    let tier: 'low' | 'medium' | 'high';
    if (score >= 7) tier = 'high';
    else if (score >= 4) tier = 'medium';
    else tier = 'low';

    return {
      tier,
      maxParticles: tier === 'high' ? 100 : tier === 'medium' ? 50 : 20,
      animationQuality: tier === 'high' ? 1.0 : tier === 'medium' ? 0.75 : 0.5,
      enableAdvancedEffects: tier !== 'low',
      targetFPS: tier === 'high' ? 60 : tier === 'medium' ? 45 : 30,
      memoryLimit: tier === 'high' ? 200 : tier === 'medium' ? 150 : 100 // MB
    };
  }

  private startPerformanceMonitoring() {
    const monitor = () => {
      const now = performance.now();
      const frameTime = now - this.performanceData.lastFrameTime;
      
      this.performanceData.frameCount++;
      this.performanceData.totalFrameTime += frameTime;
      this.performanceData.lastFrameTime = now;
      
      // Check memory usage periodically
      if (this.performanceData.frameCount % 300 === 0) { // Every 5 seconds at 60fps
        this.checkMemoryUsage();
        this.adjustCapabilities();
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  private checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1024 / 1024; // MB
      this.performanceData.memoryUsage.push(usedMemory);
      
      // Keep only last 10 measurements
      if (this.performanceData.memoryUsage.length > 10) {
        this.performanceData.memoryUsage.shift();
      }
    }
  }

  private adjustCapabilities() {
    const avgFPS = this.getAverageFPS();
    const memoryUsage = this.getAverageMemoryUsage();
    
    // Downgrade if performance is poor
    if (avgFPS < this.capabilities.targetFPS * 0.8) {
      if (this.capabilities.tier === 'high') {
        this.capabilities = { ...this.capabilities, tier: 'medium', maxParticles: 50, animationQuality: 0.75 };
      } else if (this.capabilities.tier === 'medium') {
        this.capabilities = { ...this.capabilities, tier: 'low', maxParticles: 20, animationQuality: 0.5, enableAdvancedEffects: false };
      }
    }
    
    // Memory-based adjustments
    if (memoryUsage > this.capabilities.memoryLimit * 0.9) {
      this.capabilities.maxParticles = Math.max(10, this.capabilities.maxParticles * 0.8);
    }
  }

  public getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }

  public getAverageFPS(): number {
    if (this.performanceData.frameCount === 0) return 60;
    return 1000 / (this.performanceData.totalFrameTime / this.performanceData.frameCount);
  }

  public getAverageMemoryUsage(): number {
    if (this.performanceData.memoryUsage.length === 0) return 0;
    return this.performanceData.memoryUsage.reduce((a, b) => a + b, 0) / this.performanceData.memoryUsage.length;
  }

  public getCurrentFPS(): number {
    return 1000 / (performance.now() - this.performanceData.lastFrameTime);
  }

  public resetPerformanceData() {
    this.performanceData = {
      frameCount: 0,
      totalFrameTime: 0,
      lastFrameTime: performance.now(),
      memoryUsage: []
    };
  }
}

export const deviceCapabilities = new DeviceCapabilitiesDetector();
export type { DeviceCapabilities };
