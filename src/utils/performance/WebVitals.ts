/**
 * Core Web Vitals monitoring system
 * Tracks LCP, CLS, FID, INP, TTFB and other performance metrics
 */

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay
  inp: number | null; // Interaction to Next Paint
  ttfb: number | null; // Time to First Byte
  fps: number;
  frameTime: number;
  memoryUsage: number;
  longTasks: number;
  resourceLoadTime: number;
}

class WebVitalsCollector {
  private metrics: WebVitalsMetrics = {
    lcp: null,
    cls: null,
    fid: null,
    inp: null,
    ttfb: null,
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    longTasks: 0,
    resourceLoadTime: 0
  };

  private observers: PerformanceObserver[] = [];
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private frameRequestId: number | null = null;

  constructor() {
    this.initializeObservers();
    this.startFPSMonitoring();
  }

  private initializeObservers() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            this.metrics.lcp = entries[entries.length - 1].startTime;
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // CLS Observer
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutEntry = entry as LayoutShiftEntry;
            if (!layoutEntry.hadRecentInput) {
              clsValue += layoutEntry.value;
              this.metrics.cls = clsValue;
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-input') {
              const fidEntry = entry as FirstInputEntry;
              this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
            }
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Long Tasks Observer
      try {
        let longTasksCount = 0;
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              longTasksCount++;
              this.metrics.longTasks = longTasksCount;
            }
          }
        });
        longTaskObserver.observe({ type: 'longtask', buffered: true });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }

      // Navigation Timing for TTFB
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            }
          }
        });
        navigationObserver.observe({ type: 'navigation', buffered: true });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Resource Observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          let totalLoadTime = 0;
          let resourceCount = 0;
          
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              totalLoadTime += entry.duration;
              resourceCount++;
            }
          }
          
          if (resourceCount > 0) {
            this.metrics.resourceLoadTime = totalLoadTime / resourceCount;
          }
        });
        resourceObserver.observe({ type: 'resource', buffered: true });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  private startFPSMonitoring() {
    const measureFrame = (currentTime: number) => {
      this.frameCount++;
      const deltaTime = currentTime - this.lastFrameTime;
      
      if (deltaTime >= 1000) {
        this.metrics.fps = (this.frameCount * 1000) / deltaTime;
        this.metrics.frameTime = deltaTime / this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        this.metrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
      }

      this.frameRequestId = requestAnimationFrame(measureFrame);
    };

    this.frameRequestId = requestAnimationFrame(measureFrame);
  }

  public getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  public getDetailedReport(): string {
    const m = this.metrics;
    const report = `
=== Performance Report ===
LCP (Largest Contentful Paint): ${m.lcp?.toFixed(2) || 'N/A'}ms
CLS (Cumulative Layout Shift): ${m.cls?.toFixed(4) || 'N/A'}
FID (First Input Delay): ${m.fid?.toFixed(2) || 'N/A'}ms
INP (Interaction to Next Paint): ${m.inp?.toFixed(2) || 'N/A'}ms
TTFB (Time to First Byte): ${m.ttfb?.toFixed(2) || 'N/A'}ms
FPS: ${m.fps.toFixed(1)}
Frame Time: ${m.frameTime.toFixed(2)}ms
Memory Usage: ${m.memoryUsage.toFixed(2)}MB
Long Tasks: ${m.longTasks}
Avg Resource Load: ${m.resourceLoadTime.toFixed(2)}ms
==========================
    `;
    return report;
  }

  public logReport() {
    console.log(this.getDetailedReport());
  }

  public onVisibilityChange() {
    if (document.hidden) {
      // Pause monitoring when tab is not visible
      if (this.frameRequestId) {
        cancelAnimationFrame(this.frameRequestId);
        this.frameRequestId = null;
      }
    } else {
      // Resume monitoring when tab becomes visible
      if (!this.frameRequestId) {
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.startFPSMonitoring();
      }
    }
  }

  public destroy() {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Cancel animation frame
    if (this.frameRequestId) {
      cancelAnimationFrame(this.frameRequestId);
      this.frameRequestId = null;
    }
  }
}

export const webVitals = new WebVitalsCollector();

// Listen for visibility changes
document.addEventListener('visibilitychange', () => {
  webVitals.onVisibilityChange();
});

export type { WebVitalsMetrics };