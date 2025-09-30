import React, { createContext, useContext, useEffect } from 'react';
import { GameTheme } from './ThemeSystem';
import { useThemes } from '@/hooks/useThemes';
import { PhoenixThemeEffects } from './theme-effects/PhoenixThemeEffects';
import { PandaThemeEffects } from './theme-effects/PandaThemeEffects';
import { DragonThemeEffects } from './theme-effects/DragonThemeEffects';

interface ThemeContextType {
  currentTheme: GameTheme;
  unlockedThemes: GameTheme[];
  changeTheme: (theme: GameTheme) => boolean;
  isThemeUnlocked: (theme: GameTheme) => boolean;
  getThemeName: (theme: GameTheme) => string;
  checkForNewUnlocks: (level: number) => GameTheme[];
  getThemeEffectsIntensity: (theme: GameTheme) => number;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  playerLevel: number;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  playerLevel 
}) => {
  const themeHook = useThemes(playerLevel);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeHook.currentTheme);
    
    // Apply theme-specific CSS variables
    switch (themeHook.currentTheme) {
      case 'phoenix':
        root.style.setProperty('--current-theme-primary', 'var(--phoenix-primary)');
        root.style.setProperty('--current-theme-secondary', 'var(--phoenix-secondary)');
        root.style.setProperty('--current-theme-accent', 'var(--phoenix-accent)');
        break;
      case 'panda':
        root.style.setProperty('--current-theme-primary', 'var(--panda-primary)');
        root.style.setProperty('--current-theme-secondary', 'var(--panda-secondary)');
        root.style.setProperty('--current-theme-accent', 'var(--panda-accent)');
        break;
      case 'dragon':
        root.style.setProperty('--current-theme-primary', 'var(--dragon-primary)');
        root.style.setProperty('--current-theme-secondary', 'var(--dragon-secondary)');
        root.style.setProperty('--current-theme-accent', 'var(--dragon-accent)');
        break;
      default:
        root.style.setProperty('--current-theme-primary', 'var(--pgbet-gold)');
        root.style.setProperty('--current-theme-secondary', 'var(--pgbet-red)');
        root.style.setProperty('--current-theme-accent', 'var(--pgbet-amber)');
    }
  }, [themeHook.currentTheme]);

  const contextValue: ThemeContextType = {
    currentTheme: themeHook.currentTheme,
    unlockedThemes: themeHook.unlockedThemes,
    changeTheme: themeHook.changeTheme,
    isThemeUnlocked: themeHook.isThemeUnlocked,
    getThemeName: themeHook.getThemeName,
    checkForNewUnlocks: themeHook.checkForNewUnlocks,
    getThemeEffectsIntensity: themeHook.getThemeEffectsIntensity,
    isLoading: themeHook.isLoading
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
      
      {/* Render active theme effects */}
      {themeHook.currentTheme === 'phoenix' && (
        <PhoenixThemeEffects 
          intensity={themeHook.getThemeEffectsIntensity('phoenix')} 
          isActive={true} 
        />
      )}
      {themeHook.currentTheme === 'panda' && (
        <PandaThemeEffects 
          intensity={themeHook.getThemeEffectsIntensity('panda')} 
          isActive={true} 
        />
      )}
      {themeHook.currentTheme === 'dragon' && (
        <DragonThemeEffects 
          intensity={themeHook.getThemeEffectsIntensity('dragon')} 
          isActive={true} 
        />
      )}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};