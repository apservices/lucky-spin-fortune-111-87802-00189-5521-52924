import { useEffect, useRef, useState } from 'react';
import { deviceCapabilities } from '@/utils/performance/DeviceCapabilities';
import { assetManager } from '@/utils/performance/AssetManager';
import { poolManager, ParticlePool, UIElementPool } from '@/utils/performance/ObjectPool';
import { animationController } from '@/utils/performance/AnimationController';

interface PerformanceSettings {
  enableLazyLoading: boolean;
  enableObjectPooling: boolean;
  enableAdaptiveQuality: boolean;
  maxParticles: number;
  targetFPS: number;
  enablePerformanceMonitoring: boolean;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  poolUtilization: number;
}

export const usePerformanceOptimization = (settings?: Partial<PerformanceSettings>) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const particlePoolRef = useRef<ParticlePool | null>(null);
  const uiPoolRef = useRef<UIElementPool | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    cacheHitRate: 100,
    poolUtilization: 0
  });

  const [isOptimized, setIsOptimized] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'auto' | 'high' | 'medium' | 'low'>('auto');

  // Default settings
  const defaultSettings: PerformanceSettings = {
    enableLazyLoading: true,
    enableObjectPooling: true,
    enableAdaptiveQuality: true,
    maxParticles: 50,
    targetFPS: 60,
    enablePerformanceMonitoring: true,
    ...settings
  };

  // Initialize performance systems
  useEffect(() => {
    const init = async () => {
      try {
        // Get device capabilities
        const capabilities = deviceCapabilities.getCapabilities();
        
        // Setup object pools if enabled
        if (defaultSettings.enableObjectPooling) {
          const maxParticles = Math.min(
            defaultSettings.maxParticles,
            capabilities.maxParticles
          );
          
          particlePoolRef.current = new ParticlePool(maxParticles);
          poolManager.registerPool('particles', particlePoolRef.current);
          
          // Setup UI element pool if container is available
          if (containerRef.current) {
            uiPoolRef.current = new UIElementPool(containerRef.current);
            poolManager.registerPool('ui-elements', uiPoolRef.current);
          }
        }

        // Configure animation controller
        if (defaultSettings.enableAdaptiveQuality) {
          if (capabilities.tier === 'low') {
            animationController.setPerformanceMode('low');
          } else if (capabilities.tier === 'medium') {
            animationController.setPerformanceMode('medium');
          } else {
            animationController.setPerformanceMode('high');
          }
        }

        // Preload critical assets if lazy loading is enabled
        if (defaultSettings.enableLazyLoading) {
          const criticalAssets = [
            '/src/assets/sprites/envelope-idle.webp',
            '/src/assets/sprites/fox-idle.webp',
            '/src/assets/sprites/tiger-idle.webp'
          ];
          
          assetManager.preloadAssets(criticalAssets, { 
            priority: 'critical',
            webpFallback: true 
          });
        }

        setIsOptimized(true);
      } catch (error) {
        console.error('Failed to initialize performance optimization:', error);
      }
    };

    init();

    return () => {
      // Cleanup
      particlePoolRef.current?.clear();
      uiPoolRef.current?.clear();
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (!defaultSettings.enablePerformanceMonitoring || !isOptimized) return;

    const updateMetrics = () => {
      const animStats = animationController.getStats();
      const cacheStats = assetManager.getCacheStats();
      const poolStats = poolManager.getStats();
      
      const poolUtilization = Object.values(poolStats)
        .reduce((avg, stat: any) => avg + (stat.utilization || 0), 0) / 
        Math.max(Object.keys(poolStats).length, 1);

      setMetrics({
        fps: animStats.currentFPS,
        frameTime: animStats.frameTime,
        memoryUsage: animStats.memoryUsage,
        cacheHitRate: cacheStats.totalItems > 0 ? 
          ((cacheStats.totalItems - (cacheStats as any).misses || 0) / cacheStats.totalItems) * 100 : 100,
        poolUtilization
      });

      // Auto-adjust performance mode
      if (performanceMode === 'auto') {
        if (animStats.currentFPS < 30) {
          animationController.setPerformanceMode('low');
        } else if (animStats.currentFPS < 45) {
          animationController.setPerformanceMode('medium');
        } else if (animStats.currentFPS > 55) {
          animationController.setPerformanceMode('high');
        }
      }
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [isOptimized, performanceMode]);

  // Asset loading utilities
  const loadAsset = async (url: string, priority: 'critical' | 'normal' | 'low' = 'normal') => {
    if (!defaultSettings.enableLazyLoading) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    }

    return assetManager.loadAsset(url, { 
      priority, 
      webpFallback: true 
    });
  };

  const preloadAssets = (urls: string[], priority: 'critical' | 'normal' | 'low' = 'normal') => {
    if (defaultSettings.enableLazyLoading) {
      assetManager.preloadAssets(urls, { priority, webpFallback: true });
    }
  };

  // Particle system utilities
  const createParticle = (config: any) => {
    if (!defaultSettings.enableObjectPooling || !particlePoolRef.current) {
      // Fallback to regular object creation
      return {
        ...config,
        reset: () => {},
        isActive: () => true
      };
    }

    return particlePoolRef.current.createParticle(config);
  };

  const releaseParticle = (particle: any) => {
    if (defaultSettings.enableObjectPooling && particlePoolRef.current && particle) {
      particlePoolRef.current.release(particle);
    }
  };

  // UI element utilities
  const createElement = (type: string, className?: string) => {
    if (!defaultSettings.enableObjectPooling || !uiPoolRef.current) {
      // Fallback to regular DOM creation
      const element = document.createElement('div');
      if (className) element.className = className;
      return {
        element,
        reset: () => {},
        isActive: () => true
      };
    }

    return uiPoolRef.current.createElement(type, className);
  };

  const releaseElement = (uiElement: any) => {
    if (defaultSettings.enableObjectPooling && uiPoolRef.current && uiElement) {
      uiPoolRef.current.release(uiElement);
    }
  };

  // Animation utilities
  const addAnimation = (
    id: string,
    callback: (deltaTime: number, currentTime: number) => boolean,
    options?: { priority?: 'critical' | 'normal' | 'low'; frequency?: number }
  ) => {
    animationController.addAnimation(id, callback, options);
  };

  const removeAnimation = (id: string) => {
    animationController.removeAnimation(id);
  };

  // Performance control
  const setManualPerformanceMode = (mode: 'auto' | 'high' | 'medium' | 'low') => {
    setPerformanceMode(mode);
    
    if (mode !== 'auto') {
      animationController.setPerformanceMode(mode as 'high' | 'medium' | 'low');
    }
  };

  const optimizeNow = async () => {
    // Force cleanup
    if (particlePoolRef.current) {
      particlePoolRef.current.releaseAll();
    }
    
    if (uiPoolRef.current) {
      uiPoolRef.current.releaseAll();
    }

    // Clear animation controller
    animationController.clear();

    // Reset device capabilities monitoring
    deviceCapabilities.resetPerformanceData();

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };

  return {
    // Refs
    containerRef,
    
    // State
    isOptimized,
    metrics,
    performanceMode,
    
    // Asset management
    loadAsset,
    preloadAssets,
    
    // Object pooling
    createParticle,
    releaseParticle,
    createElement,
    releaseElement,
    
    // Animation management
    addAnimation,
    removeAnimation,
    
    // Performance control
    setPerformanceMode: setManualPerformanceMode,
    optimizeNow,
    
    // Utility functions
    getDeviceCapabilities: () => deviceCapabilities.getCapabilities(),
    getCacheStats: () => assetManager.getCacheStats(),
    getPoolStats: () => poolManager.getStats(),
    getAnimationStats: () => animationController.getStats()
  };
};