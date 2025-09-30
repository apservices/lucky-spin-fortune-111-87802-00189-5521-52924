/**
 * Throttle and debounce utilities for performance optimization
 */

// Throttle function - limits execution to once per interval
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean = false;
  
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
}

// Debounce function - delays execution until after delay has passed
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  } as T;
}

// Advanced throttle with immediate execution option
export function advancedThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;
  const { leading = true, trailing = true } = options;

  return function(this: any, ...args: any[]) {
    const now = Date.now();
    
    if (!previous && !leading) {
      previous = now;
    }
    
    const remaining = limit - (now - previous);
    
    if (remaining <= 0 || remaining > limit) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  } as T;
}

// Throttle specifically for scroll events
export const throttleScroll = <T extends (...args: any[]) => any>(func: T, limit: number = 16) =>
  throttle(func, limit);

// Throttle specifically for resize events
export const throttleResize = <T extends (...args: any[]) => any>(func: T, limit: number = 100) =>
  throttle(func, limit);

// Debounce specifically for input events
export const debounceInput = <T extends (...args: any[]) => any>(func: T, delay: number = 300) =>
  debounce(func, delay);

// Animation frame throttle for smooth animations
export function rafThrottle<T extends (...args: any[]) => any>(func: T): T {
  let rafId: number | null = null;
  
  return function(this: any, ...args: any[]) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
        rafId = null;
      });
    }
  } as T;
}