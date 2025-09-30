import { deviceCapabilities } from './DeviceCapabilities';

interface AnimationTask {
  id: string;
  callback: (deltaTime: number, currentTime: number) => boolean; // Return false to remove
  priority: 'critical' | 'normal' | 'low';
  lastRun: number;
  frequency: number; // Max frequency in ms (0 = every frame)
}

interface AnimationStats {
  averageFPS: number;
  currentFPS: number;
  frameTime: number;
  skippedFrames: number;
  activeAnimations: number;
  memoryUsage: number;
}

class AnimationController {
  private tasks = new Map<string, AnimationTask>();
  private rafId: number | null = null;
  private isRunning = false;
  private lastFrameTime = 0;
  private frameCount = 0;
  private totalFrameTime = 0;
  private skippedFrames = 0;
  private performanceMode: 'high' | 'medium' | 'low' = 'high';
  private targetFrameTime = 16.67; // 60 FPS
  private isDocumentVisible = true;
  private adaptiveQuality = true;
  
  private stats: AnimationStats = {
    averageFPS: 60,
    currentFPS: 60,
    frameTime: 16.67,
    skippedFrames: 0,
    activeAnimations: 0,
    memoryUsage: 0
  };

  constructor() {
    this.setupVisibilityHandling();
    this.setupPerformanceMonitoring();
    this.start();
  }

  private setupVisibilityHandling() {
    // Pause animations when page is hidden
    document.addEventListener('visibilitychange', () => {
      this.isDocumentVisible = !document.hidden;
      
      if (this.isDocumentVisible) {
        this.resume();
      } else {
        this.pauseLowPriorityAnimations();
      }
    });

    // Reduce quality on window blur
    window.addEventListener('blur', () => {
      this.setTemporaryPerformanceMode('low');
    });

    window.addEventListener('focus', () => {
      this.restorePerformanceMode();
    });
  }

  private setupPerformanceMonitoring() {
    // Monitor device capabilities and adjust
    setInterval(() => {
      this.updatePerformanceMode();
      this.updateStats();
    }, 1000);
  }

  private updatePerformanceMode() {
    const capabilities = deviceCapabilities.getCapabilities();
    const currentFPS = deviceCapabilities.getCurrentFPS();
    
    if (this.adaptiveQuality) {
      if (currentFPS < capabilities.targetFPS * 0.7) {
        // Performance is poor, reduce quality
        this.performanceMode = 'low';
        this.targetFrameTime = 33.33; // 30 FPS
      } else if (currentFPS < capabilities.targetFPS * 0.9) {
        // Performance is okay, medium quality
        this.performanceMode = 'medium';
        this.targetFrameTime = 22.22; // 45 FPS
      } else {
        // Performance is good, high quality
        this.performanceMode = capabilities.tier === 'low' ? 'medium' : 'high';
        this.targetFrameTime = 16.67; // 60 FPS
      }
    }
  }

  private updateStats() {
    this.stats = {
      averageFPS: this.getAverageFPS(),
      currentFPS: this.getCurrentFPS(),
      frameTime: this.getAverageFrameTime(),
      skippedFrames: this.skippedFrames,
      activeAnimations: this.tasks.size,
      memoryUsage: this.getMemoryUsage()
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }

  private animationLoop = (currentTime: number) => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastFrameTime;
    
    // Skip frame if we're running too fast (except for critical animations)
    if (deltaTime < this.targetFrameTime * 0.8 && this.performanceMode !== 'high') {
      this.rafId = requestAnimationFrame(this.animationLoop);
      return;
    }

    this.frameCount++;
    this.totalFrameTime += deltaTime;
    this.lastFrameTime = currentTime;

    // Check if we're running too slow
    if (deltaTime > this.targetFrameTime * 1.5) {
      this.skippedFrames++;
      
      // Skip low priority animations if we're behind
      if (deltaTime > this.targetFrameTime * 2) {
        this.runAnimationsByPriority(['critical'], deltaTime, currentTime);
      } else {
        this.runAnimationsByPriority(['critical', 'normal'], deltaTime, currentTime);
      }
    } else {
      // Run all animations
      this.runAllAnimations(deltaTime, currentTime);
    }

    // Only continue if document is visible or we have critical animations
    if (this.isDocumentVisible || this.hasCriticalAnimations()) {
      this.rafId = requestAnimationFrame(this.animationLoop);
    }
  };

  private runAnimationsByPriority(
    priorities: Array<'critical' | 'normal' | 'low'>, 
    deltaTime: number, 
    currentTime: number
  ) {
    const toRemove: string[] = [];
    
    this.tasks.forEach((task, id) => {
      if (priorities.includes(task.priority)) {
        // Check frequency limiting
        if (task.frequency > 0 && (currentTime - task.lastRun) < task.frequency) {
          return;
        }
        
        task.lastRun = currentTime;
        
        try {
          const shouldContinue = task.callback(deltaTime, currentTime);
          if (!shouldContinue) {
            toRemove.push(id);
          }
        } catch (error) {
          console.error(`Animation task ${id} failed:`, error);
          toRemove.push(id);
        }
      }
    });

    // Remove completed tasks
    toRemove.forEach(id => this.tasks.delete(id));
  }

  private runAllAnimations(deltaTime: number, currentTime: number) {
    this.runAnimationsByPriority(['critical', 'normal', 'low'], deltaTime, currentTime);
  }

  private hasCriticalAnimations(): boolean {
    for (const task of this.tasks.values()) {
      if (task.priority === 'critical') {
        return true;
      }
    }
    return false;
  }

  public addAnimation(
    id: string,
    callback: (deltaTime: number, currentTime: number) => boolean,
    options: {
      priority?: 'critical' | 'normal' | 'low';
      frequency?: number;
    } = {}
  ): void {
    this.tasks.set(id, {
      id,
      callback,
      priority: options.priority || 'normal',
      lastRun: 0,
      frequency: options.frequency || 0
    });
  }

  public removeAnimation(id: string): void {
    this.tasks.delete(id);
  }

  public pauseAnimation(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      // Store original callback and replace with no-op
      (task as any).pausedCallback = task.callback;
      task.callback = () => true; // Keep task alive but do nothing
    }
  }

  public resumeAnimation(id: string): void {
    const task = this.tasks.get(id);
    if (task && (task as any).pausedCallback) {
      task.callback = (task as any).pausedCallback;
      delete (task as any).pausedCallback;
    }
  }

  public pauseLowPriorityAnimations(): void {
    this.tasks.forEach((task, id) => {
      if (task.priority === 'low') {
        this.pauseAnimation(id);
      }
    });
  }

  public resumeAllAnimations(): void {
    this.tasks.forEach((task, id) => {
      this.resumeAnimation(id);
    });
  }

  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.performanceMode = mode;
    this.adaptiveQuality = false;
    
    switch (mode) {
      case 'high':
        this.targetFrameTime = 16.67; // 60 FPS
        break;
      case 'medium':
        this.targetFrameTime = 22.22; // 45 FPS
        break;
      case 'low':
        this.targetFrameTime = 33.33; // 30 FPS
        break;
    }
  }

  public setTemporaryPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.setPerformanceMode(mode);
    
    // Restore after 5 seconds
    setTimeout(() => {
      this.restorePerformanceMode();
    }, 5000);
  }

  public restorePerformanceMode(): void {
    this.adaptiveQuality = true;
    this.updatePerformanceMode();
  }

  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.rafId = requestAnimationFrame(this.animationLoop);
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public pause(): void {
    this.stop();
  }

  public resume(): void {
    this.start();
  }

  public getStats(): AnimationStats {
    return { ...this.stats };
  }

  public getCurrentFPS(): number {
    const currentFrameTime = performance.now() - this.lastFrameTime;
    return currentFrameTime > 0 ? 1000 / currentFrameTime : 60;
  }

  public getAverageFPS(): number {
    if (this.frameCount === 0) return 60;
    const avgFrameTime = this.totalFrameTime / this.frameCount;
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 60;
  }

  public getAverageFrameTime(): number {
    return this.frameCount > 0 ? this.totalFrameTime / this.frameCount : 16.67;
  }

  public clear(): void {
    this.tasks.clear();
    this.frameCount = 0;
    this.totalFrameTime = 0;
    this.skippedFrames = 0;
  }
}

// Global animation controller instance
export const animationController = new AnimationController();

// Utility functions for common animations
export const createFadeAnimation = (
  element: HTMLElement,
  fromOpacity: number,
  toOpacity: number,
  duration: number,
  onComplete?: () => void
) => {
  const startTime = performance.now();
  const startOpacity = fromOpacity;
  const deltaOpacity = toOpacity - fromOpacity;
  const animationId = `fade-${Math.random()}`;

  animationController.addAnimation(animationId, (deltaTime, currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentOpacity = startOpacity + deltaOpacity * progress;
    element.style.opacity = currentOpacity.toString();
    
    if (progress >= 1) {
      onComplete?.();
      return false; // Remove animation
    }
    
    return true; // Continue animation
  }, { priority: 'normal' });
  
  return animationId;
};

export const createMoveAnimation = (
  element: HTMLElement,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  duration: number,
  onComplete?: () => void
) => {
  const startTime = performance.now();
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const animationId = `move-${Math.random()}`;

  animationController.addAnimation(animationId, (deltaTime, currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentX = fromX + deltaX * progress;
    const currentY = fromY + deltaY * progress;
    
    element.style.transform = `translate(${currentX}px, ${currentY}px)`;
    
    if (progress >= 1) {
      onComplete?.();
      return false; // Remove animation
    }
    
    return true; // Continue animation
  }, { priority: 'normal' });
  
  return animationId;
};