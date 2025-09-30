/**
 * Game Persistence Hook
 * Handles automatic saving and loading of game state
 */

import { useEffect, useCallback } from 'react';
import { useGameState, useGameActions } from '@/systems/GameStateSystem';

interface SavedGameState {
  coins: number;
  energy: number;
  level: number;
  experience: number;
  maxExperience: number;
  totalSpins: number;
  totalCoinsEarned: number;
  dailyStreak: number;
  lastWin: number;
  currentTheme: string | null;
  currentMultiplier: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  lastPlayed: number;
  autoSaved: boolean;
  version: string;
}

const STORAGE_KEY = 'zodiac-fortune-game-state';
const AUTOSAVE_KEY = 'zodiac-fortune-autosave';
const CURRENT_VERSION = '1.0.0';

export const useGamePersistence = () => {
  const { state } = useGameState();
  const { 
    setCoins, 
    setEnergy
    // Note: setLevel and setExperience not available in current GameStateSystem
  } = useGameActions();

  // Save game state
  const saveGameState = useCallback((isAutoSave = false) => {
    try {
      const gameData: SavedGameState = {
        coins: state.coins,
        energy: state.energy,
        level: state.level,
        experience: state.experience,
        maxExperience: state.maxExperience,
        totalSpins: state.totalSpins,
        totalCoinsEarned: state.totalCoinsEarned,
        dailyStreak: state.dailyStreak,
        lastWin: state.lastWin,
        currentTheme: state.currentTheme,
        currentMultiplier: state.currentMultiplier,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
        lastPlayed: Date.now(),
        autoSaved: isAutoSave,
        version: CURRENT_VERSION
      };

      const storageKey = isAutoSave ? AUTOSAVE_KEY : STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(gameData));
      
      console.log(`Game state ${isAutoSave ? 'auto-' : ''}saved successfully`);
      return true;
    } catch (error) {
      console.error('Failed to save game state:', error);
      return false;
    }
  }, [state]);

  // Load game state
  const loadGameState = useCallback(() => {
    try {
      // Try to load from main save first, then autosave as backup
      const mainSave = localStorage.getItem(STORAGE_KEY);
      const autoSave = localStorage.getItem(AUTOSAVE_KEY);
      
      let savedData: SavedGameState | null = null;
      
      if (mainSave) {
        savedData = JSON.parse(mainSave);
      } else if (autoSave) {
        savedData = JSON.parse(autoSave);
        console.log('Loaded from autosave backup');
      }

      if (savedData) {
        // Version check and migration if needed
        if (savedData.version !== CURRENT_VERSION) {
          console.log('Migrating save data from', savedData.version, 'to', CURRENT_VERSION);
          // Add migration logic here if needed
        }

        // Restore state using available actions
        setCoins(savedData.coins);
        setEnergy(savedData.energy);
        // Note: setLevel and setExperience don't exist in current GameStateSystem
        // Will need to be implemented or use available actions
        
        console.log('Game state loaded successfully');
        return savedData;
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    
    return null;
  }, [setCoins, setEnergy]);

  // Clear saved data
  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(AUTOSAVE_KEY);
      console.log('Game state cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear game state:', error);
      return false;
    }
  }, []);

  // Check if save exists
  const hasSavedGame = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) !== null || localStorage.getItem(AUTOSAVE_KEY) !== null;
  }, []);

  // Get save info
  const getSaveInfo = useCallback(() => {
    try {
      const mainSave = localStorage.getItem(STORAGE_KEY);
      const autoSave = localStorage.getItem(AUTOSAVE_KEY);
      
      if (mainSave) {
        const data = JSON.parse(mainSave);
        return {
          exists: true,
          lastPlayed: new Date(data.lastPlayed),
          isAutoSave: false,
          version: data.version,
          level: data.level,
          coins: data.coins
        };
      } else if (autoSave) {
        const data = JSON.parse(autoSave);
        return {
          exists: true,
          lastPlayed: new Date(data.lastPlayed),
          isAutoSave: true,
          version: data.version,
          level: data.level,
          coins: data.coins
        };
      }
    } catch (error) {
      console.error('Failed to get save info:', error);
    }
    
    return {
      exists: false,
      lastPlayed: null,
      isAutoSave: false,
      version: null,
      level: 1,
      coins: 1000
    };
  }, []);

  // Auto-save every 30 seconds when state changes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveGameState(true);
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [saveGameState]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGameState(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveGameState]);

  // Load on mount
  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  return {
    saveGameState,
    loadGameState,
    clearGameState,
    hasSavedGame,
    getSaveInfo
  };
};