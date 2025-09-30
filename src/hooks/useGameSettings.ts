import { useState, useEffect, useCallback } from 'react';
import { GameSettings, defaultSettings } from '@/types/settings';
import { toast } from 'sonner';

const SETTINGS_STORAGE_KEY = 'game_settings';

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          // Merge with defaults to handle new settings
          const mergedSettings = {
            ...defaultSettings,
            ...parsedSettings,
            visual: { ...defaultSettings.visual, ...parsedSettings.visual },
            audio: { ...defaultSettings.audio, ...parsedSettings.audio },
            gameplay: { ...defaultSettings.gameplay, ...parsedSettings.gameplay },
            accessibility: { ...defaultSettings.accessibility, ...parsedSettings.accessibility }
          };
          setSettings(mergedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Falha ao carregar configurações, usando padrões');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
        toast.error('Falha ao salvar configurações');
      }
    }
  }, [settings, isLoading]);

  const updateVisualSettings = useCallback((updates: Partial<GameSettings['visual']>) => {
    setSettings(prev => ({
      ...prev,
      visual: { ...prev.visual, ...updates }
    }));
    
    toast.success('Configurações visuais atualizadas', { duration: 2000 });
  }, []);

  const updateAudioSettings = useCallback((updates: Partial<GameSettings['audio']>) => {
    setSettings(prev => ({
      ...prev,
      audio: { ...prev.audio, ...updates }
    }));
    
    toast.success('Configurações de áudio atualizadas', { duration: 2000 });
  }, []);

  const updateGameplaySettings = useCallback((updates: Partial<GameSettings['gameplay']>) => {
    setSettings(prev => ({
      ...prev,
      gameplay: { ...prev.gameplay, ...updates }
    }));
    
    toast.success('Configurações de gameplay atualizadas', { duration: 2000 });
  }, []);

  const updateAccessibilitySettings = useCallback((updates: Partial<GameSettings['accessibility']>) => {
    setSettings(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, ...updates }
    }));
    
    toast.success('Configurações de acessibilidade atualizadas', { duration: 2000 });
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    toast.success('Configurações restauradas para o padrão');
  }, []);

  const exportSettings = useCallback(() => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'game-settings.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Configurações exportadas');
    } catch (error) {
      console.error('Failed to export settings:', error);
      toast.error('Falha ao exportar configurações');
    }
  }, [settings]);

  const importSettings = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const importedSettings = JSON.parse(result);
        
        // Validate imported settings structure
        if (importedSettings.visual && importedSettings.audio && 
            importedSettings.gameplay && importedSettings.accessibility) {
          setSettings(importedSettings);
          toast.success('Configurações importadas com sucesso');
        } else {
          toast.error('Arquivo de configurações inválido');
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
        toast.error('Falha ao importar configurações');
      }
    };
    
    reader.readAsText(file);
  }, []);

  // Apply settings to the game/DOM
  useEffect(() => {
    if (!isLoading) {
      // Apply visual settings
      const root = document.documentElement;
      
      // Apply accessibility settings
      if (settings.accessibility.increasedFontSize) {
        root.style.fontSize = '18px';
      } else {
        root.style.fontSize = '16px';
      }
      
      if (settings.accessibility.highContrastMode) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
      
      if (settings.accessibility.reducedMotion || settings.visual.reducedMotion) {
        root.style.setProperty('--animation-duration', '0.01ms');
      } else {
        root.style.removeProperty('--animation-duration');
      }

      // Apply battery saving mode
      if (settings.visual.batterySavingMode) {
        root.classList.add('battery-saving');
      } else {
        root.classList.remove('battery-saving');
      }
    }
  }, [settings, isLoading]);

  const getPerformanceProfile = useCallback(() => {
    const { visual, accessibility } = settings;
    
    let performanceScore = 100;
    
    // Reduce score based on enabled features
    if (visual.graphicsQuality === 'ultra') performanceScore -= 30;
    else if (visual.graphicsQuality === 'high') performanceScore -= 20;
    else if (visual.graphicsQuality === 'medium') performanceScore -= 10;
    
    if (visual.particleEffects) performanceScore -= 15;
    if (visual.backgroundAnimations) performanceScore -= 10;
    if (visual.frameRate === 60) performanceScore -= 10;
    
    // Battery saving mode improves performance
    if (visual.batterySavingMode) performanceScore += 20;
    if (accessibility.reducedMotion) performanceScore += 15;
    
    return {
      score: Math.max(0, Math.min(100, performanceScore)),
      recommendation: performanceScore < 50 ? 'low' : 
                     performanceScore < 75 ? 'medium' : 'high'
    };
  }, [settings]);

  return {
    settings,
    isLoading,
    updateVisualSettings,
    updateAudioSettings,
    updateGameplaySettings,
    updateAccessibilitySettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    getPerformanceProfile
  };
};