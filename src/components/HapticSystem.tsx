import React, { createContext, useContext, useState, useCallback } from 'react';

interface HapticContextType {
  isEnabled: boolean;
  toggleHaptic: () => void;
  triggerHaptic: (type: HapticType, intensity?: number) => void;
}

type HapticType = 
  | 'spin_start' 
  | 'spin_pulse' 
  | 'spin_stop'
  | 'win_small'
  | 'win_medium' 
  | 'win_big'
  | 'win_jackpot'
  | 'multiplier'
  | 'bonus'
  | 'level_up'
  | 'button_click'
  | 'error'
  | 'success';

const HapticContext = createContext<HapticContextType | undefined>(undefined);

// Advanced haptic patterns optimized for different events
const HAPTIC_PATTERNS: Record<HapticType, number[]> = {
  // Spin events
  spin_start: [50], // Light tap
  spin_pulse: [30, 50, 30], // Subtle pulse during spin
  spin_stop: [80], // Firm stop

  // Win events (intensity based)
  win_small: [100, 50, 100], // Double tap
  win_medium: [150, 80, 150, 80, 100], // Triple crescendo
  win_big: [200, 100, 200, 100, 200, 100, 150], // Celebration sequence
  win_jackpot: [300, 150, 300, 150, 300, 150, 300, 100, 200, 100, 200], // Epic jackpot

  // Special events
  multiplier: [120, 60, 120], // Sharp double pulse
  bonus: [180, 120, 180, 120, 200], // Bonus celebration
  level_up: [250, 100, 250, 100, 250, 100, 300], // Level up fanfare

  // UI feedback
  button_click: [25], // Subtle click
  error: [200, 100, 200], // Error alert
  success: [150, 80, 150] // Success confirmation
};

// Fallback for devices without vibration support
const createHapticFallback = (pattern: number[]) => {
  // Visual feedback could be added here
  console.log('🔊 Haptic feedback:', pattern);
};

// Check vibration API support with enhanced detection
const isVibrationSupported = (): boolean => {
  return (
    'navigator' in window &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  );
};

// Advanced pattern generator for dynamic intensity
const generateDynamicPattern = (
  basePattern: number[], 
  intensity: number = 1
): number[] => {
  const clampedIntensity = Math.max(0.3, Math.min(3, intensity));
  return basePattern.map(value => Math.round(value * clampedIntensity));
};

// Win intensity calculator based on multiplier
const calculateWinIntensity = (multiplier: number, betAmount: number): number => {
  const winRatio = multiplier;
  
  if (winRatio >= 50) return 3; // Jackpot level
  if (winRatio >= 20) return 2.5; // Big win
  if (winRatio >= 10) return 2; // Medium win
  if (winRatio >= 5) return 1.5; // Small-medium win
  return 1; // Small win
};

interface HapticProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
}

export const HapticProvider: React.FC<HapticProviderProps> = ({
  children,
  defaultEnabled = true
}) => {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);

  const toggleHaptic = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const triggerHaptic = useCallback((type: HapticType, intensity: number = 1) => {
    if (!isEnabled) return;

    const basePattern = HAPTIC_PATTERNS[type];
    if (!basePattern) {
      console.warn(`Unknown haptic type: ${type}`);
      return;
    }

    const pattern = generateDynamicPattern(basePattern, intensity);

    if (isVibrationSupported()) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Vibration API error:', error);
        createHapticFallback(pattern);
      }
    } else {
      createHapticFallback(pattern);
    }
  }, [isEnabled]);

  return (
    <HapticContext.Provider value={{ isEnabled, toggleHaptic, triggerHaptic }}>
      {children}
    </HapticContext.Provider>
  );
};

export const useHaptic = (): HapticContextType => {
  const context = useContext(HapticContext);
  if (!context) {
    throw new Error('useHaptic must be used within a HapticProvider');
  }
  return context;
};

// Advanced haptic hook with game-specific methods
export const useGameHaptics = () => {
  const context = useContext(HapticContext);
  
  // Fallback if not in HapticProvider context
  if (!context) {
    console.warn('useGameHaptics called outside of HapticProvider, using fallback');
    return {
      isEnabled: false,
      spinStart: () => {},
      spinPulse: () => {},
      spinStop: () => {},
      winHaptic: () => {},
      multiplierHaptic: () => {},
      bonusHaptic: () => {},
      levelUpHaptic: () => {},
      buttonClick: () => {},
      error: () => {},
      success: () => {}
    };
  }

  const { triggerHaptic, isEnabled } = context;

  return {
    isEnabled,
    
    // Spin haptics
    spinStart: () => triggerHaptic('spin_start'),
    spinPulse: () => triggerHaptic('spin_pulse'),
    spinStop: () => triggerHaptic('spin_stop'),

    // Win haptics with dynamic intensity
    winHaptic: (multiplier: number, betAmount: number) => {
      const intensity = calculateWinIntensity(multiplier, betAmount);
      
      if (multiplier >= 50) {
        triggerHaptic('win_jackpot', intensity);
      } else if (multiplier >= 20) {
        triggerHaptic('win_big', intensity);
      } else if (multiplier >= 5) {
        triggerHaptic('win_medium', intensity);
      } else {
        triggerHaptic('win_small', intensity);
      }
    },

    // Special event haptics
    multiplierHaptic: (level: number = 1) => {
      triggerHaptic('multiplier', Math.min(level * 0.5 + 1, 2));
    },

    bonusHaptic: () => triggerHaptic('bonus'),
    levelUpHaptic: (newLevel: number) => {
      // Increase intensity for milestone levels
      const intensity = newLevel % 10 === 0 ? 2 : 1.5;
      triggerHaptic('level_up', intensity);
    },

    // UI haptics
    buttonClick: () => triggerHaptic('button_click'),
    error: () => triggerHaptic('error'),
    success: () => triggerHaptic('success')
  };
};

// Haptic Controls Component
interface HapticControlsProps {
  className?: string;
}

export const HapticControls: React.FC<HapticControlsProps> = ({ className = '' }) => {
  const { isEnabled, toggleHaptic } = useHaptic();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label className="text-sm font-medium text-muted-foreground">
        Vibração
      </label>
      <button
        onClick={toggleHaptic}
        className={`
          w-12 h-6 rounded-full transition-all duration-300 relative
          ${isEnabled 
            ? 'bg-primary shadow-glow-primary' 
            : 'bg-muted border border-border'
          }
        `}
      >
        <div
          className={`
            w-5 h-5 rounded-full bg-background shadow-md 
            transition-transform duration-300 absolute top-0.5
            ${isEnabled ? 'translate-x-6' : 'translate-x-0.5'}
          `}
        />
      </button>
      <span className="text-xs text-muted-foreground">
        {isEnabled ? '✨' : '🔇'}
      </span>
    </div>
  );
};

// Export types and utilities
export type { HapticType };
export { calculateWinIntensity, isVibrationSupported };