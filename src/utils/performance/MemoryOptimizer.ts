/**
 * Memory Optimizer
 * Aggressive memory management and cleanup
 */

class MemoryOptimizer {
  private cleanupTasks: Array<() => void> = [];
  private isOptimizing = false;
  private lastCleanup = Date.now();
  private cleanupInterval = 30000; // 30 seconds

  constructor() {
    this.startAutoCleanup();
    this.setupVisibilityHandling();
  }

  private startAutoCleanup() {
    setInterval(() => {
      if (Date.now() - this.lastCleanup >= this.cleanupInterval) {
        this.cleanup();
      }
    }, 5000); // Check every 5 seconds
  }

  private setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Aggressive cleanup when page is hidden
        this.cleanup(true);
      }
    });
  }

  public registerCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }

  public cleanup(aggressive = false) {
    if (this.isOptimizing) return;
    
    this.isOptimizing = true;
    
    try {
      // Run all cleanup tasks
      this.cleanupTasks.forEach(task => {
        try {
          task();
        } catch (error) {
          console.warn('Cleanup task failed:', error);
        }
      });

      // Force garbage collection if available (Chrome DevTools)
      if (aggressive && 'gc' in window && typeof window.gc === 'function') {
        window.gc();
      }

      this.lastCleanup = Date.now();
    } finally {
      this.isOptimizing = false;
    }
  }

  public forceCleanup() {
    this.cleanup(true);
  }

  public getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }

  public isMemoryHigh(): boolean {
    const usage = this.getMemoryUsage();
    return usage > 150; // 150MB threshold
  }
}

export const memoryOptimizer = new MemoryOptimizer();

// Register common cleanup tasks
memoryOptimizer.registerCleanupTask(() => {
  // Clear console if it's getting too large
  if (console.clear && Math.random() < 0.1) {
    console.clear();
  }
});
