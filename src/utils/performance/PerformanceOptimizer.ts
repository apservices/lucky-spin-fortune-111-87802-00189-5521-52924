/**
 * Advanced Performance Optimizer
 * Centralized performance optimization system
 */

import { animationController } from './AnimationController';
import { assetManager } from './AssetManager';
import { poolManager } from './ObjectPool';
import { deviceCapabilities } from './DeviceCapabilities';

interface OptimizationSettings {
  enableLazyLoading: boolean;
  enableObjectPooling: boolean;
  enableAdaptiveQuality: boolean;
  maxParticles: number;
  targetFPS: number;
  throttleNonCritical: boolean;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  poolUtilization: number;
  deviceTier: 'low' | 'medium' | 'high';
}

class PerformanceOptimizer {
  private settings: OptimizationSettings;
  private metrics: PerformanceMetrics;
  private isOptimizing = false;
  private qualityLevel: 'low' | 'medium' | 'high' = 'medium';
  private fpsHistory: number[] = [];
  private visibilityChangeHandler: (() => void) | null = null;

  constructor() {
    this.settings = {
      enableLazyLoading: true,
      enableObjectPooling: true,
      enableAdaptiveQuality: true,
      maxParticles: 50,
      targetFPS: 60,
      throttleNonCritical: true
    };

    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      cacheHitRate: 100,
      poolUtilization: 0,
      deviceTier: 'medium'
    };

    this.initialize();
  }

  private initialize() {
    // Initialize device capabilities
    const capabilities = deviceCapabilities.getCapabilities();
    this.metrics.deviceTier = capabilities.tier;
    
    // Set initial quality based on device
    this.qualityLevel = capabilities.tier;
    
    // Configure animation controller
    animationController.setPerformanceMode(this.qualityLevel);
    
    // Setup visibility change handler for performance saving
    this.setupVisibilityHandler();
    
    // Start performance monitoring
    this.startMonitoring();
  }

  private setupVisibilityHandler() {
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        // Pause non-essential animations when not visible
        animationController.setPerformanceMode('low');
        poolManager.cleanup();
      } else {
        // Restore performance mode when visible
        animationController.setPerformanceMode(this.qualityLevel);
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  private startMonitoring() {
    if (!this.settings.enableAdaptiveQuality) return;

    const monitor = () => {
      if (document.hidden) {
        setTimeout(monitor, 5000); // Check less frequently when hidden
        return;
      }

      this.updateMetrics();
      this.adaptiveQualityAdjustment();
      
      setTimeout(monitor, 1000);
    };

    monitor();
  }

  private updateMetrics() {
    const animStats = animationController.getStats();
    const cacheStats = assetManager.getCacheStats();
    const poolStats = poolManager.getStats();

    this.metrics = {
      fps: animStats.currentFPS,
      frameTime: animStats.frameTime,
      memoryUsage: animStats.memoryUsage,
      cacheHitRate: cacheStats.utilizationPercent || 100,
      poolUtilization: Object.values(poolStats).reduce((sum, pool: any) => sum + pool.utilization, 0) / Object.keys(poolStats).length || 0,
      deviceTier: deviceCapabilities.getCapabilities().tier
    };

    // Track FPS history for trend analysis
    this.fpsHistory.push(this.metrics.fps);
    if (this.fpsHistory.length > 10) {
      this.fpsHistory.shift();
    }
  }

  private adaptiveQualityAdjustment() {
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    
    if (avgFPS < 30 && this.qualityLevel !== 'low') {
      this.setQualityLevel('low');
    } else if (avgFPS < 45 && this.qualityLevel === 'high') {
      this.setQualityLevel('medium');
    } else if (avgFPS > 55 && this.qualityLevel === 'low') {
      this.setQualityLevel('medium');
    } else if (avgFPS > 58 && this.qualityLevel === 'medium') {
      this.setQualityLevel('high');
    }
  }

  public setQualityLevel(level: 'low' | 'medium' | 'high') {
    if (this.qualityLevel === level) return;
    
    this.qualityLevel = level;
    animationController.setPerformanceMode(level);
    
    // Adjust settings based on quality level
    switch (level) {
      case 'low':
        this.settings.maxParticles = 10;
        break;
      case 'medium':
        this.settings.maxParticles = 30;
        break;
      case 'high':
        this.settings.maxParticles = 50;
        break;
    }
  }

  public async preloadCriticalAssets() {
    if (!this.settings.enableLazyLoading) return;

    const criticalAssets = [
      '/sprites/tiger-idle.webp',
      '/sprites/tiger-win.webp',
      '/sprites/fox-idle.webp',
      '/sprites/fox-win.webp',
      '/sprites/frog-idle.webp',
      '/sprites/frog-win.webp'
    ];

    const promises = criticalAssets.map(asset => 
      assetManager.loadAsset(asset, { priority: 'critical' })
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn('Some critical assets failed to preload:', error);
    }
  }

  public async loadAssetLazy(url: string, priority: 'critical' | 'normal' | 'low' = 'normal') {
    return assetManager.loadAsset(url, { priority });
  }

  public createParticle(config: any) {
    if (!this.settings.enableObjectPooling) {
      return { ...config, isActive: () => true, reset: () => {} };
    }

    const pool = poolManager.getPool('particles');
    if (pool) {
      return (pool as any).createParticle(config);
    }
    
    return { ...config, isActive: () => true, reset: () => {} };
  }

  public releaseParticle(particle: any) {
    if (!this.settings.enableObjectPooling || !particle) return;

    const pool = poolManager.getPool('particles');
    if (pool) {
      pool.release(particle);
    }
  }

  public optimizeNow() {
    if (this.isOptimizing) return Promise.resolve();
    
    this.isOptimizing = true;
    
    return new Promise<void>((resolve) => {
      // Cleanup pools
      poolManager.cleanup();
      
      // Clear animations if method exists
      if (typeof (animationController as any).clearNonCriticalAnimations === 'function') {
        (animationController as any).clearNonCriticalAnimations();
      }
      
      // Force garbage collection hint
      if ('gc' in window && typeof window.gc === 'function') {
        window.gc();
      }
      
      setTimeout(() => {
        this.isOptimizing = false;
        resolve();
      }, 100);
    });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getSettings(): OptimizationSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<OptimizationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Apply settings immediately
    if (newSettings.maxParticles !== undefined) {
      // Update particle limits
    }
    
    if (newSettings.targetFPS !== undefined) {
      // Set target FPS if method exists
      if (typeof (animationController as any).setTargetFPS === 'function') {
        (animationController as any).setTargetFPS(newSettings.targetFPS);
      }
    }
  }

  public destroy() {
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer();