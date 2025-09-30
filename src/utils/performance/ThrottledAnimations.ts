/**
 * Throttled Animations System
 * Manages animations with intelligent throttling based on performance
 */

import { fastPerformanceMonitor } from './FastPerformanceMonitor';

interface ThrottleConfig {
  minInterval: number; // Minimum time between executions in ms
  priority: 'high' | 'medium' | 'low';
}

class ThrottledAnimations {
  private throttledFunctions = new Map<string, {
    fn: Function;
    lastExecuted: number;
    config: ThrottleConfig;
  }>();
  private performanceMultiplier = 1;

  constructor() {
    // Adjust throttle based on performance
    fastPerformanceMonitor.subscribe((metrics) => {
      if (metrics.fps < 20) {
        this.performanceMultiplier = 4; // Severely throttle
      } else if (metrics.fps < 30) {
        this.performanceMultiplier = 2; // Moderate throttle
      } else if (metrics.fps < 45) {
        this.performanceMultiplier = 1.5; // Light throttle
      } else {
        this.performanceMultiplier = 1; // No additional throttle
      }
    });
  }

  public register(id: string, fn: Function, config: ThrottleConfig) {
    this.throttledFunctions.set(id, {
      fn,
      lastExecuted: 0,
      config
    });
  }

  public execute(id: string, ...args: any[]) {
    const entry = this.throttledFunctions.get(id);
    if (!entry) {
      console.warn(`Throttled function ${id} not registered`);
      return;
    }

    const now = performance.now();
    const adjustedInterval = entry.config.minInterval * this.performanceMultiplier;
    
    // Check if enough time has passed
    if (now - entry.lastExecuted >= adjustedInterval) {
      entry.lastExecuted = now;
      entry.fn(...args);
    }
  }

  public executeImmediate(id: string, ...args: any[]) {
    const entry = this.throttledFunctions.get(id);
    if (!entry) {
      console.warn(`Throttled function ${id} not registered`);
      return;
    }

    entry.lastExecuted = performance.now();
    entry.fn(...args);
  }

  public unregister(id: string) {
    this.throttledFunctions.delete(id);
  }

  public clear() {
    this.throttledFunctions.clear();
  }
}

export const throttledAnimations = new ThrottledAnimations();

// Utility function to create throttled animation callbacks
export function createThrottledCallback(
  id: string,
  callback: Function,
  minInterval: number = 16,
  priority: 'high' | 'medium' | 'low' = 'medium'
) {
  throttledAnimations.register(id, callback, { minInterval, priority });
  
  return (...args: any[]) => {
    throttledAnimations.execute(id, ...args);
  };
}
