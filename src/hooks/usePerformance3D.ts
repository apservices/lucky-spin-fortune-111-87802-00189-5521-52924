import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar performance 3D
 * Monitora FPS e ajusta qualidade automaticamente
 */

interface Performance3DMetrics {
  fps: number;
  frameTime: number;
  qualityLevel: 'low' | 'medium' | 'high';
  particleCount: number;
  drawCalls: number;
}

interface Performance3DSettings {
  enable3D: boolean;
  particleQuality: 'low' | 'medium' | 'high';
  postProcessing: boolean;
  adaptiveQuality: boolean;
}

const loadSettings = (): Performance3DSettings => {
  const saved = localStorage.getItem('performance3DSettings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Ignore
    }
  }
  return {
    enable3D: true,
    particleQuality: 'medium',
    postProcessing: true,
    adaptiveQuality: true,
  };
};

export const usePerformance3D = () => {
  const [settings, setSettings] = useState<Performance3DSettings>(loadSettings);
  const [metrics, setMetrics] = useState<Performance3DMetrics>({
    fps: 60,
    frameTime: 16.67,
    qualityLevel: settings.particleQuality,
    particleCount: 0,
    drawCalls: 0,
  });

  const [fpsHistory, setFpsHistory] = useState<number[]>([]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('performance3DSettings', JSON.stringify(settings));
  }, [settings]);

  // Monitorar FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        const frameTime = elapsed / frameCount;

        setMetrics(prev => ({
          ...prev,
          fps,
          frameTime,
        }));

        setFpsHistory(prev => {
          const updated = [...prev, fps];
          return updated.slice(-30); // Manter últimos 30 samples
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Ajuste automático de qualidade
  useEffect(() => {
    if (!settings.adaptiveQuality || fpsHistory.length < 10) return;

    const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;

    if (avgFPS < 25 && settings.particleQuality !== 'low') {
      setSettings(prev => ({ ...prev, particleQuality: 'low' }));
      console.log('[Performance3D] Reduzindo para qualidade LOW (FPS:', avgFPS, ')');
    } else if (avgFPS < 40 && settings.particleQuality === 'high') {
      setSettings(prev => ({ ...prev, particleQuality: 'medium' }));
      console.log('[Performance3D] Reduzindo para qualidade MEDIUM (FPS:', avgFPS, ')');
    } else if (avgFPS > 55 && settings.particleQuality === 'low') {
      setSettings(prev => ({ ...prev, particleQuality: 'medium' }));
      console.log('[Performance3D] Aumentando para qualidade MEDIUM (FPS:', avgFPS, ')');
    } else if (avgFPS > 58 && settings.particleQuality === 'medium') {
      setSettings(prev => ({ ...prev, particleQuality: 'high' }));
      console.log('[Performance3D] Aumentando para qualidade HIGH (FPS:', avgFPS, ')');
    }
  }, [fpsHistory, settings.adaptiveQuality, settings.particleQuality]);

  const getQualitySettings = useCallback(() => {
    const quality = settings.particleQuality;
    
    switch (quality) {
      case 'low':
        return {
          maxParticles: 50,
          shadowMapSize: 512,
          antialias: false,
          pixelRatio: 1,
          postProcessing: false,
        };
      case 'medium':
        return {
          maxParticles: 150,
          shadowMapSize: 1024,
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          postProcessing: settings.postProcessing,
        };
      case 'high':
        return {
          maxParticles: 300,
          shadowMapSize: 2048,
          antialias: true,
          pixelRatio: window.devicePixelRatio,
          postProcessing: settings.postProcessing,
        };
    }
  }, [settings.particleQuality, settings.postProcessing]);

  const forceQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    setSettings(prev => ({ ...prev, particleQuality: quality }));
  }, []);

  const toggle3D = useCallback(() => {
    setSettings(prev => ({ ...prev, enable3D: !prev.enable3D }));
  }, []);

  const togglePostProcessing = useCallback(() => {
    setSettings(prev => ({ ...prev, postProcessing: !prev.postProcessing }));
  }, []);

  const toggleAdaptiveQuality = useCallback(() => {
    setSettings(prev => ({ ...prev, adaptiveQuality: !prev.adaptiveQuality }));
  }, []);

  return {
    metrics,
    fpsHistory,
    qualitySettings: getQualitySettings(),
    forceQuality,
    enable3D: settings.enable3D,
    adaptiveQuality: settings.adaptiveQuality,
    postProcessing: settings.postProcessing,
    particleQuality: settings.particleQuality,
    toggle3D,
    togglePostProcessing,
    toggleAdaptiveQuality,
  };
};
