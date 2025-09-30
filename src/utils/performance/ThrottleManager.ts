/**
 * Throttle and Debounce Manager
 * Optimizes UI event handling for better performance
 */

export class ThrottleManager {
  private static timers = new Map<string, number>();
  private static debounceTimers = new Map<string, number>();

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    key?: string
  ): T {
    const throttleKey = key || func.name || 'default';
    
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      const lastExecution = this.timers.get(throttleKey) || 0;
      
      if (now - lastExecution >= limit) {
        this.timers.set(throttleKey, now);
        return func(...args);
      }
    }) as T;
  }

  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key?: string
  ): T {
    const debounceKey = key || func.name || 'default';
    
    return ((...args: Parameters<T>) => {
      const existingTimer = this.debounceTimers.get(debounceKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      const timer = window.setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(debounceKey);
      }, delay);
      
      this.debounceTimers.set(debounceKey, timer);
    }) as T;
  }

  /**
   * Request animation frame throttle
   */
  static rafThrottle<T extends (...args: any[]) => any>(
    func: T,
    key?: string
  ): T {
    const rafKey = key || func.name || 'default';
    let rafId: number | null = null;
    
    return ((...args: Parameters<T>) => {
      if (rafId !== null) return;
      
      rafId = requestAnimationFrame(() => {
        func(...args);
        rafId = null;
      });
    }) as T;
  }

  /**
   * Clear all timers
   */
  static clearAll() {
    this.timers.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// Utility functions for common use cases
export const throttle = ThrottleManager.throttle.bind(ThrottleManager);
export const debounce = ThrottleManager.debounce.bind(ThrottleManager);
export const rafThrottle = ThrottleManager.rafThrottle.bind(ThrottleManager);