import React, { createContext, useContext, useEffect, useState } from 'react';
import { useThemeContext } from './ThemeProvider';

interface PremiumThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  visualQuality: 'low' | 'medium' | 'high' | 'ultra';
  setVisualQuality: (quality: 'low' | 'medium' | 'high' | 'ultra') => void;
  appleStyleEnabled: boolean;
  setAppleStyleEnabled: (enabled: boolean) => void;
  adaptToSystemTheme: boolean;
  setAdaptToSystemTheme: (adapt: boolean) => void;
}

const PremiumThemeContext = createContext<PremiumThemeContextType | undefined>(undefined);

interface PremiumThemeProviderProps {
  children: React.ReactNode;
}

export const PremiumThemeProvider: React.FC<PremiumThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [visualQuality, setVisualQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  const [appleStyleEnabled, setAppleStyleEnabled] = useState(true);
  const [adaptToSystemTheme, setAdaptToSystemTheme] = useState(true);

  // Detect system theme preference
  useEffect(() => {
    if (!adaptToSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [adaptToSystemTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply visual quality settings
    root.setAttribute('data-visual-quality', visualQuality);
    
    // Apply Apple-style enhancements
    if (appleStyleEnabled) {
      root.classList.add('apple-enhanced');
    } else {
      root.classList.remove('apple-enhanced');
    }

    // CSS variables for dynamic quality adjustment
    switch (visualQuality) {
      case 'low':
        root.style.setProperty('--animation-duration-multiplier', '0.5');
        root.style.setProperty('--particle-density', '0.3');
        root.style.setProperty('--blur-amount', '2px');
        break;
      case 'medium':
        root.style.setProperty('--animation-duration-multiplier', '0.75');
        root.style.setProperty('--particle-density', '0.6');
        root.style.setProperty('--blur-amount', '4px');
        break;
      case 'high':
        root.style.setProperty('--animation-duration-multiplier', '1');
        root.style.setProperty('--particle-density', '1');
        root.style.setProperty('--blur-amount', '8px');
        break;
      case 'ultra':
        root.style.setProperty('--animation-duration-multiplier', '1.2');
        root.style.setProperty('--particle-density', '1.5');
        root.style.setProperty('--blur-amount', '12px');
        break;
    }
  }, [isDarkMode, visualQuality, appleStyleEnabled]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('premium-theme-preferences', JSON.stringify({
      isDarkMode,
      visualQuality,
      appleStyleEnabled,
      adaptToSystemTheme
    }));
  }, [isDarkMode, visualQuality, appleStyleEnabled, adaptToSystemTheme]);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('premium-theme-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        if (!preferences.adaptToSystemTheme) {
          setIsDarkMode(preferences.isDarkMode);
        }
        setVisualQuality(preferences.visualQuality || 'high');
        setAppleStyleEnabled(preferences.appleStyleEnabled ?? true);
        setAdaptToSystemTheme(preferences.adaptToSystemTheme ?? true);
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }, []);

  const toggleDarkMode = () => {
    if (adaptToSystemTheme) {
      setAdaptToSystemTheme(false);
    }
    setIsDarkMode(prev => !prev);
  };

  const contextValue: PremiumThemeContextType = {
    isDarkMode,
    toggleDarkMode,
    visualQuality,
    setVisualQuality,
    appleStyleEnabled,
    setAppleStyleEnabled,
    adaptToSystemTheme,
    setAdaptToSystemTheme
  };

  return (
    <PremiumThemeContext.Provider value={contextValue}>
      {children}
    </PremiumThemeContext.Provider>
  );
};

export const usePremiumTheme = (): PremiumThemeContextType => {
  const context = useContext(PremiumThemeContext);
  if (!context) {
    throw new Error('usePremiumTheme must be used within a PremiumThemeProvider');
  }
  return context;
};

// Premium Theme Controls Component
interface PremiumThemeControlsProps {
  className?: string;
}

export const PremiumThemeControls: React.FC<PremiumThemeControlsProps> = ({ className = '' }) => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    visualQuality, 
    setVisualQuality,
    appleStyleEnabled,
    setAppleStyleEnabled,
    adaptToSystemTheme,
    setAdaptToSystemTheme
  } = usePremiumTheme();

  return (
    <div className={`space-y-6 p-6 bg-card/80 backdrop-blur-apple rounded-2xl border border-border/50 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Aparência Premium</h3>
      
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Modo Escuro
        </label>
        <button
          onClick={toggleDarkMode}
          className={`
            relative w-14 h-8 rounded-full transition-all duration-300
            ${isDarkMode 
              ? 'bg-primary shadow-lg glow-gold' 
              : 'bg-muted border border-border'
            }
          `}
        >
          <div
            className={`
              absolute w-6 h-6 rounded-full bg-background shadow-md 
              transition-transform duration-300 top-1
              ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}
            `}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
            <span className={isDarkMode ? 'text-primary-foreground' : 'text-muted-foreground'}>🌙</span>
            <span className={!isDarkMode ? 'text-foreground' : 'text-muted-foreground'}>☀️</span>
          </div>
        </button>
      </div>

      {/* System Theme Adaptation */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Seguir Sistema
        </label>
        <button
          onClick={() => setAdaptToSystemTheme(!adaptToSystemTheme)}
          className={`
            w-12 h-6 rounded-full transition-all duration-300 relative
            ${adaptToSystemTheme 
              ? 'bg-secondary shadow-lg' 
              : 'bg-muted border border-border'
            }
          `}
        >
          <div
            className={`
              w-5 h-5 rounded-full bg-background shadow-md 
              transition-transform duration-300 absolute top-0.5
              ${adaptToSystemTheme ? 'translate-x-6' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      {/* Visual Quality */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Qualidade Visual
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
            <button
              key={quality}
              onClick={() => setVisualQuality(quality)}
              className={`
                px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                ${visualQuality === quality
                  ? 'bg-primary text-primary-foreground shadow-lg animate-apple-press'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {quality === 'low' && '⚡ Baixa'}
              {quality === 'medium' && '⚖️ Média'}
              {quality === 'high' && '✨ Alta'}
              {quality === 'ultra' && '🚀 Ultra'}
            </button>
          ))}
        </div>
      </div>

      {/* Apple Style Enhancement */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Estilo Apple
        </label>
        <button
          onClick={() => setAppleStyleEnabled(!appleStyleEnabled)}
          className={`
            w-12 h-6 rounded-full transition-all duration-300 relative
            ${appleStyleEnabled 
              ? 'bg-accent shadow-lg' 
              : 'bg-muted border border-border'
            }
          `}
        >
          <div
            className={`
              w-5 h-5 rounded-full bg-background shadow-md 
              transition-transform duration-300 absolute top-0.5
              ${appleStyleEnabled ? 'translate-x-6' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>
    </div>
  );
};