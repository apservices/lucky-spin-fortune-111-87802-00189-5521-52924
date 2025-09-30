export interface VisualSettings {
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  particleEffects: boolean;
  backgroundAnimations: boolean;
  batterySavingMode: boolean;
  frameRate: 30 | 45 | 60;
  reducedMotion: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  effectsVolume: number;
  musicVolume: number;
  isMuted: boolean;
  spatialAudio: boolean;
}

export interface GameplaySettings {
  spinSpeed: 'slow' | 'normal' | 'fast';
  autoSpinCount: 10 | 25 | 50 | 100 | -1; // -1 for infinite
  turboMode: boolean;
  highBetConfirmation: boolean;
  quickSpin: boolean;
  showWinAnimations: boolean;
}

export interface AccessibilitySettings {
  highContrastMode: boolean;
  reducedMotion: boolean;
  increasedFontSize: boolean;
  hapticFeedback: boolean;
  colorBlindFriendly: boolean;
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
}

export interface GameSettings {
  visual: VisualSettings;
  audio: AudioSettings;
  gameplay: GameplaySettings;
  accessibility: AccessibilitySettings;
}

export const defaultSettings: GameSettings = {
  visual: {
    graphicsQuality: 'medium',
    particleEffects: true,
    backgroundAnimations: true,
    batterySavingMode: false,
    frameRate: 60,
    reducedMotion: false
  },
  audio: {
    masterVolume: 70,
    effectsVolume: 80,
    musicVolume: 60,
    isMuted: false,
    spatialAudio: false
  },
  gameplay: {
    spinSpeed: 'normal',
    autoSpinCount: 10,
    turboMode: false,
    highBetConfirmation: true,
    quickSpin: false,
    showWinAnimations: true
  },
  accessibility: {
    highContrastMode: false,
    reducedMotion: false,
    increasedFontSize: false,
    hapticFeedback: true,
    colorBlindFriendly: false,
    screenReaderSupport: false,
    keyboardNavigation: false
  }
};