/**
 * Fast Performance Monitor
 * Lightweight performance tracking with minimal overhead
 */

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
}

class FastPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTime = 16.67;
  private rafId: number | null = null;
  private isMonitoring = false;
  private listeners = new Set<(metrics: PerformanceMetrics) => void>();
  private updateInterval = 1000; // Update every second
  private lastUpdate = 0;

  constructor() {
    this.start();
  }

  private monitor = (currentTime: number) => {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const delta = currentTime - this.lastTime;
    
    // Update metrics every second
    if (currentTime - this.lastUpdate >= this.updateInterval) {
      this.fps = (this.frameCount * 1000) / delta;
      this.frameTime = delta / this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
      this.lastUpdate = currentTime;

      // Notify listeners
      const metrics = this.getMetrics();
      this.listeners.forEach(listener => listener(metrics));
    }

    this.rafId = requestAnimationFrame(this.monitor);
  };

  public start() {
    if (!this.isMonitoring) {
      this.isMonitoring = true;
      this.lastTime = performance.now();
      this.lastUpdate = this.lastTime;
      this.frameCount = 0;
      this.rafId = requestAnimationFrame(this.monitor);
    }
  }

  public stop() {
    this.isMonitoring = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public getMetrics(): PerformanceMetrics {
    const memoryUsage = 'memory' in performance
      ? (performance as any).memory.usedJSHeapSize / 1024 / 1024
      : 0;

    return {
      fps: Math.round(this.fps * 10) / 10,
      frameTime: Math.round(this.frameTime * 100) / 100,
      memoryUsage: Math.round(memoryUsage * 100) / 100
    };
  }

  public subscribe(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public destroy() {
    this.stop();
    this.listeners.clear();
  }
}

export const fastPerformanceMonitor = new FastPerformanceMonitor();
