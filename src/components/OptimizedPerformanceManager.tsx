/**
 * Optimized Performance Manager Component
 * Manages and monitors app performance in real-time
 */

import React, { useEffect, useState } from 'react';
import { performanceOptimizer } from '@/utils/performance/PerformanceOptimizer';

interface PerformanceState {
  fps: number;
  memoryUsage: number;
  qualityLevel: 'low' | 'medium' | 'high';
  isOptimizing: boolean;
}

export const OptimizedPerformanceManager: React.FC = () => {
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    fps: 60,
    memoryUsage: 0,
    qualityLevel: 'medium',
    isOptimizing: false
  });

  useEffect(() => {
    // Initialize performance optimization
    performanceOptimizer.preloadCriticalAssets();

    // Monitor performance every 2 seconds
    const monitorInterval = setInterval(() => {
      const metrics = performanceOptimizer.getMetrics();
      setPerformanceState({
        fps: metrics.fps,
        memoryUsage: metrics.memoryUsage,
        qualityLevel: performanceOptimizer.getSettings().enableAdaptiveQuality ? 'medium' : 'high',
        isOptimizing: false
      });

      // Auto-optimize if performance is poor
      if (metrics.fps < 30 && metrics.memoryUsage > 150) {
        performanceOptimizer.optimizeNow();
      }
    }, 2000);

    // Cleanup on page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        performanceOptimizer.optimizeNow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(monitorInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      performanceOptimizer.destroy();
    };
  }, []);

  // Only visible in development mode for debugging
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>FPS: {performanceState.fps.toFixed(1)}</div>
      <div>Mem: {performanceState.memoryUsage.toFixed(1)}MB</div>
      <div>Quality: {performanceState.qualityLevel}</div>
    </div>
  );
};