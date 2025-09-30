/**
 * Global Game State Management System with Transaction History
 * Centralized state management using Context API pattern
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';

// Game State Types
export interface GameState {
  // Player Stats
  coins: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  maxExperience: number;
  
  // Game Progress
  totalSpins: number;
  totalCoinsEarned: number;
  dailyStreak: number;
  lastWin: number;
  
  // Game Settings
  currentTheme: string | null;
  currentMultiplier: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  
  // Social Features
  referrals: Array<{
    id: string;
    name: string;
    level: number;
    totalSpins: number;
    joinDate: string;
  }>;
  
  // UI State
  gameStarted: boolean;
  activeTab: string;
  activeGame: string;
  notifications: string[];
}

// Action Types
export type GameAction =
  | { type: 'SET_COINS'; payload: number }
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'SPEND_COINS'; payload: number }
  | { type: 'SET_ENERGY'; payload: number }
  | { type: 'USE_ENERGY'; payload: number }
  | { type: 'ADD_ENERGY'; payload: number }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'LEVEL_UP' }
  | { type: 'SET_EXPERIENCE'; payload: number }
  | { type: 'ADD_EXPERIENCE'; payload: number }
  | { type: 'SPIN_COMPLETED'; payload: { coinsWon: number; xpGained: number } }
  | { type: 'START_GAME' }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_GAME'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_THEME'; payload: string | null }
  | { type: 'SET_MULTIPLIER'; payload: number }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_HAPTIC' }
  | { type: 'ADD_REFERRAL'; payload: { id: string; name: string; level: number; totalSpins: number; joinDate: string } }
  | { type: 'LOAD_STATE'; payload: Partial<GameState> }
  | { type: 'RESET_GAME' };

// Initial State
const initialState: GameState = {
  coins: 1000,
  energy: 5,
  maxEnergy: 10,
  level: 1,
  experience: 150,
  maxExperience: 1000,
  totalSpins: 45,
  totalCoinsEarned: 15000,
  dailyStreak: 3,
  lastWin: 0,
  currentTheme: null,
  currentMultiplier: 1,
  soundEnabled: true,
  hapticEnabled: true,
  referrals: [],
  gameStarted: false,
  activeTab: 'games',
  activeGame: 'fortune-tiger',
  notifications: []
};

// Reducer Function
function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_COINS':
      return { ...state, coins: Math.max(0, action.payload) };
    
    case 'ADD_COINS':
      const newCoins = state.coins + action.payload;
      return { 
        ...state, 
        coins: newCoins,
        totalCoinsEarned: state.totalCoinsEarned + action.payload,
        lastWin: action.payload
      };
    
    case 'SPEND_COINS':
      return { ...state, coins: Math.max(0, state.coins - action.payload) };
    
    case 'SET_ENERGY':
      return { ...state, energy: Math.min(Math.max(0, action.payload), state.maxEnergy) };
    
    case 'USE_ENERGY':
      return { 
        ...state, 
        energy: Math.max(0, state.energy - action.payload),
        totalSpins: state.totalSpins + 1
      };
    
    case 'ADD_ENERGY':
      return { ...state, energy: Math.min(state.energy + action.payload, state.maxEnergy) };
    
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    
    case 'LEVEL_UP':
      return { 
        ...state, 
        level: state.level + 1,
        experience: 0,
        coins: state.coins + 500,
        maxExperience: Math.floor(state.maxExperience * 1.2)
      };
    
    case 'SET_EXPERIENCE':
      const newExp = action.payload;
      if (newExp >= state.maxExperience) {
        return gameStateReducer(state, { type: 'LEVEL_UP' });
      }
      return { ...state, experience: newExp };
    
    case 'ADD_EXPERIENCE':
      return gameStateReducer(state, { type: 'SET_EXPERIENCE', payload: state.experience + action.payload });
    
    case 'SPIN_COMPLETED':
      const { coinsWon, xpGained } = action.payload;
      let newState = { ...state };
      newState = gameStateReducer(newState, { type: 'ADD_COINS', payload: coinsWon });
      newState = gameStateReducer(newState, { type: 'ADD_EXPERIENCE', payload: xpGained });
      newState = gameStateReducer(newState, { type: 'USE_ENERGY', payload: 1 });
      return newState;
    
    case 'START_GAME':
      return { ...state, gameStarted: true };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_ACTIVE_GAME':
      return { ...state, activeGame: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload]
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'SET_THEME':
      return { ...state, currentTheme: action.payload };
    
    case 'SET_MULTIPLIER':
      return { ...state, currentMultiplier: action.payload };
    
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    
    case 'TOGGLE_HAPTIC':
      return { ...state, hapticEnabled: !state.hapticEnabled };
    
    case 'ADD_REFERRAL':
      return { 
        ...state, 
        referrals: [...state.referrals, action.payload],
        coins: state.coins + 500
      };
    
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    
    case 'RESET_GAME':
      return { ...initialState, gameStarted: state.gameStarted };
    
    default:
      return state;
  }
}

// Context Creation
const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Provider Component
interface GameStateProviderProps {
  children: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);

  // Persist state to localStorage
  React.useEffect(() => {
    const savedState = localStorage.getItem('zodiac-fortune-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.warn('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('zodiac-fortune-state', JSON.stringify(state));
  }, [state]);

  // Energy regeneration
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (state.energy < state.maxEnergy) {
        dispatch({ type: 'ADD_ENERGY', payload: 1 });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [state.energy, state.maxEnergy]);

  return React.createElement(GameStateContext.Provider, { value: { state, dispatch } }, children);
};

// Custom Hook
export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

// Helper Hooks
export const useGameActions = () => {
  const { dispatch } = useGameState();
  
  return {
    setCoins: (amount: number) => dispatch({ type: 'SET_COINS', payload: amount }),
    addCoins: (amount: number) => dispatch({ type: 'ADD_COINS', payload: amount }),
    spendCoins: (amount: number) => dispatch({ type: 'SPEND_COINS', payload: amount }),
    setEnergy: (amount: number) => dispatch({ type: 'SET_ENERGY', payload: amount }),
    useEnergy: (amount: number = 1) => dispatch({ type: 'USE_ENERGY', payload: amount }),
    addEnergy: (amount: number) => dispatch({ type: 'ADD_ENERGY', payload: amount }),
    addExperience: (amount: number) => dispatch({ type: 'ADD_EXPERIENCE', payload: amount }),
    levelUp: () => dispatch({ type: 'LEVEL_UP' }),
    completeSpin: (coinsWon: number, xpGained: number = 10) => 
      dispatch({ type: 'SPIN_COMPLETED', payload: { coinsWon, xpGained } }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    setActiveTab: (tab: string) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    setActiveGame: (game: string) => dispatch({ type: 'SET_ACTIVE_GAME', payload: game }),
    addNotification: (message: string) => dispatch({ type: 'ADD_NOTIFICATION', payload: message }),
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
    setTheme: (theme: string | null) => dispatch({ type: 'SET_THEME', payload: theme }),
    setMultiplier: (multiplier: number) => dispatch({ type: 'SET_MULTIPLIER', payload: multiplier }),
    toggleSound: () => dispatch({ type: 'TOGGLE_SOUND' }),
    toggleHaptic: () => dispatch({ type: 'TOGGLE_HAPTIC' }),
    addReferral: (referral: { id: string; name: string; level: number; totalSpins: number; joinDate: string }) =>
      dispatch({ type: 'ADD_REFERRAL', payload: referral }),
    resetGame: () => dispatch({ type: 'RESET_GAME' })
  };
};