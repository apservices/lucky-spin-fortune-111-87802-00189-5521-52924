import { useState, useEffect, useCallback } from 'react';
import { GameTheme } from '@/components/ThemeSystem';
import { useToast } from '@/hooks/use-toast';

const THEME_STORAGE_KEY = 'zodiac_fortune_current_theme';
const UNLOCKED_THEMES_KEY = 'zodiac_fortune_unlocked_themes';

interface ThemeState {
  currentTheme: GameTheme;
  unlockedThemes: GameTheme[];
  isLoading: boolean;
}

export const useThemes = (playerLevel: number) => {
  const { toast } = useToast();
  const [themeState, setThemeState] = useState<ThemeState>({
    currentTheme: 'classic',
    unlockedThemes: ['classic'],
    isLoading: true
  });

  // Load theme data from localStorage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const storedUnlocked = localStorage.getItem(UNLOCKED_THEMES_KEY);

      const currentTheme = (storedTheme as GameTheme) || 'classic';
      const unlockedThemes = storedUnlocked ? JSON.parse(storedUnlocked) : ['classic'];

      // Auto-unlock themes based on player level
      const autoUnlocked = getAutoUnlockedThemes(playerLevel);
      const allUnlocked = [...new Set([...unlockedThemes, ...autoUnlocked])];

      setThemeState({
        currentTheme,
        unlockedThemes: allUnlocked,
        isLoading: false
      });

      // Save updated unlocked themes if new ones were added
      if (allUnlocked.length > unlockedThemes.length) {
        localStorage.setItem(UNLOCKED_THEMES_KEY, JSON.stringify(allUnlocked));
      }
    } catch (error) {
      console.error('Error loading theme data:', error);
      setThemeState({
        currentTheme: 'classic',
        unlockedThemes: ['classic'],
        isLoading: false
      });
    }
  }, [playerLevel]);

  const getAutoUnlockedThemes = (level: number): GameTheme[] => {
    const themes: GameTheme[] = ['classic'];
    
    if (level >= 5) themes.push('phoenix');
    if (level >= 10) themes.push('panda');
    if (level >= 15) themes.push('dragon');
    if (level >= 20) themes.push('jade');
    if (level >= 30) themes.push('celestial');
    
    return themes;
  };

  const changeTheme = useCallback((newTheme: GameTheme) => {
    if (!themeState.unlockedThemes.includes(newTheme)) {
      toast({
        title: "Tema Bloqueado",
        description: "Você precisa alcançar o nível necessário para desbloquear este tema.",
        variant: "destructive"
      });
      return false;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(prev => ({
        ...prev,
        currentTheme: newTheme
      }));

      toast({
        title: "Tema Alterado",
        description: `Tema ${getThemeName(newTheme)} ativado com sucesso!`,
      });

      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o tema. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  }, [themeState.unlockedThemes, toast]);

  const unlockTheme = useCallback((theme: GameTheme) => {
    if (themeState.unlockedThemes.includes(theme)) {
      return false; // Already unlocked
    }

    try {
      const updatedUnlocked = [...themeState.unlockedThemes, theme];
      localStorage.setItem(UNLOCKED_THEMES_KEY, JSON.stringify(updatedUnlocked));
      
      setThemeState(prev => ({
        ...prev,
        unlockedThemes: updatedUnlocked
      }));

      return true;
    } catch (error) {
      console.error('Error unlocking theme:', error);
      return false;
    }
  }, [themeState.unlockedThemes]);

  const isThemeUnlocked = useCallback((theme: GameTheme): boolean => {
    return themeState.unlockedThemes.includes(theme);
  }, [themeState.unlockedThemes]);

  const getThemeName = (theme: GameTheme): string => {
    const names: Record<GameTheme, string> = {
      classic: 'Clássico Dourado',
      phoenix: 'Fênix Imperial',
      panda: 'Panda Zen',
      dragon: 'Dragão Celestial',
      jade: 'Jade Místico',
      celestial: 'Celestial Supremo'
    };
    return names[theme] || theme;
  };

  const checkForNewUnlocks = useCallback((newLevel: number) => {
    const newlyUnlocked: GameTheme[] = [];
    
    if (newLevel >= 5 && !isThemeUnlocked('phoenix')) {
      unlockTheme('phoenix');
      newlyUnlocked.push('phoenix');
    }
    if (newLevel >= 10 && !isThemeUnlocked('panda')) {
      unlockTheme('panda');
      newlyUnlocked.push('panda');
    }
    if (newLevel >= 15 && !isThemeUnlocked('dragon')) {
      unlockTheme('dragon');
      newlyUnlocked.push('dragon');
    }
    if (newLevel >= 20 && !isThemeUnlocked('jade')) {
      unlockTheme('jade');
      newlyUnlocked.push('jade');
    }
    if (newLevel >= 30 && !isThemeUnlocked('celestial')) {
      unlockTheme('celestial');
      newlyUnlocked.push('celestial');
    }

    return newlyUnlocked;
  }, [isThemeUnlocked, unlockTheme]);

  const getThemeEffectsIntensity = useCallback((theme: GameTheme): number => {
    const intensities: Record<GameTheme, number> = {
      classic: 0.5,
      phoenix: 1.0,
      panda: 0.3,
      dragon: 0.8,
      jade: 0.6,
      celestial: 1.2
    };
    return intensities[theme] || 0.5;
  }, []);

  const resetThemes = useCallback(() => {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(UNLOCKED_THEMES_KEY);
      setThemeState({
        currentTheme: 'classic',
        unlockedThemes: ['classic'],
        isLoading: false
      });
      toast({
        title: "Temas Resetados",
        description: "Todos os temas foram resetados para o padrão.",
      });
    } catch (error) {
      console.error('Error resetting themes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar os temas.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    currentTheme: themeState.currentTheme,
    unlockedThemes: themeState.unlockedThemes,
    isLoading: themeState.isLoading,
    changeTheme,
    unlockTheme,
    isThemeUnlocked,
    getThemeName,
    checkForNewUnlocks,
    getThemeEffectsIntensity,
    resetThemes
  };
};