/**
 * Optimized Performance Manager Component
 * Manages and monitors app performance in real-time
 */

import React, { useEffect, useState } from 'react';
import { performanceOptimizer } from '@/utils/performance/PerformanceOptimizer';
import { fastPerformanceMonitor } from '@/utils/performance/FastPerformanceMonitor';
import { memoryOptimizer } from '@/utils/performance/MemoryOptimizer';

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
    // Subscribe to fast performance monitor
    const unsubscribe = fastPerformanceMonitor.subscribe((metrics) => {
      setPerformanceState({
        fps: metrics.fps,
        memoryUsage: metrics.memoryUsage,
        qualityLevel: metrics.fps < 30 ? 'low' : metrics.fps < 45 ? 'medium' : 'high',
        isOptimizing: false
      });

      // Auto-optimize if performance is critical
      if (metrics.fps < 20 || metrics.memoryUsage > 200) {
        performanceOptimizer.optimizeNow();
        memoryOptimizer.forceCleanup();
      } else if (memoryOptimizer.isMemoryHigh()) {
        memoryOptimizer.cleanup();
      }
    });

    // Cleanup on page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        performanceOptimizer.optimizeNow();
        memoryOptimizer.forceCleanup();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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